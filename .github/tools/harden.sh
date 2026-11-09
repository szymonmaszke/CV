#!/usr/bin/env bash

# SPDX-FileCopyrightText: © 2026 Szymon Maszke <https://github.com/szymonmaszke>
# SPDX-License-Identifier: Apache-2.0

# Runs every script of .github/tools/harden locally, in the order of
# .github/workflows/harden.yml (rulesets last), then the Security Scorecard.
# Requires a public repository and `gh auth login` as its administrator,
# GH_REPO=owner/repo overrides the repository of the checkout. Re-runnable.
#
# Usage: ./.github/tools/harden.sh [approvals: 0|1|2]

set -euo pipefail

approvals=${1:-0}
case "${approvals}" in
    0|1|2) ;;
    *) echo "Usage: $0 [approvals: 0|1|2]" >&2; exit 1 ;;
esac

cd "$(git rev-parse --show-toplevel)"
harden=.github/tools/harden

# Rulesets, Pages, secret scanning and code scanning are free
# for public repositories only
visibility=$(gh repo view --json visibility --jq '.visibility')
if [[ "${visibility}" != "PUBLIC" ]]; then
    echo "Repository is ${visibility}, make it public before hardening it" >&2
    exit 1
fi

"${harden}/settings.sh"
"${harden}/pages.sh"
# Fails until DNS points to GitHub Pages and the certificate is issued
"${harden}/pages-https.sh" \
    || echo "warning: HTTPS not enforced yet, re-run ${harden}/pages-https.sh once the certificate is issued" >&2
"${harden}/pages-main.sh"
"${harden}/vulnerability-alerts.sh"
"${harden}/private-vulnerability-reporting.sh"
"${harden}/security.sh"
"${harden}/codeql.sh"
"${harden}/rulesets.sh" "${approvals}" .github/rulesets

# Hardening increases the score significantly; until the workflow is on main,
# it runs on the push (merge) that brings it there
gh workflow run security-scorecard.yml --ref main 2> /dev/null \
    || echo "Security Scorecard not on main yet, it runs once merged" >&2
