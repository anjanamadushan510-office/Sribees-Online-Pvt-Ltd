import { apiClient } from "@/utils/apiClient";
import { AUTH_ENDPOINTS } from "../endpoints/auth.endpoint";
import {
  RequestOtpRequest,
  RequestOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  SocialLoginRequest,
  UpdateProfileRequest,
  UpdateProfileResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  User,
} from "@/interfaces/auth.interface";

const normalizeUserResponse = (raw: any): User => {
  if (!raw) {
    return {
      userId: "",
      fullName: "",
      email: null,
      phone: "",
      isVerified: false,
      isPhoneVerified: false,
    };
  }
  return {
    userId: raw.userId || raw.user_id || raw.id || "",
    fullName: raw.fullName || raw.full_name || raw.name || "",
    email: raw.email ?? null,
    phone: raw.phone || "",
    nic: raw.nic ?? null,
    alternatePhone: (raw.alternatePhone || raw.alternate_phone) ?? null,
    profilePictureUrl: (raw.profilePictureUrl || raw.profile_picture_url) ?? null,
    isVerified: Boolean(raw.isVerified ?? raw.is_verified ?? true),
    isPhoneVerified: Boolean(raw.isPhoneVerified ?? raw.is_phone_verified ?? true),
    twoFactorEnabled: raw.twoFactorEnabled ?? raw.two_factor_enabled ?? false,
    createdAt: raw.createdAt || raw.created_at,
    updatedAt: raw.updatedAt || raw.updated_at,
    lastLogin: raw.lastLogin || raw.last_login,
    missingProfileFields: raw.missingProfileFields || raw.missing_profile_fields,
  };
};

// A session response (OTP or Google): the user plus the token pair, under
// whichever key spelling the server used.
const toSession = (resData: any): VerifyOtpResponse => {
  const user = normalizeUserResponse(resData.user || resData);
  const accessToken =
    resData.tokens?.accessToken ||
    resData.tokens?.access_token ||
    resData.accessToken ||
    resData.access_token ||
    resData.token ||
    "";
  const refreshToken =
    resData.tokens?.refreshToken ||
    resData.tokens?.refresh_token ||
    resData.refreshToken ||
    resData.refresh_token ||
    "";
  return {
    success: resData.success ?? true,
    message: resData.message || "Logged in successfully",
    user,
    tokens: { accessToken, refreshToken },
  };
};

export const authService = {
  requestOtp: async (data: RequestOtpRequest): Promise<RequestOtpResponse> => {
    const response = await apiClient.post<any>(
      AUTH_ENDPOINTS.REQUEST_OTP,
      data,
    );
    const resData = response.data?.data || response.data;
    return {
      success: resData.success ?? true,
      message: resData.message || "OTP Requested",
      expiresInSeconds: resData.expiresInSeconds || 180,
    };
  },

  verifyOtp: async (data: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
    const response = await apiClient.post<any>(
      AUTH_ENDPOINTS.VERIFY_OTP,
      data,
    );
    const resData = response.data?.data || response.data;
    const session = toSession(resData);
    if (!session.user.phone && data.phone) {
      session.user.phone = data.phone;
    }
    if (!resData.message) session.message = "OTP Verified Successfully";
    return session;
  },

  /** Exchanges a Google ID token for a session; the server verifies it. */
  socialLogin: async (data: SocialLoginRequest): Promise<VerifyOtpResponse> => {
    const response = await apiClient.post<any>(AUTH_ENDPOINTS.SOCIAL_LOGIN, {
      provider: data.provider,
      id_token: data.idToken,
      nonce: data.nonce,
    });
    return toSession(response.data?.data || response.data);
  },

  /**
   * The Google Web client ID from the server's public app-config, or null
   * when Google sign-in is not set up there. A client ID is public by design
   * (it is in every Google sign-in page); no secret is involved.
   */
  getGoogleClientId: async (): Promise<string | null> => {
    const response = await apiClient.get<any>(AUTH_ENDPOINTS.APP_CONFIG);
    const data = response.data?.data || response.data;
    const id = data?.sign_in?.google_server_client_id;
    return typeof id === "string" && id.endsWith(".apps.googleusercontent.com")
      ? id
      : null;
  },

  updateProfile: async (
    data: UpdateProfileRequest,
  ): Promise<UpdateProfileResponse> => {
    const response = await apiClient.patch<any>(
      AUTH_ENDPOINTS.UPDATE_ME,
      data,
    );
    const resData = response.data?.data || response.data;
    const user = normalizeUserResponse(resData.user || resData);
    return {
      success: resData.success ?? true,
      user,
    };
  },

  refreshToken: async (
    data: RefreshTokenRequest,
  ): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post<any>(
      AUTH_ENDPOINTS.REFRESH_TOKEN,
      {
        refresh_token: data.refreshToken,
        refreshToken: data.refreshToken,
      },
    );
    const resData = response.data?.data || response.data;
    const tokens = response.data?.tokens || resData?.tokens || resData;
    return {
      accessToken:
        tokens?.accessToken ||
        tokens?.access_token ||
        resData?.accessToken ||
        resData?.access_token ||
        resData?.token ||
        "",
      refreshToken:
        tokens?.refreshToken ||
        tokens?.refresh_token ||
        resData?.refreshToken ||
        resData?.refresh_token,
    };
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post(AUTH_ENDPOINTS.LOGOUT);
    } catch {
      // ignore
    }
  },

  logoutAll: async (): Promise<void> => {
    try {
      await apiClient.post(AUTH_ENDPOINTS.LOGOUT_ALL);
    } catch {
      // ignore
    }
  },

  getMe: async (): Promise<{ success: boolean; user: User }> => {
    const response = await apiClient.get<any>(AUTH_ENDPOINTS.UPDATE_ME);
    const resData = response.data?.data || response.data;
    const user = normalizeUserResponse(resData.user || resData);
    return { success: true, user };
  },

  getSessions: async (): Promise<any[]> => {
    const response = await apiClient.get<any>(AUTH_ENDPOINTS.SESSIONS);
    const resData = response.data?.data || response.data;
    if (Array.isArray(resData?.sessions)) {
      return resData.sessions;
    }
    if (Array.isArray(resData)) {
      return resData;
    }
    return [];
  },

  deleteSession: async (sessionId: string): Promise<void> => {
    await apiClient.delete(AUTH_ENDPOINTS.DELETE_SESSION(sessionId));
  },

  logoutOthers: async (): Promise<void> => {
    try {
      await apiClient.post(AUTH_ENDPOINTS.LOGOUT_OTHERS);
    } catch {
      // ignore
    }
  },

  requestAccountDeletionOtp: async (): Promise<RequestOtpResponse> => {
    const response = await apiClient.post<any>(AUTH_ENDPOINTS.ACCOUNT_DELETION_REQUEST_OTP);
    const resData = response.data?.data || response.data;
    return {
      success: resData.success ?? true,
      message: resData.message || "OTP Requested for account deletion",
      expiresInSeconds: resData.expiresInSeconds || 180,
    };
  },

  confirmAccountDeletion: async (data: { code: string; reason?: string }): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<any>(AUTH_ENDPOINTS.ACCOUNT_DELETION_CONFIRM, data);
    const resData = response.data?.data || response.data;
    return {
      success: resData.success ?? true,
      message: resData.message || "Your account has been closed.",
    };
  },

  getSupportInfo: async (): Promise<{ supportPhone: string; supportEmail: string }> => {
    const response = await apiClient.get<any>(AUTH_ENDPOINTS.SUPPORT_INFO);
    const resData = response.data?.data || response.data;
    return {
      supportPhone: resData?.supportPhone || resData?.phone || "+94 11 234 5678",
      supportEmail: resData?.supportEmail || resData?.email || "support@sribees.com",
    };
  },
};
