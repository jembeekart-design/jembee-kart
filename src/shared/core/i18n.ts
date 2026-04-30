export const t = (key: string, lang = "en") => {
  const dict: any = {
    en: { hello: "Hello" },
    hi: { hello: "नमस्ते" },
  };
  return dict[lang]?.[key] || key;
};