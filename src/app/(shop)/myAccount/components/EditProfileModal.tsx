"use client";

import React, { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/base/Modal";
import { Avatar } from "@/components/Avatar";
import { getAvatarInitials } from "@/utils/avatar";
import { Input } from "@/components/base/Input";
import { useUpdateProfile } from "@/api/queries/useAuth";
import { useToastStore } from "@/state/toast.store";
import { useTranslations } from "next-intl";
import { Upload, Trash2, User } from "lucide-react";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialName: string;
  initialPhotoUrl?: string;
  onProfileUpdated?: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  initialName,
  initialPhotoUrl = "",
  onProfileUpdated,
}) => {
  const t = useTranslations("account.profileCard");
  const addToast = useToastStore((state) => state.addToast);
  const updateProfileMutation = useUpdateProfile();

  const [name, setName] = useState(initialName);
  const [photoUrl, setPhotoUrl] = useState(initialPhotoUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(initialName === "Valued Customer" ? "" : initialName);
      setPhotoUrl(initialPhotoUrl || "");
    }
  }, [isOpen, initialName, initialPhotoUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      addToast({
        title: "Invalid File",
        message: "Please choose an image file (JPEG, PNG, WebP).",
        type: "error",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast({
        title: "File Too Large",
        message: "Please select an image smaller than 5MB.",
        type: "error",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhotoUrl(result);
      addToast({
        title: "Photo Ready",
        message: "Profile photo preview updated. Click Save Changes to apply.",
        type: "info",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      addToast({
        title: "Validation Error",
        message: "Name must be at least 2 characters long.",
        type: "error",
      });
      return;
    }

    try {
      // Backend PATCH /auth/me supports full_name and profile_picture_url (max 500 chars)
      // If photoUrl is a short HTTP/HTTPS URL, send it directly.
      // If it's a large dataURL, save locally and send empty to avoid 500 char backend validation.
      const isHttpUrl =
        photoUrl.startsWith("http://") || photoUrl.startsWith("https://");
      const backendPhotoPayload =
        isHttpUrl && photoUrl.length <= 500
          ? photoUrl
          : photoUrl
            ? undefined
            : null;

      await updateProfileMutation.mutateAsync({
        full_name: trimmedName,
        ...(backendPhotoPayload !== undefined && {
          profile_picture_url: backendPhotoPayload,
        }),
      });

      // If user uploaded a local data URL, also persist it in localStorage for this client
      if (typeof window !== "undefined" && photoUrl.startsWith("data:")) {
        try {
          localStorage.setItem("sribees_local_avatar", photoUrl);
        } catch {
          // ignore quota
        }
      } else if (!photoUrl && typeof window !== "undefined") {
        localStorage.removeItem("sribees_local_avatar");
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("sribees_avatar_updated"));
      }

      addToast({
        title: t("updateSuccess"),
        message: "Your profile details have been saved successfully.",
        type: "success",
      });

      onProfileUpdated?.();
      onClose();
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { detail?: string; error?: { message?: string } } };
        message?: string;
      };
      const errorMsg =
        error?.response?.data?.detail ||
        error?.response?.data?.error?.message ||
        error?.message ||
        t("updateError");
      addToast({
        title: "Update Failed",
        message: errorMsg,
        type: "error",
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("editModalTitle")}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Preview & Photo Controls */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 text-center">
          <Avatar
            src={photoUrl}
            name={name || "Customer"}
            size="xl"
            className="mb-3"
          />

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#D81B60] hover:bg-[#C2185B] rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{photoUrl ? t("changePhoto") : t("uploadPhoto")}</span>
            </button>

            {photoUrl && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 rounded-xl transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t("removePhoto")}</span>
              </button>
            )}
          </div>
        </div>

        {/* Display Name Input */}
        <div>
          <Input
            label={t("displayName")}
            required
            leftIcon={<User className="w-4 h-4 text-slate-400" />}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("displayNamePlaceholder")}
            helperText="This name will appear on your profile, orders, and receipts."
          />
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            disabled={updateProfileMutation.isPending || name.trim().length < 2}
            className="px-5 py-2 text-xs font-bold text-white bg-[#D81B60] hover:bg-[#C2185B] rounded-xl shadow-md shadow-rose-200 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            {updateProfileMutation.isPending ? t("saving") : t("saveChanges")}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProfileModal;
