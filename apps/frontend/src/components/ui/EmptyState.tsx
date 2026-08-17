import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[500px] items-center justify-center px-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
          {icon}
        </div>

        <h3 className="text-sm font-semibold text-slate-900">
          {title}
        </h3>

        {description && (
          <p className="mt-1 text-sm text-slate-400">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
