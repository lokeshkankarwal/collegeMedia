import { api } from "./api";

export const forgotPassword = async (email: string) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

export const resetPassword = async (token: string, password: string) => {
  const response = await api.post("/auth/reset-password", { token, password });
  return response.data;
};
