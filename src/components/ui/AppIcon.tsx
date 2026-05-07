import React from "react";

interface AppIconProps {
  title: string;
  icon: React.ElementType;
  color: string;
  onClick?: () => void;
}

export function AppIcon({
  title,
  icon: Icon,
  color,
  onClick,
}: AppIconProps) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center"
    >
      <div
        className={`
          flex h-24 w-24 items-center justify-center
          rounded-[30px]
          bg-gradient-to-br ${color}
          shadow-2xl
          transition-all duration-300
          group-hover:scale-105
          group-active:scale-95
        `}
      >
        <Icon className="h-10 w-10 text-white" />
      </div>

      <p className="mt-3 text-center text-sm font-medium text-white/90">
        {title}
      </p>
    </button>
  );
}
