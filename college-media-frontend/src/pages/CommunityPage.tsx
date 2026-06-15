import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import CommunityHeader from "../components/community/CommunityHeader";
import CommunityMembers from "../components/community/CommunityMembers";

import CreatePost from "../components/post/CreatePost";
import PostCard from "../components/post/PostCard";

import {
  getCommunity,
  getCommunityPosts,
  createCommunityPost,
} from "../services/community.service";

import type { Community } from "../types/community";
import type { Post } from "../types/post";

export default function CommunityPage() {
  const { communityId } = useParams();

  const [community, setCommunity] =
    useState<Community | null>(null);

  const [posts, setPosts] =
    useState<Post[]>([]);

  const currentUserId =
    localStorage.getItem("userId") || "";

  const loadData = async () => {
    try {
      if (!communityId) return;

      const communityData =
        await getCommunity(
          communityId
        );

      setCommunity(
        communityData
      );

      const postsData =
        await getCommunityPosts(
          communityId
        );

      setPosts(
        postsData
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadData();
  }, [communityId]);

  const handleCreatePost =
    async (
      content: string
    ) => {
      try {
        if (!communityId) return;

        await createCommunityPost(
          communityId,
          content
        );

        await loadData();
      } catch (error) {
        console.error(error);
      }
    };

  const handleLike =
    async (
      postId: string
    ) => {
      try {
        console.log(
          "Like Post:",
          postId
        );

        await loadData();
      } catch (error) {
        console.error(error);
      }
    };

  const handleDelete =
    async (
      postId: string
    ) => {
      try {
        console.log(
          "Delete Post:",
          postId
        );

        await loadData();
      } catch (error) {
        console.error(error);
      }
    };

  const handleJoin =
    async () => {
      try {
        console.log(
          "Join Community"
        );

        await loadData();
      } catch (error) {
        console.error(error);
      }
    };

  if (!community) {
    return (
      <MainLayout>
        <div className="p-6">
          Loading...
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Responsive grid: single column on mobile, sidebar on lg+ */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 w-full min-w-0">

        {/* Left Section */}

        <div className="col-span-1 lg:col-span-3 min-w-0">

          <CommunityHeader
            community={community}
            onJoin={handleJoin}
          />

          <CreatePost
            onSubmit={
              handleCreatePost
            }
          />

          <div className="mt-6">

            {posts.length === 0 ? (
              <div
                className="
                bg-white
                border
                rounded-xl
                p-6
                text-center
                text-gray-500
              "
              >
                No Posts Yet
              </div>
            ) : (
              posts.map(
                (post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={currentUserId}
                    onLike={
                      handleLike
                    }
                    onDelete={
                      handleDelete
                    }
                  />
                )
              )
            )}

          </div>

        </div>

        {/* Right Sidebar — stacks below posts on mobile/tablet */}

        <div className="min-w-0">

          <CommunityMembers
            members={
              (community as any)
                .members || []
            }
          />

        </div>

      </div>
    </MainLayout>
  );
}