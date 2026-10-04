import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import MainLayout from "../layouts/MainLayout";
import ProfileHeader from "../components/profile/ProfileHeader";
import PostCard from "../components/post/PostCard";
import { Button, EmptyState, PostSkeleton } from "../components/common/UI";
import { getUser, getUserPosts } from "../services/user.service";
import { followUser, unfollowUser } from "../services/follow.service";
import { createConversation } from "../services/conversation.service";
import { toggleLike } from "../services/like.service";
import { deletePost } from "../services/post.service";
import type { User } from "../types/user";
import type { Post } from "../types/post";
import { FiMessageCircle } from "react-icons/fi";

export default function OtherUserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagingLoading, setMessagingLoading] = useState(false);

  const currentUserId = localStorage.getItem("userId") || "";

  const loadProfile = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const profile = await getUser(userId);
      setUser(profile);
      const userPosts = await getUserPosts(userId);
      setPosts(userPosts);
    } catch {
      toast.error("Unable to load profile.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleFollow = async () => {
    if (!user) return;
    try {
      if (user.isFollowing) {
        await unfollowUser(user.id);
      } else {
        await followUser(user.id);
      }
      await loadProfile();
    } catch {
      toast.error("Unable to update follow status.");
    }
  };

  const handleMessage = async () => {
    if (!user) return;
    setMessagingLoading(true);
    try {
      const conversation = await createConversation(user.id);
      navigate(`/messages?conversation=${conversation.id}`);
    } catch {
      toast.error("Unable to start conversation.");
    } finally {
      setMessagingLoading(false);
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
            likesCount: result.liked
              ? post.likesCount + 1
              : Math.max(0, post.likesCount - 1),
          };
        })
      );
    } catch {
      toast.error("Unable to like post.");
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch {
      toast.error("Unable to delete post.");
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="mb-6 h-64 rounded-3xl skeleton" />
        {[1, 2].map((n) => <PostSkeleton key={n} />)}
      </MainLayout>
    );
  }

  if (!user) return <MainLayout><p className="text-slate-500">User not found.</p></MainLayout>;

  return (
    <MainLayout>
      <ProfileHeader user={user} isMe={false} onFollow={handleFollow} onEdit={() => {}} />

      <div className="mb-6">
        <Button
          variant="secondary"
          size="sm"
          loading={messagingLoading}
          onClick={handleMessage}
          className="gap-2"
        >
          <FiMessageCircle />
          Message
        </Button>
      </div>

      <h2 className="mb-4 text-lg font-bold text-slate-900">Posts</h2>

      {posts.length === 0 ? (
        <EmptyState title="No posts yet" description={`${user.name} hasn't shared anything yet.`} />
      ) : (
        posts.map((post) => (
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
