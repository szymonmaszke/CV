FROM szymonmaszke/cv:latest

COPY . /
ENTRYPOINT ["/bin/sh", "./entrypoint.sh"]
