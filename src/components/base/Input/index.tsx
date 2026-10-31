"use client";

import React, { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  prefixElement?: React.ReactNode;
  badgeText?: React.ReactNode;
  optionalText?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
  inputClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      required = false,
      leftIcon,
      rightIcon,
      prefixElement,
      badgeText,
      optionalText,
      error,
      helperText,
      containerClassName = "",
      inputClassName = "",
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    const isLocked = props.disabled || props.readOnly;

    return (
      <div className={`w-full ${containerClassName}`}>
        {/* Label Header */}
        {(label || badgeText || optionalText) && (
          <div className="flex items-center justify-between mb-1.5 min-h-[22px]">
            {label && (
              <label htmlFor={inputId} className="text-xs font-bold text-slate-700 block leading-none">
                {label} {required && <span className="text-[#D81B60]">*</span>}
              </label>
            )}
            {badgeText && (
              typeof badgeText === "string" ? (
                <span className="text-[11px] font-semibold text-[#D81B60] bg-rose-50 px-2.5 py-0.5 rounded-full">
                  {badgeText}
                </span>
              ) : (
                badgeText
              )
            )}
            {optionalText && (
              <span className="text-[10px] text-slate-400 font-semibold uppercase">
                {optionalText}
              </span>
            )}
          </div>
        )}

        {/* Input Wrapper Group */}
        <div
          className={`flex items-stretch border rounded-xl overflow-hidden transition-all shadow-2xs ${
            isLocked
              ? "bg-slate-100/90 border-slate-200 cursor-not-allowed"
              : error
              ? "bg-white border-rose-400 focus-within:border-rose-500 focus-within:ring-4 focus-within:ring-rose-100"
              : "bg-white border-slate-200 focus-within:border-[#D81B60] focus-within:ring-4 focus-within:ring-rose-100"
          }`}
        >
          {/* Prefix Element (e.g. Country code box) */}
          {prefixElement && (
            <div className="self-stretch flex items-center gap-1.5 bg-slate-50 border-r border-slate-200 px-3.5 text-xs font-bold text-slate-800 shrink-0">
              {prefixElement}
            </div>
          )}

          {/* Left Icon */}
          {leftIcon && (
            <div className="pl-3.5 pr-1.5 text-slate-400 flex items-center shrink-0">
              {leftIcon}
            </div>
          )}

          {/* Core Input Field */}
          <input
            ref={ref}
            id={inputId}
            className={`w-full py-2.5 px-3.5 text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 bg-transparent outline-none ${
              isLocked ? "cursor-not-allowed text-slate-600" : ""
            } ${
              leftIcon ? "pl-1" : ""
            } ${inputClassName} ${className}`}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <div className="pr-3.5 pl-1.5 text-slate-400 flex items-center shrink-0">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Error / Helper Text */}
        {error ? (
          <p className="text-[11px] text-rose-500 font-medium mt-1">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-slate-400 font-medium mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
