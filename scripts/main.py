import arguments
import foss
import stackoverflow
import utils


def main():
    args = arguments.get()
    dictionary = {
        "stars": foss.stars(args.github_token, args.data),
        "contributions": foss.contributions(args.github_url),
        "followers": foss.followers(args.github_token),
        "answers": stackoverflow.answers(args.stackoverflow_url),
        "reached": stackoverflow.reached(args.stackoverflow_url),
        "points": stackoverflow.points(args.stackoverflow_url),
    }
    utils.save(dictionary, args)


if __name__ == "__main__":
    main()
