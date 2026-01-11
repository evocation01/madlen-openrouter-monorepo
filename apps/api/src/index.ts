import "dotenv/config";
import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { initTelemetry } from "./instrumentation";
import { openRouterService } from "./services/openrouter";
import { authMiddleware } from "./middleware/auth";
import { prisma, MessageRole } from "@repo/database";

// Initialize OpenTelemetry before everything else
initTelemetry();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: "http://localhost:3001",
  credentials: true, // Allow cookies
}));
app.use(morgan("dev"));
app.use(express.json());
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

  if (!messages || !model) {
    res.status(400).json({ error: "Missing messages or model" });
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
      conversation = await prisma.conversation.create({
        data: {
          userId: user.id,
          title: messages[0]?.content?.slice(0, 50) || "New Chat",
        },
      });
    }

    // 2. Save User Message
    const lastMessage = messages[messages.length - 1];
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: MessageRole.user,
        content: lastMessage.content,
      },
    });

    // 3. Call OpenRouter
    const completion = await openRouterService.chat(messages, model);
    const assistantMessageContent = completion.choices[0]?.message?.content || "";

    // 4. Save Assistant Message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: MessageRole.assistant,
        content: assistantMessageContent,
      },
    });

    res.json({
      conversationId: conversation.id,
      message: completion.choices[0]?.message,
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Failed to process chat" });
  }
});

// History Endpoint
app.get("/history", authMiddleware, async (req: any, res: Response) => {
  const user = req.user;
  try {
    const conversations = await prisma.conversation.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: 1, // Just get first message for preview/title if needed
        },
      },
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

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});

export default app;
