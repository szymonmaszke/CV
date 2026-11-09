// SPDX-FileCopyrightText: © 2026 Szymon Maszke <https://github.com/szymonmaszke>
// SPDX-License-Identifier: Apache-2.0

// /sitemap.xml: the one indexable page (/about redirects to the root, 404 is noindex).
import { site } from "../site.config.ts";

const loc = new URL(site.links.home, site.url);
// the build date: the content only changes with a new build
const lastmod = new Date().toISOString().slice(0, 10);

export function GET() {
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${loc}</loc><lastmod>${lastmod}</lastmod></url></urlset>\n`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
}
