import { askGemini } from "../services/gemini.service.js";
export const generatePost = async (req, res) => {
    try {
        const { prompt } = req.body;
        const userPrompt = prompt && typeof prompt === "string" && prompt.trim()
            ? `Topic/Idea: ${prompt.trim()}`
            : "Topic: An inspiring, relatable campus thought or academic milestone for college students";
        const result = await askGemini(`You are an AI assistant for a college social media app called College Media.
Generate an engaging, concise social media post (2-3 sentences max) based on:
${userPrompt}
Make it punchy, authentic, and engaging for students. Return only the post text without quotation marks or excessive hashtags.`);
        res.json({
            generatedPost: result.trim(),
        });
    }
    catch (error) {
        console.error("Generate post error:", error);
        res.status(500).json({
            message: "Failed to generate post with AI",
        });
    }
};
export const generateBio = async (req, res) => {
    try {
        const { prompt, name, branch, year } = req.body;
        const result = await askGemini(`You are an AI bio assistant for College Media.
Generate a concise, friendly, and authentic college student profile bio (1-2 sentences, under 140 characters total) for:
Name: ${name || "Student"}
Branch/Major: ${branch || "Engineering/Arts"}
Year: ${year ? `Year ${year}` : "College Student"}
Keywords/Interests: ${prompt || "Tech, campus projects, learning, and collaborating"}

Return only the final bio text without quotation marks or hashtags.`);
        res.json({
            generatedBio: result.trim(),
        });
    }
    catch (error) {
        console.error("Generate bio error:", error);
        res.status(500).json({
            message: "Failed to generate bio with AI",
        });
    }
};
//# sourceMappingURL=ai.controller.js.map