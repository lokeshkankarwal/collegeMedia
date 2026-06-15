import { api } from "./api";

export const followUser =
async (
  userId: string
) => {

  await api.post(
    `/follows/${userId}`
  );
};

export const unfollowUser =
async (
  userId: string
) => {

  await api.delete(
    `/follows/${userId}`
  );
};