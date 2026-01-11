import { t, type Dictionary } from "intlayer";

const landingContent: Dictionary = {
  key: "landing",
  content: {
    heroTitle: t({
      en: "Unlock the Power of AI Models",
      tr: "Yapay Zeka Modellerinin Gücünü Keşfedin",
    }),
    heroDescription: t({
      en: "Access a wide range of powerful language models through OpenRouter. Chat, explore, and create with Madlen's seamless interface.",
      tr: "OpenRouter aracılığıyla geniş bir dil modeli yelpazesine erişin. Madlen'in sorunsuz arayüzü ile sohbet edin, keşfedin ve yaratın.",
    }),
    getStarted: t({
      en: "Get Started",
      tr: "Hemen Başla",
    }),
    features: {
      multiModel: t({
        en: "Multi-Model Support",
        tr: "Çoklu Model Desteği",
      }),
      multiModal: t({
        en: "Image & Text",
        tr: "Resim ve Metin",
      }),
      history: t({
        en: "Chat History",
        tr: "Sohbet Geçmişi",
      }),
    },
  },
};

export default landingContent;
