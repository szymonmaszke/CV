FROM szymonmaszke/cv:latest

COPY . /
ENTRYPOINT ["./entrypoint.sh"]
