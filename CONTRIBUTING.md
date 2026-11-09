<!--
SPDX-FileCopyrightText: © 2026 Szymon Maszke <https://github.com/szymonmaszke>
SPDX-License-Identifier: Apache-2.0
-->

# Contributing

How to run, change, check and deploy maszke.co and the CV it serves. Most site
changes touch one YAML file in `src/content/`; the CV is LaTeX in `cv/`.

## Run it locally

Requires Node.js 22.12+ (CI uses the version in `.nvmrc`).

```sh
npm run setup     # npm ci (exact versions from package-lock.json) + git hooks
npm run dev       # live preview at http://localhost:4321 (reloads on save)
npm run check     # type + content check (CI runs this too)
npm test          # Markdown and schema tests
npm run build     # production build into dist/
npm run preview   # serve dist/ locally, exactly as it will be deployed
npm run build:cv  # CV, light and dark, into public/ (needs XeLaTeX)
npm run fix       # every check below, on every file
```

Nothing is sent anywhere while you work: the npm scripts turn off Astro's
telemetry and update check (`astro.env`), and `.npmrc` turns off npm's update
check.

## Everyday edits

| I want to…                           | Edit                             |
| ------------------------------------ | -------------------------------- |
| change name, links, email, hero text | `src/content/site.yaml`          |
| change section titles, tab labels    | `src/content/about.yaml`         |
| add or change a role                 | `src/content/experience.yaml`    |
| add a degree, postgraduate, paper    | `src/content/education.yaml`     |
| add a certificate                    | `src/content/certificates.yaml`  |
| add or reorder open source projects  | `src/content/opensource.yaml`    |
| pick other StackOverflow answers     | `src/content/stackoverflow.yaml` |
| change technologies                  | `src/content/technologies.yaml`  |
| refresh stars, reputation, views     | `npm run update:stats`           |
| change the CV                        | `cv/sections/*.tex`              |
| change CV colors (light and dark)    | `cv/styles/colors.sty`           |
| change colors / spacing              | `src/styles/global.css` (tokens) |

Every file is validated by a schema (`src/lib/schema.ts`): a misspelled field, a
wrong type or a date not written as `MM/YYYY` fails `npm run check` and
`npm run build` with a message naming the file and field, so it never reaches
the live site.

Prose fields support Markdown (`lead`, `prose`, `text`, `note`, role `points`,
project `description`): **bold**, _emphasis_, `code` and links. Raw HTML is
rejected. Headings and labels are plain text. Use `>-` for long text folded into
one paragraph and `|-` when blank lines should start new paragraphs.

### Sections and tabs

The site is one page (`/`) split into sections (`src/content/about.yaml`). Each
has an `id` (its anchor: `/#experience` opens that tab) and a `tab` label. The
tabs are a progressive enhancement (`src/scripts/tabs.ts`): without JavaScript
the same links jump between sections of one long page.

### Numbers

GitHub stars, forks and repository counts (`opensource.yaml`) and StackOverflow
reputation, answers, badges, top tags, and the score and views of each listed
answer (`stackoverflow.yaml`) are committed data. `npm run update:stats` fetches
them from the public GitHub and StackExchange APIs and rewrites only those
numbers. Set `GITHUB_TOKEN` for a higher GitHub rate limit. The site itself
never calls these APIs.

The deploy (`.github/workflows/deploy.yml`) runs `npm run update:stats` before
every build and runs daily, so the live site is at most a day behind. The
refreshed numbers are not committed back: pull request builds, and deploys
during an API outage, use the committed ones. Run it locally now and then to
keep those current.

To show another StackOverflow answer, add an entry with its `id` (the number in
`https://stackoverflow.com/a/<id>`), title and tags, then run
`npm run update:stats`.

### The CV

`cv/main.tex` (XeLaTeX, TikZ) is one A4 page: `cv/sections/top.tex` (contact
bar), `sidebar.tex` (postgraduate, summary, advisory work, research,
technologies, languages) and `core.tex` (education, experience). Its text is
written there, separately from the site's YAML. Macros are in
`cv/styles/commands.sty`, colors in `cv/styles/colors.sty`: one palette per
theme, picked by `\cvtheme`.

`npm run build:cv` (`scripts/build-cv.sh`) compiles both themes into `public/`:
`szymon-maszke-cv.pdf` and `szymon-maszke-cv-dark.pdf` (git-ignored; CI builds
them for every deployment). Every CV link on the site downloads the PDF matching
the page's current theme (the OS setting or the theme switch); without
JavaScript, the light one. It needs TeX Live with XeLaTeX and the `lato` and
`fontawesome` fonts (Arch:
`texlive-xetex texlive-fontsextra texlive-pictures texlive-latexextra`; Ubuntu:
see `deploy.yml`).

## Checks

`npm run setup` installs the git hooks ([prek](https://prek.j178.dev),
configured in `prek.toml`). Each commit checks the files it changes;
`npm run fix` checks every file. Fixers (formatting, license headers, spelling)
change files in place: review their changes, stage them and commit again.

- **JS, TS, Astro, CSS, JSON**: Biome (`biome.jsonc`), every rule on.
- **Types and content**: `astro check`, the content schemas and the build.
- **LaTeX** (`cv/`): latexindent (`.latexindent.yaml`, indentation only), chktex
  and a build of both CV themes. Both tools ship with TeX Live (Arch:
  `texlive-binextra`, plus `perl-yaml-tiny` and `perl-file-homedir` for
  latexindent).
- **YAML**: yamllint (`.yamllint.yml`): `---` and `...`, double-quoted strings.
- **Markdown**: mdformat, pymarkdown, lychee (dead links), Vale and codespell.
- **Licensing**: an SPDX header on every file (REUSE) and allowed licenses of
  npm dependencies (`npm run check:licenses`).
- **Security**: trufflehog, semgrep, zizmor, actionlint and `npm audit`.
- **Commits**: messages start with `feat:` or `fix:`; every commit is signed off
  and GPG signed (`git commit -s -S`, see [DCO.md](DCO.md)).

## Project layout

```text
src/
  site.config.ts         validated loader for site.yaml
  content/*.yaml         all text and data
  lib/schema.ts          schemas of every content file
  lib/data.ts            validated loaders + number and date formatting
  pages/                 index (/), 404, llms.txt, robots.txt, sitemap.xml
                         (/about redirects to /, astro.config.mjs)
  assets/brand/          the opennudge mark (© open-nudge, not Apache-2.0)
  components/            header, footer, hero, tabs, section frame, role,
                         answer, repository card, icons
  components/sections/   the page's sections, one per tab
  layouts/Base.astro     <head>, header and footer shared by every page
  scripts/               section tabs (tabs.ts), their carousel on phones
                         (carousel.ts), swiping sections (swipe.ts, slide.ts)
  styles/global.css      design tokens (shared with opennudge.com) and base styles
scripts/                 content check, tests, update-stats.ts, build-cv.sh
public/                  copied as-is: favicons, og.png (and the built CVs)
cv/
  main.tex               the CV: packages, theme, page layout
  sections/              top bar, sidebar, core (the CV's text)
  styles/                colors (light, dark), macros, dimensions
.github/                 workflows, rulesets, Dependabot, labeler
```

## Conventions

- **Same design system as [opennudge.com](https://opennudge.com)**: the greys of
  Chrome on iOS, no accent color, never pure black or white, raised boxes,
  capsule controls (the tabs are a capsule switch), system fonts, lowercase
  display headings, the 2 px "nudge" as the only hover movement, everything off
  for reduced motion.
- **The opennudge mark** (`src/assets/brand/`) and the **site icons**
  (`public/favicon.*`, `public/apple-touch-icon.png`, copied from opennudge.com)
  are © open-nudge (`LicenseRef-opennudge-brand`), used unmodified; never
  recolor them.
- **Keep it light**: no JavaScript frameworks, no third-party requests (fonts,
  analytics, CDNs). Scripts are small and the site works without them.
- **Accessible**: real links and buttons, `aria-*` where state changes, text
  contrast of at least 4.5:1.
- **Dependencies** are pinned to exact versions and committed with
  `package-lock.json`.

## Deployment

`.github/workflows/deploy.yml` checks, tests and builds every push and pull
request: the CV (both themes, Ubuntu's TeX Live), then the site, which copies
them from `public/`. Both PDFs are also attached to the run as the `cv`
artifact. Pushes to `main` are then deployed to GitHub Pages at `maszke.co`.
Deployment needs no secrets: the workflow's own token, with the `pages` and
`id-token` permissions, publishes it.

First deployment:

1. **Verify the domain** (proves `maszke.co` is yours, so no other GitHub
   account can serve it): GitHub → your avatar → _Settings → Pages → Add a
   domain_ → `maszke.co`. GitHub shows a `TXT` record: add it at your DNS
   provider (name `_github-pages-challenge-szymonmaszke`, value the code shown),
   wait until it resolves, then click _Verify_.

1. **Point the DNS to GitHub Pages**, at your DNS provider (remove other
   `A`/`AAAA`/`ALIAS` records of the apex first, e.g. the registrar's parking
   page):

   - `A` records for `@` (the apex), four of them: `185.199.108.153`,
     `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `AAAA` records for `@`, four of them: `2606:50c0:8000::153`,
     `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
   - `CNAME` record for `www`: `szymonmaszke.github.io`

   `dig maszke.co +short` shows the four addresses once it has propagated.

1. Rename the default branch to `main` (_Settings → General → Default branch_)
   and make the repository public.

1. Harden the repository (see [Repository settings](#repository-settings)). It
   enables GitHub Pages with GitHub Actions as the source and `maszke.co` as the
   custom domain. Without it: _Settings → Pages → Source_: _GitHub Actions_,
   _Custom domain_: `maszke.co`.

1. Push to `main` (or run _deploy_ by hand). Once the certificate is issued
   (minutes to an hour after the DNS check passes), tick _Enforce HTTPS_ in
   _Settings → Pages_ (or run `./.github/tools/harden/pages-https.sh`).

1. Remove the `maszke.co` exclusion from `lychee.toml`.

## Repository settings

The scripts in `.github/tools/harden/` apply the repository settings once the
repository is public, either locally or through `.github/workflows/harden.yml`:
squash merges only, the rulesets in `.github/rulesets/` (signed commits, no
force pushes, pull requests and checks required on `main`), GitHub Pages with
the custom domain, deployments from `main` only, secret scanning with push
protection, Dependabot alerts and security updates, private vulnerability
reporting and CodeQL.

### Locally

Install Bash, the [GitHub CLI](https://cli.github.com) (`gh`) and `jq`, log in
as an administrator of the repository (`gh auth login`) and run the scripts from
the repository root. `gh` resolves the repository from the checkout, set
`GH_REPO=owner/repo` to target another one. Every script can be re-run.

| Script                               | Purpose                               |
| ------------------------------------ | ------------------------------------- |
| `settings.sh`                        | Squash merges, sign-off, homepage     |
| `pages.sh`                           | Pages via Actions, custom domain      |
| `pages-https.sh`                     | Enforce HTTPS (needs the certificate) |
| `pages-main.sh`                      | Pages deployments from `main` only    |
| `vulnerability-alerts.sh`            | Dependabot alerts and updates         |
| `private-vulnerability-reporting.sh` | Private vulnerability reporting       |
| `security.sh`                        | Secret scanning and push protection   |
| `codeql.sh`                          | CodeQL default setup                  |
| `rulesets.sh`                        | Rulesets, updated in place by name    |

```sh
./.github/tools/harden.sh 0
```

`harden.sh` runs every script (rulesets last, afterwards `main` accepts changes
through pull requests only), then the Security Scorecard. Pass `0` required
approvals when working solo, `1` for two contributors and `2` for more; single
scripts can be run on their own, e.g. `pages-https.sh` once the certificate is
issued.

### Workflow

1. Create a
   [fine-grained personal access token](https://github.com/settings/personal-access-tokens/new):
   only the `szymonmaszke/website` repository, expiring the next day, repository
   permissions _Administration_ and _Pages_: read and write.
1. Add it as the `HARDEN_GITHUB_TOKEN` repository secret (_Settings → Secrets
   and variables → Actions_).
1. Run the _Harden_ workflow from `main` (_Actions → Harden → Run workflow_).
1. Delete the `HARDEN_GITHUB_TOKEN` secret.
