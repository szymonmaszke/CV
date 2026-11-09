// SPDX-FileCopyrightText: © 2026 Szymon Maszke <https://github.com/szymonmaszke>
// SPDX-License-Identifier: Apache-2.0

// `npm run update:stats`: refreshes the numbers in src/content/opensource.yaml
// and src/content/stackoverflow.yaml from the public GitHub and StackExchange
// APIs. Only numbers change; comments, order and hand-written text stay.
// The site itself never calls these APIs (no third-party requests).
// CI runs it before every deploy, and the deploy runs daily
// (.github/workflows/deploy.yml); running it locally updates the committed
// numbers, which pull requests and API outages fall back to.
//
// Optional: GITHUB_TOKEN raises the GitHub rate limit (60 requests/hour
// without it, this script needs about 4).
import { readFileSync, writeFileSync } from "node:fs";
import process from "node:process";
import { parseDocument } from "yaml";

const opensourceFile = "src/content/opensource.yaml";
const stackoverflowFile = "src/content/stackoverflow.yaml";
const userAgent = "maszke.co-update-stats";
/** The most results either API returns per request (`per_page`, `pagesize`). */
const pageSize = 100;
/** StackExchange dates are Unix seconds, JavaScript's milliseconds. */
const msPerSecond = 1000;
// biome-ignore lint/style/noProcessEnv: optional, CI passes its own (.github/workflows/deploy.yml)
const token = process.env.GITHUB_TOKEN;

/** GET a JSON API; throws on a non-2xx response, naming the URL. */
const get = async <T>(url: string, headers: Record<string, string> = {}): Promise<T> => {
  const response = await fetch(url, { headers: { "User-Agent": userAgent, ...headers } });
  if (!response.ok) {
    throw new Error(`${url}: ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as T;
};

interface Repo {
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  private: boolean;
  created_at: string;
}

/**
 * Every repository owned by a GitHub user or organization (all pages).
 *
 * @param account - The login, e.g. `szymonmaszke` or `open-nudge`.
 */
const github = async (account: string): Promise<Repo[]> => {
  // header names are case-insensitive (fetch sends them lowercase anyway)
  const headers: Record<string, string> = { accept: "application/vnd.github+json" };
  if (token) {
    headers.authorization = `Bearer ${token}`;
  }
  const user = await get<{ type: string }>(`https://api.github.com/users/${account}`, headers);
  const kind = user.type === "Organization" ? "orgs" : "users";
  // one page after another: a full page means there may be another
  const pages = async (page: number): Promise<Repo[]> => {
    const batch = await get<Repo[]>(
      `https://api.github.com/${kind}/${account}/repos?type=owner&per_page=${pageSize}&page=${page}`,
      headers,
    );
    return batch.length < pageSize ? batch : [...batch, ...(await pages(page + 1))];
  };
  return pages(1);
};

/** Rewrite the totals and each project's stars in src/content/opensource.yaml. */
const updateOpensource = async () => {
  const document = parseDocument(readFileSync(opensourceFile, "utf8"));
  const accounts = document.get("accounts") as { items: { value: string }[] };
  const repos = (await Promise.all(accounts.items.map((item) => github(item.value))))
    .flat()
    .filter((repo) => !(repo.fork || repo.private));
  const stars = new Map(repos.map((repo) => [repo.html_url.toLowerCase(), repo.stargazers_count]));

  document.setIn(
    ["totals", "stars"],
    repos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
  );
  document.setIn(
    ["totals", "forks"],
    repos.reduce((sum, repo) => sum + repo.forks_count, 0),
  );
  document.setIn(["totals", "repos"], repos.length);
  document.setIn(
    ["totals", "since"],
    Math.min(...repos.map((repo) => new Date(repo.created_at).getFullYear())),
  );

  const past = document.get("past") as { items: { get: (key: string) => unknown }[] };
  past.items.forEach((item, index) => {
    const count = stars.get(String(item.get("repo")).toLowerCase());
    if (count === undefined) {
      process.stderr.write(`${opensourceFile}: ${String(item.get("repo"))} not found, stars kept\n`);
    } else {
      document.setIn(["past", index, "stars"], count);
    }
  });
  writeFileSync(
    opensourceFile,
    document.toString({ lineWidth: 0, defaultStringType: "QUOTE_DOUBLE", defaultKeyType: "PLAIN" }),
  );
};

interface Page<T> {
  items: T[];
  total?: number;
}

/**
 * Call the StackExchange API for StackOverflow (no key: 300 requests/day per IP).
 *
 * @param path - The API path, e.g. `users/123/answers`.
 * @param query - Extra query parameters, each starting with `&`.
 */
const stackexchange = <T>(path: string, query = "") =>
  get<Page<T>>(`https://api.stackexchange.com/2.3/${path}?site=stackoverflow${query}`);

/** A parsed YAML file, edited in place (comments and order kept). */
type YamlDocument = ReturnType<typeof parseDocument>;

/** Rewrite the profile's stats: reputation, answers, the year it started, badges. */
const updateStats = async (document: YamlDocument, id: number) => {
  const [user] = (
    await stackexchange<{
      reputation: number;
      creation_date: number;
      badge_counts: { gold: number; silver: number; bronze: number };
    }>(`users/${id}`)
  ).items;
  if (!user) {
    throw new Error(`StackOverflow user ${id} not found`);
  }
  const { total = 0 } = await stackexchange(`users/${id}/answers`, "&filter=total");
  document.setIn(["stats", "reputation"], user.reputation);
  document.setIn(["stats", "answers"], total);
  document.setIn(["stats", "since"], new Date(user.creation_date * msPerSecond).getFullYear());
  for (const rank of ["gold", "silver", "bronze"] as const) {
    document.setIn(["stats", "badges", rank], user.badge_counts[rank]);
  }
};

/** Rewrite the top tags shown for each screen. */
const updateTopTags = async (document: YamlDocument, id: number) => {
  // per screen (desktop, mobile): tags already in that screen's `facts` are
  // left out; as many as listed now
  const screens = (["desktop", "mobile"] as const).map((screen) => ({
    screen,
    shown: new Set(
      (document.getIn(["facts", screen]) as { items: { get: (key: string) => unknown }[] }).items.map(
        (item) => String(item.get("tag")),
      ),
    ),
    topCount: (document.getIn(["topTags", screen]) as { items: unknown[] }).items.length,
  }));
  const allTags = (
    await stackexchange<{ tag_name: string; answer_count: number; answer_score: number }>(
      `users/${id}/top-answer-tags`,
      `&pagesize=${Math.max(...screens.map(({ shown, topCount }) => topCount + shown.size))}`,
    )
  ).items;
  for (const { screen, shown, topCount } of screens) {
    document.setIn(
      ["topTags", screen],
      allTags
        .filter((tag) => !shown.has(tag.tag_name))
        .slice(0, topCount)
        .map((tag) => ({ tag: tag.tag_name, answers: tag.answer_count, score: tag.answer_score })),
    );
  }
};

/** Rewrite the score of each listed answer and the views of its question. */
const updateAnswers = async (document: YamlDocument) => {
  const listed = document.get("answers") as { items: { get: (key: string) => unknown }[] };
  const answerIds = listed.items.map((item) => Number(item.get("id")));
  const answers = new Map(
    (
      await stackexchange<{
        answer_id: number;
        question_id: number;
        score: number;
      }>(`answers/${answerIds.join(";")}`, `&pagesize=${pageSize}`)
    ).items.map((answer) => [answer.answer_id, answer]),
  );
  const questionIds = [...answers.values()].map((answer) => answer.question_id);
  const views = new Map(
    (
      await stackexchange<{ question_id: number; view_count: number }>(
        `questions/${questionIds.join(";")}`,
        `&pagesize=${pageSize}`,
      )
    ).items.map((question) => [question.question_id, question.view_count]),
  );
  answerIds.forEach((answerId, index) => {
    const answer = answers.get(answerId);
    if (!answer) {
      process.stderr.write(`${stackoverflowFile}: answer ${answerId} not found, numbers kept\n`);
      return;
    }
    document.setIn(["answers", index, "score"], answer.score);
    document.setIn(["answers", index, "views"], views.get(answer.question_id) ?? 0);
  });
};

/** Rewrite stats, top tags and each listed answer's score and views in src/content/stackoverflow.yaml. */
const updateStackoverflow = async () => {
  const document = parseDocument(readFileSync(stackoverflowFile, "utf8"));
  const id = Number(document.get("userId"));
  // one after another, in the order the numbers appear in the file
  await updateStats(document, id);
  await updateTopTags(document, id);
  await updateAnswers(document);
  writeFileSync(
    stackoverflowFile,
    document.toString({ lineWidth: 0, defaultStringType: "QUOTE_DOUBLE", defaultKeyType: "PLAIN" }),
  );
};

await Promise.all([updateOpensource(), updateStackoverflow()]);
process.stdout.write(`updated ${opensourceFile} and ${stackoverflowFile}\n`);
