// SPDX-FileCopyrightText: © 2026 Szymon Maszke <https://github.com/szymonmaszke>
// SPDX-License-Identifier: Apache-2.0

// Small icons shared by components: the GitHub and StackOverflow marks and
// the vote arrow (filled), and 16×16 stroke icons drawn with iconAttributes().

/** Stroke icon attributes (16×16, 1.5px, hidden from screen readers). */
export const iconAttributes = (size = 14) =>
  ({
    viewBox: "0 0 16 16",
    width: String(size),
    height: String(size),
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "1.5",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    "aria-hidden": "true",
  }) as const;

/** The GitHub mark (filled, 16×16 viewBox; GitHub's Octicons). */
export const githubMark =
  "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z";

/** The StackOverflow mark (filled, 24×24 viewBox; Simple Icons, CC0). */
export const stackoverflowMark =
  "M15.725 0l-1.72 1.277 6.39 8.588 1.716-1.277L15.725 0zm-3.94 3.418l-1.369 1.644 8.225 6.85 1.369-1.644-8.225-6.85zm-3.15 4.465l-.905 1.94 9.702 4.517.904-1.94-9.701-4.517zm-1.85 4.86l-.44 2.093 10.473 2.201.44-2.092-10.473-2.203zM1.89 15.47V24h19.19v-8.53h-2.133v6.397H4.021v-6.396H1.89zm4.265 2.133v2.13h10.66v-2.13H6.154z";

/** An upward triangle (filled, 16×16 viewBox): StackOverflow votes. */
export const voteMark = "M8 3.5 13.5 12h-11z";

/** opennudge.com's bouncing arrow: a filled chevron pointing down (24x24). */
export const arrowPath =
  "M12 17c-.3 0-.6-.1-.8-.3l-6-6a1 1 0 0 1 1.4-1.4L12 14.6l5.4-5.3a1 1 0 1 1 1.4 1.4l-6 6c-.2.2-.5.3-.8.3z";

/** Stroke icon paths. */
export const icons = {
  // arrow into a tray: download
  download: [
    "M8 2.25v7.5",
    "m4.75 6.75 3.25 3.25 3.25-3.25",
    "M2.75 11.25v1.5a1 1 0 0 0 1 1h8.5a1 1 0 0 0 1-1v-1.5",
  ],
  // envelope
  mail: ["M2.25 3.75h11.5v8.5H2.25z", "m2.5 4.25 5.5 4.5 5.5-4.5"],
  // five-pointed star (GitHub stars)
  star: ["M8 1.9 9.8 5.6l4 .6-2.9 2.8.7 4L8 11.1 4.4 13l.7-4-2.9-2.8 4-.6z"],
  // an eye (views)
  eye: [
    "M1.5 8S3.75 3.5 8 3.5 14.5 8 14.5 8 12.25 12.5 8 12.5 1.5 8 1.5 8z",
    "M8 6.25a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5z",
  ],
  // right-pointing chevron (a row that opens something)
  chevron: ["m6 3.5 4.5 4.5L6 12.5"],
} as const;
