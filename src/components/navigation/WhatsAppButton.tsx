"use client";

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/919999999999"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-5 z-50 flex items-center gap-3 rounded-full bg-green-500 px-5 py-4 text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-green-600"
    >
      <span className="text-2xl">
        💬
      </span>

      <span className="font-bold">
        WhatsApp
      </span>
    </a>
  );
}
