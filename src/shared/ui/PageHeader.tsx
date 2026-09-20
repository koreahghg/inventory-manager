import { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-h2 font-bold text-grey-900">{title}</h1>
        {description && (
          <p className="mt-1 text-body-2 text-grey-500">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
