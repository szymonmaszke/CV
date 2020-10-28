FROM ubuntu:latest

RUN apt-get -y update \
  # LaTeX dependencies and python environment
  && apt-get -y install \
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
  # Auto update Python dependencies
  && pip3 install -y \
    PyGithub==1.53 \
    beautifulsoup4==4.9.1 \
    lxml==4.6.1 \
    loguru==0.5.3

COPY . /
ENTRYPOINT ["./entrypoint.sh"]
