import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

function BookComments({ isbn13 }) {
    const { t } = useTranslation();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [user, setUser] = useState(null);  // Додаємо стейт для зберігання інформації про користувача

    const API_URL =
      window.location.hostname === "localhost"
        ? "http://localhost:8009"
        : "http://wea.nti.tul.cz:8009";

    // Завантаження коментарів
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await fetch(`${API_URL}/books/${isbn13}/comments`, {
                    credentials: "include", // Включає сесію в запит
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch comments");
                }

                const data = await response.json();
                console.log("Fetched comments:", data);
                setComments(data.comments || []);
            } catch (error) {
                console.error("Error fetching comments:", error);
            }
        };

        const fetchUser = async () => {
            try {
                const response = await fetch(`${API_URL}/current_user`, {
                    credentials: "include", // Важливо! Це дозволяє передавати сесію
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log("Current user:", data);
                    setUser(data); // Оновлюємо стейт з даними користувача
                } else {
                    setUser(null); // Якщо користувач не авторизований, обнуляємо стейт
                }
            } catch (error) {
                console.error("Error fetching current user:", error);
            }
        };

        fetchComments();
        fetchUser();  // Перевіряємо, чи користувач авторизований

    }, [isbn13, API_URL]);



    const handleAddComment = async () => {
        if (!user) {
            alert("Please log in to add a comment.");
            return;
        }

        const token = sessionStorage.getItem("token");
        try {
            const response = await fetch(`${API_URL}/books/${isbn13}/comments`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ content: newComment }), // Використовуємо newComment
            });

            if (!response.ok) {
                throw new Error("Failed to add comment");
            }

            const data = await response.json();
            setComments((prevComments) => [...prevComments, data.comment]);
            setNewComment("");
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    return (
        <div>
            <p style={{color: '#ffffff'}}>
                <h3>{t("Comments")}</h3>
                {comments && comments.length > 0 ? (
                    <ul>
                        {comments.map((comment, index) => (
                            <li key={index}>
                                <strong>{comment.user}: </strong>
                                {comment.content}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>{t("No comments yet.")}</p>
                )}
                {user ? (
                    <div>
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={t("Add a comment")}
                />
                        <button
                            onClick={handleAddComment}
                            disabled={!newComment.trim()} // Забороняє відправку порожнього коментаря
                        >
                            {t("Submit")}
                        </button>
                    </div>
                ) : (
                    <p>{t("Please log in to add a comment.")}</p>
                )}
            </p>
        </div>
);
}

export default BookComments;