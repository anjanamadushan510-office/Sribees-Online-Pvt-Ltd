export const AUTH_ENDPOINTS = {
  REQUEST_OTP: "/auth/phone/request-otp",
  VERIFY_OTP: "/auth/phone/verify-otp",
  UPDATE_ME: "/auth/me",
  REFRESH_TOKEN: "/auth/refresh",
  LOGOUT: "/auth/logout",
  LOGOUT_ALL: "/auth/logout-all",
  LOGOUT_OTHERS: "/auth/logout-others",
  SESSIONS: "/auth/sessions",
  DELETE_SESSION: (sessionId: string) =>
    `/auth/sessions/${encodeURIComponent(sessionId)}`,
  ACCOUNT_DELETION_REQUEST_OTP: "/auth/account/deletion/request-otp",
  ACCOUNT_DELETION_CONFIRM: "/auth/account/deletion/confirm",
  SUPPORT_INFO: "/app/support-info",
} as const;
