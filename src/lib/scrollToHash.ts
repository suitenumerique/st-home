import { useEffect, useRef } from "react";

interface ScrollToHashOptions {
  /** Delay before starting to check images (default: 100ms) */
  delay?: number;
  /** Whether to enable smooth scrolling (default: true) */
  smooth?: boolean;
  /** Callback when scrolling is cancelled by user interaction */
  onCancelled?: () => void;
  /** Callback when scrolling completes successfully */
  onComplete?: () => void;
  /** Maximum time to wait for content to stabilize (default: 5000ms) */
  maxWaitTime?: number;
}

/**
 * Hook that handles scrolling to hash targets after images are loaded
 */
export function useScrollToHash(options: ScrollToHashOptions = {}) {
  const { delay = 100, smooth = true, onCancelled, onComplete, maxWaitTime = 5000 } = options;

  const hasUserScrolled = useRef<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxWaitRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollY = useRef<number>(0);
  const scrollCount = useRef<number>(0);
  const isInitialLoad = useRef<boolean>(true);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    // Prevent browser auto-scroll
    const originalHash = window.location.hash;
    history.replaceState(null, "", window.location.pathname + window.location.search);
    setTimeout(() => history.replaceState(null, "", originalHash), 0);

    const scrollToTarget = () => {
      const target = document.querySelector(hash);
      if (target && !hasUserScrolled.current) {
        target.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });

        // Emit custom event when scroll is complete
        window.dispatchEvent(
          new CustomEvent("hashScrollComplete", {
            detail: { hash, target: target.id },
          }),
        );

        onComplete?.();
      }
    };

    const waitForImages = () => {
      const images = document.querySelectorAll("img");
      let pending = 0;
      let hasUnloaded = false;

      images.forEach((img) => {
        if (!img.complete) {
          hasUnloaded = true;
          pending++;
        }
      });

      if (!hasUnloaded) {
        scrollToTarget();
        return;
      }

      const onImageComplete = () => {
        pending--;
        if (pending === 0 && !hasUserScrolled.current) {
          setTimeout(scrollToTarget, 50);
        }
      };

      images.forEach((img) => {
        if (!img.complete) {
          img.addEventListener("load", onImageComplete);
          img.addEventListener("error", onImageComplete);
        }
      });
    };

    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = Math.abs(currentY - lastScrollY.current);

      scrollCount.current++;

      // Ignore initial scroll events during page load (first 2 seconds, first 3 events)
      if (isInitialLoad.current && scrollCount.current <= 3) {
        lastScrollY.current = currentY;
        return;
      }

      // Only consider it user scroll if there's significant movement
      if (delta > 10 && !hasUserScrolled.current) {
        hasUserScrolled.current = true;
        onCancelled?.();
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (maxWaitRef.current) clearTimeout(maxWaitRef.current);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Max wait fallback
    maxWaitRef.current = setTimeout(() => {
      if (!hasUserScrolled.current) scrollToTarget();
    }, maxWaitTime);

    // Start after delay
    timeoutRef.current = setTimeout(() => {
      if (!hasUserScrolled.current) waitForImages();
    }, delay);

    // End initial load protection after 2 seconds
    setTimeout(() => {
      isInitialLoad.current = false;
    }, 2000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (maxWaitRef.current) clearTimeout(maxWaitRef.current);
    };
  }, [delay, smooth, onCancelled, onComplete, maxWaitTime]);
}

/**
 * Utility function to manually scroll to a hash target
 */
export function scrollToHash(hash: string, smooth = true) {
  const target = document.querySelector(hash);
  if (target) {
    target.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
    return true;
  }
  return false;
}

/**
 * Listen for when hash scroll is complete
 */
export function onHashScrollComplete(callback: (event: CustomEvent) => void) {
  const handler = (event: Event) => callback(event as CustomEvent);
  window.addEventListener("hashScrollComplete", handler);
  return () => window.removeEventListener("hashScrollComplete", handler);
}
