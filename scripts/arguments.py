"""
Parses user provided arguments.

See `get()` function.

"""

import argparse
import pathlib
import sys
import urllib

import github as gh
import loguru
from bs4 import BeautifulSoup


def load_text(url: str) -> str:
    """
    Loads HTML and returns textual content.

    Used for stackoverflow & github page parsing.

    Parameters
    ----------
    url : str
        URL pointing to the resource

    Returns
    -------
    str
        Text after BeautifulSoup parsing

    """
    try:
        html = urllib.request.urlopen(url, timeout=30)
    except urllib.error.URLError:
        loguru.logger.critical("could not get HTML {} to parse data".format(url))
        sys.exit(1)
    return BeautifulSoup(html, "lxml").get_text()


def get():
    """Parses user provided arguments."""
    parser = argparse.ArgumentParser(
        formatter_class=argparse.RawTextHelpFormatter,
        description="""Parses GitHub and StackOverflow user statistics.

        Numbers will (should) be saved in 'data' folder and read by LaTeX.
        Can be run to update CV related statistics.

        See CV LaTeX source code for more information.""",
    )

    parser.add_argument(
        "--github-url",
        type=load_text,
        required=True,
        help="URL to GitHub profile for example 'https://github.com/szymonmaszke'",
    )

    parser.add_argument(
        "--github-token",
        type=lambda p: gh.Github(p).get_user(),
        required=True,
        help="Personal access token to GitHub profile data",
    )

    parser.add_argument(
        "--stackoverflow-url",
        type=load_text,
        required=True,
        help="URL to Stackoverflow activity profile, for example "
        "'https://stackoverflow.com/users/10886420/szymon-maszke'",
    )

    parser.add_argument(
        "--data",
        required=False,
        type=pathlib.Path,
        default="data",
        help="Folder where data is stored (relative to calling place).",
    )

    return parser.parse_args()
