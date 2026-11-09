// SPDX-FileCopyrightText: © 2026 Szymon Maszke <https://github.com/szymonmaszke>
// SPDX-License-Identifier: Apache-2.0

// The section tabs' elements (Tabs.astro) and the sections they open, shared
// by the tabs (tabs.ts) and their carousel (carousel.ts).

/** The tab bar's list of tabs. */
export const list = document.querySelector<HTMLElement>("[data-tablist]");
/** The tabs, in order (not the carousel's copies). */
export const tabs = [...document.querySelectorAll<HTMLAnchorElement>("[data-tab]")];
/** The sections' [data-panel] elements, by id. */
export const panels = new Map(
  [...document.querySelectorAll<HTMLElement>("[data-panel]")].map((panel) => [panel.id, panel]),
);
/** The filled block under the open tab. */
export const block = list?.querySelector<HTMLElement>(".block");
/** The sticky bar around the tabs. */
export const bar = list?.closest<HTMLElement>(".tabs");
/** The carousel's arrows, at its ends. */
export const arrows = [...(bar?.querySelectorAll<HTMLButtonElement>("[data-step]") ?? [])];
/** Links down to the sections (the hero's "see more"): kept on the open
 * one, so they scroll to it rather than switch back to the first. */
export const openLinks = [...document.querySelectorAll<HTMLAnchorElement>("[data-open-section]")];
/** The sections' container: its gutters are the bar's too. */
export const room = panels.values().next().value?.parentElement;
