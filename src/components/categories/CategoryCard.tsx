"use client";

interface CategoryCardProps {
  title?: string;

  image?: string;

  backgroundColor?: string;

  textColor?: string;
}

export default function CategoryCard({
  title = "Fashion",

  image = "https://images.unsplash.com/photo-1445205170230-053b83016050",

  backgroundColor = "#2563eb",

  textColor = "#ffffff"
}: CategoryCardProps) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-[28px] shadow-xl transition-all duration-300 hover:scale-[1.02]"
      style={{
        background: backgroundColor
      }}
    >

      {/* IMAGE */}

      <div className="relative h-[170px] w-full overflow-hidden">

        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/20" />

      </div>

      {/* CONTENT */}

      <div className="p-4">

        <h2
          className="line-clamp-1 text-xl font-black"
          style={{
            color: textColor
          }}
        >
          {title}
        </h2>

      </div>

    </div>
  );
}
