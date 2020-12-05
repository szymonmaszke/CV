import sys

import utils


def exclude(data):
    with open(data / "exclude.txt", "r") as f:
        return f.read().split()


def contributions(text) -> str:
    return utils.strint(
        utils.find(text, "([0-9]+) contributions", "contributions"), "contributions"
    )


def stars(user, data) -> str:
    to_exclude = exclude(data)
    return str(
        sum(
            repo.stargazers_count
            for repo in user.get_repos()
            if not repo.full_name in to_exclude
        )
    )


def followers(user) -> str:
    return str(user.followers)
