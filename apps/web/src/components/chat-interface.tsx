"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Textarea } from "@repo/ui/components/ui/textarea";
import {
    Check,
    Copy,
    History,
    ImageIcon,
    MessageSquare,
    Plus,
    X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useIntlayer } from "next-intlayer";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

interface MessagePart {
    type: "text" | "image_url";
    text?: string;
    image_url?: {
        url: string;
    };
}

interface Message {
    role: "user" | "assistant" | "system";
    content: string | MessagePart[];
}

interface Model {
    id: string;
    name: string;
}

interface Conversation {
    id: string;
    title: string;
    createdAt: string;
}

const API_URL = "http://localhost:3000";

const CodeBlock = ({ 
    language,
    value,
    copyLabel,
    copiedLabel
}: { 
    language: string;
    value: string;
    copyLabel: string;
    copiedLabel: string;
}) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group rounded-lg overflow-hidden my-4 border border-white/10">
            <div className="flex items-center justify-between px-4 py-2 bg-muted/50 text-xs font-mono text-muted-foreground border-b border-white/10">
                <span>{language || "text"}</span>
                <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                    {copied ? (
                        <Check className="w-3 h-3 text-green-500" />
                    ) : (
                        <Copy className="w-3 h-3" />
                    )}
                    {copied ? copiedLabel : copyLabel}
                </button>
            </div>
            <SyntaxHighlighter
                language={language || "text"}
                style={vscDarkPlus}
                customStyle={{
                    margin: 0,
                    padding: "1rem",
                    background: "transparent",
                }}
                PreTag="div"
            >
                {value}
            </SyntaxHighlighter>
        </div>
    );
};

export function ChatInterface() {
    const { data: session, status } = useSession();
    const content = useIntlayer("chat");
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [models, setModels] = useState<Model[]>([]);
    const [history, setHistory] = useState<Conversation[]>([]);
    const [selectedModel, setSelectedModel] = useState(
        "google/gemini-2.0-flash-exp:free"
    );
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (status === "authenticated") {
            fetchModels();
            fetchHistory();
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
            const freeModels = [
                {
                    id: "google/gemini-2.0-flash-exp:free",
                    name: "Gemini 2.0 Flash (Free)",
                },
                {
                    id: "meta-llama/llama-3.3-70b-instruct:free",
                    name: "Llama 3.3 70B (Free)",
                },
                {
                    id: "mistralai/devstral-2512:free",
                    name: "Mistral Devstral 2512 (Free)",
                },
                {
                    id: "xiaomi/mimo-v2-flash:free",
                    name: "Xiaomi Mimo V2 (Free)",
                },
                {
                    id: "tngtech/deepseek-r1t2-chimera:free",
                    name: "DeepSeek R1T2 Chimera (Free)",
                },
                { id: "qwen/qwen3-coder:free", name: "Qwen 3 Coder (Free)" },
                { id: "openai/gpt-oss-120b:free", name: "GPT OSS 120B (Free)" },
                { id: "openai/gpt-oss-20b:free", name: "GPT OSS 20B (Free)" },
            ];
            setModels(freeModels);
        } catch (e) {
            console.error("Failed to fetch models", e);
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await fetch(`${API_URL}/history`, {
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                setHistory(data);
            }
        } catch (e) {
            console.error("Failed to fetch history", e);
        }
    };

    const loadConversation = async (id: string) => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/history/${id}`, {
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages);
                setConversationId(data.id);
            }
        } catch (e) {
            console.error("Failed to load conversation", e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewChat = () => {
        setMessages([]);
        setConversationId(null);
        setInput("");
        setSelectedImage(null);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSend = async () => {
        if (!input.trim() && !selectedImage) return;
        if (isLoading) return;

        let userContent: string | MessagePart[] = input;

        if (selectedImage) {
            userContent = [
                { type: "text", text: input },
                { type: "image_url", image_url: { url: selectedImage } },
            ];
        }

        const userMessage: Message = { role: "user", content: userContent };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput("");
        setSelectedImage(null);
        setIsLoading(true);

        try {
            const res = await fetch(`${API_URL}/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    messages: newMessages,
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
            if (data.conversationId && !conversationId) {
                setConversationId(data.conversationId);
                fetchHistory();
            }
        } catch (error) {
            console.error(error);
            setMessages((prev) => [
                ...prev,
                { role: "system", content: content.errorResponse.value },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const MarkdownRenderer = ({ content: textContent }: { content: string }) => {
        return (
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    code({ inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || "");
                        const language = match ? match[1] : "";
                        const value = String(children).replace(/\n$/, "");

                        return !inline ? (
                            <CodeBlock 
                                language={language} 
                                value={value} 
                                copyLabel={content.copy.value}
                                copiedLabel={content.copied.value}
                            />
                        ) : (
                            <code
                                className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs"
                                {...props}
                            >
                                {children}
                            </code>
                        );
                    },
                    p: ({ children }) => (
                        <p className="mb-2 last:mb-0">{children}</p>
                    ),
                    ul: ({ children }) => (
                        <ul className="list-disc pl-4 mb-2">{children}</ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="list-decimal pl-4 mb-2">{children}</ol>
                    ),
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    h1: ({ children }) => (
                        <h1 className="text-xl font-bold mb-2">{children}</h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-lg font-bold mb-2">{children}</h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-base font-bold mb-2">{children}</h3>
                    ),
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-muted pl-4 italic my-2">
                            {children}
                        </blockquote>
                    ),
                }}
            >
                {textContent}
            </ReactMarkdown>
        );
    };

    const renderMessageContent = (msgContent: string | MessagePart[]) => {
        if (typeof msgContent === "string")
            return <MarkdownRenderer content={msgContent} />;

        return (
            <div className="space-y-2">
                {msgContent.map((part, i) => (
                    <div key={i}>
                        {part.type === "text" && part.text && (
                            <MarkdownRenderer content={part.text} />
                        )}
                        {part.type === "image_url" && (
                            <img
                                src={part.image_url?.url}
                                alt="Uploaded"
                                className="max-w-full h-auto rounded-lg border bg-white"
                            />
                        )}
                    </div>
                ))}
            </div>
        );
    };

    if (status === "loading")
        return <div className="p-8 text-center">{content.loading.value}</div>;

    return (
        <div className="flex h-full w-full gap-4 min-h-0">
            {/* Sidebar - Hidden on mobile */}
            <div className="hidden md:flex w-64 flex-col gap-2 border rounded-xl p-3 bg-muted/30 backdrop-blur-sm min-h-0">
                <Button
                    variant="outline"
                    className="w-full justify-start gap-2 mb-2 bg-background shadow-sm shrink-0"
                    onClick={handleNewChat}
                >
                    <Plus className="w-4 h-4" />
                    {content.newChatButton.value}
                </Button>

                <div className="flex items-center gap-2 px-2 py-1 text-xs font-bold text-muted-foreground uppercase tracking-widest shrink-0">
                    <History className="w-3 h-3" />
                    {content.historyTitle.value}
                </div>

                <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar min-h-0">
                    {history.length === 0 ? (
                        <div className="text-xs text-center text-muted-foreground p-4">
                            {content.noHistory.value}
                        </div>
                    ) : (
                        history.map((chat) => (
                            <button
                                key={chat.id}
                                onClick={() => loadConversation(chat.id)}
                                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all hover:bg-accent hover:text-accent-foreground flex items-center gap-2 truncate group ${ 
                                    conversationId === chat.id
                                        ? "bg-accent text-accent-foreground shadow-sm font-medium"
                                        : "text-muted-foreground"
                                }`}
                            >
                                <MessageSquare
                                    className={`w-4 h-4 shrink-0 transition-opacity ${ 
                                        conversationId === chat.id
                                            ? "opacity-100"
                                            : "opacity-50 group-hover:opacity-100"
                                    }`}
                                />
                                <span className="truncate">
                                    {chat.title || content.untitledChat.value}
                                </span>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col border rounded-xl shadow-md bg-card overflow-hidden min-h-0">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b bg-card/50 backdrop-blur-md shrink-0">
                    <h2 className="font-bold text-base md:text-lg">
                        {content.title.value}
                    </h2>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-muted-foreground hidden sm:block">
                            {content.modelLabel.value}
                        </span>
                        <select
                            className="p-2 border rounded-lg text-xs bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer hover:border-muted-foreground/50 shadow-sm max-w-[150px] md:max-w-xs truncate"
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

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar min-h-0 overscroll-contain">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-30 space-y-4">
                            <MessageSquare className="w-16 h-12" />
                            <p className="text-lg font-medium">
                                {content.noMessages.value}
                            </p>
                        </div>
                    )}
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${ 
                                msg.role === "user"
                                    ? "justify-end"
                                    : "justify-start"
                            }`}
                        >
                            <div
                                className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm shadow-sm ${ 
                                    msg.role === "user"
                                        ? "bg-primary text-primary-foreground rounded-tr-none"
                                        : msg.role === "system"
                                        ? "bg-destructive/10 text-destructive text-center w-full shadow-none border border-destructive/20"
                                        : "bg-muted text-foreground rounded-tl-none"
                                }`}
                            >
                                {msg.role !== "user" &&
                                    msg.role !== "system" && (
                                        <div className="text-[10px] font-bold opacity-40 mb-1.5 uppercase tracking-wider">
                                            {msg.role}
                                        </div>
                                    )}
                                <div className="whitespace-pre-wrap leading-relaxed">
                                    {renderMessageContent(msg.content)}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-muted text-muted-foreground rounded-2xl rounded-tl-none px-5 py-3 text-sm animate-pulse shadow-sm">
                                <span className="flex gap-1">
                                    <span className="animate-bounce">.</span>
                                    <span className="animate-bounce [animation-delay:0.2s]">
                                        .
                                    </span>
                                    <span className="animate-bounce [animation-delay:0.4s]">
                                        .
                                    </span>
                                </span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <div className="p-6 border-t bg-card/50 shrink-0">
                    <div className="max-w-3xl mx-auto space-y-4">
                        {/* Image Preview */}
                        {selectedImage && (
                            <div className="relative inline-block group">
                                <img
                                    src={selectedImage}
                                    alt="Preview"
                                    className="h-24 w-24 object-cover rounded-xl border-2 border-primary/20 shadow-md"
                                />
                                <button
                                    onClick={() => setSelectedImage(null)}
                                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        )}

                        <div className="flex gap-3 items-end">
                            <div className="flex-1 relative flex gap-2 items-end bg-background border rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 shrink-0 text-muted-foreground hover:text-primary transition-colors"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                >
                                    <ImageIcon className="w-5 h-5" />
                                </Button>
                                <input
                                    type="file"
                                    className="hidden"
                                    ref={fileInputRef}
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                                <Textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    placeholder={content.placeholder.value}
                                    className="min-h-[44px] max-h-48 border-0 focus-visible:ring-0 px-0 py-2.5 shadow-none"
                                />
                            </div>
                            <Button
                                onClick={handleSend}
                                disabled={
                                    isLoading ||
                                    (!input.trim() && !selectedImage)
                                }
                                className="h-[52px] px-8 rounded-2xl shadow-md transition-transform active:scale-95"
                            >
                                {content.sendButton.value}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}