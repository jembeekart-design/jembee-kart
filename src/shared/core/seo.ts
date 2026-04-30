export const setMeta = (title: string, desc: string) => {
  document.title = title;
  const meta = document.querySelector("meta[name='description']");
  if (meta) meta.setAttribute("content", desc);
};