import { api } from "./api";

export const getCommunities =
async () => {
  const response =
    await api.get(
      "/communities"
    );

  return response.data;
};

export const createCommunity =
async (
  name: string,
  description: string
) => {
  const response =
    await api.post(
      "/communities",
      {
        name,
        description,
      }
    );

  return response.data;
};

export const joinCommunity =
async (
  communityId: string
) => {

  await api.post(
    `/communities/${communityId}/join`
  );
};

export const leaveCommunity =
async (
  communityId: string
) => {

  await api.delete(
    `/communities/${communityId}/join`
  );
};

export const getCommunityPosts =
async (
  communityId: string
) => {

  const response =
    await api.get(
      `/communities/${communityId}/posts`
    );

  return response.data;
};

export const createCommunityPost =
async (
  communityId: string,
  content: string
) => {

  const response =
    await api.post(
      `/communities/${communityId}/posts`,
      {
        content,
      }
    );

  return response.data;
};

export const getCommunity =
async (
  communityId: string
) => {

  const response =
    await api.get(
      `/communities/${communityId}`
    );

  return response.data;
};