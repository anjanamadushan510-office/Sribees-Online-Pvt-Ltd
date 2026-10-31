import { useQuery } from "@tanstack/react-query";
import { walletService } from "../services/wallet.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useAuthStore } from "@/state/auth.store";

export const useGetWalletBalance = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: [QUERY_KEYS.WALLET_BALANCE],
    queryFn: () => walletService.getWalletBalance(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 3,
  });
};

export const useGetWalletTransactions = (page = 1, pageSize = 20) => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: [QUERY_KEYS.WALLET_TRANSACTIONS, page, pageSize],
    queryFn: () => walletService.getWalletTransactions(page, pageSize),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetLoyaltySummary = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: [QUERY_KEYS.LOYALTY_SUMMARY],
    queryFn: () => walletService.getLoyaltySummary(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });
};
