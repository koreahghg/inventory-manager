import { InputHTMLAttributes } from "react";
import { CONTROL_SIZE_CLASSES, type ControlSize } from "./size";

export function Input({
  size = "m",
  className = "",
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & { size?: ControlSize }) {
  return (
    <input
      className={`border border-grey-200 bg-grey-100 text-grey-900 outline-none placeholder:text-grey-400 focus:border-[1.5px] focus:border-brand focus:bg-white ${CONTROL_SIZE_CLASSES[size]} ${className}`}
      {...props}
    />
  );
}
