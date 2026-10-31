export interface ApiAddress {
  address_id: string;
  title: string;
  recipient_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string | null;
  province: string;
  district: string;
  postal_city: string;
  postal_code?: string | null;
  is_default: boolean;
  is_serviceable?: boolean;
  delivery_available?: boolean;
  branch_id?: string | null;
  branch_name?: string | null;
}

export interface GetAddressesResponse {
  success: boolean;
  data: ApiAddress[];
}

export interface CreateAddressRequest {
  title: string;
  recipient_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string | null;
  province: string;
  district: string;
  postal_city: string;
  postal_code?: string | null;
  is_default?: boolean;
}

export interface CreateAddressResponse {
  success: boolean;
  data: ApiAddress;
  message?: string;
}
