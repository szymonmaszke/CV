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
            if repo.full_name not in to_exclude
        )
    )


def specific_repos(user, data):
    with open(data / "specific_repos.txt", "r") as f:
        specific_repos = f.read().split()
    for repo in user.get_repos():
        if repo.name in specific_repos:
            with open((data / repo.name).with_suffix(".txt"), "w") as f:
                f.write(str(repo.stargazers_count))


def followers(user) -> str:
    return str(user.followers)
