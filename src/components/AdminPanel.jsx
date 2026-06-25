import { useState, useEffect } from "react";
import { getAllUsers, updateUserRole } from "../api/user";

function getInitials(email) {
  return email ? email.slice(0, 2).toUpperCase() : "U";
}

const AVATAR_COLORS = {
  admin: { bg: "#FAEEDA", color: "#633806" },
  seller: { bg: "#EEEDFE", color: "#3C3489" },
  buyer: { bg: "#E1F5EE", color: "#085041" },
  user: { bg: "#E6F1FB", color: "#0C447C" },
};

const ROLE_BADGE = {
  admin: "badge-admin",
  seller: "badge-seller",
  buyer: "badge-buyer",
  user: "badge-user",
};

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [toast, setToast] = useState({ msg: "", type: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getAllUsers();
        setUsers(res.data);
      } catch (err) {
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handlePromote = async (userId) => {
    setSaving((s) => ({ ...s, [userId]: true }));
    try {
      const res = await updateUserRole(userId);
      setUsers((u) =>
        u.map((usr) =>
          usr.id === userId ? { ...usr, role: res.data.role } : usr,
        ),
      );
      showToast(res.data.message, "success");
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to update role", "error");
    } finally {
      setSaving((s) => ({ ...s, [userId]: false }));
    }
  };

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 3000);
  };

  const counts = {
    total: users.length,
    admin: users.filter((u) => u.role === "admin").length,
    user: users.filter((u) => u.role === "user").length,
  };

  if (loading)
    return (
      <div className="dash-loading">
        <div className="spinner" />
      </div>
    );
  if (error) return <div className="error-msg">{error}</div>;

  return (
    <div className="admin-panel">
      {toast.msg && (
        <div className={`toast ${toast.type === "error" ? "toast-error" : ""}`}>
          {toast.msg}
        </div>
      )}

      {/* Stats */}
      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-label">Total users</div>
          <div className="stat-val">{counts.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Admins</div>
          <div className="stat-val">{counts.admin}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Users</div>
          <div className="stat-val">{counts.user}</div>
        </div>
      </div>

      {/* Table */}
      <div className="table-card">
        <div className="card-title">
          <i className="ti ti-users" /> User management
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: "45%" }}>User</th>
                <th style={{ width: "20%" }}>Current role</th>
                <th style={{ width: "35%" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const av = AVATAR_COLORS[u.role] || AVATAR_COLORS.user;
                const isAdmin = u.role === "admin";
                return (
                  <tr key={u.id}>
                    <td>
                      <div className="user-cell">
                        <div
                          className="avatar-sm"
                          style={{ background: av.bg, color: av.color }}
                        >
                          {getInitials(u.email)}
                        </div>
                        <div>
                          <div className="user-name">
                            {u.email.split("@")[0]}
                          </div>
                          <div className="user-email">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${ROLE_BADGE[u.role] || "badge-user"}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td>
                      {isAdmin ? (
                        <span className="already-admin">
                          <i className="ti ti-circle-check" /> Already admin
                        </span>
                      ) : (
                        <button
                          className="save-btn"
                          onClick={() => handlePromote(u.id)}
                          disabled={saving[u.id]}
                        >
                          {saving[u.id] ? (
                            <>
                              <i className="ti ti-loader" /> Promoting...
                            </>
                          ) : (
                            <>
                              <i className="ti ti-arrow-up" /> Promote to admin
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
