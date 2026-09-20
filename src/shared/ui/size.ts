export type ControlSize = "xl" | "l" | "m" | "s";

/**
 * Shared height/radius/text scale for Button, Input, Select — so a button
 * placed next to a field at any size always lines up exactly, instead of
 * each component picking its own height independently.
 */
export const CONTROL_SIZE_CLASSES: Record<ControlSize, string> = {
  xl: "h-14 rounded-xl px-5 text-body-1",
  l: "h-12 rounded-lg px-4 text-body-2",
  m: "h-10 rounded-m px-4 text-body-2",
  s: "h-8 rounded-sm px-3 text-label-s",
};
