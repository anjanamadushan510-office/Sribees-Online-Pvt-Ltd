export interface UserProfile {
  name: string;
  email: string;
  nic: string;
  primaryMobile: string;
  secondaryMobile?: string;
  tier: string;
  tierName?: string;
  tierColor?: string;
  isVerified: boolean;
  greenShopperPoints: number;
  memberSince: string;
  hubLocation: string;
  tierProgressPoints: number;
  pointsToNextTier: number;
  nextTierName: string;
  avatarUrl: string;
  accountId?: string;
}

export interface WalletInfo {
  balance: number;
  currency: string;
  welcomeVoucherActive: boolean;
  welcomeVoucherAmount: number;
  voucherDaysRemaining: number;
  pendingCashback?: number;
}

export interface DeliveryAddress {
  id: string;
  label: string;
  provinceTag: string;
  province?: string;
  district?: string;
  postalCity?: string;
  addressLine1: string;
  addressLine2: string;
  recipientName: string;
  recipientPhone: string;
  deliveryInstructions: string;
  isDefault: boolean;
  type: 'home' | 'work' | 'other';
}
