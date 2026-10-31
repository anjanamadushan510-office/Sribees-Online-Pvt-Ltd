"use client";

import React from "react";

export interface HeaderProps {
  /** Optional badge or label displayed above the main heading (e.g. "CATEGORIES") */
  badge?: React.ReactNode;
  /** Main page or section heading title */
  title: React.ReactNode;
  /** Subtitle description text or content */
  description?: React.ReactNode;
  /** Action buttons, filters, or right-aligned controls */
  actions?: React.ReactNode;
  /** Additional custom content below header title & description */
  children?: React.ReactNode;
  /** Semantic HTML tag for the heading (defaults to "h1") */
  headingTag?: "h1" | "h2" | "h3" | "h4";
  /** Size variant for heading text */
  size?: "sm" | "md" | "lg" | "xl";
  /** Alignment of header content */
  align?: "left" | "center" | "right";
  /** Whether to show a bottom border divider */
  borderBottom?: boolean;
  /** Outer container class overrides */
  className?: string;
  /** Title text class overrides */
  titleClassName?: string;
  /** Description text class overrides */
  descriptionClassName?: string;
  /** Actions container class overrides */
  actionsClassName?: string;
}

const sizeClasses: Record<NonNullable<HeaderProps["size"]>, string> = {
  sm: "text-lg sm:text-xl font-bold",
  md: "text-xl sm:text-2xl font-black",
  lg: "text-2xl sm:text-3xl font-extrabold",
  xl: "text-2xl sm:text-3xl lg:text-4xl font-extrabold",
};

export const Header: React.FC<HeaderProps> = ({
  badge,
  title,
  description,
  actions,
  children,
  headingTag: Heading = "h1",
  size = "lg",
  align = "left",
  borderBottom = false,
  className = "",
  titleClassName = "",
  descriptionClassName = "",
  actionsClassName = "",
}) => {
  const isCenter = align === "center" || className.includes("text-center");
  const isRight = align === "right" || className.includes("text-right");

  return (
    <div
      className={`space-y-2 ${
        borderBottom ? "pb-4 border-b border-slate-100" : ""
      } ${className}`}
    >
      <div
        className={`flex flex-col ${
          actions
            ? isCenter
              ? "items-center text-center justify-center"
              : "sm:flex-row sm:items-center justify-between"
            : isCenter
            ? "items-center text-center"
            : isRight
            ? "items-end text-right"
            : ""
        } gap-4`}
      >
        <div
          className={`space-y-1 ${
            actions && !isCenter ? "min-w-0" : "w-full"
          } ${isCenter ? "text-center" : isRight ? "text-right" : ""}`}
        >
          {badge && (
            <div className="inline-block">
              {typeof badge === "string" ? (
                <span className="text-[11px] font-black uppercase tracking-widest text-[#D81B60]">
                  {badge}
                </span>
              ) : (
                badge
              )}
            </div>
          )}

          <Heading
            className={`${sizeClasses[size]} text-slate-900 tracking-tight ${titleClassName}`}
          >
            {title}
          </Heading>

          {description && (
            <div
              className={`max-w-2xl ${
                isCenter ? "mx-auto" : isRight ? "ml-auto" : ""
              } ${descriptionClassName}`}
            >
              {typeof description === "string" ? (
                <p
                  className={`text-xs sm:text-sm text-slate-500 font-medium ${descriptionClassName}`}
                >
                  {description}
                </p>
              ) : (
                description
              )}
            </div>
          )}
        </div>

        {actions && (
          <div
            className={`flex items-center gap-2.5 shrink-0 self-start sm:self-auto ${actionsClassName}`}
          >
            {actions}
          </div>
        )}
      </div>

      {children && <div className="pt-2">{children}</div>}
    </div>
  );
};

export default Header;
