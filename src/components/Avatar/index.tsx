"use client";

import React, { useState } from "react";
import { Camera } from "lucide-react";
import { getAvatarInitials } from "@/utils/avatar";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: AvatarSize;
  className?: string;
  showEditButton?: boolean;
  onEditClick?: () => void;
  editButtonTitle?: string;
  alt?: string;
}

const sizeClasses: Record<AvatarSize, { container: string; text: string; editBtn: string; editIcon: string }> = {
  xs: {
    container: "w-7 h-7",
    text: "text-[11px]",
    editBtn: "p-0.5",
    editIcon: "w-2.5 h-2.5",
  },
  sm: {
    container: "w-9 h-9",
    text: "text-xs",
    editBtn: "p-1",
    editIcon: "w-3 h-3",
  },
  md: {
    container: "w-12 h-12",
    text: "text-sm",
    editBtn: "p-1",
    editIcon: "w-3.5 h-3.5",
  },
  lg: {
    container: "w-16 h-16 sm:w-20 sm:h-20",
    text: "text-lg sm:text-xl",
    editBtn: "p-1.5",
    editIcon: "w-3.5 h-3.5",
  },
  xl: {
    container: "w-24 h-24 sm:w-28 sm:h-28",
    text: "text-2xl sm:text-3xl",
    editBtn: "p-2",
    editIcon: "w-4 h-4",
  },
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = "md",
  className = "",
  showEditButton = false,
  onEditClick,
  editButtonTitle = "Change Photo",
  alt,
}) => {
  const [imageError, setImageError] = useState(false);
  const initials = getAvatarInitials(name);
  const sizeConfig = sizeClasses[size];

  const hasValidImage = src && src.trim() !== "" && !imageError;

  return (
    <div className={`relative inline-block shrink-0 rounded-full ${className}`}>
      <div
        suppressHydrationWarning
        className={`${sizeConfig.container} rounded-full overflow-hidden border-2 border-white shadow-xs flex items-center justify-center select-none ring-2 ring-rose-100 transition-all`}
      >
        {hasValidImage ? (
          <img
            src={src}
            alt={alt || name || "User Avatar"}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center font-black tracking-wider uppercase bg-gradient-to-br from-rose-100 via-rose-50 to-pink-100 text-[#D81B60] ${sizeConfig.text}`}
          >
            {initials}
          </div>
        )}
      </div>

      {showEditButton && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEditClick?.();
          }}
          title={editButtonTitle}
          className={`absolute bottom-0 right-0 ${sizeConfig.editBtn} bg-[#D81B60] hover:bg-[#C2185B] text-white rounded-full border-2 border-white shadow-md transition-transform active:scale-90 cursor-pointer`}
        >
          <Camera className={sizeConfig.editIcon} />
        </button>
      )}
    </div>
  );
};

export default Avatar;
