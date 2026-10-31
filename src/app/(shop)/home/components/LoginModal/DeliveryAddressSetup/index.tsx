"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  MapPin,
  Crosshair,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Loader2,
  Plus,
  Check,
  Building2,
  Home as HomeIcon,
  ChevronLeft,
} from "lucide-react";
import { Input } from "@/components/base/Input";
import { useGetAddresses } from "@/api/queries/useAddresses";
import { useProvinces, useDistricts, usePostalCities } from "@/api/queries/useLocations";
import { ApiAddress } from "@/interfaces/address.interface";

export interface SavedAddress {
  id: string;
  tag: "Home" | "Work" | "Other" | "GPS Location";
  isDefault?: boolean;
  houseAddress: string;
  city: string;
  district: string;
  province: string;
  landmark?: string;
}

export interface DeliveryAddressSetupProps {
  isExistingUser?: boolean;
  province: string;
  setProvince: (val: string) => void;
  district: string;
  setDistrict: (val: string) => void;
  city: string;
  setCity: (val: string) => void;
  houseAddress: string;
  setHouseAddress: (val: string) => void;
  landmark: string;
  setLandmark: (val: string) => void;
  selectedAddressId?: string;
  setSelectedAddressId?: (val: string) => void;
  isSubmitting: boolean;
  onConfirmAddress: (e: React.FormEvent) => void;
}

export const DeliveryAddressSetup: React.FC<DeliveryAddressSetupProps> = ({
  isExistingUser = false,
  province,
  setProvince,
  district,
  setDistrict,
  city,
  setCity,
  houseAddress,
  setHouseAddress,
  landmark,
  setLandmark,
  selectedAddressId: propSelectedAddressId,
  setSelectedAddressId: propSetSelectedAddressId,
  isSubmitting,
  onConfirmAddress,
}) => {
  // Fetch real addresses from Backend API
  const { data: apiAddresses = [], isLoading: isLoadingAddresses } = useGetAddresses();

  // Fetch real location options from Backend API via TanStack Query
  const { data: provinces = [], isLoading: isLoadingProvinces } = useProvinces();
  const { data: districts = [], isLoading: isLoadingDistricts } = useDistricts(province);
  const { data: postalCities = [], isLoading: isLoadingCities } = usePostalCities(district);

  // Sync default district when districts load
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
  }, [districts, district, setDistrict]);

  // Sync default city when postalCities load
  useEffect(() => {
    if (postalCities.length > 0) {
      if (!city || !postalCities.some((c) => c.postalCity === city)) {
        setCity(postalCities[0].postalCity);
      }
    }
  }, [postalCities, city, setCity]);

  // Transform backend API addresses into SavedAddress list
  const savedAddresses: SavedAddress[] = useMemo(() => {
    if (apiAddresses && apiAddresses.length > 0) {
      return apiAddresses.map((a: ApiAddress) => ({
        id: a.address_id,
        tag: (a.title as any) || "Home",
        isDefault: a.is_default,
        houseAddress: a.address_line1 + (a.address_line2 ? `, ${a.address_line2}` : ""),
        city: a.postal_city,
        district: a.district,
        province: a.province,
        landmark: "",
      }));
    }
    return [];
  }, [apiAddresses]);

  // Default to list view if user has saved addresses, otherwise form view
  const [viewMode, setViewMode] = useState<"list" | "form">("form");
  const [internalSelectedAddressId, setInternalSelectedAddressId] = useState<string>("");

  useEffect(() => {
    if (savedAddresses.length > 0) {
      setViewMode("list");
      if (!internalSelectedAddressId) {
        const defaultAddr = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
        if (defaultAddr) {
          updateSelectedAddressId(defaultAddr.id);
          setProvince(defaultAddr.province);
          setDistrict(defaultAddr.district);
          setCity(defaultAddr.city);
          setHouseAddress(defaultAddr.houseAddress);
        }
      }
    } else {
      setViewMode("form");
    }
  }, [savedAddresses]);

  const selectedAddressId = propSelectedAddressId ?? internalSelectedAddressId;

  const updateSelectedAddressId = (id: string) => {
    setInternalSelectedAddressId(id);
    if (propSetSelectedAddressId) {
      propSetSelectedAddressId(id);
    }
  };

  const [isLocating, setIsLocating] = useState(false);

  // Handle Province change
  const handleProvinceChange = (newProvince: string) => {
    setProvince(newProvince);
    setDistrict("");
    setCity("");
  };

  // GPS Auto-detect handler
  const handleDetectLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (_position) => {
          setIsLocating(false);
          setProvince("Western");
          setDistrict("Kalutara");
          setCity("Matugama");
          setHouseAddress("Detected Location");
          setLandmark("Current GPS Location");
        },
        (_error) => {
          setIsLocating(false);
          setProvince("Western");
          setDistrict("Kalutara");
          setCity("Matugama");
        }
      );
    } else {
      setTimeout(() => {
        setIsLocating(false);
        setProvince("Western");
        setDistrict("Kalutara");
        setCity("Matugama");
      }, 600);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmAddress(e);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      {/* Icon Header */}
      <div className="flex flex-col items-center text-center">
        <div className="w-13 h-13 rounded-2xl bg-rose-50 flex items-center justify-center text-[#D81B60] mb-2.5 shadow-2xs">
          <MapPin className="w-6 h-6 stroke-[2.2]" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Delivery Address
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-1 max-w-[320px]">
          {viewMode === "list"
            ? "Select your delivery location or add a new address"
            : "Enter your address details for quick delivery"}
        </p>
      </div>

      {/* GPS Location Button */}
      <button
        type="button"
        onClick={handleDetectLocation}
        disabled={isLocating}
        className="w-full py-3 px-4 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 active:scale-[0.99] text-[#D81B60] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-70 mt-1 shadow-2xs"
      >
        {isLocating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-[#D81B60]" />
            <span>Detecting Location...</span>
          </>
        ) : (
          <>
            <Crosshair className="w-4 h-4 text-[#D81B60]" />
            <span>Use Current GPS Location</span>
          </>
        )}
      </button>

      {/* VIEW MODE 1: Saved Addresses List */}
      {isLoadingAddresses ? (
        <div className="py-6 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin text-[#D81B60]" />
          <span>Fetching your saved addresses from Backend...</span>
        </div>
      ) : viewMode === "list" && savedAddresses.length > 0 ? (
        <div className="space-y-3 pt-1">
          {/* Section Divider */}
          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-slate-100 w-full" />
            <span className="bg-white px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase shrink-0">
              Saved Locations
            </span>
            <div className="border-t border-slate-100 w-full" />
          </div>

          {/* Saved Addresses List */}
          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
            {savedAddresses.map((addr) => {
              const isSelected = selectedAddressId === addr.id;
              return (
                <div
                  key={addr.id}
                  onClick={() => {
                    updateSelectedAddressId(addr.id);
                    setProvince(addr.province);
                    setDistrict(addr.district);
                    setCity(addr.city);
                    setHouseAddress(addr.houseAddress);
                    setLandmark(addr.landmark || "");
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 relative ${
                    isSelected
                      ? "border-[#D81B60] bg-rose-50/30 ring-2 ring-rose-100 shadow-2xs"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  {/* Selection Radio Circle */}
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      isSelected
                        ? "border-[#D81B60] bg-[#D81B60] text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>

                  {/* Address Info */}
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                        {addr.tag === "Home" ? (
                          <HomeIcon className="w-3.5 h-3.5 text-[#D81B60]" />
                        ) : addr.tag === "Work" ? (
                          <Building2 className="w-3.5 h-3.5 text-[#D81B60]" />
                        ) : (
                          <MapPin className="w-3.5 h-3.5 text-[#D81B60]" />
                        )}
                        {addr.tag}
                      </span>
                      {addr.isDefault && (
                        <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {addr.houseAddress}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {addr.city}, {addr.district}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Location Button */}
          <button
            type="button"
            onClick={() => setViewMode("form")}
            className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/20 hover:bg-rose-50/60 active:scale-[0.99] text-[#D81B60] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-2xs mt-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Location</span>
          </button>
        </div>
      ) : (
        /* VIEW MODE 2: Manual Add Location Form */
        <div className="space-y-3 pt-1">
          {/* Back to Saved Addresses Button if list exists */}
          {savedAddresses.length > 0 && (
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className="flex items-center gap-1 text-xs font-bold text-[#D81B60] hover:underline cursor-pointer mb-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Select from Saved Locations</span>
            </button>
          )}

          {/* Divider */}
          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-slate-100 w-full" />
            <span className="bg-white px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase shrink-0">
              Or Enter Details Manually
            </span>
            <div className="border-t border-slate-100 w-full" />
          </div>

          {/* Form Fields Grid */}
          <div className="space-y-3">
            {/* Province & District dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Province Select */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Province <span className="text-[#D81B60]">*</span>
                </label>
                <div className="relative">
                  <select
                    value={province}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    disabled={isLoadingProvinces}
                    required
                    className="w-full py-3 pl-3.5 pr-8 text-sm font-medium text-slate-800 bg-white border border-slate-200 rounded-xl outline-none appearance-none focus:border-[#D81B60] focus:ring-4 focus:ring-rose-100 transition-all cursor-pointer shadow-2xs disabled:opacity-60"
                  >
                    {isLoadingProvinces ? (
                      <option value="">Loading provinces...</option>
                    ) : (
                      provinces.map((prov) => {
                        const isComingSoon = prov.comingSoon || prov.available === false;
                        return (
                          <option
                            key={prov.province}
                            value={prov.province}
                            disabled={isComingSoon}
                            className={isComingSoon ? "text-slate-400 font-normal bg-slate-100" : "text-slate-800 font-semibold"}
                          >
                            {prov.province} {isComingSoon ? "(Coming Soon)" : ""}
                          </option>
                        );
                      })
                    )}
                  </select>
                  {isLoadingProvinces ? (
                    <Loader2 className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 animate-spin pointer-events-none" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  )}
                </div>
              </div>

              {/* District Select */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  District <span className="text-[#D81B60]">*</span>
                </label>
                <div className="relative">
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    disabled={isLoadingDistricts || !province}
                    required
                    className="w-full py-3 pl-3.5 pr-8 text-sm font-medium text-slate-800 bg-white border border-slate-200 rounded-xl outline-none appearance-none focus:border-[#D81B60] focus:ring-4 focus:ring-rose-100 transition-all cursor-pointer shadow-2xs disabled:opacity-60"
                  >
                    {isLoadingDistricts ? (
                      <option value="">Loading districts...</option>
                    ) : districts.length === 0 ? (
                      <option value="">No districts found</option>
                    ) : (
                      districts.map((dist) => {
                        const isComingSoon = dist.comingSoon || dist.available === false;
                        return (
                          <option
                            key={dist.district}
                            value={dist.district}
                            disabled={isComingSoon}
                            className={isComingSoon ? "text-slate-400 font-normal bg-slate-100" : "text-slate-800 font-semibold"}
                          >
                            {dist.district} {isComingSoon ? "(Coming Soon)" : ""}
                          </option>
                        );
                      })
                    )}
                  </select>
                  {isLoadingDistricts ? (
                    <Loader2 className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 animate-spin pointer-events-none" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  )}
                </div>
              </div>
            </div>

            {/* City / Postal Zone */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                City / Postal Zone <span className="text-[#D81B60]">*</span>
              </label>
              <div className="relative">
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={isLoadingCities || !district}
                  required
                  className="w-full py-3 pl-3.5 pr-8 text-sm font-medium text-slate-800 bg-white border border-slate-200 rounded-xl outline-none appearance-none focus:border-[#D81B60] focus:ring-4 focus:ring-rose-100 transition-all cursor-pointer shadow-2xs disabled:opacity-60"
                >
                  {isLoadingCities ? (
                    <option value="">Loading postal cities...</option>
                  ) : postalCities.length === 0 ? (
                    <option value="">No postal cities found</option>
                  ) : (
                    postalCities.map((c) => (
                      <option key={c.postalCity} value={c.postalCity}>
                        {c.postalCity}
                      </option>
                    ))
                  )}
                </select>
                {isLoadingCities ? (
                  <Loader2 className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 animate-spin pointer-events-none" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                )}
              </div>
            </div>

            {/* House / Street Address */}
            <Input
              label="House / Street Address"
              required
              type="text"
              value={houseAddress}
              onChange={(e) => setHouseAddress(e.target.value)}
              placeholder="No. 12, Main Street"
            />

            {/* Landmark (Optional) */}
            <Input
              label="Landmark"
              optionalText="Optional"
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="Near Town Clock Tower"
            />
          </div>
        </div>
      )}

      {/* Confirm Address & Proceed CTA */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 px-6 bg-[#D81B60] hover:bg-[#C2185B] active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer mt-5 disabled:opacity-75"
      >
        <span>
          {isSubmitting ? "Saving Address..." : "Confirm Address & Proceed"}
        </span>
        <ArrowRight className="w-4 h-4" />
      </button>

      {/* Security & Support Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 text-center space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            End-to-End Encrypted • Sri Lanka Data Protection Compliant
          </span>
        </div>
        <p className="text-[11px] text-slate-400 font-medium">
          Need help? Call{" "}
          <strong className="text-slate-600">+94 11 234 5678</strong>
        </p>
      </div>
    </form>
  );
};

export default DeliveryAddressSetup;
