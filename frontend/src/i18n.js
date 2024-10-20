import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          Books: "Books",
          "Search...": "Search...",
          "Unknown Author": "Unknown Author",
          "No category": "No category",
          "Category: {{category}}": "Category: {{category}}",
        },
      },
      cs: {
        translation: {
          Books: "Knihy",
          "Search...": "Hledat...",
          "Unknown Author": "Neznámý autor",
          "No category": "Žádná kategorie",
          "Category: {{category}}": "Kategorie: {{category}}",
        },
      },
    },
    lng: "cs", // set default language to Czech
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
