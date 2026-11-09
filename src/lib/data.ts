// SPDX-FileCopyrightText: © 2026 Szymon Maszke <https://github.com/szymonmaszke>
// SPDX-License-Identifier: Apache-2.0

// Every content file, parsed and validated at build time. Raw imports through
// Vite, so saving a YAML file refreshes the local preview.
import aboutSource from "../content/about.yaml?raw";
import certificatesSource from "../content/certificates.yaml?raw";
import educationSource from "../content/education.yaml?raw";
import experienceSource from "../content/experience.yaml?raw";
import opensourceSource from "../content/opensource.yaml?raw";
import stackoverflowSource from "../content/stackoverflow.yaml?raw";
import technologiesSource from "../content/technologies.yaml?raw";
import { load } from "./content.ts";
import {
  aboutSchema,
  certificatesSchema,
  educationSchema,
  experienceSchema,
  opensourceSchema,
  stackoverflowSchema,
  technologiesSchema,
} from "./schema.ts";

/** Formats 1718 as "1.7K": one decimal at most (used by {@link short}). */
const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
/** Formats 25275 as "25,275", with thousands separators (used by {@link long}). */
const full = new Intl.NumberFormat("en");

// The validated content of each file, typed by its schema (src/lib/schema.ts).
// A typo or a missing field fails the build here, naming the file and field.
export const about = load(aboutSource, "src/content/about.yaml", aboutSchema);
export const certificates = load(certificatesSource, "src/content/certificates.yaml", certificatesSchema);
export const education = load(educationSource, "src/content/education.yaml", educationSchema);
export const experience = load(experienceSource, "src/content/experience.yaml", experienceSchema);
export const opensource = load(opensourceSource, "src/content/opensource.yaml", opensourceSchema);
export const stackoverflow = load(stackoverflowSource, "src/content/stackoverflow.yaml", stackoverflowSchema);
export const technologies = load(technologiesSource, "src/content/technologies.yaml", technologiesSchema);

/** The screens with lists of their own (desktop, phones): the hero's pills
 * and the Stack Overflow tags. */
export const screens = ["desktop", "mobile"] as const;

/** 1718 → "1.7k", 25275 → "25.3k" (lowercase, like the rest of the display type). */
export const short = (value: number) => compact.format(value).toLowerCase();
/** 25275 → "25,275" */
export const long = (value: number) => full.format(value);

/** "04/2022" → "2022-04" (for <time datetime>). */
export const isoMonth = (value: string) => {
  const [mm, yyyy] = value.split("/");
  return `${yyyy}-${mm}`;
};
