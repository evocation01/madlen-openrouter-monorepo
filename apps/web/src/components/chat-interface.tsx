"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { useSession, signIn } from "next-auth/react";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface Model {
  id: string;
  name: string;
}

const API_URL = "http://localhost:3000";

export function ChatInterface() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState("openai/gpt-3.5-turbo");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetchModels();
    }
  }, [status]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchModels = async () => {
    try {
      // For now, hardcode some free models if API fetch fails or for speed
      const freeModels = [
        { id: "openai/gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
        { id: "google/gemini-pro", name: "Gemini Pro" },
        { id: "meta-llama/llama-3-8b-instruct:free", name: "Llama 3 8B (Free)" },
      ];
      setModels(freeModels);

      // Uncomment when API is fully ready with CORS
      /*
      const res = await fetch(`${API_URL}/models`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.data) setModels(data.data);
      */
    } catch (e) {
      console.error("Failed to fetch models", e);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Send Auth.js cookies
        body: JSON.stringify({
          messages: [...messages, userMessage],
          model: selectedModel,
          conversationId,
        }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const data = await res.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.message.content,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      if (data.conversationId) setConversationId(data.conversationId);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "system", content: "Error: Failed to get response." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") return <div>Loading...</div>;

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p>Please sign in to chat.</p>
        <Button onClick={() => signIn()}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] w-full max-w-4xl mx-auto p-4 border rounded-lg shadow-sm bg-background">
      {/* Header / Model Selector */}
      <div className="flex justify-between items-center mb-4 pb-4 border-b">
        <h2 className="text-lg font-semibold">Madlen Chat</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Model:</label>
          <select
            className="p-2 border rounded-md text-sm bg-background"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-2">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground mt-10">
            Start a conversation...
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : msg.role === "system"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-muted"
              }`}
            >
              <div className="text-xs opacity-50 mb-1 capitalize">{msg.role}</div>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-2 animate-pulse">
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex gap-2 pt-2 border-t">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type your message..."
          className="resize-none"
        />
        <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
          Send
        </Button>
      </div>
    </div>
  );
}
