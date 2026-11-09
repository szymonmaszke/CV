// SPDX-FileCopyrightText: © 2026 Szymon Maszke <https://github.com/szymonmaszke>
// SPDX-License-Identifier: Apache-2.0

// The sections' side of a swipe (swipe.ts tracks the finger): the open
// section follows the finger with its neighbour next to it, then the
// neighbour slides in or both spring back.

/** What the tabs (tabs.ts) lend the gesture. */
interface SwipeHost {
  /** The sections' [data-panel] elements, by id. */
  panels: Map<string, HTMLElement>;
  /** Id of the open section. */
  current: () => string;
  /** Id of the previous (-1) or next (1) section, round the ends. */
  neighbour: (direction: number) => string;
  /** Swiping is on (the tabs are a carousel, the page not zoomed in). */
  enabled: () => boolean;
  /** Open a section (as a tap on its tab does), its top scrolled under the
   * bar at once if the bar is stuck. */
  choose: (id: string) => void;
  /** The sticky bar is stuck: a switch scrolls to the top of the new section. */
  stuck: () => boolean;
  /** The bottom edge of the sticky bar, in viewport pixels. */
  barBottom: () => number;
  /** Start moving the tab bar with the finger towards the previous (-1) or
   * next (1) tab. The result takes the progress (0 to 1); with `done`, it
   * glides to that point and lets the bar go. */
  follow: (direction: number) => (progress: number, done?: boolean) => void;
}

/** What moving the sections needs (and the drag, swipe.ts, shares). */
interface Sections {
  /** The element holding the [data-panel] sections. */
  container: HTMLElement;
  /** The tabs' side of it (see {@link SwipeHost}). */
  host: SwipeHost;
  /** Reduced motion: the sections switch without moving. */
  reducedMotion: MediaQueryList;
  /** A slide is finishing: no new drag until it has. */
  busy: boolean;
}

/** The two sections a drag moves. */
interface Slide {
  /** The open section. */
  panel: HTMLElement;
  /** The section coming in, if there is one that way. */
  neighbour?: HTMLElement;
  /** Where it comes from: -1 the previous, 1 the next (0 before the first move). */
  direction: number;
  /** A section's width plus the gap between the two. */
  width: number;
  /** Moves the tab bar along (see {@link SwipeHost.follow}). */
  follow?: (progress: number, done?: boolean) => void;
}

/** Longest wait for the slide to finish, in milliseconds. */
const settleMs = 600;

/** Run `then` once the element's transform transition ends (or soon after,
 * if it never does). */
const settle = (el: HTMLElement, then: () => void) => {
  let finished = false;
  const finish = () => {
    if (!finished) {
      finished = true;
      el.removeEventListener("transitionend", finish);
      then();
    }
  };
  el.addEventListener("transitionend", finish);
  setTimeout(finish, settleMs);
};

/** A drag is not a tap: the click after it (if any) opens nothing. */
const swallowClick = (container: HTMLElement) => {
  const swallow = (click: Event) => {
    click.preventDefault();
    click.stopPropagation();
  };
  container.addEventListener("click", swallow, { capture: true, once: true });
  setTimeout(() => container.removeEventListener("click", swallow, { capture: true }), settleMs);
};

/** Put the neighbour on the side it comes from, its top just under the bar
 * (where the switch will scroll its top to) or, near the page top, level
 * with the open section. */
const stage = ({ container, host }: Sections, slide: Slide, direction: number) => {
  if (slide.neighbour) {
    slide.neighbour.hidden = true;
    slide.neighbour.removeAttribute("style");
  }
  const neighbour = host.panels.get(host.neighbour(direction));
  if (!neighbour || neighbour === slide.panel) {
    slide.neighbour = undefined;
    return;
  }
  // measure first, then place it out of the flow, then show it: shown in
  // the flow for a moment, a section above would push the page down
  const box = container.getBoundingClientRect();
  const top = host.stuck() ? host.barBottom() - box.top : slide.panel.offsetTop;
  const { offsetLeft: left, offsetWidth: width } = slide.panel;
  Object.assign(neighbour.style, {
    position: "absolute",
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`,
    // down to the bottom of the screen only: it must not spill over the
    // footer while it is a preview
    maxHeight: `${Math.max(0, innerHeight - (box.top + top))}px`,
    overflow: "clip",
    background: "var(--bg)",
  });
  neighbour.hidden = false;
  slide.neighbour = neighbour;
  slide.direction = direction;
  slide.follow?.(0, true);
  slide.follow = host.follow(direction);
};

/** Move both sections by `dx` (the neighbour a section width plus the gap
 * further). */
const position = ({ reducedMotion }: Sections, slide: Slide, dx: number) => {
  if (reducedMotion.matches) {
    return;
  }
  slide.panel.style.transform = `translateX(${dx}px)`;
  if (slide.neighbour) {
    slide.neighbour.style.transform = `translateX(${dx + slide.direction * slide.width}px)`;
  }
  slide.follow?.(Math.min(1, Math.abs(dx) / slide.width));
};

/** Let go: the neighbour slides in (`open`), or both spring back. */
const slideTo = (sections: Sections, slide: Slide, neighbour: HTMLElement, open: boolean) => {
  const { container, host, reducedMotion } = sections;
  const { panel, width, direction, follow } = slide;
  swallowClick(container);

  const id = host.neighbour(direction);
  // the tab bar glides on to the new tab (or back) while the sections slide
  follow?.(open ? 1 : 0, true);
  const finish = () => {
    // The browser would keep the neighbour (the only section on screen) in
    // place as it drops into the page, scrolling the page by the distance;
    // the switch scrolls to it itself.
    const root = document.documentElement;
    root.style.overflowAnchor = "none";
    requestAnimationFrame(() => root.style.removeProperty("overflow-anchor"));
    panel.style.transform = "";
    panel.style.transition = "";
    if (!open) {
      neighbour.hidden = true;
    }
    neighbour.removeAttribute("style");
    if (open) {
      host.choose(id);
      // it is on screen already: no fade in
      neighbour.removeAttribute("data-enter");
    }
    sections.busy = false;
  };
  if (reducedMotion.matches) {
    finish();
    return;
  }
  sections.busy = true;
  const target = open ? -direction * width : 0;
  for (const el of [panel, neighbour]) {
    el.style.transition = "transform var(--slow) var(--ease)";
  }
  requestAnimationFrame(() => {
    panel.style.transform = `translateX(${target}px)`;
    neighbour.style.transform = `translateX(${target + direction * width}px)`;
    settle(panel, finish);
  });
};

export type { Sections, Slide, SwipeHost };
export { position, slideTo, stage };
