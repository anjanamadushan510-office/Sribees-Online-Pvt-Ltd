import React from "react";

const CONTAINER_SIZES = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
  xl: "max-w-[88rem]",
};

interface ContainerProps {
  size?: keyof typeof CONTAINER_SIZES;
  className?: string;
  children: React.ReactNode;
}

export function Container({ size = "xl", className = "", children }: ContainerProps) {
  return (
    <div className={`w-full mx-auto px-4 sm:px-6 lg:px-8 ${CONTAINER_SIZES[size]} ${className}`}>
      {children}
    </div>
  );
}

interface BadgeProps {
  variant?: "pink";
  className?: string;
  children: React.ReactNode;
}

export function Badge({ className = "", children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-[#D81B60] text-white ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {children}
    </span>
  );
}
