// SPDX-FileCopyrightText: © 2026 Szymon Maszke <https://github.com/szymonmaszke>
// SPDX-License-Identifier: Apache-2.0

// Scroll the page to a point at a pace of our own (the tabs, tabs.ts): the
// browser's smooth scrolling crosses a long section in a blink and can't be
// slowed down. The glide lasts longer the farther it goes, eases in and out,
// and stops the moment the reader scrolls, taps or presses a key.

/** Shortest and longest glide, in milliseconds. */
const minMs = 450;
const maxMs = 900;
/** Milliseconds added per pixel travelled (on top of {@link baseMs}). */
const msPerPx = 0.15;
const baseMs = 300;

/** Input that hands the page back to the reader mid-glide. */
const interrupts = ["wheel", "touchstart", "pointerdown", "keydown"] as const;

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

/** Ease in and out (along a half cosine): slow start, slow landing. */
const easeInOut = (t: number) => (1 - Math.cos(Math.PI * t)) / 2;

/** Stops the running glide (none running: undefined). */
let stop: (() => void) | undefined;

/**
 * Scroll the page to `top`, gliding there unless `instant` (or the reader
 * prefers reduced motion). A new glide replaces the running one.
 *
 * @param top - Where to scroll to, in page pixels (kept within the page).
 * @param options.instant - Go there at once.
 */
export const glide = (top: number, { instant = false } = {}) => {
  stop?.();
  const root = document.documentElement;
  const target = Math.max(0, Math.min(top, root.scrollHeight - innerHeight));
  const from = scrollY;
  const distance = target - from;
  if (instant || reducedMotion.matches || Math.abs(distance) < 1) {
    scrollTo({ top: target, behavior: "instant" });
    return;
  }

  const duration = Math.min(maxMs, Math.max(minMs, baseMs + Math.abs(distance) * msPerPx));
  const start = performance.now();
  let frame = 0;
  // input from before the glide (the key that started it) doesn't stop it
  const interrupt = (event: Event) => {
    if (event.timeStamp > start) {
      stop?.();
    }
  };
  stop = () => {
    cancelAnimationFrame(frame);
    // back to html's smooth scrolling (global.css) for in-page links
    root.style.scrollBehavior = "";
    for (const type of interrupts) {
      removeEventListener(type, interrupt);
    }
    stop = undefined;
  };

  // each frame's step lands at once, not smoothed again by html's
  // scroll-behavior
  root.style.scrollBehavior = "auto";
  for (const type of interrupts) {
    addEventListener(type, interrupt, { passive: true });
  }
  const step = (now: number) => {
    const progress = Math.min(1, (now - start) / duration);
    scrollTo({ top: from + distance * easeInOut(progress), behavior: "instant" });
    if (progress < 1) {
      frame = requestAnimationFrame(step);
    } else {
      stop?.();
    }
  };
  frame = requestAnimationFrame(step);
};
