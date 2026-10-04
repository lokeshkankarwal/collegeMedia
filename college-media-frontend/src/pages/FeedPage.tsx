import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import MainLayout from "../layouts/MainLayout";
import CreatePost from "../components/post/CreatePost";
import PostCard from "../components/post/PostCard";
import { PostSkeleton, EmptyState, ErrorState, PageHeader } from "../components/common/UI";
import { uploadFile } from "../services/upload.service";
import { getFeedPosts, createPost, deletePost } from "../services/post.service";
import { toggleLike } from "../services/like.service";
import type { Post } from "../types/post";

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const currentUserId = localStorage.getItem("userId") || "";

  const doLoadPosts = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getFeedPosts();
      setPosts(data.posts || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { doLoadPosts(); }, []);

  const handleCreatePost = async (content: string, image?: File) => {
    try {
      let imageUrl = "";
      if (image) {
        const uploaded = await uploadFile(image);
        imageUrl = uploaded.imageUrl;
      }
      const newPost = await createPost(content, imageUrl);
      if (newPost?.id) {
        setPosts((prev) => [newPost, ...prev]);
      } else {
        await doLoadPosts();
      }
      toast.success("Post published!");
    } catch {
      toast.error("Unable to create post. Please try again.");
      throw new Error("Post failed");
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
              ? [...post.likes, { userId: currentUserId }]
              : post.likes.filter((l) => l.userId !== currentUserId),
            likesCount: result.liked ? post.likesCount + 1 : Math.max(0, post.likesCount - 1),
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
      toast.success("Post deleted.");
    } catch {
      toast.error("Unable to delete post.");
    }
  };

  return (
    <MainLayout>
      <PageHeader eyebrow="Your Campus" title="Feed" />
      <CreatePost onSubmit={handleCreatePost} />

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => <PostSkeleton key={n} />)}
        </div>
      )}

      {!loading && error && (
        <ErrorState
          message="Unable to load posts. Check your connection."
          onRetry={doLoadPosts}
        />
      )}

      {!loading && !error && posts.length === 0 && (
        <EmptyState
          title="Nothing here yet"
          description="Be the first to share something with your college."
        />
      )}

      {!loading && !error && posts.length > 0 && (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              onLike={handleLike}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </MainLayout>
  );
}
