import { TextareaHTMLAttributes } from "react";

export function Textarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`rounded-m border border-grey-200 bg-grey-100 px-4 py-3 text-body-2 text-grey-900 outline-none placeholder:text-grey-400 focus:border-[1.5px] focus:border-brand focus:bg-white ${className}`}
      {...props}
    />
  );
}
