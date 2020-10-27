import re
import sys

import loguru


def strint(value, error: str):
    try:
        return str(int(value))
    except ValueError:
        loguru.logger.critical("{} are not integer".format(error))
        sys.exit(1)


def save(dictionary, args):
    for name, data in dictionary.items():
        with open((args.data / name).with_suffix(".txt"), "w") as f:
            f.write(data)


def find(text: str, regex: str, error: str):
    data = re.findall(regex, text)
    if not data:
        loguru.logger.critical("could not find any {}".format(error))
        sys.exit(1)
    return data[0]
