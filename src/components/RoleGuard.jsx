import { useAuth } from "../context/AuthContext";

export default function RoleGuard({ roles, children, fallback = null }) {
  const { user } = useAuth();
  if (!user) return fallback;
  const allowed = Array.isArray(roles) ? roles : [roles];
  return allowed.includes(user.Role) ? children : fallback;
}
