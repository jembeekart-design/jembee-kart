"use client";

interface CategoryCardProps {
  title?: string;

  image?: string;

  backgroundColor?: string;

  textColor?: string;

  borderRadius?: string;

  cardHeight?: string;

  cardWidth?: string;

  imageHeight?: string;

  titleSize?: string;
}

export default function CategoryCard({
  title = "Fashion",

  image = "https://images.unsplash.com/photo-1445205170230-053b83016050",

  backgroundColor = "var(--primary-color)",

  textColor = "var(--primary-color)",

  borderRadius = "28px",

  cardHeight = "260px",

  cardWidth = "100%",

  imageHeight = "170px",

  titleSize = "32px"
}: CategoryCardProps) {
  return (
    <div
      className="relative overflow-hidden shadow-xl transition-all duration-300 hover:scale-[1.02]"
      style={{
        background: backgroundColor,

        borderRadius: borderRadius,

        height: cardHeight,

        width: cardWidth
      }}
    >

      {/* IMAGE */}

      <div
        className="relative w-full overflow-hidden"
        style={{
          height: imageHeight
        }}
      >

        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-[var(--card-color)]/20" />

      </div>

      {/* CONTENT */}

      <div className="flex items-center justify-center p-4 text-center">

        <h2
          className="line-clamp-2 w-full font-black text-center"
          style={{
            color: textColor,

            fontSize: titleSize
          }}
        >
          {title}
        </h2>

      </div>

    </div>
  );
}
