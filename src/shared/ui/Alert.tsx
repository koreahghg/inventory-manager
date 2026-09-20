type Tone = "error" | "warning";

const TONE_CLASSES: Record<Tone, string> = {
  error: "bg-danger-weak text-danger",
  warning: "bg-warning-weak text-warning",
};

export function Alert({
  tone = "error",
  message,
}: {
  tone?: Tone;
  message: string;
}) {
  return (
    <p className={`rounded-m px-4 py-3 text-body-2 ${TONE_CLASSES[tone]}`}>
      {message}
    </p>
  );
}
