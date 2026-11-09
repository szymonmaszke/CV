// SPDX-FileCopyrightText: © 2026 Szymon Maszke <https://github.com/szymonmaszke>
// SPDX-License-Identifier: Apache-2.0

import { readFileSync } from "node:fs";
import { defineConfig } from "astro/config";
import { parse } from "yaml";

export default defineConfig({
  site: parse(readFileSync(new URL("./src/content/site.yaml", import.meta.url), "utf8")).url,
  trailingSlash: "ignore",
  // One page for now, at the root; /about (its old address) still leads there.
  redirects: {
    "/about": "/",
  },
  build: {
    // All CSS is inlined into the HTML (it is small): one request per page.
    inlineStylesheets: "always",
  },
  devToolbar: {
    enabled: false,
  },
});
