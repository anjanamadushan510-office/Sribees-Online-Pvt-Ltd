export interface LocationData {
  branch_id: string;
  branch_name: string;
  city: string;
}

export interface SetLocationRequest {
  address_id: string;
}

export interface SetLocationResponse {
  success: boolean;
  data: LocationData;
  message: string;
}
