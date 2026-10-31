import { apiClient } from "@/utils/apiClient";
import { NOTIFICATION_ENDPOINTS } from "../endpoints/notification.endpoint";
import {
  ApiNotification,
  GetNotificationsResponse,
  GetUnreadCountResponse,
  NotificationPreferences,
  NotificationParams,
} from "@/interfaces/notification.interface";

export const notificationService = {
  getNotifications: async (params?: NotificationParams): Promise<GetNotificationsResponse> => {
    const response = await apiClient.get<
      { data: GetNotificationsResponse | { notifications: ApiNotification[] } } | GetNotificationsResponse
    >(NOTIFICATION_ENDPOINTS.GET_NOTIFICATIONS, { params });

    const rawData = response.data;
    if (rawData && "data" in rawData && rawData.data) {
      const dataObj = rawData.data;
      if ("notifications" in dataObj) {
        return dataObj as GetNotificationsResponse;
      }
    }
    if (rawData && "notifications" in rawData) {
      return rawData as GetNotificationsResponse;
    }
    return { notifications: Array.isArray(rawData) ? rawData : [] };
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<
      { data: GetUnreadCountResponse } | GetUnreadCountResponse | { unread_count: number }
    >(NOTIFICATION_ENDPOINTS.GET_UNREAD_COUNT);

    const data = response.data;
    if (data && "data" in data && data.data && typeof data.data.unread_count === "number") {
      return data.data.unread_count;
    }
    if (data && "unread_count" in data && typeof data.unread_count === "number") {
      return data.unread_count;
    }
    return 0;
  },

  markAsRead: async (id: string): Promise<void> => {
    await apiClient.patch(NOTIFICATION_ENDPOINTS.MARK_READ(id));
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.put(NOTIFICATION_ENDPOINTS.MARK_ALL_READ);
  },

  deleteNotification: async (id: string): Promise<void> => {
    await apiClient.delete(NOTIFICATION_ENDPOINTS.DELETE_NOTIFICATION(id));
  },

  deleteAllNotifications: async (): Promise<void> => {
    await apiClient.delete(NOTIFICATION_ENDPOINTS.DELETE_ALL_NOTIFICATIONS);
  },

  getPreferences: async (): Promise<NotificationPreferences> => {
    const response = await apiClient.get<{ data: NotificationPreferences } | NotificationPreferences>(
      NOTIFICATION_ENDPOINTS.PREFERENCES
    );
    const data = response.data;
    if (data && "data" in data && data.data) {
      return data.data;
    }
    return data as NotificationPreferences;
  },

  updatePreferences: async (preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> => {
    const response = await apiClient.put<{ data: NotificationPreferences } | NotificationPreferences>(
      NOTIFICATION_ENDPOINTS.PREFERENCES,
      preferences
    );
    const data = response.data;
    if (data && "data" in data && data.data) {
      return data.data;
    }
    return data as NotificationPreferences;
  },
};
