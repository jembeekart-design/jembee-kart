export const sendWhatsApp = (phone: string, text: string) => {
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
};