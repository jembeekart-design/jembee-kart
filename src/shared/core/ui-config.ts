export type UIConfig = {
  glass: boolean;
  blur: number;        // px
  opacity: number;     // 0–1
  radius: number;      // px
  shadow: string;
};

export const defaultUIConfig: UIConfig = {
  glass: true,
  blur: 12,
  opacity: 0.1,
  radius: 16,
  shadow: "0 10px 30px rgba(0,0,0,0.25)",
};

export const applyUIConfig = (cfg: UIConfig) => {
  const r = document.documentElement;
  r.style.setProperty("--blur", `${cfg.blur}px`);
  r.style.setProperty("--opacity", `${cfg.opacity}`);
  r.style.setProperty("--radius", `${cfg.radius}px`);
  r.style.setProperty("--shadow", cfg.shadow);
};