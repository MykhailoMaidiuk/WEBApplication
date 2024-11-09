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
          "Hello": "Hello",
          "Logout": "Logout",
          "Login": "Login",
          "Register": "Register",
          "Search by title": "Search by title",
          "Search by author": "Search by author",
          "Search by category": "Search by category",
          "Search by ISBN13": "Search by ISBN13",
          "Search": "Search"
        },
      },
      cs: {
        translation: {
          Books: "Knihy",
          "Search...": "Hledat...",
          "Unknown Author": "Neznámý autor",
          "No category": "Žádná kategorie",
          "Category: {{category}}": "Kategorie: {{category}}",
          "Sort by": "Seřadit podle",
          "Title (A-Z)": "Název (A-Z)",
          "Title (Z-A)": "Název (Z-A)",
          "Author (A-Z)": "Autor (A-Z)",
          "Author (Z-A)": "Autor (Z-A)",
          "Rating (Low to High)": "Hodnocení (od nejnižšího)",
          "Rating (High to Low)": "Hodnocení (od nejvyššího)",
          "Year (Oldest to Newest)": "Rok (od nejstaršího)",
          "Year (Newest to Oldest)": "Rok (od nejnovějšího)",
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
          "Hello": "Ahoj",
          "Logout": "Odhlásit se",
          "Login": "Přihlásit se",
          "Register": "Registrovat se",
          "Search by title": "Hledat podle názvu",
          "Search by author": "Hledat podle autora",
          "Search by category": "Hledat podle kategorie",
          "Search by ISBN13": "Hledat podle ISBN13",
          "Search": "Hledat"
        },
      },
    },
    lng: "cs", // Default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
