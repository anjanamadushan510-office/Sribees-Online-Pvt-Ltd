import { Product } from "./product.interface";

export interface SearchProductsParams {
  q: string;
  page?: number;
  limit?: number;
}

export interface SearchPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface SearchBranchInfo {
  branchId: string;
  branchName: string;
}

export interface SearchApiResponse {
  success: boolean;
  data?: {
    products: any[];
    pagination?: SearchPagination;
    branch?: SearchBranchInfo;
    query?: string;
  };
  message?: string;
}

export interface SearchResult {
  products: Product[];
  pagination: SearchPagination;
  branch?: SearchBranchInfo;
  query: string;
}
