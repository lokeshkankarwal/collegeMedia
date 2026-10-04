import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import MainLayout from "../layouts/MainLayout";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "../services/notification.service";
import { Avatar, Button, CardSkeleton, EmptyState, PageHeader } from "../components/common/UI";
import { FiBell, FiCheck, FiCheckCircle, FiChevronRight } from "react-icons/fi";

interface NotificationItem {
  id: string;
  type: "LIKE" | "COMMENT" | "FOLLOW";
  isRead: boolean;
  createdAt: string;
  postId?: string;
  sender: { id: string; name: string; avatarUrl?: string };
  post?: { id: string; content?: string };
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

const typeDetails: Record<NotificationItem["type"], { text: string; icon: string }> = {
  LIKE: { text: "liked your post", icon: "❤️" },
  COMMENT: { text: "commented on your post", icon: "💬" },
  FOLLOW: { text: "started following you", icon: "👤" },
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data || []);
    } catch {
      toast.error("Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read.");
    } catch {
      toast.error("Unable to mark all as read.");
    }
  };

  const handleMarkOneRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      toast.success("Notification marked as read");
    } catch {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleNotificationClick = async (n: NotificationItem) => {
    if (!n.isRead) {
      try {
        await markNotificationRead(n.id);
        setNotifications((prev) =>
          prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
        );
      } catch {
        // silently proceed with navigation
      }
    }

    if (n.type === "FOLLOW") {
      navigate(`/profile/${n.sender.id}`);
    } else if (n.type === "LIKE") {
      const targetPostId = n.postId || n.post?.id;
      if (targetPostId) {
        navigate(`/?post=${targetPostId}`);
      } else {
        navigate("/");
      }
    } else if (n.type === "COMMENT") {
      const targetPostId = n.postId || n.post?.id;
      if (targetPostId) {
        navigate(`/?post=${targetPostId}&comments=true`);
      } else {
        navigate("/");
      }
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const filteredNotifications =
    filter === "unread" ? notifications.filter((n) => !n.isRead) : notifications;

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

      {/* Filter Tabs */}
      <div className="mb-4 flex gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
            filter === "all"
              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-100"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("unread")}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
            filter === "unread"
              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-100"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <CardSkeleton key={n} rows={1} />
          ))}
        </div>
      )}

      {!loading && filteredNotifications.length === 0 && (
        <EmptyState
          title={filter === "unread" ? "No unread notifications" : "You're all caught up!"}
          description={
            filter === "unread"
              ? "You have read all your notifications."
              : "No activity to show right now. Check back later."
          }
          icon={<FiBell />}
        />
      )}

      {!loading && filteredNotifications.length > 0 && (
        <div className="space-y-3">
          {filteredNotifications.map((n) => {
            const detail = typeDetails[n.type] || { text: "sent a notification", icon: "🔔" };
            return (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`group flex items-center justify-between gap-4 rounded-3xl border p-4 transition cursor-pointer hover:shadow-md hover:border-indigo-300 ${
                  n.isRead
                    ? "border-slate-200 bg-white"
                    : "border-indigo-200 bg-indigo-50/70"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="relative shrink-0">
                    <Avatar name={n.sender.name} src={n.sender.avatarUrl} size="md" />
                    <span className="absolute -bottom-1 -right-1 text-sm bg-white rounded-full p-0.5 shadow-sm">
                      {detail.icon}
                    </span>
                    {!n.isRead && (
                      <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-indigo-600 ring-2 ring-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800 break-words leading-relaxed">
                      <span className="font-semibold text-slate-900">{n.sender.name}</span>{" "}
                      {detail.text}
                    </p>
                    {n.post?.content && (
                      <p className="mt-1 text-xs text-slate-500 italic truncate max-w-md">
                        "{n.post.content}"
                      </p>
                    )}
                    <p className="mt-1 text-[11px] text-slate-400 font-medium">
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!n.isRead && (
                    <button
                      type="button"
                      title="Mark as read"
                      onClick={(e) => handleMarkOneRead(e, n.id)}
                      className="grid h-8 w-8 place-items-center rounded-xl text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 transition shrink-0"
                    >
                      <FiCheck className="text-sm" />
                    </button>
                  )}
                  <FiChevronRight className="text-slate-300 text-sm group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </MainLayout>
  );
}
