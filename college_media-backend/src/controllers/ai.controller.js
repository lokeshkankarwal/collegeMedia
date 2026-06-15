import { askGemini, } from "../services/gemini.service.js";
export const generatePost = async (req, res) => {
    try {
        const { prompt } = req.body;
        const result = await askGemini(`
Generate a social media post.

Input:
${prompt}
`);
        res.json({
            generatedPost: result,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to generate post",
        });
    }
};
//# sourceMappingURL=ai.controller.js.map