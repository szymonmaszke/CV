import sys

import loguru

import utils


def reached(text):
    return utils.find(text, r"(.+)\speople reached", "reached").upper()[1:]


def answers(text):
    return utils.strint(utils.find(text, r"([0-9]+)\sanswers", "answers"), "answers")


def points(text):
    data = utils.find(text, "([0-9]+,[0-9]+)", "points")
    no_comma = "".join(data.split(","))
    return "{:,}".format(int(no_comma))
