"use client";

import React, { useRef, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  isFullscreen?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className,
  showCloseButton = true,
  isFullscreen = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  /* --- ESC‑to‑close --- */
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    if (isOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  /* --- Body scroll lock --- */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const contentClasses = isFullscreen
    ? "w-full h-full"
    : "relative w-full rounded-3xl bg-white dark:bg-gray-900";

  return (
    <div className="modal fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto">
      {/* BACKDROP */}
      {!isFullscreen && (
        <div
          className="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]"
          onClick={onClose}
        />
      )}

      {/* CONTENT */}
      <div
        ref={modalRef}
        className={`${contentClasses} ${className ?? ""}`}
        onClick={(e) => e.stopPropagation()} // stop overlay‑clicks
      >
        {/* X‑BUTTON */}
        {showCloseButton && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // prevent bubbling into container
              onClose();
            }}
            className="absolute right-3 top-3 z-[999] flex h-9.5 w-9.5 items-center justify-center rounded-full
                       bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700
                       dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white
                       sm:right-6 sm:top-6 sm:h-11 sm:w-11"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.04 16.54a.9.9 0 0 0 1.28 1.28l4.68-4.68 4.68 4.68a.9.9 0 1 0 1.28-1.28l-4.68-4.68 4.68-4.68A.9.9 0 0 0 16.68 6l-4.68 4.68L7.32 6A.9.9 0 0 0 6.04 7.28l4.68 4.68-4.68 4.68Z"
                fill="currentColor"
              />
            </svg>
          </button>
        )}

        {/* SLOT */}
        <div>{children}</div>
      </div>
    </div>
  );
};
