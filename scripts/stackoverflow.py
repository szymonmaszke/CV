"""
Process StackOverflow data.

Some data points in this CV are specific, hence they are currently not automated
(or are hard to do like top N% this year).

Some statistics will probably be changed in the future.

"""

import sys

import loguru

import utils


def reached(text):
    """Return how many people got reached by user's answers."""
    return utils.find(text, r"(.+) reached", "reached").upper()[1:]


def answers(text):
    """Return how many answers user gave."""
    return utils.strint(utils.find(text, r"([0-9]+) answers", "answers"), "answers")


def points(text):
    """Returns how many points user has currently."""
    data = utils.find(text, "([0-9]+,[0-9]+)", "points")
    no_comma = "".join(data.split(","))
    return "{:,}".format(int(no_comma))
