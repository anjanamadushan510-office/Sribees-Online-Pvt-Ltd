import { formatRelativeTime } from "@/utils/formatDate";

export type NotificationType = 'all' | 'order' | 'promo' | 'delivery' | 'system';

export interface ApiNotification {
  notification_id?: string;
  id?: string;
  type: string;
  title: string;
  message: string;
  reference_type?: string | null;
  reference_id?: string | null;
  data?: {
    actionUrl?: string;
    actionLabel?: string;
    promoCode?: string;
    discountBadge?: string;
    orderId?: string;
    [key: string]: any;
  } | null;
  is_read?: boolean;
  read?: boolean;
  read_at?: string | null;
  created_at?: string;
  timestamp?: string;
}

export interface Notification {
  id: string;
  type: 'order' | 'promo' | 'delivery' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  promoCode?: string;
  discountBadge?: string;
  orderId?: string;
  referenceType?: string;
  referenceId?: string;
}

export interface NotificationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
}

export interface GetNotificationsResponse {
  notifications: ApiNotification[];
  pagination?: NotificationPagination;
}

export interface GetUnreadCountResponse {
  unread_count: number;
}

export interface NotificationPreferences {
  offers: boolean;
  promotions: boolean;
  general: boolean;
  language: string;
}

export interface NotificationParams {
  page?: number;
  limit?: number;
  unread_only?: boolean;
}

export function mapApiNotificationToNotification(apiNotif: ApiNotification): Notification {
  const rawType = (apiNotif.type || '').toLowerCase();
  const refType = (apiNotif.reference_type || '').toLowerCase();

  let mappedType: Notification['type'] = 'system';
  if (rawType.includes('order') || refType === 'order') {
    mappedType = 'order';
  } else if (rawType.includes('promo') || rawType.includes('offer')) {
    mappedType = 'promo';
  } else if (rawType.includes('delivery') || rawType.includes('dispatch')) {
    mappedType = 'delivery';
  }

  const id = apiNotif.notification_id || apiNotif.id || `notif-${Math.random()}`;
  const isRead = apiNotif.is_read ?? apiNotif.read ?? false;
  const createdAt = apiNotif.created_at || apiNotif.timestamp || '';

  return {
    id,
    type: mappedType,
    title: apiNotif.title || 'Notification',
    message: apiNotif.message || '',
    timestamp: createdAt ? formatRelativeTime(createdAt) : 'Just now',
    read: isRead,
    actionUrl: apiNotif.data?.actionUrl,
    actionLabel: apiNotif.data?.actionLabel,
    promoCode: apiNotif.data?.promoCode,
    discountBadge: apiNotif.data?.discountBadge,
    orderId: apiNotif.data?.orderId || (refType === 'order' ? apiNotif.reference_id || undefined : undefined),
    referenceType: apiNotif.reference_type || undefined,
    referenceId: apiNotif.reference_id || undefined,
  };
}
