// SPDX-FileCopyrightText: © 2026 Szymon Maszke <https://github.com/szymonmaszke>
// SPDX-License-Identifier: Apache-2.0

// Turns the section menu (Tabs.astro) into tabs, following the WAI-ARIA tabs
// pattern: one [data-panel] shown at a time, arrow keys / Home / End move
// between tabs, the URL hash names the open one (/#experience), so links
// and the back button work. Without this script every section is shown.
//
// When the tabs don't fit (phones), the bar becomes an endless carousel
// (src/scripts/carousel.ts). Swiping only scrolls it; a tap opens the
// section, centers its tab and scrolls the page to the top of the section
// (as a tab does on desktop); the arrows at its ends and a swipe on the
// content (src/scripts/swipe.ts) open the next or previous one.

import {
  carousel,
  centerOn,
  follow,
  isCarousel,
  loop,
  markClones,
  overflows,
  swipeable,
  zoomed,
} from "./carousel.ts";
import { glide } from "./glide.ts";
import { swipe } from "./swipe.ts";
import { arrows, bar, block, list, openLinks, panels, room, tabs } from "./tab-elements.ts";

const first = tabs[0]?.dataset.tab ?? "";
/** The section named by the URL hash, or the first one if it names none. */
const fromHash = () => {
  const id = decodeURIComponent(location.hash.slice(1));
  return panels.has(id) ? id : first;
};

/** Slide the filled block under the chosen tab. Measured to the fraction of
 * a pixel (offsetLeft / offsetWidth round): the tabs share the capsule's
 * room, and the block must meet the capsule's ends exactly. */
const place = (tab: HTMLElement) => {
  if (!(block && list)) {
    return;
  }
  const box = tab.getBoundingClientRect();
  const left = box.left - list.getBoundingClientRect().left - list.clientLeft + list.scrollLeft;
  block.style.setProperty("--x", `${left}px`);
  block.style.setProperty("--w", `${box.width}px`);
};

/** Where the sticky bar sticks: its `top`, in pixels. */
const stickyTop = (el: HTMLElement) => Number.parseFloat(getComputedStyle(el).top) || 0;

/** The sticky bar is stuck under the header (the page is scrolled past it). */
const stuck = () => (bar ? bar.getBoundingClientRect().top <= stickyTop(bar) + 1 : false);

/** A switch scrolls to its section: the page is far down (the bar stuck),
 * or the section starts below the screen (short screens: the tabs at its
 * bottom edge), where nothing would seem to happen. */
const scrollsTo = (panel: HTMLElement) => stuck() || panel.getBoundingClientRect().top >= innerHeight;

/** Scroll the page to the top of a section, just under the sticky bar (and
 * its scroll margin: desktop keeps the gap the page has there): down to it
 * from above, up to it from deep in another one, gliding (glide.ts).
 * `jump`: see {@link show}. */
const toTop = (panel: HTMLElement, { jump = false } = {}) => {
  if (!bar) {
    return;
  }
  const margin = Number.parseFloat(getComputedStyle(panel).scrollMarginTop) || 0;
  glide(panel.getBoundingClientRect().top + scrollY - stickyTop(bar) - bar.offsetHeight - margin, {
    instant: jump,
  });
};

/** Id of the open section ("" before the first {@link show}). */
let current = "";

/**
 * Select the tab of one section (and only it), the block sliding under it.
 *
 * @param id - The section's id.
 * @param options.focus - Move keyboard focus to the tab (arrow keys).
 * @param options.smooth - Scroll the carousel there smoothly (a switch), not
 *   at once (on load).
 */
const selectTab = (id: string, { focus, smooth }: { focus: boolean; smooth: boolean }) => {
  for (const tab of tabs) {
    const selected = tab.dataset.tab === id;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
    tab.toggleAttribute("data-current", selected);
    if (selected) {
      place(tab);
      // the real tab for the keyboard (it has the focus ring), else the copy
      // nearest the eye (a tap: the one tapped)
      centerOn(id, { smooth, real: focus });
      if (focus) {
        tab.focus({ preventScroll: true });
      }
    }
  }
};

/** Show one section and hide the others; it fades in, unless it is the
 * first one shown (on load, `previous` is ""). */
const showPanel = (id: string, previous: string) => {
  for (const [panelId, panel] of panels) {
    panel.hidden = panelId !== id;
    panel.toggleAttribute("data-enter", previous !== "" && panelId === id);
  }
};

/**
 * Open one section: select its tab, hide the other panels and scroll to the
 * top of the new section: always for a tap on the bar (`reveal`), otherwise
 * if the bar is stuck or the section starts below the screen.
 *
 * @param id - The section's id (its [data-panel] element and tab).
 * @param options.focus - Move keyboard focus to the tab (arrow keys).
 * @param options.jump - Scroll to the new section at once, not smoothly (a
 *   swipe has drawn it there already).
 * @param options.reveal - Chosen on the bar (a tab, an arrow, a key): bring
 *   the section's top under the bar wherever the page is.
 */
const show = (id: string, { focus = false, jump = false, reveal = false } = {}) => {
  if (id === current) {
    return;
  }
  const previous = current;
  current = id;
  markClones(id);
  selectTab(id, { focus, smooth: previous !== "" });
  showPanel(id, previous);
  for (const link of openLinks) {
    link.setAttribute("href", `#${id}`);
  }
  // A switch made on the bar goes to the top of the new section, just under
  // the bar: down from the page top, up from deep in another section, never
  // into the middle of it. Any other switch (a swipe, back / forward) only
  // when far down the page or when the section starts below the screen
  // ({@link scrollsTo}).
  const panel = panels.get(id);
  if (previous && panel && (reveal || scrollsTo(panel))) {
    toTop(panel, { jump });
  }
};

/** A tap on a tab (or a copy of it): open its section, or, if it is open
 * already, bring its tab to the middle of a carousel (and, with `reveal`,
 * the page to its top). `jump`, `reveal`: see {@link show}. */
const choose = (id: string, { jump = false, reveal = false } = {}) => {
  if (id === current) {
    centerOn(id);
    const panel = panels.get(id);
    if (reveal && panel) {
      toTop(panel, { jump });
    }
  } else {
    history.pushState(null, "", `#${id}`);
    show(id, { jump, reveal });
  }
};

/** Id of the section `by` tabs away from the open one (-1 or 1), round the
 * ends. */
const neighbour = (by: number) => {
  const index = tabs.findIndex((tab) => tab.dataset.tab === current);
  return tabs[(index + by + tabs.length) % tabs.length]?.dataset.tab ?? "";
};

if (list && tabs.length > 0) {
  list.setAttribute("role", "tablist");
  for (const tab of tabs) {
    const id = tab.dataset.tab ?? "";
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", id);
    const panel = panels.get(id);
    panel?.setAttribute("role", "tabpanel");
    panel?.setAttribute("aria-labelledby", tab.id);
    panel?.setAttribute("tabindex", "-1");

    tab.addEventListener("click", (event) => {
      event.preventDefault();
      choose(id, { reveal: true });
    });
  }

  /** The keys that move between tabs, and the tab each one moves to. */
  const moves = new Map<string, () => string | undefined>([
    ["ArrowRight", () => neighbour(1)],
    ["ArrowLeft", () => neighbour(-1)],
    ["Home", () => tabs[0]?.dataset.tab],
    ["End", () => tabs.at(-1)?.dataset.tab],
  ]);
  list.addEventListener("keydown", (event) => {
    const move = moves.get(event.key);
    if (!move) {
      return;
    }
    event.preventDefault();
    const id = move();
    if (id) {
      history.replaceState(null, "", `#${id}`);
      show(id, { focus: true, reveal: true });
    }
  });

  for (const arrow of arrows) {
    arrow.addEventListener("click", () => choose(neighbour(Number(arrow.dataset.step)), { reveal: true }));
  }

  if (room) {
    swipe(room, {
      panels,
      current: () => current,
      neighbour,
      enabled: () => isCarousel() && !zoomed(),
      choose: (id) => choose(id, { jump: true }),
      stuck,
      barBottom: () => bar?.getBoundingClientRect().bottom ?? 0,
      follow: (direction) => follow(current, direction),
    });
  }

  // back / forward, and in-page links to a section (#experience)
  addEventListener("popstate", () => show(fromHash()));
  addEventListener("hashchange", () => show(fromHash()));

  show(fromHash());

  // measure again once fonts and layout settle, and on resize
  const replace = () => {
    carousel(overflows(), { current, choose });
    const tab = tabs.find((item) => item.dataset.tab === current);
    if (tab) {
      place(tab);
    }
  };
  // zooming in hands sideways drags back to the page; zooming out, to swipes
  globalThis.visualViewport?.addEventListener("resize", swipeable);
  // the carousel wraps around once it rests (no scrollend: shortly after
  // the last scroll event)
  if ("onscrollend" in globalThis) {
    list.addEventListener("scrollend", loop);
  } else {
    const restMs = 150;
    let timer: ReturnType<typeof setTimeout> | undefined;
    list.addEventListener(
      "scroll",
      () => {
        clearTimeout(timer);
        timer = setTimeout(loop, restMs);
      },
      { passive: true },
    );
  }
  const resize = new ResizeObserver(replace);
  resize.observe(list);
  if (room) {
    resize.observe(room);
  }
  document.fonts.ready.then(replace);
  // a local: TypeScript doesn't narrow an import inside callbacks
  const tablist = list;
  requestAnimationFrame(() => {
    replace();
    tablist.setAttribute("data-ready", "");
    // the block slides only between tabs, not into place on load
    requestAnimationFrame(() => tablist.setAttribute("data-animate", ""));
  });
}
