// SPDX-FileCopyrightText: © 2026 Szymon Maszke <https://github.com/szymonmaszke>
// SPDX-License-Identifier: Apache-2.0

// Licenses of every npm dependency (package-lock.json, all platforms), run by
// `npm run check:licenses` (prek: licenses). A dependency passes when its SPDX
// expression is satisfied by the allowed licenses or it is a listed exception.

import { readFileSync } from "node:fs";
import process from "node:process";

/** SPDX expression tokens: parentheses, licenses and operators. */
const spdxToken = /\(|\)|[^\s()]+/g;

/** Path prefix of package-lock.json keys (nested ones included). */
const nodeModules = /^.*node_modules\//;

/** opentemplate's allowed licenses (its .trivy.yaml), plus permissive BlueOak-1.0.0 and CC0-1.0. */
const allowed = new Set([
  "MIT",
  "MIT-0",
  "Apache-2.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "ISC",
  "PSF-2.0",
  "Python-2.0",
  "0BSD",
  "Unlicense",
  "Zlib",
  "OFL-1.1",
  "BlueOak-1.0.0",
  "CC0-1.0",
]);

/** Package name prefixes under other licenses, with why they are acceptable. */
const exceptions: Record<string, string> = {
  "@img/sharp-": "LGPL-3.0 libvips, optional image processing at build time, nothing of it ships",
  lightningcss: "MPL-2.0, CSS tooling used unmodified at build time, nothing of it ships",
};

/** Whether an SPDX expression (AND, OR, parentheses) is satisfied by the allowed licenses. */
function satisfied(expression: string): boolean {
  const tokens = expression.match(spdxToken) ?? [];
  let position = 0;
  const next = () => {
    position += 1;
    return tokens[position - 1];
  };
  const term = (): boolean => {
    const token = next();
    if (token !== "(") {
      return allowed.has(token ?? "");
    }
    const inner = any();
    next();
    return inner;
  };
  const all = (): boolean => {
    let result = term();
    while (tokens[position] === "AND") {
      next();
      result = term() && result;
    }
    return result;
  };
  const any = (): boolean => {
    let result = all();
    while (tokens[position] === "OR") {
      next();
      result = all() || result;
    }
    return result;
  };
  return any();
}

const lock: { packages: Record<string, { license?: string }> } = JSON.parse(
  readFileSync("package-lock.json", "utf8"),
);

const failures = Object.entries(lock.packages)
  // "" is this project, every other key is a node_modules/<name> path
  .filter(([path]) => path !== "")
  .map(([path, { license }]) => ({ name: path.replace(nodeModules, ""), license: license ?? "none" }))
  .filter(({ license }) => !satisfied(license))
  .filter(({ name }) => !Object.keys(exceptions).some((prefix) => name.startsWith(prefix)));

for (const { name, license } of failures) {
  process.stderr.write(`${name}: ${license} is not allowed (.github/tools/licenses.ts)\n`);
}
process.exitCode = failures.length > 0 ? 1 : 0;
