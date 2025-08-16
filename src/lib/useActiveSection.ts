import { useEffect, useRef, useState } from "react";

interface Section {
  id: string;
  element: HTMLElement;
}

/**
 * Hook that tracks which section is currently visible in the viewport
 * Useful for highlighting active items in navigation menus
 */
export function useActiveSection(sectionIds: string[]) {
  const [activeSection, setActiveSection] = useState<string>("");
  const sectionsRef = useRef<Section[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isInitialized = useRef<boolean>(false);

  useEffect(() => {
    // Listen for when the initial hash scroll is complete
    const handleHashScrollComplete = () => {
      if (isInitialized.current) return;
      isInitialized.current = true;
      initializeObserver();
    };

    window.addEventListener("hashScrollComplete", handleHashScrollComplete);

    // Fallback: if no hash scroll happens, initialize after a reasonable delay
    const fallbackTimer = setTimeout(() => {
      if (!isInitialized.current) {
        isInitialized.current = true;
        initializeObserver();
      }
    }, 1000);

    return () => {
      window.removeEventListener("hashScrollComplete", handleHashScrollComplete);
      clearTimeout(fallbackTimer);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const initializeObserver = () => {
    // Get all section elements
    const sections: Section[] = [];
    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        sections.push({ id, element });
      }
    });
    sectionsRef.current = sections;

    if (sections.length === 0) return;

    // Create intersection observer to track which section is visible
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the section with the highest intersection ratio
        let bestSection = "";
        let bestRatio = 0;

        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestSection = entry.target.id;
          }
        });

        // Update active section if we found a better one
        if (bestSection && bestSection !== activeSection) {
          setActiveSection(bestSection);
        }
      },
      {
        // Root margin to trigger slightly before section comes into view
        rootMargin: "-20% 0px -70% 0px",
        // Threshold to trigger when section is significantly visible
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    // Observe all sections
    sections.forEach((section) => {
      observerRef.current?.observe(section.element);
    });
  };

  return activeSection;
}
