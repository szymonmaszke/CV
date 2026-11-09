#!/usr/bin/env bash

# SPDX-FileCopyrightText: © 2026 Szymon Maszke <https://github.com/szymonmaszke>
# SPDX-License-Identifier: Apache-2.0

# Enforce HTTPS for GitHub Pages
# Fails until DNS points to GitHub Pages and the certificate is issued,
# re-run once it is (or tick "Enforce HTTPS" in Settings -> Pages)
# https://docs.github.com/en/rest/pages/pages?apiVersion=2022-11-28#update-information-about-a-apiname-pages-site

set -euo pipefail

gh api --method PUT "repos/{owner}/{repo}/pages" -F "https_enforced=true"
