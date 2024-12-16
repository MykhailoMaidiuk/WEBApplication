import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

function Register({ setUser }) {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:8009"
      : "http://wea.nti.tul.cz:8009";

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      const data = await response.json();
      setUser(data.user);
      setSuccessMessage(t("Successfully registered"));
      setError(null);
      navigate("/login");
    } catch (err) {
      setError(t("Registration failed"));
      setSuccessMessage("");
    }
  };

  return (
    <div className="reg-log">
      <h2>{t("Register")}</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder={t("Username")}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder={t("Password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{t("Register")}</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {successMessage && (
        <p style={{ color: "green" }}>{successMessage}</p>
      )}{" "}
    </div>
  );
}

export default Register;