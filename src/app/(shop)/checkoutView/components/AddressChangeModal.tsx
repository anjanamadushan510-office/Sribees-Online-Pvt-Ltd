"use client";

import React, { useMemo } from "react";
import { Modal } from "@/components/base/Modal";
import { MapPin, Check, Plus, Loader2 } from "lucide-react";
import { useGetAddresses } from "@/api/queries/useAddresses";
import { ApiAddress } from "@/interfaces/address.interface";
import { useAuthStore } from "@/state/auth.store";
import { useUIStore } from "@/state/ui.store";
import { isDummyPhone } from "@/utils/formatMobileNumber";

export interface AddressOption {
  id: string;
  name: string;
  address: string;
  contact: string;
  tag: string;
  isDefault?: boolean;
}

interface AddressChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAddressId: string;
  onSelectAddress: (address: AddressOption) => void;
}

export const AddressChangeModal: React.FC<AddressChangeModalProps> = ({
  isOpen,
  onClose,
  selectedAddressId,
  onSelectAddress,
}) => {
  const { data: apiAddresses = [], isLoading } = useGetAddresses();
  const { user } = useAuthStore();
  const { userProfile } = useUIStore();

  const customerDisplayName =
    user?.fullName ||
    (userProfile?.name && userProfile.name !== "Valued Customer"
      ? userProfile.name
      : "") ||
    "";

  const addresses: AddressOption[] = useMemo(() => {
    if (apiAddresses.length > 0) {
      return apiAddresses.map((a: ApiAddress) => {
        const hasCustomRecipient =
          a.recipient_name &&
          a.recipient_name !== "Valued Customer" &&
          a.recipient_name !== "Customer";

        const addrPhone = a.phone?.trim();
        const resolvedPhone =
          !isDummyPhone(addrPhone) && addrPhone
            ? addrPhone
            : user?.phone || "";

        return {
          id: a.address_id,
          name: hasCustomRecipient
            ? a.recipient_name
            : customerDisplayName || a.title || "Delivery Address",
          address: `${a.address_line1}${a.address_line2 ? `, ${a.address_line2}` : ""}, ${a.postal_city}, ${a.district}`,
          contact: resolvedPhone,
          tag: a.title || "Home",
          isDefault: a.is_default,
        };
      });
    }
    return [];
  }, [apiAddresses, customerDisplayName, user?.phone]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Delivery Address">
      <div className="space-y-4">
        <p className="text-xs text-slate-500">
          Select where you would like your fresh groceries and items dispatched to.
        </p>

        {isLoading ? (
          <div className="py-8 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin text-[#D81B60]" />
            <span>Fetching saved addresses...</span>
          </div>
        ) : addresses.length === 0 ? (
          <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200">
            <p className="text-xs font-bold text-slate-700">No saved addresses found</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Please add a new delivery address to proceed.</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {addresses.map((addr) => {
              const isSelected = selectedAddressId === addr.id;
              return (
                <div
                  key={addr.id}
                  onClick={() => {
                    onSelectAddress(addr);
                    onClose();
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? "border-[#D81B60] bg-rose-50/50 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl mt-0.5 ${
                        isSelected
                          ? "bg-[#D81B60] text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-slate-900">
                          {addr.name}
                        </span>
                        <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full uppercase">
                          {addr.tag}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 font-medium">
                        {addr.address}
                      </p>
                      {addr.contact && (
                        <p className="text-[11px] text-slate-400 mt-1 font-semibold">
                          {addr.contact}
                        </p>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#D81B60] text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 border border-dashed border-[#D81B60] text-[#D81B60] hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Address</span>
        </button>
      </div>
    </Modal>
  );
};
