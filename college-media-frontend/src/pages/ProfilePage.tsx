import {
  useEffect,
  useState,
} from "react";

import MainLayout from "../layouts/MainLayout";

import ProfileHeader from "../components/profile/ProfileHeader";

import EditProfileModal from "../components/profile/EditProfileModal";

import PostCard from "../components/post/PostCard";

import {
  getMe,
  updateProfile,
  getUserPosts,
} from "../services/user.service";

import {
  deletePost,
} from "../services/post.service";

import {
  toggleLike,
} from "../services/like.service";

export default function ProfilePage() {
  const [user, setUser] =
    useState<any>(null);

  const [posts, setPosts] =
    useState<any[]>([]);

  const [editing, setEditing] =
    useState(false);

  const currentUserId =
    localStorage.getItem("userId") || "";

  const loadProfile =
    async () => {
      try {
        const profile =
          await getMe();

        setUser(profile);

        const userPosts =
          await getUserPosts(
            profile.id
          );

        setPosts(userPosts);
      } catch (error) {
        console.error(error);
      }
    };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleDelete =
    async (postId: string) => {
      try {
        await deletePost(postId);

        setPosts((prev) =>
          prev.filter(
            (post) =>
              post.id !== postId
          )
        );
      } catch (error) {
        console.error(error);
      }
    };

  const handleLike =
    async (postId: string) => {
      try {
        const result =
          await toggleLike(postId);

        setPosts((prev) =>
          prev.map((post) => {
            if (
              post.id !== postId
            ) {
              return post;
            }

            const alreadyLiked =
              post.likes?.some(
                (like: any) =>
                  like.userId ===
                  currentUserId
              );

            return {
              ...post,

              likes: result.liked
                ? [
                    ...(post.likes ||
                      []),
                    {
                      userId:
                        currentUserId,
                    },
                  ]
                : (
                    post.likes || []
                  ).filter(
                    (like: any) =>
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

  if (!user) {
    return (
      <MainLayout>
        Loading...
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <ProfileHeader
        user={user}
        isMe={true}
        onEdit={() =>
          setEditing(true)
        }
        onFollow={() => {}}
      />

      {editing && (
        <EditProfileModal
          name={user.name}
          bio={user.bio}
          onSave={async (
            name,
            bio
          ) => {
            await updateProfile({
              name,
              bio,
            });

            setEditing(
              false
            );

            loadProfile();
          }}
        />
      )}

      {posts.map(
        (post: any) => (
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
        )
      )}
    </MainLayout>
  );
}