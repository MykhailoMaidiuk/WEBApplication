// i18n.js
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
          "Year (Newest to Oldest)": "Year (Newest to Oldest)",
          "Back to List": "Back to List",
          "Published Year": "Published Year",
          "ISBN-13": "ISBN-13",
          "ISBN-10": "ISBN-10",
          "Categories": "Categories",
          "Average Rating": "Average Rating",
          "Number of Pages": "Number of Pages",
          "Ratings Count": "Ratings Count",
          "Description": "Description",
          "No description available": "No description available",
        },
      },
      cs: {
        translation: {
          // Czech translations here...
          "Back to List": "Zpět na seznam",
          "Published Year": "Rok vydání",
          "ISBN-13": "ISBN-13",
          "ISBN-10": "ISBN-10",
          "Categories": "Kategorie",
          "Average Rating": "Průměrné hodnocení",
          "Number of Pages": "Počet stránek",
          "Ratings Count": "Počet hodnocení",
          "Description": "Popis",
          "No description available": "Popis není k dispozici",
          // other translations...
        },
      },
    },
    lng: "cs", // Set default language to Czech
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
