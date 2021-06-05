# Curriculum Vitae

<p align=center>
<img alt="screenshot" src="https://user-images.githubusercontent.com/20703378/107883698-ae469600-6ef0-11eb-92f5-828e02306881.png">
</p>
<p align=center>
  Click icons below to contact me and more
</p>

[![full](https://img.shields.io/badge/-FULL&nbsp;CV&nbsp;+&nbsp;DOWNLOAD-43a047?style=for-the-badge)](https://github.com/szymonmaszke/CV/blob/master/cv.pdf)
 [![mail](https://img.shields.io/badge/-MAIL&nbsp;ME-DB4437?style=for-the-badge)](mailto:work@maszke.co)
 [![linkedin](https://img.shields.io/badge/-LINKEDIN-0072b1?style=for-the-badge)](www.linkedin.com/in/szymonmaszke)
 [![github](https://img.shields.io/badge/-GITHUB-333333?style=for-the-badge)](https://github.com/szymonmaszke)
 [![stackoverflow](https://img.shields.io/badge/-STACKOVERFLOW-F48024?style=for-the-badge)](https://stackoverflow.com/users/10886420/szymon-maszke?tab=profile)

# Code description

## LaTeX files (`/cv`)

Inside `/cv` you can find core CV source code created mainly via `TikZ` package.

__See `/cv/README.md` for more information__

__Warning:__ LaTeX files are currently quite inflexible and are adjusted manually in
a few places. You would have to play around with them to fit your needs (any help and PRs
to make this into real & easy template are more than welcome, thanks).

## Makefile (`/Makefile`)

Makefile helps with compiling and running stuff inside this repo.
- `make all` - updates statistics (see below), compiles LaTeX and creates `cv.pdf`
- `make cv` - compiles LaTeX and creates `cv.pdf`
- `make clean` - cleans LaTeX build artifacts

## Python updates (`/scripts`)

__Using this part is optional!__

Inside `/scripts` you can find code which scrapes GitHub and StackOverflow statistics
into `/cv/data/{file.txt}` files later read by LaTeX.

This is part of automated CV update procedure via
[GitHub Workflows](https://docs.github.com/en/free-pro-team@latest/actions/reference/workflow-syntax-for-github-actions)

__See `/scripts/README.md` for more information__

## GitHub Action (`/Dockerfile`)

__Using this part is optional!__

Dockerfile defines [GitHub Action](https://github.com/features/actions) updating
this CV. You can see all necessary dependencies to build this package locally
or [override entrypoint](https://docs.docker.com/engine/reference/run/#entrypoint-default-command-to-execute-at-runtime)
and get into container to compile CV over there.

To update CV with this action you should fork this repository, make any necessary changes
(mentioned above) and spin up your own action.

## GitHub Workflows

__Using this part is optional!__

Inside `.github/workflows/update.yml` is a script to update CV on `push` and on `cron` events
(every day at midnight). It uses GitHub action defined by this repository.

# Contributing

All contributions, ideas and feedback is welcome (especially on the LaTeX part).
