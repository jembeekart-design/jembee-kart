"use client";

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/917061369212"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-4 z-50 flex items-center gap-3 rounded-full bg-green-500 px-5 py-4 text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-green-600"
    >

      <span className="text-2xl">
        💬
      </span>

      <span className="text-sm font-bold md:text-base">
        WhatsApp
      </span>

    </a>
  );
}
