import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

function UserProfile({ user, updateUserProfile }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [userDetails, setUserDetails] = useState({
    username: user?.username || "",
    full_name: user?.full_name || "",
    email: user?.email || "",
    personal_address: user?.personal_address || "",
    billing_address: user?.billing_address || "",
    billing_same_as_personal: user?.billing_same_as_personal || false,
    gender: user?.gender || "",
    phone: user?.phone || "",
    favorite_genres: user?.favorite_genres || "",
    marketing_consent: user?.marketing_consent || false,
    age: user?.age || "",
    referral: user?.referral || "",
  });

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:8009"
      : "http://wea.nti.tul.cz:8009";

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const requestBody = { ...userDetails, username: user.username };

    try {
      const response = await fetch(`${API_URL}/user/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(t("Failed to update profile"));
      }

      const updatedUser = await response.json();
      updateUserProfile(updatedUser); // Вызываем updateUserProfile в App.js

      setSuccessMessage(t("Profile updated successfully!"));
      setError(null);
      navigate("/");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(t("Failed to update profile"));
      setSuccessMessage("");
    }
  };

  const handleChange = (field, value) => {
    setUserDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="user-profile">
      <h2>{t("User Profile")}</h2>
      <form onSubmit={handleUpdateProfile}>
        <div>
          <label>{t("Username")}</label>
          <input
            type="text"
            value={userDetails.username}
            disabled
            onChange={(e) =>
              setUserDetails({ ...userDetails, username: e.target.value })
            }
          />
        </div>

        <div>
          <label>{t("Full Name")}</label>
          <input
            type="text"
            value={userDetails.full_name}
            onChange={(e) => handleChange("full_name", e.target.value)}
          />
        </div>

        <div>
          <label>{t("Email")}</label>
          <input
            type="email"
            value={userDetails.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </div>

        <div>
          <label>{t("Phone")}</label>
          <input
            type="text"
            value={userDetails.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
        </div>

        <div>
          <label>{t("Personal Address")}</label>
          <input
            type="text"
            value={userDetails.personal_address}
            onChange={(e) => handleChange("personal_address", e.target.value)}
          />
        </div>

        <div>
          <label>{t("Billing Address")}</label>
          <input
            type="text"
            value={userDetails.billing_address}
            onChange={(e) => handleChange("billing_address", e.target.value)}
          />
        </div>

        <div>
          <label>{t("Billing Same As Personal")}</label>
          <input
            type="checkbox"
            checked={userDetails.billing_same_as_personal}
            onChange={(e) =>
              handleChange("billing_same_as_personal", e.target.checked)
            }
          />
        </div>

        <div>
          <label>{t("Gender")}</label>
          <select
            value={userDetails.gender}
            onChange={(e) => handleChange("gender", e.target.value)}
          >
            <option value="">{t("Select gender")}</option>
            <option value="male">{t("Male")}</option>
            <option value="female">{t("Female")}</option>
            <option value="other">{t("Other")}</option>
          </select>
        </div>

        <div>
          <label>{t("Age")}</label>
          <input
            type="number"
            value={userDetails.age}
            onChange={(e) => handleChange("age", e.target.value)}
          />
        </div>

        <div>
          <label>{t("Favorite Genres")}</label>
          <input
            type="text"
            value={userDetails.favorite_genres}
            onChange={(e) => handleChange("favorite_genres", e.target.value)}
          />
        </div>

        <div>
          <label>{t("Reference Source")}</label>
          <input
            type="text"
            value={userDetails.referral}
            onChange={(e) => handleChange("referral", e.target.value)}
          />
        </div>

        <div>
          <label>{t("Marketing Consent")}</label>
          <input
            type="checkbox"
            checked={userDetails.marketing_consent}
            onChange={(e) =>
              handleChange("marketing_consent", e.target.checked)
            }
          />
        </div>

        <div>
          <button type="submit">{t("Update Profile")}</button>
        </div>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
    </div>
  );
}

export default UserProfile;
