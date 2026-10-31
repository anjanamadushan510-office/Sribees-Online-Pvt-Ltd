import { apiClient } from "@/utils/apiClient";
import { REFERRAL_ENDPOINTS } from "../endpoints/referral.endpoint";
import {
  ReferralMeResponse,
  RedeemReferralRequest,
  RedeemReferralResponse,
  ClaimReferralCommissionResponse,
  FriendCommissionsResponse,
} from "@/interfaces/referral.interface";

export const referralService = {
  getReferralMe: async (): Promise<ReferralMeResponse> => {
    const response = await apiClient.get<any>(REFERRAL_ENDPOINTS.ME);
    const resData = response.data?.data || response.data;
    return {
      referralCode: resData.referralCode || "",
      commissionPercent: resData.commissionPercent ?? 0,
      currency: resData.currency || "LKR",
      totals: {
        pending: resData.totals?.pending ?? 0,
        claimable: resData.totals?.claimable ?? 0,
        paid: resData.totals?.paid ?? 0,
      },
      friendCount: resData.friendCount ?? resData.friends?.length ?? 0,
      friends: Array.isArray(resData.friends) ? resData.friends : [],
    };
  },

  redeemReferral: async (
    data: RedeemReferralRequest,
  ): Promise<RedeemReferralResponse> => {
    const response = await apiClient.post<any>(
      REFERRAL_ENDPOINTS.REDEEM,
      data,
    );
    return response.data;
  },

  claimCommission: async (): Promise<ClaimReferralCommissionResponse> => {
    const response = await apiClient.post<ClaimReferralCommissionResponse>(
      REFERRAL_ENDPOINTS.CLAIM,
    );
    return response.data;
  },

  getFriendCommissions: async (
    friendUserId: string,
  ): Promise<FriendCommissionsResponse> => {
    const response = await apiClient.get<FriendCommissionsResponse>(
      REFERRAL_ENDPOINTS.FRIEND(friendUserId),
    );
    return response.data;
  },
};
