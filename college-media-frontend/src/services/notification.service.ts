import { api } from "./api";

export const getNotifications =
  async () => {

    const response =
      await api.get(
        "/notifications"
      );

    return response.data;
  };

export const markAllNotificationsRead =
  async () => {

    const response =
      await api.patch(
        "/notifications/read"
      );

    return response.data;
  };
export const markNotificationRead = async (id: string) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};
