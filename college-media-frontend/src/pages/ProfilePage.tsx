import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiLogOut } from "react-icons/fi";
import MainLayout from "../layouts/MainLayout";
import ProfileHeader from "../components/profile/ProfileHeader";
import EditProfileModal, { type ProfileUpdateData } from "../components/profile/EditProfileModal";
import PostCard from "../components/post/PostCard";
import { PostSkeleton, EmptyState, PageHeader, Button } from "../components/common/UI";
import { getMe, updateProfile, getUserPosts } from "../services/user.service";
import { uploadFile } from "../services/upload.service";
import { deletePost } from "../services/post.service";
import { toggleLike } from "../services/like.service";
import { useAuthStore } from "../store/authStore";
import type { Post } from "../types/post";
import type { User } from "../types/user";

export default function ProfilePage() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const currentUserId = localStorage.getItem("userId") || "";

  const syncUpdatedUser = (updated: User) => {
    setUser((prev) => (prev ? { ...prev, ...updated } : updated));
    if (updated.avatarUrl !== undefined) {
      localStorage.setItem("userAvatar", updated.avatarUrl || "");
    }
    if (updated.name) {
      localStorage.setItem("userName", updated.name);
    }
    window.dispatchEvent(
      new CustomEvent("profile-updated", {
        detail: {
          name: updated.name,
          avatarUrl: updated.avatarUrl,
        },
      })
    );
    // Update avatar and name on posts belonging to current user
    setPosts((prev) =>
      prev.map((p) =>
        p.author.id === updated.id
          ? {
              ...p,
              author: {
                ...p.author,
                name: updated.name,
                avatarUrl: updated.avatarUrl,
              },
            }
          : p
      )
    );
  };

  const doLoad = async () => {
    setLoading(true);
    try {
      const profile = await getMe();
      setUser(profile);
      if (profile?.avatarUrl !== undefined) {
        localStorage.setItem("userAvatar", profile.avatarUrl || "");
      }
      if (profile?.name) {
        localStorage.setItem("userName", profile.name);
      }
      const userPosts = await getUserPosts(profile.id);
      setPosts(userPosts || []);
    } catch {
      toast.error("Unable to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    doLoad();
  }, []);

  const handleDirectAvatarUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WEBP)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file size must be under 10MB");
      return;
    }
    setAvatarUploading(true);
    try {
      const res = await uploadFile(file);
      if (res?.imageUrl) {
        const updated = await updateProfile({ avatarUrl: res.imageUrl });
        syncUpdatedUser(updated);
        toast.success("Profile picture updated!");
      } else {
        toast.error("Failed to upload image");
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Failed to update profile picture";
      toast.error(msg || "Failed to update profile picture");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleProfileSave = async (updates: ProfileUpdateData) => {
    const updated = await updateProfile(updates);
    syncUpdatedUser(updated);
    setEditing(false);
    toast.success("Profile updated successfully!");
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
    toast.success("Logged out successfully");
  };

  const handleDelete = async (postId: string) => {
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success("Post deleted.");
    } catch {
      toast.error("Unable to delete post.");
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const result = await toggleLike(postId);
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post;
          return {
            ...post,
            likes: result.liked
              ? [...(post.likes || []), { userId: currentUserId }]
              : (post.likes || []).filter((l) => l.userId !== currentUserId),
            likesCount: result.liked ? post.likesCount + 1 : Math.max(0, post.likesCount - 1),
          };
        })
      );
    } catch {
      toast.error("Unable to like post.");
    }
  };

  if (loading && !user) {
    return (
      <MainLayout>
        <div className="mb-6 h-64 rounded-3xl skeleton" />
        {[1, 2].map((n) => (
          <PostSkeleton key={n} />
        ))}
      </MainLayout>
    );
  }

  if (!user) return <MainLayout><p>Unable to load profile.</p></MainLayout>;

  return (
    <MainLayout>
      <PageHeader eyebrow="Your account" title="Profile" />
      <ProfileHeader
        user={user}
        isMe={true}
        onEdit={() => setEditing(true)}
        onFollow={() => {}}
        onAvatarUpload={handleDirectAvatarUpload}
        avatarUploading={avatarUploading}
      />

      {editing && (
        <EditProfileModal
          name={user.name}
          bio={user.bio || ""}
          avatarUrl={user.avatarUrl || undefined}
          branch={user.branch || undefined}
          year={user.year || undefined}
          userPosts={posts.map((p) => p.content).filter(Boolean)}
          onSave={handleProfileSave}
          onClose={() => setEditing(false)}
        />
      )}

      <h2 className="mb-4 text-lg font-bold text-slate-900">Posts</h2>

      {posts.length === 0 ? (
        <EmptyState title="No posts yet" description="Share something with your campus!" />
      ) : (
        posts.map((post: Post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={currentUserId}
            onLike={handleLike}
            onDelete={handleDelete}
          />
        ))
      )}

      {/* Account & Settings: Accessible Logout on Mobile & Desktop */}
      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Account & Security</h3>
        <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-slate-800">{user.email}</p>
            <p className="text-xs text-slate-500">
              Signed in as {user.name} ({user.branch || "Campus Member"}{user.year ? ` • Year ${user.year}` : ""})
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-semibold"
          >
            <FiLogOut className="text-base" />
            Log Out
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
