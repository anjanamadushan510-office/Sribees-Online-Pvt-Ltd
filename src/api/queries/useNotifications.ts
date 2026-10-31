import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "../services/notification.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useAuthStore } from "@/state/auth.store";
import {
  NotificationParams,
  NotificationPreferences,
  mapApiNotificationToNotification,
  Notification,
} from "@/interfaces/notification.interface";

export const useGetNotifications = (params?: NotificationParams) => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: [QUERY_KEYS.NOTIFICATIONS, params],
    queryFn: async () => {
      const response = await notificationService.getNotifications(params);
      const notifications: Notification[] = (response.notifications || []).map(
        mapApiNotificationToNotification
      );
      return {
        notifications,
        pagination: response.pagination,
      };
    },
    enabled: Boolean(isAuthenticated),
    staleTime: 1000 * 30, // 30 seconds
  });
};

export const useGetUnreadNotificationCount = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: [QUERY_KEYS.UNREAD_NOTIFICATION_COUNT],
    queryFn: () => notificationService.getUnreadCount(),
    enabled: Boolean(isAuthenticated),
    refetchInterval: isAuthenticated ? 1000 * 30 : false,
    staleTime: 1000 * 15,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATIONS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.UNREAD_NOTIFICATION_COUNT] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATIONS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.UNREAD_NOTIFICATION_COUNT] });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATIONS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.UNREAD_NOTIFICATION_COUNT] });
    },
  });
};

export const useDeleteAllNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.deleteAllNotifications(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATIONS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.UNREAD_NOTIFICATION_COUNT] });
    },
  });
};

export const useGetNotificationPreferences = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: [QUERY_KEYS.NOTIFICATION_PREFERENCES],
    queryFn: () => notificationService.getPreferences(),
    enabled: isAuthenticated,
  });
};

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (prefs: Partial<NotificationPreferences>) =>
      notificationService.updatePreferences(prefs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATION_PREFERENCES] });
    },
  });
};
