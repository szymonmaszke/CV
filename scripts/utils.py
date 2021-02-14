"""
Various general utility functions.
"""

import re
import sys

import loguru


def setup_folders(data):
    "Create generated folder in specified data directory"
    generated = data / "generated"
    generated.mkdir(parents=True, exist_ok=True)


def strint(value: str, error: str):
    """
    Try to cast value to int and back to string.

    This ensures numerical data parsed is actually numerical when auto-updated.

    """
    try:
        return str(int(value))
    except ValueError:
        loguru.logger.critical("{} are not integer".format(error))
        sys.exit(1)


def save(dictionary, data):
    """
    Save gathered data into `.txt` files under generated folder.

    Those files are loaded by LaTeX source code afterwards.

    """
    generated = data / "generated"
    for name, value in dictionary.items():
        with open((generated / name).with_suffix(".txt"), "w") as f:
            f.write(value)


def find(text: str, regex: str, error: str):
    """
    Find specific data based on regex.

    If list of matches is empty, raise specified error.

    """
    data = re.findall(regex, text)
    if not data:
        loguru.logger.critical("could not find any {}".format(error))
        sys.exit(1)
    return data[0]
