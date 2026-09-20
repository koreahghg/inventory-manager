import { HTMLAttributes } from "react";

export function Card({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl border border-grey-200 bg-white p-4 ${className}`}
      {...props}
    />
  );
}
