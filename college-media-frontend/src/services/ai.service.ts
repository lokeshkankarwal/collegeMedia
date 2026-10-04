import { api } from "./api";

export const generatePostAI = async (prompt?: string): Promise<string> => {
  const response = await api.post("/ai/generate-post", { prompt });
  return response.data?.generatedPost || "";
};

export const generateBioAI = async (params: {
  prompt?: string;
  name?: string;
  branch?: string;
  year?: number;
  posts?: string[];
}): Promise<string> => {
  const response = await api.post("/ai/generate-bio", params);
  return response.data?.generatedBio || "";
};