"use client";

import { ReactNode, useEffect, useState } from "react";

/** Matches the panel's `duration-200` exit transition below — the DOM node
 * stays mounted for this long after `open` goes false so the animation can
 * play before React removes it. */
const EXIT_MS = 200;

const SIZE_CLASSES = {
  sm: "max-w-sm",
  lg: "max-w-2xl max-h-[90vh] overflow-y-auto",
};

export function Modal({
  children,
  open,
  onClose,
  size = "sm",
}: {
  children: ReactNode;
  open: boolean;
  onClose?: () => void;
  size?: keyof typeof SIZE_CLASSES;
}) {
  const [mounted, setMounted] = useState(open);

  if (open && !mounted) {
    setMounted(true);
  }

  useEffect(() => {
    if (open) return;
    const timer = setTimeout(() => setMounted(false), EXIT_MS);
    return () => clearTimeout(timer);
  }, [open]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-40 flex items-center justify-center bg-grey-900/40 p-4 transition-opacity duration-200 ease-toss-out starting:opacity-0 ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className={`w-full rounded-3xl border border-grey-200 bg-white p-6 shadow-[0_12px_32px_oklch(0.155_0.060_261_/_0.10),0_2px_6px_oklch(0.155_0.060_261_/_0.06)] transition-[opacity,transform] duration-200 ease-toss-out starting:scale-95 starting:opacity-0 ${
          open ? "scale-100 opacity-100" : "scale-95 opacity-0"
        } ${SIZE_CLASSES[size]}`}
      >
        {children}
      </div>
    </div>
  );
}
