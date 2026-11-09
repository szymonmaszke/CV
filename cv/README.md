<!--
SPDX-FileCopyrightText: © 2026 Szymon Maszke <https://github.com/szymonmaszke>
SPDX-License-Identifier: Apache-2.0
-->

# CV

One A4 page in LaTeX (XeLaTeX, TikZ), served by the site in a light and a dark
version. Build both from the repository root:

```sh
npm run build:cv  # public/szymon-maszke-cv.pdf and public/szymon-maszke-cv-dark.pdf
```

## main.tex

Loads the packages, picks the theme (`\cvtheme`: `light` unless the build
defines it, see `scripts/build-cv.sh`), draws the bars and stitches the sections
together.

## sections

- `top.tex`: top bar (email, GitHub, website, StackOverflow)
- `sidebar.tex`: left bar (name, postgraduate, executive summary, advisory work,
  research, technologies, languages)
- `core.tex`: main column (education, experience, data processing clause)

Each part uses the commands and colors from `styles`. Keep the license header
directly above `\documentclass` (no blank line): `\subfile` reads it as a
paragraph break, which moves the main column.

## styles

- `colors.sty`: every color (bars, text, icons, tags), one palette per theme
- `commands.sty`: TikZ commands for entries, tags, icons and links
- `environments.sty`: the text environment
- `variables.sty`: margins, heights and widths

The layout is tuned by hand in a few places (offsets in `sidebar.tex` and
`core.tex`): check both PDFs after changing the content.
