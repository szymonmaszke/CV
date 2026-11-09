// SPDX-FileCopyrightText: © 2026 Szymon Maszke <https://github.com/szymonmaszke>
// SPDX-License-Identifier: Apache-2.0

import type { z } from "astro/zod";
import { parseDocument } from "yaml";

/**
 * Parse YAML text into plain JavaScript values, without validating them.
 * Duplicate keys are an error, not a silent overwrite.
 *
 * @param source - The YAML text.
 * @param filename - Path of the file, used only in error messages.
 * @returns The parsed value (check it with a schema, see {@link load}).
 * @throws Error naming the file and every YAML error in it.
 */
export function parseYaml(source: string, filename: string): unknown {
  const document = parseDocument(source, { uniqueKeys: true });
  if (document.errors.length > 0) {
    throw new Error(`${filename}: ${document.errors.map((error) => error.message).join("\n")}`);
  }
  return document.toJS();
}

/**
 * Parse a YAML file and validate it against its schema (src/lib/schema.ts).
 *
 * @param source - The YAML text.
 * @param filename - Path of the file, used only in error messages.
 * @param schema - The Zod schema the content must match.
 * @returns The validated content, typed by the schema.
 * @throws Error naming the file and each invalid field (`path.to.field: message`).
 */
export function load<T>(source: string, filename: string, schema: z.ZodType<T>): T {
  const result = schema.safeParse(parseYaml(source, filename));
  if (!result.success) {
    throw new Error(
      `${filename}:\n${result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("\n")}`,
    );
  }
  return result.data;
}
