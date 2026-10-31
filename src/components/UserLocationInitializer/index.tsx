"use client";

import React, { useEffect } from "react";
import { useAuthStore } from "@/state/auth.store";
import { useUIStore } from "@/state/ui.store";
import { addressService } from "@/api/services/address.service";
import { branchService } from "@/api/services/branch.service";
import { sessionService } from "@/api/services/session.service";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";

export const UserLocationInitializer: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { setSelectedLocation } = useUIStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) return;

    const initLoggedInLocation = async () => {
      try {
        // 1. Check if backend session already has a branch location set
        const sessionLoc = await sessionService.getSessionLocation();
        if (!useAuthStore.getState().isAuthenticated) return;

        if (sessionLoc?.postalCity || sessionLoc?.branchName) {
          const label = `${sessionLoc.postalCity || sessionLoc.branchName}${
            sessionLoc.district ? `, ${sessionLoc.district}` : ""
          }`;
          setSelectedLocation(label);
          return;
        }

        // 2. Fetch user's saved addresses to get default address
        const addresses = await addressService.getAddresses();
        if (!useAuthStore.getState().isAuthenticated) return;

        if (addresses && addresses.length > 0) {
          const defaultAddress =
            addresses.find((a) => a.is_default) || addresses[0];

          if (defaultAddress.address_id) {
            await sessionService.setLocationByAddressId(defaultAddress.address_id);
          } else if (defaultAddress.province && defaultAddress.district) {
            await branchService.resolveByLocation({
              province: defaultAddress.province,
              district: defaultAddress.district,
              postal_city:
                defaultAddress.postal_city ||
                "Matugama",
            });
          }

          const label = `${defaultAddress.postal_city || defaultAddress.district || "Default Address"}`;
          setSelectedLocation(label);

          // Invalidate catalog cache so products load for user's default address branch
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] });
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BANNERS] });
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES] });
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.HOME_FEED] });
        }
      } catch (err: any) {
        if (err?.response?.status !== 401 && !err?.message?.includes("token")) {
          console.warn("Could not auto-initialize logged-in user location:", err);
        }
      }
    };

    initLoggedInLocation();
  }, [isAuthenticated, setSelectedLocation, queryClient]);

  return null;
};
