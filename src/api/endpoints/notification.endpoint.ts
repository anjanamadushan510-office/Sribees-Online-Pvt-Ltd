export const NOTIFICATION_ENDPOINTS = {
  GET_NOTIFICATIONS: "/notifications",
  GET_UNREAD_COUNT: "/notifications/unread-count",
  MARK_READ: (id: string) => `/notifications/${encodeURIComponent(id)}/read`,
  MARK_ALL_READ: "/notifications/read-all",
  DELETE_NOTIFICATION: (id: string) =>
    `/notifications/${encodeURIComponent(id)}`,
  DELETE_ALL_NOTIFICATIONS: "/notifications",
  PREFERENCES: "/notifications/preferences",
};
