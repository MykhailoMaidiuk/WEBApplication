import React, { useState } from "react";
import { useTranslation } from "react-i18next";

function SortingOptions({ onSortChange }) {
  const { t } = useTranslation();
  const [selectedSort, setSelectedSort] = useState("title_asc");

  const handleSortChange = (event) => {
    setSelectedSort(event.target.value);
    onSortChange(event.target.value);
  };

  return (
    <div className="flex items-center space-x-4">
      <label htmlFor="sort-by" className="font-medium">
        {t("Sort by")}:
      </label>
      <select
        id="sort-by"
        value={selectedSort}
        onChange={handleSortChange}
        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="title_asc">{t("Title (A-Z)")}</option>
        <option value="title_desc">{t("Title (Z-A)")}</option>
        <option value="author_asc">{t("Author (A-Z)")}</option>
        <option value="author_desc">{t("Author (Z-A)")}</option>
        <option value="rating_asc">{t("Rating (Low to High)")}</option>
        <option value="rating_desc">{t("Rating (High to Low)")}</option>
        <option value="year_asc">{t("Year (Oldest to Newest)")}</option>
        <option value="year_desc">{t("Year (Newest to Oldest)")}</option>
      </select>
    </div>
  );
}

export default SortingOptions;