import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "xl" | "l" | "m" | "s";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-hover",
  secondary: "bg-grey-100 text-grey-900 hover:bg-grey-150",
  danger: "bg-danger text-white hover:brightness-95",
  ghost: "bg-transparent text-brand hover:bg-brand-weak",
};

const SIZE_CLASSES: Record<Size, string> = {
  xl: "h-14 rounded-xl px-6 text-label-l font-bold",
  l: "h-12 rounded-lg px-5 text-label-l font-bold",
  m: "h-10 rounded-m px-4 text-label-m font-semibold",
  s: "h-8 rounded-sm px-3 text-label-s font-semibold",
};

export function Button({
  variant = "primary",
  size = "m",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap no-underline transition-colors duration-[120ms] ease-toss [-webkit-tap-highlight-color:transparent] [&::-moz-focus-inner]:border-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-30 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    />
  );
}
