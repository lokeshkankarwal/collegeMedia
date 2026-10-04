import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FiArrowLeft } from "react-icons/fi";
import MainLayout from "../layouts/MainLayout";
import CommunityHeader from "../components/community/CommunityHeader";
import CommunityMembers from "../components/community/CommunityMembers";
import CreatePost from "../components/post/CreatePost";
import PostCard from "../components/post/PostCard";
import {
  getCommunity,
  getCommunityPosts,
  createCommunityPost,
  joinCommunity,
  leaveCommunity,
  deleteCommunity,
} from "../services/community.service";
import { toggleLike } from "../services/like.service";
import { deletePost } from "../services/post.service";
import { CardSkeleton, ConfirmDialog, EmptyState, PostSkeleton } from "../components/common/UI";
import type { Community } from "../types/community";
import type { Post } from "../types/post";

export default function CommunityPage() {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState(false);

  // Deletion state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const currentUserId = localStorage.getItem("userId") || "";

  const loadData = useCallback(async () => {
    if (!communityId) return;
    setLoading(true);
    try {
      const [communityData, postsData] = await Promise.all([
        getCommunity(communityId),
        getCommunityPosts(communityId),
      ]);
      setCommunity(communityData);
      setPosts(postsData || []);
    } catch {
      toast.error("Failed to load community details.");
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreatePost = async (content: string) => {
    if (!communityId) return;
    try {
      const newPost = await createCommunityPost(communityId, content);
      const safePost: Post = {
        ...newPost,
        author: newPost.author || {
          id: currentUserId,
          name: localStorage.getItem("userName") || "Me",
          avatarUrl: localStorage.getItem("userAvatar") || undefined,
        },
        likes: newPost.likes || [],
        likesCount: newPost.likesCount ?? 0,
        commentsCount: newPost.commentsCount ?? 0,
      };
      setPosts((prev) => [safePost, ...prev]);
      toast.success("Posted to community!");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Unable to create post.";
      toast.error(msg || "Failed to create post.");
      throw err;
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
      toast.error("Failed to like post");
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success("Post deleted");
    } catch {
      toast.error("Failed to delete post");
    }
  };

  const handleJoin = async () => {
    if (!communityId || !community) return;
    setJoinLoading(true);
    try {
      if (community.isJoined) {
        await leaveCommunity(communityId);
        toast.success(`Left ${community.name}`);
        setCommunity((prev) =>
          prev
            ? {
                ...prev,
                isJoined: false,
                membersCount: Math.max(0, (prev.membersCount || 1) - 1),
                members: (prev.members || []).filter((m) => m.id !== currentUserId),
              }
            : null
        );
      } else {
        await joinCommunity(communityId);
        toast.success(`Joined ${community.name}!`);
        await loadData();
      }
    } catch {
      toast.error("Failed to update membership");
    } finally {
      setJoinLoading(false);
    }
  };

  const handleDeleteCommunity = async () => {
    if (!communityId) return;
    setDeleteLoading(true);
    try {
      await deleteCommunity(communityId);
      toast.success("Community deleted successfully");
      navigate("/communities");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Failed to delete community.";
      toast.error(msg || "Failed to delete community");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading && !community) {
    return (
      <MainLayout>
        <div className="space-y-4">
          <CardSkeleton rows={3} />
          <PostSkeleton />
        </div>
      </MainLayout>
    );
  }

  if (!community) {
    return (
      <MainLayout>
        <EmptyState
          title="Community not found"
          description="The community you are looking for may have been removed or does not exist."
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-3">
        <button
          type="button"
          onClick={() => navigate("/communities")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition"
        >
          <FiArrowLeft /> Back to Communities
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 w-full min-w-0">
        {/* Left Section */}
        <div className="col-span-1 lg:col-span-3 min-w-0">
          <CommunityHeader
            community={community}
            onJoin={handleJoin}
            joinLoading={joinLoading}
            onDelete={community.isOwner ? () => setShowDeleteConfirm(true) : undefined}
          />

          {community.isJoined && <CreatePost onSubmit={handleCreatePost} />}

          <div className="mt-6">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Discussions</h2>

            {posts.length === 0 ? (
              <EmptyState
                title="No posts yet"
                description={
                  community.isJoined
                    ? "Start the conversation! Be the first to post in this community."
                    : "Join this community to start posting and participating in discussions."
                }
              />
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={currentUserId}
                  onLike={handleLike}
                  onDelete={handleDeletePost}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="min-w-0">
          <CommunityMembers members={community.members || []} />
        </div>
      </div>

      {/* Confirmation Dialog for Community Deletion */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete this community?"
        description={`Are you sure you want to delete "${community.name}"? This action cannot be undone and will permanently remove all community posts.`}
        confirmText="Delete Community"
        cancelText="Cancel"
        variant="danger"
        loading={deleteLoading}
        onConfirm={handleDeleteCommunity}
        onClose={() => setShowDeleteConfirm(false)}
      />
    </MainLayout>
  );
}
