// SPDX-FileCopyrightText: © 2026 Szymon Maszke <https://github.com/szymonmaszke>
// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { parseYaml } from "../src/lib/content.ts";
import { plainText, renderMarkdown, validateMarkdown } from "../src/lib/markdown.ts";
import { aboutSchema, experienceSchema, siteSchema, stackoverflowSchema } from "../src/lib/schema.ts";

const read = (name: string) => parseYaml(readFileSync(`src/content/${name}.yaml`, "utf8"), `${name}.yaml`);
const site = siteSchema.parse(read("site"));
const about = aboutSchema.parse(read("about"));
const experience = experienceSchema.parse(read("experience"));

const duplicateKeyError = /site.yaml:.*Map keys/s;
const yamlError = /site.yaml:/;
const unsafeLinkError = /unsupported link/;
const inlineError = /inline text/;

test("Markdown: emphasis, lists, breaks, inline code and links", () => {
  const html = renderMarkdown("Some **bold** text:\n\n- one item");
  assert.ok(html.includes("<strong>bold</strong>"));
  assert.ok(html.includes("<ul>\n<li>one item</li>\n</ul>"));
  assert.equal(renderMarkdown("one\\\ntwo"), "<p>one<br>two</p>\n");
  assert.equal(
    renderMarkdown("a `command` and [link](#summary)", true),
    'a <code>command</code> and <a href="#summary">link</a>',
  );
});

test("plain text keeps punctuation, code and list content", () => {
  assert.equal(
    plainText("A **bold** word, `code`, and [link](#summary).\n\n- First\n- Second"),
    "A bold word, code, and link. First Second",
  );
});

test("YAML rejects duplicate keys and tab indentation", () => {
  assert.throws(() => parseYaml("name: one\nname: two", "site.yaml"), duplicateKeyError);
  assert.throws(() => parseYaml("hero:\n\tlead: broken", "site.yaml"), yamlError);
});

test("schemas reject typos, wrong types and invalid URLs", () => {
  assert.equal(siteSchema.safeParse({ ...site, typo: "x" }).success, false);
  assert.equal(siteSchema.safeParse({ ...site, url: "broken" }).success, false);
  assert.equal(siteSchema.safeParse({ ...site, hero: { ...site.hero, lead: 42 } }).success, false);
});

test("Markdown fields reject raw HTML and unsafe links", () => {
  assert.equal(siteSchema.safeParse({ ...site, hero: { ...site.hero, lead: "<b>x</b>" } }).success, false);
  assert.throws(() => validateMarkdown("[x](javascript:alert)", "lead"), unsafeLinkError);
  assert.throws(() => validateMarkdown("one\n\n- two", "title", true), inlineError);
});

test("dates are MM/YYYY", () => {
  const [role] = experience.roles;
  assert.ok(role);
  assert.equal(
    experienceSchema.safeParse({ ...experience, roles: [{ ...role, from: "2024-03" }] }).success,
    false,
  );
});

test("every section has a unique anchor", () => {
  const ids = [
    about.summary,
    about.opensource,
    about.stackoverflow,
    about.experience,
    about.education,
    about.certificates,
    about.technologies,
  ].map((section) => section.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("stackoverflow data matches its schema", () => {
  assert.equal(stackoverflowSchema.safeParse(read("stackoverflow")).success, true);
});
