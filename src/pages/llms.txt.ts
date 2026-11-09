// SPDX-FileCopyrightText: © 2026 Szymon Maszke <https://github.com/szymonmaszke>
// SPDX-License-Identifier: Apache-2.0

// /llms.txt: a plain-text version of the page for AI agents (https://llmstxt.org).
// Generated from the same content files, so it never goes stale.
import type { APIRoute } from "astro";
import {
  about,
  certificates,
  education,
  experience,
  long,
  opensource,
  stackoverflow,
  technologies,
} from "../lib/data.ts";
import { plainText } from "../lib/markdown.ts";
import { site } from "../site.config.ts";

const dates = (from: string, to?: string) => `${from} - ${to ?? site.ui.present}`;

/** A `##` section: its heading, a blank line, its lines and a blank line. */
const section = (title: string, lines: string[]) => [`## ${title}`, "", ...lines, ""];

const roles = (list: typeof experience.roles) =>
  list.map(
    (role) =>
      `- ${role.title}, ${role.company} (${dates(role.from, role.to)}): ${role.points.map(plainText).join("; ")}.`,
  );

/** The name, the lead and where to find the rest. */
const intro = () => [
  `# ${site.name}`,
  "",
  `> ${plainText(site.hero.lead)}`,
  "",
  `- [Website](${new URL(site.links.home, site.url)}): this page as HTML`,
  `- [CV (PDF)](${new URL(site.cv.light, site.url)}), also [dark](${new URL(site.cv.dark, site.url)})`,
  `- Email: ${site.email}`,
  `- GitHub: ${site.links.github}`,
  `- Stack Overflow: ${site.links.stackoverflow}`,
  "",
];

const openSource = () =>
  section("Open source", [
    `${long(opensource.totals.stars)} GitHub stars across ${opensource.totals.repos} public repositories.`,
    "",
    `- [opennudge](${site.links.opennudge}) (current): ${plainText(about.opensource.featured.text)}`,
    ...opensource.current.map((project) => `  - ${project.name}: ${plainText(project.description)}`),
    ...opensource.past.map(
      (project) =>
        `- [${project.name}](${project.repo}): ${plainText(project.description)} (${project.stars} stars)`,
    ),
  ]);

const stackOverflow = () =>
  section("Stack Overflow", [
    `${long(stackoverflow.stats.reputation)} reputation, ${stackoverflow.stats.answers} answers; ${stackoverflow.facts.desktop
      .map((fact) => `${fact.tag} (${fact.note})`)
      .join(", ")}.`,
    "",
    ...stackoverflow.answers.map(
      (answer) =>
        `- [${answer.title}](https://stackoverflow.com/a/${answer.id}) (${answer.score} votes; ${answer.topics.join(", ")})`,
    ),
  ]);

const educationLines = () =>
  section("Education", [
    ...[...education.degrees, ...education.postgraduate].map(
      (item) =>
        `- ${item.title}${item.detail ? ` (${item.detail})` : ""}, ${item.school}${item.inProgress ? `, ${site.ui.inProgress}` : ""}`,
    ),
    ...education.research.map(
      (paper) => `- Research: [${paper.title}](${paper.url}), ${paper.venue}, ${paper.year}`,
    ),
  ]);

const certificateLines = () =>
  section(
    "Certificates",
    certificates.map(
      (certificate) =>
        `- ${certificate.title}, ${certificate.issuer}: ${certificate.topic}${certificate.inProgress ? ` (${site.ui.inProgress})` : ""}`,
    ),
  );

export const GET: APIRoute = () => {
  const lines = [
    ...intro(),
    // Markdown already: the list and links read well as they are
    ...section("Summary", [about.summary.prose]),
    ...openSource(),
    ...stackOverflow(),
    ...section("Experience", [
      ...roles(experience.roles),
      "",
      "### Advisory",
      "",
      ...roles(experience.advisory),
    ]),
    ...educationLines(),
    ...certificateLines(),
    ...section(
      "Technologies",
      technologies.map((group) => `- ${group.group}: ${group.items.join(", ")}`),
    ),
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
