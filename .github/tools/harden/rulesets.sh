#!/usr/bin/env bash

# SPDX-FileCopyrightText: © 2026 Szymon Maszke <https://github.com/szymonmaszke>
# SPDX-License-Identifier: Apache-2.0

# Apply rulesets from a directory, updating repository rulesets of the same
# name in place (re-runnable, e.g. to change the number of approvals)
# https://docs.github.com/en/rest/repos/rules?apiVersion=2022-11-28#create-a-repository-ruleset

set -euo pipefail

if [[ "$#" -ne 2 ]]; then
    echo "Usage: $0 <approvals: 0|1|2> <ruleset-directory>" >&2
    exit 1
fi
case "$1" in
    0) last_push=false ;;
    1|2) last_push=true ;;
    *) echo "Approvals must be 0, 1, or 2" >&2; exit 1 ;;
esac

shopt -s nullglob
files=("$2"/*.json)
if [[ ${#files[@]} -lt 1 ]]; then
    echo "No ruleset JSON files found in $2" >&2
    exit 1
fi

# Repository-owned rulesets only (name -> id), inherited ones are never touched
existing=$(gh api --paginate "repos/{owner}/{repo}/rulesets?includes_parents=false&per_page=100" \
    --jq '.[] | {(.name): .id}' | jq -s 'add // {}')

for file in "${files[@]}"; do
    body=$(jq --argjson reviewers "$1" --argjson last_push "${last_push}" '
        walk(if . == "PLACEHOLDER_REVIEWERS" then $reviewers
             elif . == "PLACEHOLDER_LAST_PUSH_APPROVAL" then $last_push
             else . end)' "${file}")
    name=$(jq --raw-output '.name' <<< "${body}")
    id=$(jq --raw-output --arg name "${name}" '.[$name] // empty' <<< "${existing}")
    if [[ -n "${id}" ]]; then
        gh api --method PUT "repos/{owner}/{repo}/rulesets/${id}" --input - <<< "${body}" > /dev/null
        echo "Updated ruleset ${name}"
    else
        gh api --method POST "repos/{owner}/{repo}/rulesets" --input - <<< "${body}" > /dev/null
        echo "Created ruleset ${name}"
    fi
done
