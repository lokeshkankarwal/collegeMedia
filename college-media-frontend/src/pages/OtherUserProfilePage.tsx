import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import { useNavigate } from "react-router-dom";

import { createConversation } from "../services/conversation.service";
import MainLayout from "../layouts/MainLayout";

import ProfileHeader from "../components/profile/ProfileHeader";

import PostCard from "../components/post/PostCard";

import { getUser, getUserPosts } from "../services/user.service";

import { followUser, unfollowUser } from "../services/follow.service";

import type { User } from "../types/user";

import type { Post } from "../types/post";

export default function OtherUserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  const [posts, setPosts] = useState<Post[]>([]);

  const loadProfile = async () => {
    try {
      if (!userId) return;

      const profile = await getUser(userId);

      setUser(profile);

      const userPosts = await getUserPosts(userId);

      setPosts(userPosts);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const handleFollow = async () => {
    try {
      if (!user) return;

      if (user.isFollowing) {
        await unfollowUser(user.id);
      } else {
        await followUser(user.id);
      }

      await loadProfile();
    } catch (error) {
      console.error(error);
    }
  };

  const handleLike = async (postId: string) => {
    console.log("Like", postId);
  };

  const handleDelete = async (postId: string) => {
    console.log("Delete", postId);
  };
  const handleMessage = async () => {
    if (!user) return;

    try {
      const conversation = await createConversation(user.id);
        console.log("Created conversation", conversation);
      navigate(`/messages?conversation=${conversation.id}`);
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) {
    return (
      <MainLayout>
        <div>Loading...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <ProfileHeader
        user={user}
        isMe={false}
        onFollow={handleFollow}
        onEdit={() => {}}
      />
      <button
        onClick={handleMessage}
        className="
            bg-black
            text-white
            px-4
            py-2
            rounded-lg
            w-full
            sm:w-auto
            min-h-[44px]
        "
      >
        Message
      </button>

      <div className="mt-6">
        {posts.length === 0 ? (
          <div
            className="
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
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </MainLayout>
  );
}
