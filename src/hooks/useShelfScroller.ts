"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Arrow step distance — two cards: 2 × (180px card + 20px gap) */
const STEP_PX = 400;
/** Pixels per frame while an arrow is held (≈ 420 px/s at 60fps) */
const HOLD_SPEED = 7;
/** Lerp factor easing scrollLeft toward the target — the "silk" feel */
const LERP = 0.12;
/** Repeat interval for hold-to-run on touch devices */
const TOUCH_HOLD_MS = 300;

export type ShelfScroller<T extends HTMLElement> = {
  ref: React.RefObject<T | null>;
  /** Arrow click: advance the shelf by ~2 cards */
  step: (dir: -1 | 1) => void;
  /** Arrow press-and-hold: run the shelf continuously */
  startHold: (dir: -1 | 1) => void;
  endHold: () => void;
  /** False at the far left — dims the ‹ arrow */
  canLeft: boolean;
  /** False at the far right — dims the › arrow */
  canRight: boolean;
  /** False when all books fit on screen — hides both arrows */
  hasOverflow: boolean;
};

export function useShelfScroller<T extends HTMLElement>(): ShelfScroller<T> {
  const ref = useRef<T | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  // Engine state lives in refs — it changes every animation frame.
  const target = useRef(0);
  const holdDir = useRef<0 | -1 | 1>(0);
  const rafId = useRef(0);
  const engineOn = useRef(false);
  const fine = useRef(false);     // pointer-fine (mouse/trackpad) device
  const reduced = useRef(false);  // prefers-reduced-motion
  const overRow = useRef(false);  // cursor currently over the row
  const touchHold = useRef<ReturnType<typeof setInterval> | null>(null);

  const clamp = useCallback((v: number) => {
    const el = ref.current;
    if (!el) return 0;
    return Math.min(Math.max(v, 0), el.scrollWidth - el.clientWidth);
  }, []);

  const updateEdges = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setHasOverflow(max > 4);
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < max - 4);
  }, []);

  const tick = useCallback(() => {
    const el = ref.current;
    if (!el) {
      engineOn.current = false;
      return;
    }
    if (holdDir.current) {
      target.current = clamp(target.current + holdDir.current * HOLD_SPEED);
    }
    const delta = target.current - el.scrollLeft;
    el.scrollLeft = reduced.current
      ? target.current
      : el.scrollLeft + delta * LERP;
    updateEdges();
    const settled = Math.abs(target.current - el.scrollLeft) < 0.5;
    if (settled && !overRow.current && !holdDir.current) {
      engineOn.current = false;
      return;
    }
    rafId.current = requestAnimationFrame(tick);
  }, [clamp, updateEdges]);

  const wake = useCallback(() => {
    if (!engineOn.current) {
      engineOn.current = true;
      rafId.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  const step = useCallback(
    (dir: -1 | 1) => {
      const el = ref.current;
      if (!el) return;
      if (!fine.current) {
        // Touch: native smooth scroll settles onto scroll-snap points.
        el.scrollBy({
          left: dir * STEP_PX,
          behavior: reduced.current ? "auto" : "smooth",
        });
        return;
      }
      target.current = clamp(target.current + dir * STEP_PX);
      wake();
    },
    [clamp, wake]
  );

  const startHold = useCallback(
    (dir: -1 | 1) => {
      const el = ref.current;
      if (!el) return;
      if (!fine.current) {
        touchHold.current = setInterval(() => {
          el.scrollBy({ left: dir * STEP_PX, behavior: "smooth" });
        }, TOUCH_HOLD_MS);
        return;
      }
      holdDir.current = dir;
      wake();
    },
    [wake]
  );

  const endHold = useCallback(() => {
    holdDir.current = 0;
    if (touchHold.current) {
      clearInterval(touchHold.current);
      touchHold.current = null;
    }
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    fine.current = window.matchMedia("(pointer: fine)").matches;
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    target.current = el.scrollLeft;
    updateEdges();
    window.addEventListener("resize", updateEdges);

    if (!fine.current) {
      // Touch devices keep native swipe + snap; arrows use scrollBy.
      const onScroll = () => updateEdges();
      el.addEventListener("scroll", onScroll, { passive: true });
      return () => {
        window.removeEventListener("resize", updateEdges);
        el.removeEventListener("scroll", onScroll);
        if (touchHold.current) clearInterval(touchHold.current);
      };
    }

    // Pointer-fine: programmatic scrolling fights snap — disable it.
    const prevSnap = el.style.scrollSnapType;
    el.style.scrollSnapType = "none";

    const onMove = (e: MouseEvent) => {
      if (holdDir.current) return; // hold owns the target while active
      const r = el.getBoundingClientRect();
      let x = (e.clientX - r.left) / r.width;
      // Outer 8% on each side pins to the ends.
      x = Math.min(1, Math.max(0, (x - 0.08) / 0.84));
      target.current = x * (el.scrollWidth - el.clientWidth);
    };
    const onEnter = () => {
      overRow.current = true;
      wake();
    };
    const onLeave = () => {
      overRow.current = false;
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.style.scrollSnapType = prevSnap;
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", updateEdges);
      cancelAnimationFrame(rafId.current);
      engineOn.current = false;
      if (touchHold.current) clearInterval(touchHold.current);
    };
  }, [updateEdges, wake]);

  return { ref, step, startHold, endHold, canLeft, canRight, hasOverflow };
}
