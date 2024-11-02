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
          "Sort by": "Sort by",
          "Title (A-Z)": "Title (A-Z)",
          "Title (Z-A)": "Title (Z-A)",
          "Author (A-Z)": "Author (A-Z)",
          "Author (Z-A)": "Author (Z-A)",
          "Rating (Low to High)": "Rating (Low to High)",
          "Rating (High to Low)": "Rating (High to Low)",
          "Year (Oldest to Newest)": "Year (Oldest to Newest)",
          "Year (Newest to Oldest)": "Year (Newest to Oldest)"
        }
      },
      cs: {
        translation: {
          Books: "Knihy",
          "Search...": "Hledat...",
          "Unknown Author": "Neznámý autor",
          "No category": "Žádná kategorie",
          "Category: {{category}}": "Kategorie: {{category}}",
          "Sort by": "Řadit podle",
          "Title (A-Z)": "Název (A-Z)",
          "Title (Z-A)": "Název (Z-A)",
          "Author (A-Z)": "Autor (A-Z)",
          "Author (Z-A)": "Autor (Z-A)",
          "Rating (Low to High)": "Hodnocení (Od nejnižšího)",
          "Rating (High to Low)": "Hodnocení (Od nejvyššího)",
          "Year (Oldest to Newest)": "Rok (Od nejstaršího)",
          "Year (Newest to Oldest)": "Rok (Od nejnovějšího)"
        }
      }
    },
    lng: "cs", // set default language to Czech
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;