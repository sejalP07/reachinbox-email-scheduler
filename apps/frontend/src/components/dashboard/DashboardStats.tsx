"use client";

import { Clock3, Send, TriangleAlert } from "lucide-react";

import type { EmailStats } from "@/types/email";

interface DashboardStatsProps {
  stats: EmailStats | null;
}

export default function DashboardStats({
  stats,
}: DashboardStatsProps) {
  const cards = [
    {
      label: "Scheduled",
      value: stats?.scheduled ?? 0,
      icon: (
        <Clock3 className="h-4 w-4 text-amber-500" />
      ),
      iconBg: "bg-amber-50",
    },
    {
      label: "Sent",
      value: stats?.sent ?? 0,
      icon: (
        <Send className="h-4 w-4 text-emerald-500" />
      ),
      iconBg: "bg-emerald-50",
    },
    {
      label: "Failed",
      value: stats?.failed ?? 0,
      icon: (
        <TriangleAlert className="h-4 w-4 text-red-500" />
      ),
      iconBg: "bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 px-5 py-4 lg:px-8">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm"
        >
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${card.iconBg}`}
          >
            {card.icon}
          </div>

          <div className="min-w-0">
            <p className="text-lg font-semibold leading-none text-slate-900">
              {card.value}
            </p>

            <p className="mt-1 truncate text-xs text-slate-500">
              {card.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
