import sys

import loguru

import utils


def contributions(text) -> str:
    return utils.strint(
        utils.find(text, "([0-9]+) contributions", "contributions"), "contributions"
    )


def stars(user) -> str:
    return str(sum(repo.stargazers_count for repo in user.get_repos()))


def followers(user) -> str:
    return str(user.followers)
