export interface WalletTier {
  tier_id?: string;
  name: string;
  min_points?: number;
  color?: string;
}

export interface WalletBalanceResponse {
  balance: number;
  currency: string;
  cashback_rate?: number;
  pending_cashback?: number;
  points?: number;
  tier?: WalletTier;
  next_tier?: WalletTier & { points_needed?: number };
}

export interface WalletTransactionItem {
  transaction_id: string;
  type: "earned" | "spent" | "refund";
  title: string;
  amount: number;
  balance_after?: number;
  order_id?: string | null;
  order_number?: string | null;
  created_at: string;
}

export interface GetWalletTransactionsResponse {
  success: boolean;
  data: {
    transactions: WalletTransactionItem[];
    total: number;
    page: number;
    page_size: number;
  };
}

export interface LoyaltySummaryResponse {
  success: boolean;
  data: {
    points: number;
    tier?: WalletTier;
    next_tier?: WalletTier & { points_needed?: number };
    tiers?: WalletTier[];
    spend_per_point?: number;
    spend_to_next_point?: number;
  };
}
