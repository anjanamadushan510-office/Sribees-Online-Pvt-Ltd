import { useEffect } from "react";

let activeLocksCount = 0;

/**
 * Custom hook to lock body scrolling when a modal, drawer, or dropdown is open.
 * Uses a reference counter to prevent premature unlocking when nested modals close.
 */
export const useBodyScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    if (typeof window === "undefined" || !isLocked) return;

    activeLocksCount++;
    document.body.style.overflow = "hidden";
    document.body.setAttribute("data-modal-open", "true");
    window.dispatchEvent(
      new CustomEvent("app:modal-toggle", {
        detail: { isOpen: true, count: activeLocksCount },
      })
    );

    return () => {
      activeLocksCount = Math.max(0, activeLocksCount - 1);
      if (activeLocksCount === 0) {
        document.body.style.overflow = "";
        document.body.removeAttribute("data-modal-open");
        window.dispatchEvent(
          new CustomEvent("app:modal-toggle", {
            detail: { isOpen: false, count: 0 },
          })
        );
      }
    };
  }, [isLocked]);
};

