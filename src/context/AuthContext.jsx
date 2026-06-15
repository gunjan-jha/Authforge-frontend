import { createContext, useContext, useState, useEffect } from "react";
import { getMe } from "../api/user";
import { refreshToken, logout as logoutApi } from "../api/auth";

const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  //on app load, try to fetch current user
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          const res = await getMe();
          setUser(res.data);
        } catch (err) {
          //Token might be expired,try refresh
          await tryRefresh();
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const tryRefresh = async () => {
    const refresh = localStorage.getItem("refresh_token");
    if (!refresh) return;
    try {
      const res = await refreshToken(refresh);
      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("refresh_token", res.data.refresh_token);
      const me = await getMe();
      setUser(me.data);
    } catch (err) {
      // Refresh also failed,clear everything
      clearTokens();
    }
  };

  const loginUser = (tokens, userData) => {
    localStorage.setItem("access_token", tokens.access_token);
    if (tokens.refresh_token) {
      localStorage.setItem("refresh_token", tokens.refresh_token);
    }
    setUser(userData);
  };

  const logoutUser = async () => {
    const refresh = localStorage.getItem("refresh_token");
    try {
      if (refresh) await logoutApi(refresh);
    } catch (err) {
      //Silently fail, still clear local tokens
    }
    clearTokens();
  };

  const clearTokens = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
