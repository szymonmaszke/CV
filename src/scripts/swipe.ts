// SPDX-FileCopyrightText: © 2026 Szymon Maszke <https://github.com/szymonmaszke>
// SPDX-License-Identifier: Apache-2.0

// Swipe between sections (phones, while the tabs are a carousel: tabs.ts).
// The open section follows the finger sideways and the neighbouring one
// slides in next to it, its top where the eye is (just under the sticky
// bar); let go far or fast enough and the neighbour opens, else both spring
// back. The sections loop like the tabs do. Vertical drags stay the page's,
// and so does a pinch: a second finger lets the sections spring back.
// This file tracks the finger; slide.ts moves the sections.

import { position, type Sections, type Slide, type SwipeHost, slideTo, stage } from "./slide.ts";

/** A finger on the sections, and the two sections it moves. */
interface Drag extends Slide {
  /** The finger's pointer. */
  id: number;
  /** Where it came down. */
  x0: number;
  y0: number;
  /** The axis it moves along, picked once it has moved {@link lock} pixels. */
  axis?: "x" | "y";
  /** How far it has moved sideways. */
  dx: number;
  /** Last move, for the flick speed. */
  last: { x: number; t: number };
  /** Sideways, in pixels per millisecond. */
  speed: number;
}

/** A container's swipe: the sections' side (slide.ts) and the drag under way, if any. */
interface Gesture extends Sections {
  drag?: Drag;
}

/** Movement before the gesture picks an axis, in pixels. */
const lock = 10;
/** Share of the width past which letting go opens the neighbour. */
const distance = 0.25;
/** A flick at least this fast (pixels per millisecond) opens it too. */
const flick = 0.4;

/** The element, or one of its ancestors inside `stop`, scrolls sideways
 * itself (code, tables): the drag is its own. */
const scrollsSideways = (target: EventTarget | null, stop: HTMLElement) => {
  for (let el = target instanceof Element ? target : null; el && el !== stop; el = el.parentElement) {
    const overflow = getComputedStyle(el).overflowX;
    if ((overflow === "auto" || overflow === "scroll") && el.scrollWidth > el.clientWidth) {
      return true;
    }
  }
  return false;
};

/** A finger, on a section, while swiping is on and no slide is running. */
const starts = (gesture: Gesture, event: PointerEvent) =>
  event.pointerType === "touch" &&
  event.isPrimary &&
  !gesture.busy &&
  gesture.host.enabled() &&
  !scrollsSideways(event.target, gesture.container);

/** Let go of the drag: the neighbour slides in (`open`), or both spring
 * back. */
const release = (gesture: Gesture, open: boolean) => {
  const { drag } = gesture;
  if (!drag) {
    return;
  }
  gesture.drag = undefined;
  if (drag.axis !== "x" || !drag.neighbour) {
    return;
  }
  slideTo(gesture, drag, drag.neighbour, open);
};

/** A finger comes down on a section: a drag starts. */
const begin = (gesture: Gesture, event: PointerEvent) => {
  // a second finger (a pinch): the drag is not a swipe
  if (gesture.drag && event.pointerId !== gesture.drag.id) {
    release(gesture, false);
    return;
  }
  if (!starts(gesture, event)) {
    return;
  }
  const panel = gesture.host.panels.get(gesture.host.current());
  if (!panel) {
    return;
  }
  const gap = Number.parseFloat(getComputedStyle(gesture.container).paddingLeft) || 0;
  gesture.drag = {
    id: event.pointerId,
    x0: event.clientX,
    y0: event.clientY,
    dx: 0,
    last: { x: event.clientX, t: event.timeStamp },
    speed: 0,
    direction: 0,
    panel,
    width: panel.offsetWidth + gap,
  };
};

/** Pick the drag's axis once it has moved far enough: sideways it is a
 * swipe (the container captures the finger), up or down the page's (the
 * drag ends). Returns whether it is a swipe. */
const lockAxis = (gesture: Gesture, drag: Drag, event: PointerEvent) => {
  if (drag.axis) {
    return true;
  }
  const dx = event.clientX - drag.x0;
  const dy = event.clientY - drag.y0;
  if (Math.hypot(dx, dy) < lock) {
    return false;
  }
  drag.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
  if (drag.axis === "y") {
    gesture.drag = undefined;
    return false;
  }
  gesture.container.setPointerCapture(event.pointerId);
  return true;
};

/** The finger's speed sideways since its last move, for a flick. */
const track = (drag: Drag, event: PointerEvent) => {
  const elapsed = event.timeStamp - drag.last.t;
  if (elapsed > 0) {
    drag.speed = (event.clientX - drag.last.x) / elapsed;
  }
  drag.last = { x: event.clientX, t: event.timeStamp };
};

/** The finger moves: once the drag is a swipe, both sections follow it. */
const move = (gesture: Gesture, event: PointerEvent) => {
  const { drag } = gesture;
  if (!drag || event.pointerId !== drag.id || !lockAxis(gesture, drag, event)) {
    return;
  }
  track(drag, event);
  drag.dx = event.clientX - drag.x0;
  // the finger moving right brings the previous section in from the left
  const direction = drag.dx > 0 ? -1 : 1;
  if (direction !== drag.direction) {
    stage(gesture, drag, direction);
  }
  position(gesture, drag, drag.dx);
};

/** The finger lifts (far or fast enough: the neighbour opens) or the
 * browser takes the gesture over (pointercancel: it springs back). */
const end = (gesture: Gesture, event: PointerEvent) => {
  const { drag } = gesture;
  if (!drag || event.pointerId !== drag.id) {
    return;
  }
  const { dx, speed, width, direction } = drag;
  release(
    gesture,
    event.type === "pointerup" &&
      (Math.abs(dx) > width * distance || (Math.abs(speed) > flick && Math.sign(speed) === -direction)),
  );
};

/**
 * Let a container of sections be swiped between them.
 *
 * @param container - The element holding the [data-panel] sections.
 * @param host - The tabs' side of it (see {@link SwipeHost}).
 */
export const swipe = (container: HTMLElement, host: SwipeHost) => {
  const gesture: Gesture = {
    container,
    host,
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)"),
    busy: false,
  };
  container.addEventListener("pointerdown", (event) => begin(gesture, event));
  container.addEventListener("pointermove", (event) => move(gesture, event));
  container.addEventListener("pointerup", (event) => end(gesture, event));
  container.addEventListener("pointercancel", (event) => end(gesture, event));
};
