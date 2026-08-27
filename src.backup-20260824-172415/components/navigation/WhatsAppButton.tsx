"use client";

export default function WhatsAppButton() {

  return (

    <a
      href="https://wa.me/917061369212"
      target="_blank"
      rel="noopener noreferrer"
      className="
        fixed
        bottom-24
        right-4
        z-50

        flex
        h-16
        w-16

        items-center
        justify-center

        rounded-full

        bg-[var(--success-color)]
        text-[var(--button-text-color)]

        shadow-2xl
        shadow

        transition-all
        duration-300

        hover:scale-110
        hover:bg-[var(--success-color)]

        active:scale-95
      "
    >

      <span className="text-3xl">
        💬
      </span>

    </a>

  );

}
