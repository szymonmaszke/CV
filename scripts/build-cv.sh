#!/usr/bin/env sh
# SPDX-FileCopyrightText: © 2026 Szymon Maszke <https://github.com/szymonmaszke>
# SPDX-License-Identifier: Apache-2.0

# `npm run build:cv`: compiles the CV (cv/main.tex) with XeLaTeX in both
# themes, into public/ (served by the site, git-ignored):
#   public/szymon-maszke-cv.pdf       light
#   public/szymon-maszke-cv-dark.pdf  dark (\cvtheme, cv/styles/colors.sty)
# Two passes each: the TikZ overlays (remember picture) need the first one's
# positions. Run from the repository root (npm does).

set -eu

root=$(pwd)
mkdir -p "${root}/public"
cd "${root}/cv"

build() {
  # $1: job (output) name, $2: TeX input
  for _ in 1 2; do
    if ! xelatex -interaction=nonstopmode -halt-on-error -jobname="$1" "$2" >/dev/null; then
      tail -n 40 "$1.log" >&2
      exit 1
    fi
  done
  mv "$1.pdf" "${root}/public/$1.pdf"
  rm -f "$1.aux" "$1.log" "$1.out"
  printf 'built public/%s.pdf\n' "$1"
}

build "szymon-maszke-cv" "main.tex"
build "szymon-maszke-cv-dark" '\def\cvtheme{dark}\input{main.tex}'
