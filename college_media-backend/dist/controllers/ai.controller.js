import prisma from "../lib/prisma.js";
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
        const { prompt, name, branch, year, posts: bodyPosts } = req.body;
        let userName = typeof name === "string" ? name.trim() : "";
        let userBranch = typeof branch === "string" ? branch.trim() : "";
        let userYear = year;
        let postContents = Array.isArray(bodyPosts)
            ? bodyPosts.filter((p) => typeof p === "string" && p.trim())
            : [];
        const userId = req.userId;
        if (userId) {
            try {
                const dbUser = await prisma.user.findUnique({
                    where: { id: userId },
                    select: {
                        name: true,
                        branch: true,
                        year: true,
                        posts: {
                            where: { communityId: null },
                            take: 8,
                            orderBy: { createdAt: "desc" },
                            select: { content: true },
                        },
                    },
                });
                if (dbUser) {
                    if (!userName && dbUser.name)
                        userName = dbUser.name;
                    if (!userBranch && dbUser.branch)
                        userBranch = dbUser.branch;
                    if (!userYear && dbUser.year)
                        userYear = dbUser.year;
                    if (postContents.length === 0 && dbUser.posts && dbUser.posts.length > 0) {
                        postContents = dbUser.posts
                            .map((p) => p.content?.trim())
                            .filter((c) => Boolean(c));
                    }
                }
            }
            catch (dbErr) {
                console.warn("Could not query user posts for bio generation:", dbErr);
            }
        }
        let postsContext = "";
        if (postContents.length > 0) {
            const formattedPosts = postContents
                .slice(0, 6)
                .map((p, idx) => `${idx + 1}. "${p}"`)
                .join("\n");
            postsContext = `Recent posts authored by this student on College Media:
${formattedPosts}

MANDATORY INSTRUCTION: Analyze the themes, projects, skills, vibe, and topics in these actual posts. Craft a bio that directly reflects their real interests, personality, and activities from their posts.`;
        }
        else {
            postsContext = `The student has not created any posts yet. Craft a welcoming bio highlighting their academic focus and campus interests.`;
        }
        const systemPrompt = `You are an expert AI bio writer for College Media, a campus social media network for university students.
Generate a concise, engaging, and authentic student profile bio (1-2 sentences, strictly under 150 characters total).

Student Details:
- Name: ${userName || "Student"}
- Branch/Major: ${userBranch || "College Member"}
- Academic Year: ${userYear ? `Year ${userYear}` : "Student"}
${prompt ? `- Custom keyword or topic: ${prompt}` : ""}

${postsContext}

Requirements:
- Written in a genuine, friendly first-person tone (e.g., "CS soph passionate about web dev & AI..." or "Building cool web apps, exploring campus cafes, and studying DS & Algo.").
- Strictly under 150 characters.
- Do NOT output quotation marks, hashtags, or introductory greetings. Return ONLY the final bio text.`;
        const result = await askGemini(systemPrompt);
        res.json({
            generatedBio: result.trim().replace(/^["']|["']$/g, ""),
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