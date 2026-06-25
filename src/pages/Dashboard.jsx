import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMe } from "../api/user";
import "./Dashboard.css";
import RoleGuard from "../components/RoleGuard";
import AdminPanel from "../components/AdminPanel";
import RoleZones from "../components/RoleZones";

const FLOW_STEPS = [
  { icon: "ti-user", label: "User clicks login", color: "step-purple" },
  {
    icon: "ti-server",
    label: "Backend redirects to Google",
    color: "step-blue",
  },
  {
    icon: "ti-brand-google",
    label: "User consents on Google",
    color: "step-amber",
  },
  { icon: "ti-key", label: "Auth code returned", color: "step-teal" },
  { icon: "ti-lock-open", label: "Tokens issued", color: "step-green" },
];

function getInitials(name, email) {
  if (name)
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  if (email) return email[0].toUpperCase();
  return "U";
}

function truncateToken(token) {
  if (!token) return "—";
  return token.slice(0, 12) + "..." + token.slice(-6);
}

export default function Dashboard() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getMe();
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  const accessToken = localStorage.getItem("access_token");
  const refreshToken = localStorage.getItem("refresh_token");
  const data = profile || user;

  return (
    <div className="dash">
      {/* Top bar */}
      <div className="topbar">
        <div className="brand">
          <i className="ti ti-shield-lock" />
          OAuth2 Demo
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <i className="ti ti-logout" />
          Sign out
        </button>
      </div>

      {loading ? (
        <div className="dash-loading">
          <div className="spinner" />
        </div>
      ) : (
        <div className="dash-grid">
          {/* Profile card */}
          <div className="profile-card">
            <div className="avatar">{getInitials(data?.name, data?.email)}</div>
            <div className="profile-info">
              <div className="profile-name">{data?.name || "User"}</div>
              <div className="profile-email">{data?.email}</div>
              <span className="provider-badge">
                {data?.provider === "google" ? (
                  <>
                    <i className="ti ti-brand-google" /> Google OAuth
                  </>
                ) : (
                  <>
                    <i className="ti ti-mail" /> Email &amp; Password
                  </>
                )}
              </span>
            </div>
            <div className="profile-meta">
              <div className="meta-row">
                <span className="meta-label">
                  <i className="ti ti-user" /> User ID
                </span>
                <span className="meta-val">
                  #{String(data?.id || "—").slice(0, 6)}
                </span>
              </div>
              <div className="meta-row">
                <span className="meta-label">
                  <i className="ti ti-calendar" /> Joined
                </span>
                <span className="meta-val">
                  {data?.created_at
                    ? new Date(data.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </span>
              </div>
              <div className="meta-row">
                <span className="meta-label">
                  <i className="ti ti-circle-check" /> Status
                </span>
                <span className="meta-val status-active">Active</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">
                  <i className="ti ti-shield" /> Role
                </span>
                <span
                  className={`role-badge role-${data?.Role?.toLowerCase()}`}
                >
                  {data?.Role || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="right-col">
            {/* OAuth flow */}
            <div className="flow-card">
              <div className="card-title">
                <i className="ti ti-route" /> OAuth 2.0 authorization code flow
              </div>
              <div className="flow">
                {FLOW_STEPS.map((step, i) => (
                  <div key={i} className="flow-item">
                    <div className="flow-step">
                      <div className={`step-icon ${step.color}`}>
                        <i className={`ti ${step.icon}`} />
                      </div>
                      <div className="step-label">{step.label}</div>
                    </div>
                    {i < FLOW_STEPS.length - 1 && (
                      <div className="flow-arrow">
                        <i className="ti ti-arrow-right" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tokens */}
            <div className="token-card">
              <div className="card-title">
                <i className="ti ti-key" /> Session tokens
              </div>
              <div className="token-rows">
                <div className="token-row">
                  <span className="token-key">
                    <i className="ti ti-lock" /> Access token
                  </span>
                  <span className="token-val">
                    {truncateToken(accessToken)}
                  </span>
                </div>
                <div className="token-row">
                  <span className="token-key">
                    <i className="ti ti-refresh" /> Refresh token
                  </span>
                  <span className="token-val">
                    {truncateToken(refreshToken)}
                  </span>
                </div>
                <div className="token-row">
                  <span className="token-key">
                    <i className="ti ti-clock" /> Token type
                  </span>
                  <span className="token-val">Bearer</span>
                </div>
              </div>
            </div>

            {/* Role zones — visible to all */}
            <div className="flow-card">
              <div className="card-title">
                <i className="ti ti-layout-grid" /> Role-specific zones
              </div>
              <RoleZones />
            </div>

            {/* Admin panel — admin only */}
            <RoleGuard roles={["admin"]}>
              <div className="flow-card">
                <div className="card-title">
                  <i className="ti ti-shield-check" /> Admin panel
                </div>
                <AdminPanel />
              </div>
            </RoleGuard>
          </div>
        </div>
      )}
    </div>
  );
}
