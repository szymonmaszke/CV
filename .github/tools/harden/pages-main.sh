#!/usr/bin/env bash

# SPDX-FileCopyrightText: © 2026 Szymon Maszke <https://github.com/szymonmaszke>
# SPDX-License-Identifier: Apache-2.0

# Allow GitHub Pages deployments from the main branch only
# https://docs.github.com/en/rest/deployments/environments?apiVersion=2022-11-28#create-or-update-an-environment

set -euo pipefail

endpoint="repos/{owner}/{repo}/environments/github-pages"
gh api --method PUT "${endpoint}" \
    -F "deployment_branch_policy[protected_branches]=false" \
    -F "deployment_branch_policy[custom_branch_policies]=true" \
    > /dev/null
policies=$(gh api --paginate "${endpoint}/deployment-branch-policies?per_page=100" | jq -s '[.[].branch_policies[]]')
if ! jq -e 'any(.[]; .name == "main" and .type == "branch")' <<< "${policies}" > /dev/null; then
    gh api --method POST "${endpoint}/deployment-branch-policies" -f "name=main" -f "type=branch" > /dev/null
fi
