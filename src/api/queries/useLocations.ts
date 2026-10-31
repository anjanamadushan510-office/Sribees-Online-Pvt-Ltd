import { useQuery } from "@tanstack/react-query";
import { locationService } from "../services/location.service";

export const useProvinces = () => {
  return useQuery({
    queryKey: ["locations-provinces"],
    queryFn: () => locationService.getProvinces(),
    staleTime: 1000 * 60 * 30,
  });
};

export const useDistricts = (province?: string) => {
  return useQuery({
    queryKey: ["locations-districts", province],
    queryFn: () => locationService.getDistricts(province!),
    enabled: !!province,
    staleTime: 1000 * 60 * 30,
  });
};

export const usePostalCities = (district?: string) => {
  return useQuery({
    queryKey: ["locations-postal-cities", district],
    queryFn: () => locationService.getPostalCities(district!),
    enabled: !!district,
    staleTime: 1000 * 60 * 30,
  });
};
