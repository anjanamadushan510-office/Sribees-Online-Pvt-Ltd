export interface ReferralTotals {
  pending: number;
  claimable: number;
  paid: number;
}

export interface ReferredFriend {
  friendUserId?: string;
  userId?: string;
  id?: string;
  name?: string;
  fullName?: string;
  phone?: string;
  createdAt?: string;
  joinedAt?: string;
  totalOrders?: number;
  commissionEarned?: number;
  status?: string;
  [key: string]: any;
}

export interface ReferralMeResponse {
  referralCode: string;
  commissionPercent: number;
  currency: string;
  totals: ReferralTotals;
  friendCount: number;
  friends: ReferredFriend[];
}

export interface RedeemReferralRequest {
  referral_code: string;
}

export interface RedeemReferralResponse {
  success?: boolean;
  message?: string;
  detail?: string;
  [key: string]: any;
}

export interface ClaimReferralCommissionResponse {
  data: {
    claimedCount: number;
    amount: number;
  };
  message: string;
}

export interface FriendCommissionsResponse {
  success?: boolean;
  data?: any;
  [key: string]: any;
}
