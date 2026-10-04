import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import MainLayout from "../layouts/MainLayout";
import { getNotifications, markAllNotificationsRead } from "../services/notification.service";
import { Avatar, Button, CardSkeleton, EmptyState, PageHeader } from "../components/common/UI";
import { FiBell, FiCheckCircle } from "react-icons/fi";

interface Notification {
  id: string;
  type: "LIKE" | "COMMENT" | "FOLLOW" | "COMMUNITY_INVITE" | "GROUP_INVITE";
  isRead: boolean;
  createdAt: string;
  sender: { id: string; name: string; avatarUrl?: string };
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const typeLabel: Record<Notification["type"], string> = {
  LIKE: "liked your post ❤️",
  COMMENT: "commented on your post 💬",
  FOLLOW: "started following you 👤",
  COMMUNITY_INVITE: "invited you to a community 🏘️",
  GROUP_INVITE: "added you to a group 👥",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch {
      toast.error("Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  const markAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read.");
    } catch {
      toast.error("Unable to mark as read.");
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <MainLayout>
      <PageHeader
        eyebrow="Activity"
        title={`Notifications${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
        action={
          unreadCount > 0 ? (
            <Button variant="secondary" size="sm" onClick={markAllRead}>
              <FiCheckCircle />
              Mark all read
            </Button>
          ) : undefined
        }
      />

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => <CardSkeleton key={n} rows={1} />)}
        </div>
      )}

      {!loading && notifications.length === 0 && (
        <EmptyState
          title="You're all caught up!"
          description="No new notifications. Check back later."
          icon={<FiBell />}
        />
      )}

      {!loading && notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-center gap-4 rounded-3xl border p-4 transition ${
                n.isRead
                  ? "border-slate-200 bg-white"
                  : "border-indigo-200 bg-indigo-50"
              }`}
            >
              <div className="relative shrink-0">
                <Avatar name={n.sender.name} src={n.sender.avatarUrl} size="md" />
                {!n.isRead && (
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-indigo-600 ring-2 ring-white" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-800 break-words">
                  <span className="font-semibold">{n.sender.name}</span>{" "}
                  {typeLabel[n.type] ?? "sent a notification"}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">{timeAgo(n.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </MainLayout>
  );
}
