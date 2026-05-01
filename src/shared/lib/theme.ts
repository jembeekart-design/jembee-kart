// 📦 Theme storage (Local + Firestore ready)

export type Theme = {
  name: string;
  primary: string;
  bg1: string;
  bg2: string;
};

// 🔄 Load theme
export const loadTheme = async (): Promise<Theme | null> => {
  try {
    const saved = localStorage.getItem("appTheme");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

// 💾 Save theme
export const saveTheme = async (theme: Theme) => {
  try {
    localStorage.setItem("appTheme", JSON.stringify(theme));
  } catch {}
};
