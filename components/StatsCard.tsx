import React from "react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: "default" | "orange" | "green" | "navy" | "red";
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  variant = "default",
  className = "",
}: StatsCardProps) {
  const iconVariants = {
    default: "bg-gray-100 text-bengkel-navy",
    orange: "bg-bengkel-orange-light text-bengkel-orange",
    green: "bg-bengkel-green-light text-bengkel-green",
    navy: "bg-bengkel-navy-light text-white",
    red: "bg-bengkel-red-light text-bengkel-red",
  };

  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-bengkel-border p-5 shadow-xs hover:shadow-md transition-shadow duration-200",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-bengkel-muted uppercase tracking-wider">{title}</p>
          <div className="text-2xl font-bold text-bengkel-navy tracking-tight">{value}</div>
          {description && <p className="text-xs text-bengkel-muted pt-1">{description}</p>}
        </div>
        <div className={cn("p-2.5 rounded-xl flex items-center justify-center flex-shrink-0", iconVariants[variant])}>
          {icon}
        </div>
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-xs font-medium">
          <span className={trend.isPositive ? "text-bengkel-green" : "text-bengkel-red"}>
            {trend.isPositive ? "↑" : "↓"} {trend.value}
          </span>
          <span className="text-bengkel-muted">dibandingkan bulan lalu</span>
        </div>
      )}
    </div>
  );
}
