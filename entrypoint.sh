#!/usr/bin/env sh

printf "\n=============================UPDATING CV=============================\n"

make all PYTHON="python3" READ_GITHUB_TOKEN="$1" URL_GITHUB="$2" URL_STACKOVERFLOW="$3"

printf "\n===============================PUSH CV===============================\n"

git config --local user.email "action@github.com"
git config --local user.name "GitHub Action"

git add cv.pdf
git commit -m "Automatically update CV"

GITHUB_ACTOR=$4
GITHUB_REPOSITORY=$5
GITHUB_TOKEN=$6
REMOTE_REPO="https://${GITHUB_ACTOR}:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git"
echo $REMOTE_REPO
git push "${REMOTE_REPO}" -u origin master
