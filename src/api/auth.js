import api from "./axios";

export const login = (email, password) => {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  return api.post("/auth/login", formData, {
    headers: {
      "content-Type": "application/x-www-form-urlencoded",
    },
  });
};

export const signup = (email, password) =>
  api.post("/auth/signup", { email, password });

export const logout = () => api.post("/auth/logout");

export const refreshToken = (refresh) =>
  api.post("/auth/refresh", { refresh_token: refresh });

export const getGoogleLoginUrl = () => api.get("/auth/google/login");
