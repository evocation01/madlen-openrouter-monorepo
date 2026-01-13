import { MessageRole, prisma } from "@repo/database";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config"; // Ensure this is first
import express, { type Express, type Response } from "express";
import morgan from "morgan";
import { initTelemetry } from "./instrumentation";
import { authMiddleware } from "./middleware/auth";
import { openRouterService } from "./services/openrouter";

// Initialize OpenTelemetry before everything else
initTelemetry();

console.log("API Starting...");
// Check DB URL securely (hide password)
const dbUrl = process.env.DATABASE_URL;
console.log("DATABASE_URL status:", dbUrl ? "Loaded" : "Missing");

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(
    cors({
        origin: "http://localhost:3001",
        credentials: true, // Allow cookies
    })
);
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "api" });
});

// Models Endpoint
app.get("/models", authMiddleware, async (req, res) => {
    try {
        const models = await openRouterService.getModels();
        res.json(models);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch models" });
    }
});

// Chat Endpoint
app.post("/chat", authMiddleware, async (req: any, res: Response) => {
    const { messages, model, conversationId } = req.body;
    const user = req.user;

    if (!messages || !model || !Array.isArray(messages)) {
        res.status(400).json({ error: "Missing or invalid messages or model" });
        return;
    }

    try {
        // 1. Create or Update Conversation
        let conversation;
        if (conversationId) {
            conversation = await prisma.conversation.findUnique({
                where: { id: conversationId },
            });
            if (!conversation || conversation.userId !== user.id) {
                res.status(404).json({ error: "Conversation not found" });
                return;
            }
        } else {
            const firstMessage = messages[0];
            const titleContent =
                typeof firstMessage?.content === "string"
                    ? firstMessage.content
                    : Array.isArray(firstMessage?.content)
                    ? firstMessage.content.find((c: any) => c.type === "text")
                          ?.text || "New Chat"
                    : "New Chat";

            conversation = await prisma.conversation.create({
                data: {
                    userId: user.id,
                    title: titleContent.slice(0, 50),
                },
            });
        }

        // 2. Save User Message
        const lastMessage = messages[messages.length - 1];
        await prisma.message.create({
            data: {
                conversationId: conversation.id,
                role: MessageRole.user,
                content: lastMessage.content as any,
            },
        });

        // 3. Call OpenRouter
        const completion = await openRouterService.chat(messages, model);
        const assistantMessage = completion.choices[0]?.message;

        // Check for refusal or empty content
        let assistantMessageContent = assistantMessage?.content || "";
        if (!assistantMessageContent && assistantMessage?.refusal) {
            assistantMessageContent = `[Refusal]: ${assistantMessage.refusal}`;
        }

        if (!assistantMessageContent.trim()) {
            console.warn("OpenRouter returned empty content for model:", model);
            assistantMessageContent = "[No response from model]";
        }

        // 4. Save Assistant Message
        await prisma.message.create({
            data: {
                conversationId: conversation.id,
                role: MessageRole.assistant,
                content: assistantMessageContent as any,
            },
        });

        res.json({
            conversationId: conversation.id,
            message: { ...assistantMessage, content: assistantMessageContent },
        });
    } catch (error) {
        console.error("Chat error details:", error);
        // @ts-ignore
        if (error.response) {
            // @ts-ignore
            console.error("OpenRouter API Response:", error.response.data);
        }
        res.status(500).json({ error: "Failed to process chat" });
    }
});

// History Endpoint
app.get("/history", authMiddleware, async (req: any, res: Response) => {
    const user = req.user;
    try {
        const conversations = await prisma.conversation.findMany({
            where: { userId: user.id },
            orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
        });
        res.json(conversations);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch history" });
    }
});

// Get Single Conversation
app.get("/history/:id", authMiddleware, async (req: any, res: Response) => {
    const user = req.user;
    const { id } = req.params;
    try {
        const conversation = await prisma.conversation.findUnique({
            where: { id },
            include: {
                messages: {
                    orderBy: { createdAt: "asc" },
                },
            },
        });

        if (!conversation || conversation.userId !== user.id) {
            res.status(404).json({ error: "Conversation not found" });
            return;
        }

        res.json(conversation);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch conversation" });
    }
});

// Patch Conversation (Rename/Pin)
app.patch("/history/:id", authMiddleware, async (req: any, res: Response) => {
    const user = req.user;
    const { id } = req.params;
    const { title, isPinned } = req.body;

    try {
        const conversation = await prisma.conversation.findUnique({
            where: { id },
        });

        if (!conversation || conversation.userId !== user.id) {
            res.status(404).json({ error: "Conversation not found" });
            return;
        }

        const updated = await prisma.conversation.update({
            where: { id },
            data: {
                ...(title !== undefined && { title }),
                ...(isPinned !== undefined && { isPinned }),
            },
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: "Failed to update conversation" });
    }
});

// Delete Conversation
app.delete("/history/:id", authMiddleware, async (req: any, res: Response) => {
    const user = req.user;
    const { id } = req.params;

    try {
        const conversation = await prisma.conversation.findUnique({
            where: { id },
        });

        if (!conversation || conversation.userId !== user.id) {
            res.status(404).json({ error: "Conversation not found" });
            return;
        }

        await prisma.conversation.delete({
            where: { id },
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete conversation" });
    }
});

app.listen(port, () => {
    console.log(`API server running at http://localhost:${port}`);
});

export default app;
