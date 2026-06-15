import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe } from "../api/user";
import { useAuth } from "../context/AuthContext";

export default function GoogleCallback() {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (!accessToken) {
        setError("No token received from Google");
        return;
      }

      try {
        // Save token first so axios can use it
        localStorage.setItem("access_token", accessToken);
        if (refreshToken) localStorage.setItem("refresh_token", refreshToken);

        const me = await getMe();
        loginUser(
          { access_token: accessToken, refresh_token: refreshToken },
          me.data,
        );
        navigate("/dashboard");
      } catch (err) {
        setError("Google login failed. Please try again.");
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ textAlign: "center" }}>
        {error ? (
          <div className="error-msg">{error}</div>
        ) : (
          <>
            <p style={{ color: "var(--text-muted)", marginBottom: "12px" }}>
              Completing Google sign in...
            </p>
            <div className="spinner" />
          </>
        )}
      </div>
    </div>
  );
}
