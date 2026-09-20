import { ReactNode } from "react";

type Tone = "gray" | "green" | "red" | "blue";

const TONE_CLASSES: Record<Tone, string> = {
  gray: "bg-grey-100 text-grey-700",
  green: "bg-success-weak text-success",
  red: "bg-danger-weak text-danger",
  blue: "bg-brand-weak text-brand",
};

export function Badge({
  tone = "gray",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex h-[22px] items-center rounded-[6px] px-2 text-caption font-medium ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
