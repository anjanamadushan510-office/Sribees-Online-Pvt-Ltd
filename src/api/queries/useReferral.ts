import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { referralService } from "../services/referral.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useAuthStore } from "@/state/auth.store";
import { RedeemReferralRequest } from "@/interfaces/referral.interface";

export const useGetReferralMe = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: [QUERY_KEYS.REFERRAL_ME],
    queryFn: () => referralService.getReferralMe(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useRedeemReferral = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RedeemReferralRequest) =>
      referralService.redeemReferral(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REFERRAL_ME] });
    },
  });
};

export const useClaimReferralCommission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => referralService.claimCommission(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REFERRAL_ME] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WALLET_BALANCE] });
    },
  });
};

export const useGetFriendCommissions = (friendUserId: string) => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: [QUERY_KEYS.REFERRAL_FRIEND, friendUserId],
    queryFn: () => referralService.getFriendCommissions(friendUserId),
    enabled: isAuthenticated && Boolean(friendUserId),
    staleTime: 1000 * 60 * 5,
  });
};
