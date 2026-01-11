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
  },
};

export default chatContent;
