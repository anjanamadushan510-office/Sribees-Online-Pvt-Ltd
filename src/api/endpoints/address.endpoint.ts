export const ADDRESS_ENDPOINTS = {
  USER_ADDRESSES: "/user/addresses",
  ADDRESS_BY_ID: (id: string) => `/user/addresses/${encodeURIComponent(id)}`,
  SET_DEFAULT: (id: string) =>
    `/user/addresses/${encodeURIComponent(id)}/set-default`,
} as const;
