<!--
SPDX-FileCopyrightText: © 2026 Szymon Maszke <https://github.com/szymonmaszke>
SPDX-License-Identifier: Apache-2.0
-->

# maszke.co

Source of [maszke.co](https://maszke.co), the personal website of Szymon Maszke:
experience, open source, StackOverflow, education and a downloadable CV, and of
that CV itself (LaTeX, `cv/`).

A small static site built with [Astro](https://astro.build), published to GitHub
Pages on every push to `main`, together with the CV built from `cv/`.

## Features

- **No JavaScript framework**, no trackers, cookies, web fonts or third-party
  requests. The page is about 16 KB gzipped.
- **Same design system as [opennudge.com](https://opennudge.com)**: soft greys,
  light and dark.
- **Content is data**: every section lives in a YAML file in `src/content/`,
  validated at build time. GitHub and StackOverflow numbers are refreshed by
  `npm run update:stats` on every deploy, and the site is deployed daily.
- **CV in both themes**: `cv/` compiles (XeLaTeX) to a light and a dark PDF; the
  site's download links serve the one matching the current theme.
- **Agent-friendly**: [`/llms.txt`](https://maszke.co/llms.txt) is a plain text
  version of the page, generated from the same data.

## Quick start

Requires Node.js 22.12 or newer.

```sh
npm run setup   # install the exact dependency versions and the git hooks
npm run dev     # live preview at http://localhost:4321
npm run build:cv  # the CV, light and dark, into public/ (needs XeLaTeX)
```

[CONTRIBUTING.md](CONTRIBUTING.md) explains how the site is organized, how to
change it, and how it is checked and deployed.

## License

[Apache-2.0](LICENSE). Every file states its license
([REUSE](https://reuse.software)).

Except the opennudge brand files (the site icons, the opennudge mark and the
social image that carries it): © open-nudge, all rights reserved, used with
permission, under
[LicenseRef-opennudge-brand](LICENSES/LicenseRef-opennudge-brand.txt).
