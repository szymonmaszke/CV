// SPDX-FileCopyrightText: © 2026 Szymon Maszke <https://github.com/szymonmaszke>
// SPDX-License-Identifier: Apache-2.0

// Import raw content through Vite so saving YAML refreshes the local preview.
import source from "./content/site.yaml?raw";
import { load } from "./lib/content.ts";
import { siteSchema } from "./lib/schema.ts";

export const site = load(source, "src/content/site.yaml", siteSchema);
