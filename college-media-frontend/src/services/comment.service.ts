import { api } from "./api";

// 🔄 Update GET: Point it to your actual backend structure
export const getComments = async (postId: string) => {
  const response = await api.get(`/posts/${postId}/comments`); // 👈 Fixed path string
  return response.data;
};

// 🔄 Update POST: Point it to your actual backend structure
export const addComment = async (postId: string, content: string) => {
  const response = await api.post(`/posts/${postId}/comments`, { content }); // 👈 Fixed path string
  return response.data;
};