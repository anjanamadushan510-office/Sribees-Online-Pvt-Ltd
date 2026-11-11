export interface User {
  userId: string;
  email: string | null;
  fullName: string;
  phone: string;
  nic?: string | null;
  alternatePhone?: string | null;
  profilePictureUrl?: string | null;
  isVerified: boolean;
  isPhoneVerified: boolean;
  twoFactorEnabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
  missingProfileFields?: ProfileField[];
}

export type ProfileField = "full_name" | "nic" | "email";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RequestOtpRequest {
  phone: string;
}

export interface RequestOtpResponse {
  success: boolean;
  message: string;
  expiresInSeconds: number;
}

export interface VerifyOtpRequest {
  phone: string;
  code: string;
}

export interface SocialLoginRequest {
  provider: "google";
  /** The ID token Google handed the browser; verified by the server. */
  idToken: string;
  /** The raw nonce whose SHA-256 went into the sign-in request. */
  nonce: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  user: User;
  tokens: AuthTokens;
}

export interface UpdateProfileRequest {
  full_name?: string;
  email?: string;
  nic?: string;
  alternate_phone?: string;
  profile_picture_url?: string | null;
}

export interface UpdateProfileResponse {
  success: boolean;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
}
