import arguments
import foss
import stackoverflow
import utils


def main():
    args = arguments.get()
    utils.setup_folders(args.data)
    dictionary = {
        "stars": foss.stars(args.github_token, args.data),
        "followers": foss.followers(args.github_token),
        "answers": stackoverflow.answers(args.stackoverflow_url),
        "reached": stackoverflow.reached(args.stackoverflow_url),
        "points": stackoverflow.points(args.stackoverflow_url),
    }
    utils.save(dictionary, args.data)

    # Add stats about special repositories
    foss.specific_repos(args.github_token, args.data)


if __name__ == "__main__":
    main()
