export type LanguageCode = "en" | "si" | "ta";

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  badge?: string;
  description: string;
}

export interface NotificationPreferences {
  offers: boolean;
  promotions: boolean;
  general: boolean;
  language?: string;
}

export interface ApiSessionItem {
  sessionId?: string;
  session_id?: string;
  id?: string;
  device?: string;
  deviceName?: string;
  device_name?: string;
  ipAddress?: string;
  ip_address?: string;
  userAgent?: string;
  user_agent?: string;
  createdAt?: string;
  created_at?: string;
  lastActive?: string;
  last_active?: string;
  isCurrent?: boolean;
  is_current?: boolean;
}

export interface UserSession {
  id: string;
  deviceName: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  isCurrentDevice: boolean;
  deviceType: "desktop" | "mobile" | "tablet";
}

export interface SupportInfo {
  supportPhone: string;
  supportEmail: string;
}

export interface AccountDeletionConfirmRequest {
  code: string;
  reason?: string;
}

