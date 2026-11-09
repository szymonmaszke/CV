// SPDX-FileCopyrightText: © 2026 Szymon Maszke <https://github.com/szymonmaszke>
// SPDX-License-Identifier: Apache-2.0

// Schemas of every file in src/content/. Unknown keys are errors (typos never
// reach the site); Markdown fields are checked for raw HTML and unsafe links.
import { z } from "astro/zod";
import { validateMarkdown } from "./markdown.ts";

/** Link targets allowed in content: https/http, mailto, a site path (not `//host`) or an anchor. */
const destinationPattern = /^(https?:\/\/|mailto:|\/(?!\/)|#)/;
const datePattern = /^\d{2}\/\d{4}$/;

/** A Markdown string field, checked by validateMarkdown (src/lib/markdown.ts). */
const markdownOf = (inlineOnly: boolean) =>
  z.string().superRefine((value, context) => {
    try {
      validateMarkdown(value, "markdown", inlineOnly);
    } catch (error) {
      context.addIssue({ code: "custom", message: (error as Error).message });
    }
  });

/** Markdown prose: paragraphs, lists, emphasis, code and links. */
const prose = markdownOf(false);
/** Markdown without blocks or links: headings, labels. */
const inline = markdownOf(true);

/** One list for desktop, another for phones. */
const perScreen = <T extends z.ZodType>(item: T) =>
  z.strictObject({ desktop: z.array(item), mobile: z.array(item) });

/** A link target (see destinationPattern). */
const destination = z
  .string()
  .refine(
    (value) => destinationPattern.test(value),
    "Expected an https URL, mailto link, site path or anchor",
  );
/** Month and year, `MM/YYYY`. */
const month = z.string().regex(datePattern, "Expected MM/YYYY");
/** A count: stars, forks, views, answers. */
const count = z.number().int().nonnegative();

const link = z.strictObject({ label: z.string(), href: destination });

const siteSchema = z.strictObject({
  name: z.string(),
  url: z.url(),
  title: z.string(),
  description: z.string(),
  language: z.string(),
  email: z.email(),
  cv: z.strictObject({ light: destination, dark: destination }),
  links: z.strictObject({
    home: destination,
    github: z.url(),
    stackoverflow: z.url(),
    opennudge: z.url(),
    llms: destination,
  }),
  ui: z.strictObject({
    skip: z.string(),
    githubLabel: z.string(),
    stackoverflowLabel: z.string(),
    opennudgeLabel: z.string(),
    darkMode: z.string(),
    cv: z.string(),
    cvLabel: z.string(),
    sections: z.string(),
    menu: z.string(),
    closeMenu: z.string(),
    previous: z.string(),
    next: z.string(),
    stackoverflow: z.string(),
    github: z.string(),
    stars: z.string(),
    archived: z.string(),
    views: z.string(),
    votes: z.string(),
    present: z.string(),
    inProgress: z.string(),
  }),
  hero: z.strictObject({
    title: inline,
    motto: z.string(),
    lead: prose,
    /** Pills above the title, one set for desktop, one for phones. */
    points: perScreen(z.string()),
    /** Spec sheet cells; `stat` takes the number from the data files instead of `value`. */
    spec: z.array(
      z
        .strictObject({
          key: z.string(),
          value: z.string().optional(),
          stat: z.enum(["stars", "reputation"]).optional(),
          note: z.string(),
        })
        .refine(
          (cell) => (cell.value === undefined) !== (cell.stat === undefined),
          "Set either value or stat",
        ),
    ),
    actions: z.strictObject({ more: z.string(), cv: z.string(), email: z.string(), github: z.string() }),
  }),
  footer: z.strictObject({
    contact: z.string(),
    elsewhere: z.string(),
    files: z.string(),
    llms: z.string(),
    license: z.string(),
  }),
  notFound: z.strictObject({
    title: z.string(),
    code: z.string(),
    heading: inline,
    text: prose,
    action: z.string(),
  }),
});

/** A section (tab) of the page: its anchor, tab label and heading. */
const sectionHead = z.strictObject({
  id: z.string().regex(/^[a-z-]+$/, "Expected a lowercase anchor"),
  tab: z.string(),
  title: inline,
});

const aboutSchema = z.strictObject({
  summary: sectionHead.extend({
    prose,
    facts: z.array(z.strictObject({ key: z.string(), value: prose })),
  }),
  opensource: sectionHead.extend({
    text: prose,
    featured: z.strictObject({
      eyebrow: z.string(),
      title: z.string(),
      text: prose,
      note: prose,
      website: link,
      github: link,
    }),
    current: z.string(),
    past: z.string(),
    pastText: prose,
    /** small, centered line under the cards (a link to GitHub) */
    more: prose,
    stats: z.strictObject({ stars: z.string(), forks: z.string(), repos: z.string(), since: z.string() }),
  }),
  stackoverflow: sectionHead.extend({
    text: prose,
    selected: z.string(),
    more: prose,
    stats: z.strictObject({
      reputation: z.string(),
      answers: z.string(),
      badges: z.string(),
      since: z.string(),
    }),
    facts: z.string(),
    tags: z.string(),
  }),
  experience: sectionHead.extend({ advisory: z.string(), advisoryText: prose }),
  education: sectionHead.extend({ degrees: z.string(), postgraduate: z.string(), research: z.string() }),
  certificates: sectionHead,
  technologies: sectionHead,
});

/** One role on the experience timeline (Role.astro). */
const role = z.strictObject({
  title: z.string(),
  company: z.string(),
  url: z.url().optional(),
  from: month,
  to: month.optional(), // none: present
  points: z.array(prose).min(1),
  tags: z.array(z.string()).default([]),
});

const experienceSchema = z.strictObject({
  roles: z.array(role).min(1),
  advisory: z.array(role).min(1),
});

/** One degree or school (education). */
const school = z.strictObject({
  title: z.string(),
  detail: z.string().optional(),
  school: z.string(),
  url: z.url(),
  inProgress: z.boolean().default(false),
});

const educationSchema = z.strictObject({
  degrees: z.array(school).min(1),
  postgraduate: z.array(school),
  research: z.array(
    z.strictObject({ title: z.string(), url: z.url(), venue: z.string(), year: z.number().int() }),
  ),
});

const certificatesSchema = z.array(
  z.strictObject({
    title: z.string(),
    issuer: z.string(),
    url: z.url(),
    topic: z.string(),
    inProgress: z.boolean().default(false),
    note: prose,
  }),
);

/** One open source project card (RepoCard.astro). */
const repo = z.strictObject({
  name: z.string(),
  repo: z.url(),
  description: prose,
  stars: count,
  archived: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

const opensourceSchema = z.strictObject({
  // updated by `npm run update:stats` (scripts/update-stats.ts)
  totals: z.strictObject({ stars: count, forks: count, repos: count, since: z.number().int() }),
  accounts: z.array(z.string()).min(1),
  current: z.array(z.strictObject({ name: z.string(), url: z.url(), description: prose })),
  past: z.array(repo),
});

const stackoverflowSchema = z.strictObject({
  userId: count,
  // updated by `npm run update:stats` (scripts/update-stats.ts)
  stats: z.strictObject({
    reputation: count,
    answers: count,
    since: z.number().int(),
    badges: z.strictObject({ gold: count, silver: count, bronze: count }),
  }),
  /** "some facts" pills: a tag and what it stands for ("top 10 all time", "gold badge") */
  facts: perScreen(z.strictObject({ tag: z.string(), note: z.string() })),
  /** "other tags" pills: top answer tags, without the tags in the same screen's `facts` */
  topTags: perScreen(z.strictObject({ tag: z.string(), answers: count, score: count })),
  answers: z.array(
    z.strictObject({
      id: count,
      title: z.string(),
      score: count,
      views: count,
      /** the question's tags, under the title */
      tags: z.array(z.string()),
      /** badges on the right: what the answer is about */
      topics: z.array(z.string()).min(1),
    }),
  ),
});

const technologiesSchema = z.array(z.strictObject({ group: z.string(), items: z.array(z.string()).min(1) }));

export {
  aboutSchema,
  certificatesSchema,
  educationSchema,
  experienceSchema,
  opensourceSchema,
  siteSchema,
  stackoverflowSchema,
  technologiesSchema,
};
