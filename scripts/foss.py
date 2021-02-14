"""
Parse GitHub data (contributions, total numbers of stars etc.)

This module is run by `main.py`

"""

import sys

import utils


def _exclude(data):
    """Load repositories which shouldn't be counted in total stars."""
    with open(data / "exclude.txt", "r") as f:
        return f.read().split()


def contributions(text) -> str:
    """String finding total number of contributions on GitHub."""
    return utils.strint(
        utils.find(text, "([0-9]+) contributions", "contributions"), "contributions"
    )


def stars(user, data) -> str:
    """Return total number of stars user has on GitHub."""
    to_exclude = _exclude(data / "specified")
    return str(
        sum(
            repo.stargazers_count
            for repo in user.get_repos()
            if repo.full_name not in to_exclude
        )
    )


def specific_repos(user, data) -> None:
    """Save into data/repo_name.txt number of stars.

    Those files are read by LaTeX after processing.

    """
    with open(data / "specified" / "repos.txt", "r") as f:
        specific_repos = f.read().split()
    for repo in user.get_repos():
        if repo.name in specific_repos:
            with open((data / "generated" / repo.name).with_suffix(".txt"), "w") as f:
                f.write(str(repo.stargazers_count))


def followers(user) -> str:
    """Return number of followers."""
    return str(user.followers)
