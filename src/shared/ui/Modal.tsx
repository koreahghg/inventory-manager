"use client";

import { ReactNode } from "react";

const SIZE_CLASSES = {
  sm: "max-w-sm",
  lg: "max-w-2xl max-h-[90vh] overflow-y-auto",
};

export function Modal({
  children,
  onClose,
  size = "sm",
}: {
  children: ReactNode;
  onClose?: () => void;
  size?: keyof typeof SIZE_CLASSES;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-grey-900/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className={`w-full rounded-3xl border border-grey-200 bg-white p-6 shadow-[0_12px_32px_oklch(0.155_0.060_261_/_0.10),0_2px_6px_oklch(0.155_0.060_261_/_0.06)] ${SIZE_CLASSES[size]}`}
      >
        {children}
      </div>
    </div>
  );
}
