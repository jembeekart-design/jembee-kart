/**
 * Safe utility for injecting third-party scripts.
 */
export function injectScript(src: string, id: string) {
  if (typeof document === 'undefined') return;
  if (document.getElementById(id)) return; // Already injected

  const script = document.createElement("script");
  script.src = src;
  script.id = id;
  script.async = true;
  document.head.appendChild(script);
}
