import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom"; // Import useNavigate

function Login({ setUser }) {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const API_URL =
      window.location.hostname === "localhost"
        ? "http://localhost:8009"
        : "http://wea.nti.tul.cz:8009";

 const handleLogin = async (e) => {
  e.preventDefault();
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json();
  console.log("Login response:", data); // Log the response data
  if (response.ok) {
    setUser(data.user || { username }); // Ensure `user` is set if data is missing
    setError(null);
    navigate("/");
  } else {
    setError(t("Login or password is incorrect"));
  }
};

  return (
    <div className="reg-log">
      <h2>{t("Login")}</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder={t("Username")}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder={t("Password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">{t("Login")}</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default Login;