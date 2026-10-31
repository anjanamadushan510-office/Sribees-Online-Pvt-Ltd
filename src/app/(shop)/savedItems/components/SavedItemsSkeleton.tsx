"use client";

import React from "react";

interface SavedItemsSkeletonProps {
  count?: number;
  viewMode?: "grid" | "list";
}

export const SavedItemsSkeleton: React.FC<SavedItemsSkeletonProps> = ({
  count = 8,
  viewMode = "grid",
}) => {
  if (viewMode === "list") {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-3xl border border-slate-200/80 p-4 md:p-5 flex flex-col sm:flex-row items-center gap-5 animate-pulse"
          >
            <div className="w-28 h-28 sm:w-32 sm:h-32 bg-slate-200 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-3 w-full">
              <div className="h-4 bg-slate-200 rounded-lg w-1/4" />
              <div className="h-5 bg-slate-200 rounded-lg w-3/4" />
              <div className="h-4 bg-slate-200 rounded-lg w-1/3" />
            </div>
            <div className="w-full sm:w-32 h-10 bg-slate-200 rounded-2xl shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-3xl border border-slate-200/80 p-4 space-y-4 animate-pulse"
        >
          <div className="w-full aspect-square bg-slate-200 rounded-2xl" />
          <div className="space-y-2">
            <div className="h-3 bg-slate-200 rounded-md w-1/3" />
            <div className="h-4 bg-slate-200 rounded-md w-full" />
            <div className="h-4 bg-slate-200 rounded-md w-2/3" />
          </div>
          <div className="h-10 bg-slate-200 rounded-2xl w-full" />
        </div>
      ))}
    </div>
  );
};
