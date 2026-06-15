import {
  useState,
} from "react";

import MainLayout from "../layouts/MainLayout";

import {
  askAI,
} from "../services/ai.service";

interface Message {
  role:
    | "user"
    | "assistant";

  content: string;
}

export default function AIAssistantPage() {

  const [prompt,
    setPrompt] =
    useState("");

  const [loading,
    setLoading] =
    useState(false);

  const [messages,
    setMessages] =
    useState<Message[]>([]);

  const sendMessage =
    async () => {

      if (!prompt.trim())
        return;

      const userMessage = {
        role: "user" as const,
        content: prompt,
      };

      setMessages(
        (prev) => [
          ...prev,
          userMessage,
        ]
      );

      const currentPrompt =
        prompt;

      setPrompt("");

      try {

        setLoading(true);

        const response =
          await askAI(
            currentPrompt
          );

        setMessages(
          (prev) => [
            ...prev,
            {
              role:
                "assistant",
              content:
                response.answer,
            },
          ]
        );

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

  return (
    <MainLayout>

      <div
        className="
        max-w-5xl
        mx-auto
        h-[80vh]
        flex
        flex-col
      "
      >

        <div
          className="
          mb-6
        "
        >
          <h1
            className="
            text-3xl
            font-bold
          "
          >
            AI Assistant
          </h1>

          <p
            className="
            text-gray-500
            mt-2
          "
          >
            Powered by Gemini
          </p>
        </div>

        {/* Quick Actions */}

        <div
          className="
          grid
          grid-cols-4
          gap-3
          mb-6
        "
        >
          <button
            onClick={() =>
              setPrompt(
                "Generate a LinkedIn post about web development."
              )
            }
            className="
            border
            rounded-lg
            p-3
          "
          >
            Generate Post
          </button>

          <button
            onClick={() =>
              setPrompt(
                "Give me React interview questions."
              )
            }
            className="
            border
            rounded-lg
            p-3
          "
          >
            Interview Prep
          </button>

          <button
            onClick={() =>
              setPrompt(
                "Review my resume."
              )
            }
            className="
            border
            rounded-lg
            p-3
          "
          >
            Resume Review
          </button>

          <button
            onClick={() =>
              setPrompt(
                "Help me solve DSA problems."
              )
            }
            className="
            border
            rounded-lg
            p-3
          "
          >
            DSA Help
          </button>
        </div>

        {/* Chat */}

        <div
          className="
          flex-1
          overflow-y-auto
          border
          rounded-xl
          bg-white
          p-4
          space-y-4
        "
        >

          {messages.map(
            (
              message,
              index
            ) => (

              <div
                key={index}
                className={`
                flex

                ${
                  message.role ===
                  "user"
                    ? "justify-end"
                    : "justify-start"
                }
              `}
              >
                <div
                  className={`
                  max-w-2xl
                  p-4
                  rounded-xl

                  ${
                    message.role ===
                    "user"
                      ? "bg-black text-white"
                      : "bg-gray-100"
                  }
                `}
                >
                  {
                    message.content
                  }
                </div>
              </div>

            )
          )}

          {loading && (
            <div>
              AI Thinking...
            </div>
          )}

        </div>

        {/* Input */}

        <div
          className="
          mt-4
          flex
          gap-3
        "
        >
          <input
            value={prompt}
            onChange={(e) =>
              setPrompt(
                e.target.value
              )
            }
            placeholder="Ask AI..."
            className="
            flex-1
            border
            rounded-lg
            p-4
          "
          />

          <button
            onClick={
              sendMessage
            }
            className="
            bg-black
            text-white
            px-8
            rounded-lg
          "
          >
            Send
          </button>
        </div>

      </div>

    </MainLayout>
  );
}