FROM ubuntu:latest

RUN  apt-get -y update \
# TZDate workaround
  && DEBIAN_FRONTEND="noninteractive" \
  TZ="America/New_York" \
  apt-get -y install \
    git \
    make \
# Python
    python3.8 \
    python3-pip \
# LaTeX related
    fonts-font-awesome \
    texlive-full \
    texlive-xetex \
    --no-install-recommends \
  && rm -rf /var/lib/apt/lists/* \
# Install Python automation modules
  && pip3 install --upgrade pip \
  && pip3 install --no-cache-dir \
    PyGithub==1.53 \
    beautifulsoup4==4.9.1 \
    lxml==4.6.1 \
    loguru==0.5.3
