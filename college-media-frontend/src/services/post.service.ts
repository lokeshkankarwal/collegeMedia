import { api } from "./api";

export const getFeedPosts =
async () => {
  const response =
    await api.get(
      "/feed"
    );

  return response.data;
};

export const createPost =
async (
  content: string,
  imageUrl?: string
) => {
  const response =
    await api.post(
      "/posts",
      {
        content,
        imageUrl,
      }
    );

  return response.data;
};

export const deletePost =
async (
  postId: string
) => {
  await api.delete(
    `/posts/${postId}`
  );
};