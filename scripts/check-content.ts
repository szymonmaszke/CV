// SPDX-FileCopyrightText: © 2026 Szymon Maszke <https://github.com/szymonmaszke>
// SPDX-License-Identifier: Apache-2.0

// `npm run check`: the content checks of the build, without building.
import { readFileSync } from "node:fs";
import type { z } from "astro/zod";
import { load } from "../src/lib/content.ts";
import {
  aboutSchema,
  certificatesSchema,
  educationSchema,
  experienceSchema,
  opensourceSchema,
  siteSchema,
  stackoverflowSchema,
  technologiesSchema,
} from "../src/lib/schema.ts";

const files: Record<string, z.ZodType> = {
  site: siteSchema,
  about: aboutSchema,
  certificates: certificatesSchema,
  education: educationSchema,
  experience: experienceSchema,
  opensource: opensourceSchema,
  stackoverflow: stackoverflowSchema,
  technologies: technologiesSchema,
};

for (const [name, schema] of Object.entries(files)) {
  const filename = `src/content/${name}.yaml`;
  load(readFileSync(filename, "utf8"), filename, schema);
}
