import { useEffect, useState } from "react";

import MainLayout from "../layouts/MainLayout";

import CreatePost from "../components/post/CreatePost";
import PostCard from "../components/post/PostCard";
import { uploadFile } from "../services/upload.service";

import {
  getFeedPosts,
  createPost,
  deletePost,
} from "../services/post.service";

import { toggleLike } from "../services/like.service";

import type { Post } from "../types/post";

export default function FeedPage() {
  const [posts, setPosts] =
    useState<Post[]>([]);

  const [loading, setLoading] =
    useState(true);

  const currentUserId =
    localStorage.getItem("userId") || "";

  const loadPosts = async () => {
    try {
      const data =
        await getFeedPosts();

      setPosts(
        data.posts || []
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleCreatePost =
  async (
    content: string,
    image?: File
  ) => {
    try {
      let imageUrl = "";

      if (image) {
        const uploaded =
          await uploadFile(image);

        imageUrl =
          uploaded.imageUrl;
      }

      await createPost(
        content,
        imageUrl
      );
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  const handleLike =
    async (
      postId: string
    ) => {
      try {
        const result =
          await toggleLike(
            postId
          );

        setPosts((prev) =>
          prev.map((post) => {
            if (
              post.id !== postId
            )
              return post;

            return {
              ...post,

              likes: result.liked
                ? [
                    ...post.likes,
                    {
                      userId:
                        currentUserId,
                    },
                  ]
                : post.likes.filter(
                    (
                      like
                    ) =>
                      like.userId !==
                      currentUserId
                  ),

              likesCount:
                result.liked
                  ? post.likesCount +
                    1
                  : Math.max(
                      0,
                      post.likesCount -
                        1
                    ),
            };
          })
        );
      } catch (error) {
        console.error(error);
      }
    };

  const handleDelete =
    async (
      postId: string
    ) => {
      try {
        await deletePost(
          postId
        );

        setPosts((prev) =>
          prev.filter(
            (post) =>
              post.id !==
              postId
          )
        );
      } catch (error) {
        console.error(error);
      }
    };

  return (
    <MainLayout>
      <h1
        className="
        text-3xl
        font-bold
        mb-6
      "
      >
        Feed
      </h1>

      <CreatePost
        onSubmit={
          handleCreatePost
        }
      />

      {loading ? (
        <p>
          Loading posts...
        </p>
      ) : posts.length ===
        0 ? (
        <p>
          No posts found
        </p>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={
              currentUserId
            }
            onLike={
              handleLike
            }
            onDelete={
              handleDelete
            }
          />
        ))
      )}
    </MainLayout>
  );
}