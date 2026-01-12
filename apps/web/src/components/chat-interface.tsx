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
    MoreVertical,
    Pin,
    Trash,
    Edit,
    PanelLeftClose,
    PanelLeftOpen,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useIntlayer } from "next-intlayer";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { ModelSelector } from "@/components/model-selector";

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

interface Conversation {
    id: string;
    title: string;
    createdAt: string;
    isPinned?: boolean;
}

const API_URL = "http://localhost:3000";

const CodeBlock = ({
    language,
    value,
    copyLabel,
    copiedLabel,
}: { language: string; value: string; copyLabel: string; copiedLabel: string }) => {
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
    const [history, setHistory] = useState<Conversation[]>([]);
    const [selectedModel, setSelectedModel] = useState(
        "google/gemini-2.0-flash-exp:free"
    );
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
    const [chatToRename, setChatToRename] = useState<Conversation | null>(null);
    const [newTitle, setNewTitle] = useState("");

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (status === "authenticated") {
            fetchHistory();
        }
    }, [status]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

    const handlePin = async (chat: Conversation, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await fetch(`${API_URL}/history/${chat.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ isPinned: !chat.isPinned }),
            });
            fetchHistory();
        } catch (e) {
            console.error("Failed to pin chat", e);
        }
    };

    const handleDelete = async (chatId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this chat?")) return;
        try {
            await fetch(`${API_URL}/history/${chatId}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (conversationId === chatId) handleNewChat();
            fetchHistory();
        } catch (e) {
            console.error("Failed to delete chat", e);
        }
    };

    const openRenameDialog = (chat: Conversation, e: React.MouseEvent) => {
        e.stopPropagation();
        setChatToRename(chat);
        setNewTitle(chat.title || "");
        setIsRenameDialogOpen(true);
    };

    const handleRename = async () => {
        if (!chatToRename) return;
        try {
            await fetch(`${API_URL}/history/${chatToRename.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ title: newTitle }),
            });
            fetchHistory();
            setIsRenameDialogOpen(false);
        } catch (e) {
            console.error("Failed to rename chat", e);
        }
    };

    const MarkdownRenderer = ({
        content: textContent,
    }: { content: string }) => {
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

    const pinnedChats = history.filter((c) => c.isPinned);
    const recentChats = history.filter((c) => !c.isPinned);

    if (status === "loading")
        return <div className="p-8 text-center">{content.loading.value}</div>;

    return (
        <div className="flex h-full w-full gap-4 min-h-0">
            {/* Sidebar */}
            {isSidebarOpen && (
                <div className="hidden md:flex w-64 flex-col gap-2 border rounded-xl p-3 bg-muted/30 backdrop-blur-sm min-h-0 shrink-0">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="flex-1 justify-start gap-2 bg-background shadow-sm"
                            onClick={handleNewChat}
                        >
                            <Plus className="w-4 h-4" />
                            {content.newChatButton.value}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSidebarOpen(false)}
                            title="Close Sidebar"
                        >
                            <PanelLeftClose className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar min-h-0">
                        {/* Pinned Section */}
                        {pinnedChats.length > 0 && (
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 px-2 py-1 text-xs font-bold text-muted-foreground uppercase tracking-widest shrink-0">
                                    <Pin className="w-3 h-3" />
                                    {content.sections.pinned.value}
                                </div>
                                {pinnedChats.map((chat) => (
                                    <ChatListItem 
                                        key={chat.id} 
                                        chat={chat} 
                                        isActive={conversationId === chat.id}
                                        onClick={() => loadConversation(chat.id)}
                                        onPin={handlePin}
                                        onRename={openRenameDialog}
                                        onDelete={handleDelete}
                                        content={content}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Recent Section */}
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 px-2 py-1 text-xs font-bold text-muted-foreground uppercase tracking-widest shrink-0">
                                <History className="w-3 h-3" />
                                {content.sections.recent.value}
                            </div>
                            {recentChats.length === 0 && pinnedChats.length === 0 ? (
                                <div className="text-xs text-center text-muted-foreground p-4">
                                    {content.noHistory.value}
                                </div>
                            ) : (
                                recentChats.map((chat) => (
                                    <ChatListItem 
                                        key={chat.id} 
                                        chat={chat} 
                                        isActive={conversationId === chat.id}
                                        onClick={() => loadConversation(chat.id)}
                                        onPin={handlePin}
                                        onRename={openRenameDialog}
                                        onDelete={handleDelete}
                                        content={content}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Rename Dialog */}
            <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{content.menu.rename.value}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Input
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                        />
                        <Button onClick={handleRename}>Save</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col border rounded-xl shadow-md bg-card overflow-hidden min-h-0">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b bg-card/50 backdrop-blur-md shrink-0">
                    <div className="flex items-center gap-3">
                        {!isSidebarOpen && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsSidebarOpen(true)}
                                title="Open Sidebar"
                                className="mr-2"
                            >
                                <PanelLeftOpen className="w-4 h-4" />
                            </Button>
                        )}
                        <h2 className="font-bold text-base md:text-lg">
                            {content.title.value}
                        </h2>
                    </div>
                    <div className="flex items-center gap-3 w-full max-w-sm justify-end">
                        <span className="text-xs font-semibold text-muted-foreground hidden sm:block whitespace-nowrap">
                            {content.modelLabel.value}
                        </span>
                        <ModelSelector
                            selectedModelId={selectedModel}
                            onSelectModel={setSelectedModel}
                        />
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
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm shadow-sm ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-none" : msg.role === "system" ? "bg-destructive/10 text-destructive text-center w-full shadow-none border border-destructive/20" : "bg-muted text-foreground rounded-tl-none"}`}
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

                        <div className="flex gap-3 items-center">
                            <div className="flex-1 relative flex gap-2 items-center bg-background border rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm">
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
                                    className="min-h-[44px] max-h-48 border-0 focus-visible:ring-0 px-0 py-4 shadow-none"
                                />
                            </div>

                            <Button
                                onClick={handleSend}
                                disabled={
                                    isLoading ||
                                    (!input.trim() && !selectedImage)
                                }
                                className="h-[52px] px-8 rounded-2xl shadow-md transition-transform active:scale-95 shrink-0"
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

function ChatListItem({
    chat,
    isActive,
    onClick,
    onPin,
    onRename,
    onDelete,
    content
}: any) {
    return (
        <div className="group relative flex items-center">
            <button
                onClick={onClick}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all hover:bg-accent hover:text-accent-foreground flex items-center gap-2 truncate ${isActive ? "bg-accent text-accent-foreground shadow-sm font-medium" : "text-muted-foreground"}`}
            >
                <MessageSquare
                    className={`w-4 h-4 shrink-0 transition-opacity ${isActive ? "opacity-100" : "opacity-50 group-hover:opacity-100"}`}
                />
                <span className="truncate flex-1 pr-6">
                    {chat.title || content.untitledChat.value}
                </span>
            </button>
            <div className="absolute right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 p-0 hover:bg-background">
                            <MoreVertical className="h-3 w-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => onRename(chat, e)}>
                            <Edit className="mr-2 h-3.5 w-3.5" />
                            {content.menu.rename.value}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => onPin(chat, e)}>
                            <Pin className="mr-2 h-3.5 w-3.5" />
                            {chat.isPinned ? content.menu.unpin.value : content.menu.pin.value}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => onDelete(chat.id, e)} className="text-destructive focus:text-destructive">
                            <Trash className="mr-2 h-3.5 w-3.5" />
                            {content.menu.delete.value}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
