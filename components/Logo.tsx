import React from "react";
import Link from "next/link";
import { Wrench } from "lucide-react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  href?: string;
}

export function Logo({ className = "", size = "md", href = "/" }: LogoProps) {
  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-9 h-9",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  const content = (
    <div className={`flex items-center gap-2.5 font-bold tracking-tight select-none ${className}`}>
      <div className="flex items-center justify-center rounded-xl bg-bengkel-orange text-white p-2 shadow-sm shadow-orange-500/20">
        <Wrench className={`${iconSizes[size]} transform -rotate-12`} />
      </div>
      <div className={`${textSizes[size]} flex items-center`}>
        <span className="text-bengkel-navy font-extrabold tracking-tight">Bengkel</span>
        <span className="text-bengkel-orange font-black">Pro</span>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="inline-flex items-center">{content}</Link>;
  }

  return content;
}
