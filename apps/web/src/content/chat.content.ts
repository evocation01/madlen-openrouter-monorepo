import { t, type Dictionary } from "intlayer";

const chatContent: Dictionary = {
    key: "chat",
    content: {
        title: t({
            en: "Madlen Chat",
            tr: "Madlen Sohbet",
        }),
        modelLabel: t({
            en: "Model:",
            tr: "Model:",
        }),
        placeholder: t({
            en: "Type your message...",
            tr: "Mesajınızı yazın...",
        }),
        sendButton: t({
            en: "Send",
            tr: "Gönder",
        }),
        thinking: t({
            en: "Thinking...",
            tr: "Düşünüyor...",
        }),
        loading: t({
            en: "Loading...",
            tr: "Yükleniyor...",
        }),
        noHistory: t({
            en: "No history yet",
            tr: "Henüz geçmiş yok",
        }),
        untitledChat: t({
            en: "Untitled Chat",
            tr: "Başlıksız Sohbet",
        }),
        errorResponse: t({
            en: "Error: Failed to get response.",
            tr: "Hata: Yanıt alınamadı.",
        }),
        copy: t({
            en: "Copy",
            tr: "Kopyala",
        }),
        copied: t({
            en: "Copied!",
            tr: "Kopyalandı!",
        }),
        noMessages: t({
            en: "Start a conversation...",
            tr: "Bir sohbet başlatın...",
        }),
        signInRequired: t({
            en: "Please sign in to chat.",
            tr: "Sohbet etmek için lütfen giriş yapın.",
        }),
        signInButton: t({
            en: "Sign In",
            tr: "Giriş Yap",
        }),
        historyTitle: t({
            en: "History",
            tr: "Geçmiş",
        }),
        newChatButton: t({
            en: "New Chat",
            tr: "Yeni Sohbet",
        }),
        uploadImage: t({
            en: "Upload Image",
            tr: "Resim Yükle",
        }),
        removeImage: t({
            en: "Remove",
            tr: "Kaldır",
        }),
        menu: {
            rename: t({ en: "Rename", tr: "Yeniden Adlandır" }),
            delete: t({ en: "Delete", tr: "Sil" }),
            pin: t({ en: "Pin", tr: "Sabitle" }),
            unpin: t({ en: "Unpin", tr: "Sabitlemeyi Kaldır" }),
        },
        sections: {
            pinned: t({ en: "Pinned", tr: "Sabitlenenler" }),
            recent: t({ en: "Recent", tr: "Son Sohbetler" }),
        },
    },
};

export default chatContent;
