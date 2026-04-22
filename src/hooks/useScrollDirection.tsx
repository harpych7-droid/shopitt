import { useEffect, useState } from "react";

/**
 * Tracks vertical scroll direction on a target element (or window).
 * Returns `hidden = true` when user is scrolling down past the threshold,
 * and false when scrolling up — used to auto-hide nav bars smoothly.
 */
export function useScrollDirection(opts?: {
  target?: HTMLElement | null;
  threshold?: number;
  offset?: number;
}) {
  const { target, threshold = 8, offset = 80 } = opts ?? {};
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = 0;
    let ticking = false;

    const getY = () =>
      target ? target.scrollTop : window.scrollY || document.documentElement.scrollTop;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = getY();
        const delta = y - lastY;
        if (Math.abs(delta) > threshold) {
          setHidden(delta > 0 && y > offset);
          lastY = y;
        }
        ticking = false;
      });
    };

    const el: EventTarget = target ?? window;
    el.addEventListener("scroll", onScroll, { passive: true } as AddEventListenerOptions);
    return () => el.removeEventListener("scroll", onScroll as EventListener);
  }, [target, threshold, offset]);

  return hidden;
}
