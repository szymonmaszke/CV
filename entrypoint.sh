#!/usr/bin/env sh

printf "\n==============================UPDATE CV==============================\n\n"

make all PYTHON="python3" TOKEN_GITHUB="$1"

printf "\n==============================SETUP GIT==============================\n\n"

git config --local user.email "action@github.com"
git config --local user.name "GitHub Action"

printf "\n==============================COMMIT CV==============================\n\n"

git add cv.pdf
git commit -m "[AUTOMATION] Update CV"

printf "\n===============================PUSH CV===============================\n\n"

TOKEN_GITHUB=$1
GITHUB_REPOSITORY=$2
REMOTE_REPO="https://${TOKEN_GITHUB}@github.com/${GITHUB_REPOSITORY}"
git push "${REMOTE_REPO}" master
