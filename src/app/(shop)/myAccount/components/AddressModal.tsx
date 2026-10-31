"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/base/Modal";
import { DeliveryAddress } from "@/interfaces/account.interface";
import { MapPin, Home as HomeIcon, ChevronDown, Loader2 } from "lucide-react";
import { useProvinces, useDistricts, usePostalCities } from "@/api/queries/useLocations";
import { useTranslations } from "next-intl";

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  addressToEdit?: DeliveryAddress | null;
  onSaveAddress: (address: Partial<DeliveryAddress>) => void;
}

export const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  onClose,
  addressToEdit,
  onSaveAddress,
}) => {
  const t = useTranslations("account.addressModal");
  const [province, setProvince] = useState<string>("Western");
  const [district, setDistrict] = useState<string>("Colombo");
  const [city, setCity] = useState<string>("");
  const [houseNoStreet, setHouseNoStreet] = useState<string>("");
  const [village, setVillage] = useState<string>("");

  // TanStack Query backend location hooks
  const { data: provinces = [], isLoading: isLoadingProvinces } = useProvinces();
  const { data: districts = [], isLoading: isLoadingDistricts } = useDistricts(province);
  const { data: postalCities = [], isLoading: isLoadingCities } = usePostalCities(district);

  // Sync state when modal opens or addressToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (addressToEdit) {
        setProvince(addressToEdit.province || addressToEdit.provinceTag || "Western");
        setDistrict(addressToEdit.district || "Colombo");
        setCity(addressToEdit.postalCity || addressToEdit.addressLine2 || "");
        setHouseNoStreet(addressToEdit.addressLine1 || "");
        setVillage(addressToEdit.addressLine2 || "");
      } else {
        if (provinces.length > 0 && !provinces.some((p) => p.province === province)) {
          setProvince(provinces[0].province);
        }
        setHouseNoStreet("");
        setVillage("");
      }
    }
  }, [addressToEdit, isOpen]);

  // When districts load, ensure a valid district is selected
  useEffect(() => {
    if (districts.length > 0) {
      const isCurrentDisabled = districts.some(
        (d) => d.district === district && (d.comingSoon || d.available === false)
      );
      if (!district || isCurrentDisabled || !districts.some((d) => d.district === district)) {
        const activeDist = districts.find((d) => !d.comingSoon && d.available !== false) || districts[0];
        if (activeDist) setDistrict(activeDist.district);
      }
    }
  }, [districts, district]);

  // When postalCities load, ensure a valid postal city is selected
  useEffect(() => {
    if (postalCities.length > 0) {
      if (!city || !postalCities.some((c) => c.postalCity === city)) {
        if (postalCities[0]) setCity(postalCities[0].postalCity);
      }
    }
  }, [postalCities, city]);

  const handleProvinceChange = (newProvince: string) => {
    setProvince(newProvince);
    setDistrict("");
    setCity("");
  };

  const handleDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict);
    setCity("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!houseNoStreet.trim()) return;

    onSaveAddress({
      label: city || "Home",
      provinceTag: province,
      province,
      district,
      postalCity: city,
      addressLine1: houseNoStreet.trim(),
      addressLine2: village.trim(),
      isDefault: addressToEdit ? addressToEdit.isDefault : false,
      type: "home",
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={addressToEdit ? t("editTitle") : t("addTitle")}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* 1. Province Dropdown */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            {t("province")} <span className="text-[#D81B60]">*</span>
          </label>
          <div className="relative">
            <select
              value={province}
              onChange={(e) => handleProvinceChange(e.target.value)}
              disabled={isLoadingProvinces}
              required
              className="w-full py-2.5 pl-3 pr-8 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-none appearance-none focus:border-[#D81B60] focus:bg-white transition-all cursor-pointer disabled:opacity-60"
            >
              {isLoadingProvinces ? (
                <option value="">{t("provinceLoading")}</option>
              ) : (
                provinces.map((p) => {
                  const isComingSoon = p.comingSoon || p.available === false;
                  return (
                    <option
                      key={p.province}
                      value={p.province}
                      disabled={isComingSoon}
                      className={isComingSoon ? "text-slate-400 font-normal bg-slate-100" : "text-slate-800 font-semibold"}
                    >
                      {p.province} {t("province")} {isComingSoon ? `(${t("comingSoon")})` : ""}
                    </option>
                  );
                })
              )}
            </select>
            {isLoadingProvinces ? (
              <Loader2 className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 animate-spin pointer-events-none" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            )}
          </div>
        </div>

        {/* 2. District Dropdown */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            {t("district")} <span className="text-[#D81B60]">*</span>
          </label>
          <div className="relative">
            <select
              value={district}
              onChange={(e) => handleDistrictChange(e.target.value)}
              disabled={isLoadingDistricts || !province}
              required
              className="w-full py-2.5 pl-3 pr-8 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-none appearance-none focus:border-[#D81B60] focus:bg-white transition-all cursor-pointer disabled:opacity-60"
            >
              {isLoadingDistricts ? (
                <option value="">{t("districtLoading")}</option>
              ) : districts.length === 0 ? (
                <option value="">{t("noDistricts")}</option>
              ) : (
                districts.map((d) => {
                  const isComingSoon = d.comingSoon || d.available === false;
                  return (
                    <option
                      key={d.district}
                      value={d.district}
                      disabled={isComingSoon}
                      className={isComingSoon ? "text-slate-400 font-normal bg-slate-100" : "text-slate-800 font-semibold"}
                    >
                      {d.district} {t("district")} {isComingSoon ? `(${t("comingSoon")})` : ""}
                    </option>
                  );
                })
              )}
            </select>
            {isLoadingDistricts ? (
              <Loader2 className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 animate-spin pointer-events-none" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            )}
          </div>
        </div>

        {/* 3. City Dropdown */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            {t("city")} <span className="text-[#D81B60]">*</span>
          </label>
          <div className="relative">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={isLoadingCities || !district}
              required
              className="w-full py-2.5 pl-3 pr-8 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-none appearance-none focus:border-[#D81B60] focus:bg-white transition-all cursor-pointer disabled:opacity-60"
            >
              {isLoadingCities ? (
                <option value="">{t("cityLoading")}</option>
              ) : postalCities.length === 0 ? (
                <option value="">{t("noCities")}</option>
              ) : (
                postalCities.map((c) => (
                  <option key={c.postalCity} value={c.postalCity}>
                    {c.postalCity}
                  </option>
                ))
              )}
            </select>
            {isLoadingCities ? (
              <Loader2 className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 animate-spin pointer-events-none" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            )}
          </div>
        </div>

        {/* 4. House Number & Street Input Field */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            {t("houseNo")} <span className="text-[#D81B60]">*</span>
          </label>
          <div className="relative flex items-center">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3" />
            <input
              type="text"
              value={houseNoStreet}
              onChange={(e) => setHouseNoStreet(e.target.value)}
              placeholder={t("houseNoPlaceholder")}
              className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#D81B60] focus:bg-white transition-all outline-none"
              required
            />
          </div>
        </div>

        {/* 5. Village Input Field */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            {t("village")} <span className="text-slate-400 font-normal">{t("optional")}</span>
          </label>
          <div className="relative flex items-center">
            <HomeIcon className="w-4 h-4 text-slate-400 absolute left-3" />
            <input
              type="text"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              placeholder={t("villagePlaceholder")}
              className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#D81B60] focus:bg-white transition-all outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#D81B60] hover:bg-[#C2185B] text-white text-xs font-bold rounded-full shadow-md shadow-rose-200 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            {addressToEdit ? t("update") : t("save")}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddressModal;
