#!/usr/bin/env bash

# SPDX-FileCopyrightText: © 2026 Szymon Maszke <https://github.com/szymonmaszke>
# SPDX-License-Identifier: Apache-2.0

# Secret scanning features (best effort)
# One request per feature, so an unavailable one does not block the rest
# https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#update-a-repository

set -euo pipefail

for feature in \
    secret_scanning \
    secret_scanning_push_protection \
    secret_scanning_non_provider_patterns \
    secret_scanning_ai_detection; do
    gh api --method PATCH "repos/{owner}/{repo}" \
        -f "security_and_analysis[${feature}][status]=enabled" > /dev/null \
        || echo "::warning::Could not enable ${feature}"
done
