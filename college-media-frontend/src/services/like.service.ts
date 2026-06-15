import { api } from "./api";

export const toggleLike =
async (
  postId: string
) => {
  const response =
    await api.post(
      `/likes/${postId}`
    );

  return response.data;
};
