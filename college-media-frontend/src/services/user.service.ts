import { api } from "./api";

export const getMe =
async () => {

  const response =
    await api.get(
      "/users/me"
    );

  return response.data;
};

export const getUser =
async (
  userId: string
) => {

  const response =
    await api.get(
      `/users/${userId}`
    );

  return response.data;
};

export const updateProfile =
async (
  data: {
    name: string;
    bio: string;
    avatarUrl?: string;
  }
) => {

  const response =
    await api.put(
      "/users/me",
      data
    );

  return response.data;
};

export const getUserPosts =
async (
  userId: string
) => {

  const response =
    await api.get(
      `/users/${userId}/posts`
    );

  return response.data;
};