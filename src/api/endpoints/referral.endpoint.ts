export const REFERRAL_ENDPOINTS = {
  ME: "/referrals/me",
  FRIEND: (friendUserId: string) =>
    `/referrals/friends/${encodeURIComponent(friendUserId)}`,
  REDEEM: "/referrals/redeem",
  CLAIM: "/referrals/claim",
} as const;
