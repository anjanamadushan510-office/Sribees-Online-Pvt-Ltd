"use client";

import React, { useState } from "react";
import {
  Plus,
  CheckCircle2,
  Home,
  Building2,
  Users,
  Pencil,
  Trash2,
  MapPin,
  Loader2,
} from "lucide-react";
import { DeliveryAddress } from "@/interfaces/account.interface";
import { AddressModal } from "./AddressModal";
import { useToastStore } from "@/state/toast.store";
import {
  useGetAddresses,
  useCreateAddress,
  useUpdateAddress,
  useSetDefaultAddress,
  useDeleteAddress,
} from "@/api/queries/useAddresses";
import { ApiAddress, CreateAddressRequest } from "@/interfaces/address.interface";
import { Header } from "@/components/Header";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/state/auth.store";
import { useUIStore } from "@/state/ui.store";
import { isDummyPhone } from "@/utils/formatMobileNumber";

interface DeliveryAddressesSectionProps {
  addresses?: DeliveryAddress[];
  onSetDefault?: (id: string) => void;
  onUpdateAddresses?: (addresses: DeliveryAddress[]) => void;
}

export const DeliveryAddressesSection: React.FC<
  DeliveryAddressesSectionProps
> = ({ onSetDefault, onUpdateAddresses }) => {
  const t = useTranslations("account.deliveryAddresses");
  const addToast = useToastStore((state) => state.addToast);
  const { data: apiAddresses, isLoading } = useGetAddresses();
  const createAddressMutation = useCreateAddress();
  const updateAddressMutation = useUpdateAddress();
  const setDefaultAddressMutation = useSetDefaultAddress();
  const deleteAddressMutation = useDeleteAddress();

  const { user } = useAuthStore();
  const { userProfile } = useUIStore();
  const defaultCustomerName =
    user?.fullName ||
    (userProfile?.name && userProfile.name !== "Valued Customer"
      ? userProfile.name
      : "") ||
    "Customer";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<DeliveryAddress | null>(
    null,
  );

  // Transform backend API addresses into UI DeliveryAddress format
  const addresses: DeliveryAddress[] = (apiAddresses || []).map((addr: ApiAddress) => {
    const hasCustomRecipient =
      addr.recipient_name &&
      addr.recipient_name !== "Valued Customer" &&
      addr.recipient_name !== "Customer";

    return {
      id: addr.address_id,
      label: addr.title || "Address",
      provinceTag: addr.province || "Western",
      province: addr.province,
      district: addr.district,
      postalCity: addr.postal_city,
      addressLine1: addr.address_line1,
      addressLine2:
        addr.address_line2 ||
        `${addr.postal_city || ""}${addr.postal_city && addr.district ? ", " : ""}${addr.district || ""}`,
      recipientName: hasCustomRecipient
        ? addr.recipient_name
        : defaultCustomerName,
      recipientPhone:
        !isDummyPhone(addr.phone) && addr.phone ? addr.phone : user?.phone || "",
      deliveryInstructions: "",
      isDefault: addr.is_default,
      type: addr.title?.toLowerCase().includes("work")
        ? "work"
        : addr.title?.toLowerCase().includes("home")
          ? "home"
          : "other",
    };
  });

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddressMutation.mutateAsync(id);
      if (onSetDefault) onSetDefault(id);
      addToast({
        title: "Default Address Changed",
        message: "Active delivery destination updated successfully.",
        type: "success",
      });
    } catch {
      addToast({
        title: "Update Failed",
        message: "Could not set default address.",
        type: "error",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAddressMutation.mutateAsync(id);
      addToast({
        title: "Address Deleted",
        message: "Selected address has been removed from your saved locations.",
        type: "info",
      });
    } catch {
      addToast({
        title: "Delete Failed",
        message: "Could not remove address.",
        type: "error",
      });
    }
  };

  const handleOpenAddModal = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (addr: DeliveryAddress) => {
    setEditingAddress(addr);
    setIsModalOpen(true);
  };

  const handleSaveAddress = async (addressData: Partial<DeliveryAddress>) => {
    try {
      const payload: CreateAddressRequest = {
        title: addressData.label || "Home",
        recipient_name: addressData.recipientName || defaultCustomerName,
        phone: addressData.recipientPhone || user?.phone || "0770000000",
        address_line1: addressData.addressLine1 || "",
        address_line2: addressData.addressLine2 || null,
        province: addressData.province || addressData.provinceTag || "Western",
        district: addressData.district || "Colombo",
        postal_city: addressData.postalCity || addressData.addressLine2 || "Colombo 01",
        is_default: addressData.isDefault || addresses.length === 0,
      };

      if (editingAddress?.id) {
        await updateAddressMutation.mutateAsync({
          id: editingAddress.id,
          data: payload,
        });
        addToast({
          title: "Address Updated",
          message: `Updated address "${payload.title}".`,
          type: "success",
        });
      } else {
        await createAddressMutation.mutateAsync(payload);
        addToast({
          title: "Address Saved",
          message: `Saved address "${payload.title}".`,
          type: "success",
        });
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } }; message?: string };
      addToast({
        title: "Save Failed",
        message: error?.response?.data?.detail || "Could not save address.",
        type: "error",
      });
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
      {/* Header */}
      <Header
        headingTag="h2"
        size="md"
        title={t("title")}
        description={t("description")}
        borderBottom
        actions={
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-[#D81B60] border border-rose-200 rounded-full text-xs font-bold transition-all shrink-0 self-start sm:self-auto cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>{t("addNew")}</span>
          </button>
        }
      />

      {/* Grid of Address Cards */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#D81B60]" />
          <span className="text-xs font-semibold">{t("loading")}</span>
        </div>
      ) : addresses.length === 0 ? (
        <div className="py-10 text-center space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-6">
          <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
          <div>
            <h3 className="text-sm font-bold text-slate-800">{t("emptyTitle")}</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {t("emptyDesc")}
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#D81B60] hover:bg-[#C2185B] text-white rounded-full text-xs font-bold transition-all cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>{t("addFirst")}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {addresses.map((addr) => {
            const isDefault = addr.isDefault;

          return (
            <div
              key={addr.id}
              className={`rounded-3xl p-5 flex flex-col justify-between space-y-4 transition-all ${
                isDefault
                  ? "border-2 border-[#D81B60] bg-white shadow-xs"
                  : "border border-slate-200/80 bg-white hover:border-slate-300 shadow-2xs"
              }`}
            >
              {/* Badges Row */}
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1 rounded-full ${
                    isDefault
                      ? "bg-[#D81B60] text-white"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  {isDefault && <CheckCircle2 className="w-3 h-3 text-white" />}
                  {addr.type === "work" ? (
                    <Building2 className="w-3 h-3" />
                  ) : addr.type === "other" ? (
                    <Users className="w-3 h-3" />
                  ) : (
                    <Home className="w-3 h-3" />
                  )}
                  <span>{addr.label}</span>
                </span>

                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{addr.provinceTag}</span>
                </span>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {addr.addressLine1}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {addr.addressLine2}
                </p>
              </div>

              {/* Bottom Actions Row */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                {isDefault ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D81B60]">
                    <span className="w-2 h-2 rounded-full bg-[#D81B60]"></span>
                    {t("activeDefault")}
                  </span>
                ) : (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-xs font-bold text-[#D81B60] hover:underline cursor-pointer"
                  >
                    {t("setAsDefault")}
                  </button>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(addr)}
                    title={t("edit")}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  {addresses.length > 1 && (
                    <button
                      onClick={() => handleDelete(addr.id)}
                      title={t("delete")}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Address Edit/Add Modal */}
      <AddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        addressToEdit={editingAddress}
        onSaveAddress={handleSaveAddress}
      />
    </div>
  );
};
