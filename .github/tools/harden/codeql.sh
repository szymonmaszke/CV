#!/usr/bin/env bash

# SPDX-FileCopyrightText: © 2026 Szymon Maszke <https://github.com/szymonmaszke>
# SPDX-License-Identifier: Apache-2.0

# CodeQL default setup, required by the code_scanning rule of
# .github/rulesets/branch-default.json
# https://docs.github.com/en/rest/code-scanning/code-scanning?apiVersion=2022-11-28#update-a-code-scanning-default-setup-configuration

set -euo pipefail

gh api --method PATCH "repos/{owner}/{repo}/code-scanning/default-setup" \
    -f "state=configured" -f "query_suite=default" > /dev/null
