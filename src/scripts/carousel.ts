// SPDX-FileCopyrightText: © 2026 Szymon Maszke <https://github.com/szymonmaszke>
// SPDX-License-Identifier: Apache-2.0

// The endless carousel the tab bar becomes when the tabs don't fit (phones,
// tabs.ts): the tab set is repeated on both sides, so it scrolls round and
// round, and the tabs cut off at both edges show there is more. A swipe on
// the sections (swipe.ts) moves it along with the finger.

import { arrows, list, room, tabs } from "./tab-elements.ts";

/** Opens a section, as a tap on its tab does (tabs.ts). */
type Choose = (id: string, options: { reveal: boolean }) => void;

/** Copies of the tab set in the carousel: the real one in the middle, two
 * on each side, room for a long fling before the loop wraps it back. */
const copies = 5;
/** The repeated tabs (aria-hidden), present only while it is a carousel. */
let clones: HTMLAnchorElement[] = [];
/** A swipe moves the bar: it neither loops nor snaps meanwhile. */
let following = false;
/** Scale past which the page counts as zoomed in (some browsers report a
 * hair over 1 at rest). */
const zoomedScale = 1.01;

/** Width of one tab set, gaps included: the carousel's period. */
const period = () => {
  const [firstTab] = tabs;
  const next = clones[Math.floor(copies / 2) * tabs.length];
  return firstTab && next ? next.offsetLeft - firstTab.offsetLeft : 0;
};

/** A copy of a tab, hidden from screen readers and the keyboard; a tap on
 * it opens its section, as the tab does. */
const cloneTab = (tab: HTMLAnchorElement, choose: Choose) => {
  const clone = tab.cloneNode(true) as HTMLAnchorElement;
  for (const name of ["id", "role", "aria-controls", "aria-selected"]) {
    clone.removeAttribute(name);
  }
  clone.setAttribute("aria-hidden", "true");
  clone.tabIndex = -1;
  clone.addEventListener("click", (event) => {
    event.preventDefault();
    choose(clone.dataset.tab ?? "", { reveal: true });
  });
  return clone;
};

/** The bar is a carousel now. */
export const isCarousel = () => clones.length > 0;

/** The page is pinch-zoomed in: a sideways drag pans it, not the sections. */
export const zoomed = () => (globalThis.visualViewport?.scale ?? 1) > zoomedScale;

/** Sections are swiped (swipe.ts) while the tabs are a carousel and the page
 * is not zoomed in: [data-swipe] keeps the page's sideways drags for that. */
export const swipeable = () => {
  room?.toggleAttribute("data-swipe", isCarousel() && !zoomed());
};

/** Mark the copies of the open section's tab. */
export const markClones = (id: string) => {
  for (const clone of clones) {
    clone.toggleAttribute("data-current", clone.dataset.tab === id);
  }
};

/** In a carousel, center the copy of a section's tab nearest to the middle
 * of the bar (the one the eye is on), or the real tab itself. Only the bar
 * scrolls (sideways): scrollIntoView would move the page too. */
export const centerOn = (id: string, { smooth = true, real = false } = {}) => {
  if (!(list && isCarousel())) {
    return;
  }
  const middle = list.scrollLeft + list.clientWidth / 2;
  const distance = (tab: HTMLElement) => Math.abs(tab.offsetLeft + tab.offsetWidth / 2 - middle);
  const candidates = [...tabs, ...(real ? [] : clones)].filter((tab) => tab.dataset.tab === id);
  const [nearest] = candidates.sort((a, b) => distance(a) - distance(b));
  if (nearest) {
    list.scrollTo({
      left: nearest.offsetLeft - (list.clientWidth - nearest.offsetWidth) / 2,
      behavior: smooth ? "smooth" : "instant",
    });
  }
};

/** Once the carousel rests, jump it back by whole tab sets so its middle is
 * over the real set again: the same tabs under the same spot, unseen, and
 * never the end of the copies. */
export const loop = () => {
  const width = period();
  const start = tabs[0]?.offsetLeft;
  if (!(list && isCarousel() && !following && width > 0 && start !== undefined)) {
    return;
  }
  const middle = list.scrollLeft + list.clientWidth / 2;
  const sets = Math.floor((middle - start) / width);
  if (sets !== 0) {
    list.scrollTo({ left: list.scrollLeft - sets * width, behavior: "instant" });
  }
};

/**
 * Move the carousel with a swipe (swipe.ts), from the copy of the open tab
 * nearest the middle towards the tab next to it.
 *
 * @param current - Id of the open section.
 * @param direction - -1 towards the previous tab, 1 towards the next.
 * @returns Takes the progress (0 to 1); with `done`, glides there and lets
 *   the bar loop and snap again.
 */
export const follow = (current: string, direction: number) => {
  const middle = list ? list.scrollLeft + list.clientWidth / 2 : 0;
  const centerOf = (tab: Element | null | undefined) =>
    tab instanceof HTMLElement && tab.dataset.tab ? tab.offsetLeft + tab.offsetWidth / 2 : undefined;
  const away = (tab: HTMLElement) => Math.abs((centerOf(tab) ?? 0) - middle);
  const [from] = [...tabs, ...clones]
    .filter((tab) => tab.dataset.tab === current)
    .sort((a, b) => away(a) - away(b));
  const start = centerOf(from);
  const end = centerOf(direction > 0 ? from?.nextElementSibling : from?.previousElementSibling);
  if (!list || start === undefined || end === undefined) {
    return () => undefined;
  }
  // a local: TypeScript doesn't narrow an import inside the function returned
  const tablist = list;
  following = true;
  tablist.style.scrollSnapType = "none";
  return (progress: number, done = false) => {
    const left = start + (end - start) * progress - tablist.clientWidth / 2;
    tablist.scrollTo({ left, behavior: done ? "smooth" : "instant" });
    if (done) {
      following = false;
      tablist.style.scrollSnapType = "";
    }
  };
};

/** The tab set, side by side, is wider than the room the bar has, between
 * the gutters. Measured on the sections, not the bar itself: a carousel
 * spans the screen, and the room must not grow when it turns on. */
export const overflows = () => {
  const [firstTab] = tabs;
  const lastTab = tabs.at(-1);
  if (!(list && firstTab && lastTab && room)) {
    return false;
  }
  const px = (value: string) => Number.parseFloat(value) || 0;
  const outer = getComputedStyle(room);
  const inner = getComputedStyle(list);
  const available = room.clientWidth - px(outer.paddingLeft) - px(outer.paddingRight);
  const inset = px(inner.paddingLeft) + px(inner.paddingRight);
  return lastTab.offsetLeft + lastTab.offsetWidth - firstTab.offsetLeft + inset > available + 1;
};

/**
 * Turn the carousel on (the tabs don't fit the bar) or off.
 *
 * @param on - A carousel, or the tabs side by side.
 * @param tabsState.current - Id of the open section.
 * @param tabsState.choose - Opens a section: a tap on a copy of its tab.
 */
export const carousel = (on: boolean, { current, choose }: { current: string; choose: Choose }) => {
  if (!list || on === isCarousel()) {
    return;
  }
  if (on) {
    const side = Math.floor(copies / 2);
    const copy = () => tabs.map((tab) => cloneTab(tab, choose));
    const before = Array.from({ length: side }, copy).flat();
    const after = Array.from({ length: side }, copy).flat();
    tabs[0]?.before(...before);
    list.append(...after);
    clones = [...before, ...after];
    markClones(current);
    list.setAttribute("data-carousel", "");
    centerOn(current, { smooth: false, real: true });
  } else {
    for (const clone of clones) {
      clone.remove();
    }
    clones = [];
    list.removeAttribute("data-carousel");
  }
  for (const arrow of arrows) {
    arrow.hidden = !on;
  }
  swipeable();
};
