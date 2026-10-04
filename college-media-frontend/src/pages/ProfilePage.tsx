import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import MainLayout from "../layouts/MainLayout";
import ProfileHeader from "../components/profile/ProfileHeader";
import EditProfileModal from "../components/profile/EditProfileModal";
import PostCard from "../components/post/PostCard";
import { PostSkeleton, EmptyState, PageHeader } from "../components/common/UI";
import { getMe, updateProfile, getUserPosts } from "../services/user.service";
import { uploadFile } from "../services/upload.service";
import { deletePost } from "../services/post.service";
import { toggleLike } from "../services/like.service";
import type { Post } from "../types/post";
import type { User } from "../types/user";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const currentUserId = localStorage.getItem("userId") || "";

  const doLoad = async () => {
    setLoading(true);
    try {
      const profile = await getMe();
      setUser(profile);
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
        await updateProfile({ avatarUrl: res.imageUrl });
        setUser((prev) => (prev ? { ...prev, avatarUrl: res.imageUrl } : null));
        toast.success("Profile picture updated!");
      } else {
        toast.error("Failed to upload image");
      }
    } catch {
      toast.error("Failed to update profile picture");
    } finally {
      setAvatarUploading(false);
    }
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
          bio={user.bio}
          avatarUrl={user.avatarUrl}
          onSave={async (name, bio, avatarUrl) => {
            await updateProfile({ name, bio, avatarUrl });
            setEditing(false);
            doLoad();
            toast.success("Profile updated!");
          }}
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
    </MainLayout>
  );
}
