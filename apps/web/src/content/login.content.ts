import { t, type Dictionary } from "intlayer";

const loginContent: Dictionary = {
    key: "login",
    content: {
        title: t({
            en: "Login",
            tr: "Giriş Yap",
        }),
        emailLabel: t({
            en: "Email",
            tr: "E-posta",
        }),
        passwordLabel: t({
            en: "Password",
            tr: "Şifre",
        }),
        emailPlaceholder: t({
            en: "test@example.com",
            tr: "test@ornek.com",
        }),
        passwordPlaceholder: t({
            en: "******",
            tr: "******",
        }),
        submitButton: t({
            en: "Sign In",
            tr: "Giriş Yap",
        }),
        loading: t({
            en: "Signing In...",
            tr: "Giriş Yapılıyor...",
        }),
        errorInvalid: t({
            en: "Invalid email or password",
            tr: "Geçersiz e-posta veya şifre",
        }),
        errorGeneric: t({
            en: "An error occurred. Please try again.",
            tr: "Bir hata oluştu. Lütfen tekrar deneyin.",
        }),
    },
};

export default loginContent;
