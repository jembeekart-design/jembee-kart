const KEY = "search_history";

export const saveHistory = (query: string) => {
  const old = JSON.parse(localStorage.getItem(KEY) || "[]");
  const updated = [query, ...old].slice(0, 10);
  localStorage.setItem(KEY, JSON.stringify(updated));
};

export const getHistory = () => {
  return JSON.parse(localStorage.getItem(KEY) || "[]");
};

export const clearHistory = () => {
  localStorage.removeItem(KEY);
};