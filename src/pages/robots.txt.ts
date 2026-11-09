// SPDX-FileCopyrightText: © 2026 Szymon Maszke <https://github.com/szymonmaszke>
// SPDX-License-Identifier: Apache-2.0
import { site } from "../site.config.ts";
export function GET() {
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL("/sitemap.xml", site.url)}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
