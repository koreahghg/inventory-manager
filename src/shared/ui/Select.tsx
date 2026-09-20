"use client";

import {
  Children,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type OptionHTMLAttributes,
  type ReactNode,
} from "react";
import { CONTROL_SIZE_CLASSES, type ControlSize } from "./size";

/**
 * A bare `<div>` has no intrinsic width inside a flex row (unlike inside a
 * flex-col Field, where a block box already stretches to 100%), so without
 * this the trigger shrinks down to just its label's content width.
 */
const MIN_WIDTH_CLASSES: Record<ControlSize, string> = {
  xl: "min-w-72",
  l: "min-w-64",
  m: "min-w-56",
  s: "min-w-36",
};

type OptionElementProps = OptionHTMLAttributes<HTMLOptionElement>;

type Option = { value: string; label: ReactNode; disabled?: boolean };

function extractOptions(children: ReactNode): Option[] {
  const options: Option[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement<OptionElementProps>(child) && child.type === "option") {
      options.push({
        value: String(child.props.value ?? ""),
        label: child.props.children,
        disabled: child.props.disabled,
      });
    }
  });
  return options;
}

export function Select({
  children,
  value,
  onChange,
  name,
  id,
  size = "l",
  disabled,
  className = "",
}: {
  children: ReactNode;
  value: string | number;
  onChange?: (event: { target: { value: string } }) => void;
  name?: string;
  id?: string;
  size?: ControlSize;
  disabled?: boolean;
  /** Accepted for drop-in API parity with a native select; validation for
   * an empty selection is handled server-side instead, since a hidden
   * input can't display the native validation bubble. */
  required?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const options = extractOptions(children);
  const stringValue = String(value);
  const selected = options.find((option) => option.value === stringValue);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function selectOption(optionValue: string) {
    onChange?.({ target: { value: optionValue } });
    setOpen(false);
  }

  return (
    <div ref={containerRef} className={`relative ${MIN_WIDTH_CLASSES[size]}`}>
      {name && <input type="hidden" name={name} value={stringValue} />}

      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between gap-2 border border-grey-200 bg-grey-100 text-left font-medium text-grey-900 outline-none transition-colors focus:border-[1.5px] focus:border-brand focus:bg-white disabled:cursor-not-allowed disabled:opacity-50 ${CONTROL_SIZE_CLASSES[size]} ${className}`}
      >
        <span className={`truncate ${selected ? "" : "font-normal text-grey-400"}`}>
          {selected ? selected.label : " "}
        </span>
        <svg
          viewBox="0 0 20 20"
          fill="none"
          className={`h-5 w-5 shrink-0 text-grey-500 transition-transform duration-200 ease-toss ${
            open ? "rotate-180" : ""
          }`}
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="animate-menu-in absolute z-30 mt-2 max-h-80 w-full origin-top overflow-auto rounded-lg border border-grey-200 bg-white p-1.5 shadow-[0_4px_12px_oklch(0.155_0.060_261_/_0.06),0_1px_2px_oklch(0.155_0.060_261_/_0.04)]"
        >
          {options.map((option, index) => (
            <li key={option.value} className={index > 0 ? "mt-1" : undefined}>
              <button
                type="button"
                role="option"
                aria-selected={option.value === stringValue}
                disabled={option.disabled}
                onClick={() => selectOption(option.value)}
                className={`block w-full rounded-m px-4 py-3 text-left text-body-2 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  option.value === stringValue
                    ? "bg-brand text-white"
                    : "text-grey-800 hover:bg-grey-100 active:bg-grey-150"
                }`}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
