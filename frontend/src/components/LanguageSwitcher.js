// LanguageSwitcher.js
import React from "react";
import { useTranslation } from "react-i18next";

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="language-switcher">
      <button onClick={() => changeLanguage("en")}>EN</button>
      <button onClick={() => changeLanguage("cs")}>CS</button>
    </div>
  );
}

export default LanguageSwitcher;