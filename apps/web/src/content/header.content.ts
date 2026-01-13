import { t, type Dictionary } from "intlayer";

const headerContent: Dictionary = {
    key: "header",
    content: {
        title: t({
            en: "MadlenOpenRouter",
            tr: "MadlenOpenRouter",
        }),
        login: t({
            en: "Login",
            tr: "Giriş",
        }),
        logout: t({
            en: "Logout",
            tr: "Çıkış",
        }),
        themeLight: t({
            en: "Light",
            tr: "Açık",
        }),
        themeDark: t({
            en: "Dark",
            tr: "Koyu",
        }),
        language: t({
            en: "Language",
            tr: "Dil",
        }),
    },
};

export default headerContent;
