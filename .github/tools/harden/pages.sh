#!/usr/bin/env bash

# SPDX-FileCopyrightText: © 2026 Szymon Maszke <https://github.com/szymonmaszke>
# SPDX-License-Identifier: Apache-2.0

# GitHub Pages built by GitHub Actions (deploy.yml) with the custom domain
# https://docs.github.com/en/rest/pages/pages?apiVersion=2022-11-28#create-a-github-pages-site

set -euo pipefail

DOMAIN=${DOMAIN:-'maszke.co'}

# Pages uses POST for creation and PUT for updates
# Only a missing site (404) should trigger creation; propagate other failures.
if ! response=$(gh api --include "repos/{owner}/{repo}/pages" 2> /dev/null); then
    if [[ "${response}" =~ ^HTTP/[^[:space:]]+[[:space:]]404[[:space:]] ]]; then
        gh api --method POST "repos/{owner}/{repo}/pages" -f "build_type=workflow" > /dev/null
    else
        printf 'Could not inspect GitHub Pages:\n%s\n' "${response}" >&2
        exit 1
    fi
fi

gh api --method PUT "repos/{owner}/{repo}/pages" -f "build_type=workflow" -f "cname=${DOMAIN}"
