// src/shared/auth/session.ts

export const saveSession = (user: any) => {
  localStorage.setItem("session", JSON.stringify(user));
};

export const getSession = () => {
  const data = localStorage.getItem("session");
  return data ? JSON.parse(data) : null;
};

export const clearSession = () => {
  localStorage.removeItem("session");
};