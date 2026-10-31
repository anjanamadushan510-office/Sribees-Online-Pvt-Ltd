import { apiClient } from "@/utils/apiClient";
import { WALLET_ENDPOINTS } from "../endpoints/wallet.endpoint";
import {
  WalletBalanceResponse,
  GetWalletTransactionsResponse,
  LoyaltySummaryResponse,
} from "@/interfaces/wallet.interface";

export const walletService = {
  getWalletBalance: async (): Promise<WalletBalanceResponse> => {
    const response = await apiClient.get<WalletBalanceResponse>(
      WALLET_ENDPOINTS.BALANCE,
    );
    return response.data;
  },

  getWalletTransactions: async (
    page = 1,
    pageSize = 20,
  ): Promise<GetWalletTransactionsResponse["data"]> => {
    const response = await apiClient.get<GetWalletTransactionsResponse>(
      `${WALLET_ENDPOINTS.TRANSACTIONS}?page=${page}&page_size=${pageSize}`,
    );
    return response.data.data;
  },

  getLoyaltySummary: async (): Promise<LoyaltySummaryResponse["data"]> => {
    const response = await apiClient.get<LoyaltySummaryResponse>(
      WALLET_ENDPOINTS.LOYALTY,
    );
    return response.data.data;
  },
};
