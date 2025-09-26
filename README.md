# Curriculum Vitae

<p align=center>
  Click icons below to contact me or know more
</p>

[![full](https://img.shields.io/badge/-FULL&nbsp;CV&nbsp;+&nbsp;DOWNLOAD-43a047?style=for-the-badge)](https://raw.githubusercontent.com/szymonmaszke/CV/master/cv.pdf)
[![mail](https://img.shields.io/badge/-MAIL&nbsp;ME-DB4437?style=for-the-badge)](mailto:work@maszke.co)
[![github](https://img.shields.io/badge/-GITHUB-333333?style=for-the-badge)](https://github.com/szymonmaszke)
[![stackoverflow](https://img.shields.io/badge/-STACKOVERFLOW-F48024?style=for-the-badge)](https://stackoverflow.com/users/10886420/szymon-maszke?tab=profile)
[![linkedin](https://img.shields.io/badge/-LINKEDIN-0072b1?style=for-the-badge)](https://www.linkedin.com/in/szymonmaszke/)

- __Business inquiries - please email me at [work@maszke.co](mailto:work@maszke.co)__
- Click [here](https://raw.githubusercontent.com/szymonmaszke/CV/master/cv.pdf) to download full CV in PDF format

## Code description

### LaTeX files (`/cv`)

Inside `/cv` you can find core CV source code created mainly via `TikZ` package.

__See `/cv/README.md` for more information__

__Warning:__ LaTeX files are currently quite inflexible and are adjusted manually in
a few places. You would have to play around with them to fit your needs (any help and PRs
to make this into real & easy template are more than welcome, thanks).

### Makefile (`/Makefile`)

Makefile helps with compiling and running stuff inside this repo.
- `make all` - updates statistics (see below), compiles LaTeX and creates `cv.pdf`
- `make cv` - compiles LaTeX and creates `cv.pdf`
- `make clean` - cleans LaTeX build artifacts
