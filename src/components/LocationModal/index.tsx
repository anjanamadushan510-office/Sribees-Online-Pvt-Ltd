"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/base/Modal";
import { useUIStore } from "@/state/ui.store";
import { useProvinces, useDistricts, usePostalCities } from "@/api/queries/useLocations";
import { branchService } from "@/api/services/branch.service";
import { useQueryClient } from "@tanstack/react-query";
import { MapPin, Navigation, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import { useAuthStore } from "@/state/auth.store";

export const LocationModal: React.FC = () => {
  const { isLocationModalOpen, setIsLocationModalOpen, setSelectedLocation } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const [selectedProvince, setSelectedProvince] = useState<string>("Western");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("Kalutara");
  const [selectedPostalCity, setSelectedPostalCity] = useState<string>("Matugama");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Queries for locations
  const { data: provinces = [], isLoading: isLoadingProvinces } = useProvinces();
  const { data: districts = [], isLoading: isLoadingDistricts } = useDistricts(selectedProvince);
  const { data: postalCities = [], isLoading: isLoadingCities } = usePostalCities(selectedDistrict);

  // Auto-open for guest on first visit if no location is selected yet
  useEffect(() => {
    if (typeof window !== "undefined") {
      const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const isLoggedIn = !!accessToken || isAuthenticated;

      // Logged in user: DO NOT prompt location modal
      if (isLoggedIn) {
        setIsLocationModalOpen(false);
        return;
      }

      const hasLocationSet = localStorage.getItem("sribees_user_location");
      const storedLabel = localStorage.getItem("sribees_user_location_label");

      if (!hasLocationSet) {
        // Guest first visit: Auto-open modal so guest selects delivery location
        setIsLocationModalOpen(true);
      } else if (storedLabel) {
        setSelectedLocation(storedLabel);
      }
    }
  }, [isAuthenticated, setIsLocationModalOpen, setSelectedLocation]);

  const handleProvinceChange = (newProv: string) => {
    setSelectedProvince(newProv);
    setSelectedDistrict("");
    setSelectedPostalCity("");
    setSubmitError(null);
  };

  const handleDistrictChange = (newDist: string) => {
    setSelectedDistrict(newDist);
    setSelectedPostalCity("");
    setSubmitError(null);
  };

  // Auto-select first available province when provinces load if selected one is invalid or coming soon
  useEffect(() => {
    if (provinces.length > 0) {
      const isCurrentDisabled = provinces.some(
        (p) => p.province === selectedProvince && (p.comingSoon || p.available === false)
      );
      if (!selectedProvince || isCurrentDisabled || !provinces.some((p) => p.province === selectedProvince)) {
        const activeProv = provinces.find((p) => !p.comingSoon && p.available !== false) || provinces[0];
        if (activeProv) setSelectedProvince(activeProv.province);
      }
    }
  }, [provinces, selectedProvince]);

  // When districts load, auto-select first available district if currently empty or coming soon
  useEffect(() => {
    if (districts.length > 0) {
      const isCurrentDisabled = districts.some(
        (d) => d.district === selectedDistrict && (d.comingSoon || d.available === false)
      );
      if (!selectedDistrict || isCurrentDisabled || !districts.some((d) => d.district === selectedDistrict)) {
        const activeDist = districts.find((d) => !d.comingSoon && d.available !== false) || districts[0];
        if (activeDist) setSelectedDistrict(activeDist.district);
      }
    }
  }, [districts, selectedDistrict]);

  // When postalCities load, auto-select first city if currently empty
  useEffect(() => {
    if (postalCities.length > 0) {
      if (!selectedPostalCity || !postalCities.some((c) => c.postalCity === selectedPostalCity)) {
        if (postalCities[0]) setSelectedPostalCity(postalCities[0].postalCity);
      }
    }
  }, [postalCities, selectedPostalCity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvince || !selectedDistrict || !selectedPostalCity) {
      setSubmitError("Please select your province, district, and town/area.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await branchService.resolveByLocation({
        province: selectedProvince,
        district: selectedDistrict,
        postal_city: selectedPostalCity,
      });

      const displayLabel = `${selectedPostalCity}, ${selectedDistrict}`;

      // Update UI store and localStorage
      setSelectedLocation(displayLabel);
      if (typeof window !== "undefined") {
        localStorage.setItem("sribees_user_location_label", displayLabel);
      }

      // Invalidate queries so catalog refreshes with new branch context
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BANNERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.HOME_FEED] });

      setIsLocationModalOpen(false);
    } catch (err: any) {
      console.error("Location submission error:", err);
      const apiErrorMsg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.response?.data?.detail;

      setSubmitError(
        apiErrorMsg ||
          "This location is currently not served by an active branch. Please select another nearby city (e.g. Matugama)."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isLocationModalOpen}
      onClose={() => setIsLocationModalOpen(false)}
      title="Set Delivery Location"
    >
      <div className="space-y-5">
        {/* Banner Header */}
        <div className="bg-gradient-to-br from-rose-50 to-orange-50 p-4 rounded-2xl border border-rose-100/80 flex items-start gap-3">
          <div className="p-2.5 bg-[#D81B60] text-white rounded-xl shadow-md shadow-rose-200">
            <Navigation className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900">
              Select Your Delivery Area
            </h4>
            <p className="text-xs text-slate-600 font-medium mt-0.5 leading-relaxed">
              SRIBEES delivers fresh groceries directly from local hubs. Select your area to view live stock and prices.
            </p>
          </div>
        </div>

        {submitError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-bold text-[#D81B60]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step 1: Province */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">
              1. Province
            </label>
            <select
              value={selectedProvince}
              onChange={(e) => handleProvinceChange(e.target.value)}
              disabled={isLoadingProvinces || isSubmitting}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#D81B60] focus:bg-white transition-all cursor-pointer"
            >
              {isLoadingProvinces ? (
                <option>Loading provinces...</option>
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
                      {p.province} {isComingSoon ? "(Coming Soon)" : ""}
                    </option>
                  );
                })
              )}
            </select>
          </div>

          {/* Step 2: District */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">
              2. District
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              disabled={isLoadingDistricts || isSubmitting}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#D81B60] focus:bg-white transition-all cursor-pointer"
            >
              {isLoadingDistricts ? (
                <option>Loading districts...</option>
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
                      {d.district} {isComingSoon ? "(Coming Soon)" : ""}
                    </option>
                  );
                })
              )}
            </select>
          </div>

          {/* Step 3: Postal City / Post Office */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">
              3. Postal City / Town
            </label>
            {isLoadingCities ? (
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl text-xs text-slate-400 font-semibold">
                <Loader2 className="w-4 h-4 animate-spin text-[#D81B60]" />
                <span>Fetching serviceable cities...</span>
              </div>
            ) : postalCities.length === 0 ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 font-medium text-center">
                No cities found for this district.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {postalCities.map((city) => {
                  const isSelected = selectedPostalCity === city.postalCity;
                  return (
                    <button
                      type="button"
                      key={city.postalCity}
                      onClick={() => {
                        setSelectedPostalCity(city.postalCity);
                        setSubmitError(null);
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#D81B60] bg-rose-50/80 text-[#D81B60] shadow-xs"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className={`w-3.5 h-3.5 ${isSelected ? "text-[#D81B60]" : "text-slate-400"}`} />
                        <span>{city.postalCity}</span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#D81B60]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !selectedPostalCity}
              className="w-full py-3 bg-[#D81B60] hover:bg-[#C2185B] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting to Hub...</span>
                </>
              ) : (
                <span>Confirm Location & Start Shopping</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
