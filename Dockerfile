FROM docker.io/szymonmaszke/cv:latest

COPY . /
ENTRYPOINT ["/bin/sh", "./entrypoint.sh"]
