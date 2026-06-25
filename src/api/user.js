import api from "./axios";

export const getMe = () => api.get("/users/me");

export const updateUserRole = (userId) =>
  api.put(`/users/${userId}/make-admin`);

export const getAllUsers = () => api.get("/users/all-users");
