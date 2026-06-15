import {
  useEffect,
  useState,
} from "react";

import MainLayout from "../layouts/MainLayout";

import {
  getNotifications,
  markAllNotificationsRead,
} from "../services/notification.service";

interface Notification {
  id: string;

  type:
    | "LIKE"
    | "COMMENT"
    | "FOLLOW"
    | "COMMUNITY_INVITE"
    | "GROUP_INVITE";

  isRead: boolean;

  createdAt: string;

  sender: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

export default function NotificationsPage() {
  const [
    notifications,
    setNotifications,
  ] = useState<
    Notification[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const loadNotifications =
    async () => {
      try {
        const data =
          await getNotifications();

        setNotifications(
          data
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAllRead =
    async () => {
      try {
        await markAllNotificationsRead();

        setNotifications(
          (prev) =>
            prev.map(
              (
                notification
              ) => ({
                ...notification,
                isRead: true,
              })
            )
        );
      } catch (error) {
        console.error(error);
      }
    };

  const getMessage = (
    notification: Notification
  ) => {
    switch (
      notification.type
    ) {
      case "LIKE":
        return `${notification.sender.name} liked your post ❤️`;

      case "COMMENT":
        return `${notification.sender.name} commented on your post 💬`;

      case "FOLLOW":
        return `${notification.sender.name} started following you 👤`;

      case "COMMUNITY_INVITE":
        return `${notification.sender.name} invited you to a community 🏘️`;

      case "GROUP_INVITE":
        return `${notification.sender.name} added you to a group 👥`;

      default:
        return "New notification";
    }
  };

  return (
    <MainLayout>
      <div className="w-full max-w-4xl mx-auto min-w-0">
        <div
          className="
            flex
            flex-col
            sm:flex-row
            justify-between
            items-start
            sm:items-center
            gap-3
            sm:gap-0
            mb-6
          "
        >
          <h1
            className="
              text-2xl
              sm:text-3xl
              font-bold
            "
          >
            Notifications
          </h1>

          <button
            onClick={
              markAllRead
            }
            className="
              bg-black
              text-white
              px-4
              py-2
              rounded-lg
              hover:opacity-90
              w-full
              sm:w-auto
              shrink-0
            "
          >
            Mark All Read
          </button>
        </div>

        {loading && (
          <p>
            Loading...
          </p>
        )}

        {!loading &&
          notifications.length ===
            0 && (
            <div
              className="
                text-center
                text-gray-500
                mt-10
              "
            >
              No Notifications
            </div>
          )}

        <div className="space-y-3">
          {notifications.map(
            (
              notification
            ) => (
              <div
                key={
                  notification.id
                }
                className={`
                  border
                  rounded-xl
                  p-4
                  shadow-sm
                  transition

                  ${
                    notification.isRead
                      ? "bg-white"
                      : "bg-blue-50 border-blue-200"
                  }
                `}
              >
                <div
                  className="
                    flex
                    items-start
                    sm:items-center
                    gap-3
                    sm:gap-4
                    min-w-0
                  "
                >
                  <img
                    src={
                      notification
                        .sender
                        .avatarUrl ||
                      `https://ui-avatars.com/api/?name=${notification.sender.name}`
                    }
                    alt={
                      notification
                        .sender.name
                    }
                    className="
                      w-10
                      h-10
                      sm:w-12
                      sm:h-12
                      rounded-full
                      object-cover
                      shrink-0
                    "
                  />

                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-medium break-words">
                      {getMessage(
                        notification
                      )}
                    </p>

                    <p
                      className="
                        text-sm
                        text-gray-500
                        mt-1
                      "
                    >
                      {new Date(
                        notification.createdAt
                      ).toLocaleString()}
                    </p>
                  </div>

                  {!notification.isRead && (
                    <div
                      className="
                        w-3
                        h-3
                        rounded-full
                        bg-blue-500
                      "
                    />
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </MainLayout>
  );
}