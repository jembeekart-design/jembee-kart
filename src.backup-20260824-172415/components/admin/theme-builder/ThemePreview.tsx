"use client";

type Theme = {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  cardColor: string;
  textColor: string;
  borderColor: string;
  buttonRadius: number;
  cardRadius?: number;
  inputRadius?: number;
  fontFamily: string;
  headingSize?: number;
  bodySize?: number;
  fontWeight?: string;
  shadow?: string;
  shadowOpacity?: number;
  borderWidth?: number;
  buttonStyle?: string;
};

type Props = {
  theme: Theme;
};

function getShadow(
  shadow?: Theme["shadow"],
  opacity = 0.25
) {

  switch (shadow) {

    case "sm":
      return `0 2px 6px rgba(0,0,0,${opacity})`;

    case "md":
      return `0 6px 16px rgba(0,0,0,${opacity})`;

    case "lg":
      return `0 12px 28px rgba(0,0,0,${opacity})`;

    case "xl":
      return `0 20px 48px rgba(0,0,0,${opacity})`;

    default:
      return "none";

  }

}

function getButtonStyle(theme: Theme) {

  switch (theme.buttonStyle) {

    case "outline":
      return {
        background: "transparent",
        color: theme.primaryColor,
        border: `2px solid ${theme.primaryColor}`,
      };

    case "soft":
      return {
        background: `${theme.primaryColor}22`,
        color: theme.primaryColor,
        border: "none",
      };

    case "gradient":
      return {
        background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
        color: "var(--primary-color)",
        border: "none",
      };

    default:
      return {
        background: theme.primaryColor,
        color: "var(--primary-color)",
        border: "none",
      };

  }

}

export default function ThemePreview({
  theme,
}: Props) {

  return (

    <div className="mt-8 rounded-3xl border border-[var(--border-color)] p-6">

      <h2 className="mb-6 text-3xl font-bold text-[var(--button-text-color)]">
        Live Theme Preview
      </h2>

      <div
        className="overflow-hidden rounded-3xl"
        style={{
          background: theme.backgroundColor,
          color: theme.textColor,
          fontFamily: theme.fontFamily,
        }}
      >

        {/* Header */}

        <header
          className="flex items-center justify-between p-6"
          style={{
            background: theme.cardColor,
            borderBottom: `${theme.borderWidth ?? 1}px solid ${theme.borderColor}`,
          }}
        >

          <h1
            style={{
              color: theme.primaryColor,
              fontSize: `${theme.headingSize ?? 30}px`,
              fontWeight: theme.fontWeight,
            }}
          >
            JembeeKart
          </h1>

          <button
            style={{
              ...getButtonStyle(theme),
              borderRadius: `${theme.buttonRadius}px`,
              padding: "10px 24px",
            }}
          >
            Login
          </button>

        </header>

        {/* Hero */}

        <section
          className="p-8"
          style={{
            background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
          }}
        >

          <h2 className="text-4xl font-bold">
            Welcome to JembeeKart
          </h2>

          <p className="mt-3 opacity-90">
            Dynamic Theme Preview
          </p>

        </section>

        {/* Categories */}

        <section className="p-6">

          <h3 className="mb-5 text-2xl font-bold">
            Categories
          </h3>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

            {[
              "Fashion",
              "Electronics",
              "Beauty",
              "Home",
            ].map((item) => (

              <div
                key={item}
                className="p-5 text-center"
                style={{
                  background: theme.cardColor,
                  color: theme.textColor,
                  borderRadius: `${theme.cardRadius ?? 20}px`,
                  border: `${theme.borderWidth ?? 1}px solid ${theme.borderColor}`,
                  boxShadow: getShadow(
                    theme.shadow,
                    theme.shadowOpacity
                  ),
                }}
              >
                {item}
              </div>

            ))}

          </div>

        </section>

        {/* Products */}

        <section className="p-6">

          <h3 className="mb-5 text-2xl font-bold">
            Featured Products
          </h3>

          <div className="grid gap-6 md:grid-cols-3">

            {[1, 2, 3].map((id) => (

              <div
                key={id}
                style={{
                  background: theme.cardColor,
                  borderRadius: `${theme.cardRadius ?? 20}px`,
                  border: `${theme.borderWidth ?? 1}px solid ${theme.borderColor}`,
                  boxShadow: getShadow(
                    theme.shadow,
                    theme.shadowOpacity
                  ),
                }}
              >

                <div
                  className="h-48"
                  style={{
                    background: theme.secondaryColor,
                    borderTopLeftRadius: `${theme.cardRadius ?? 20}px`,
                    borderTopRightRadius: `${theme.cardRadius ?? 20}px`,
                  }}
                />

                <div className="p-5">

                  <h4 className="text-xl font-bold">
                    Product {id}
                  </h4>

                  <p className="mt-2">
                    ₹999
                  </p>

                  <button
                    className="mt-5 w-full py-3"
                    style={{
                      ...getButtonStyle(theme),
                      borderRadius: `${theme.buttonRadius}px`,
                    }}
                  >
                    Add To Cart
                  </button>

                </div>

              </div>

            ))}

          </div>

        </section>

        {/* Footer */}

        <footer
          className="mt-6 p-6 text-center"
          style={{
            background: theme.cardColor,
            borderTop: `${theme.borderWidth ?? 1}px solid ${theme.borderColor}`,
          }}
        >

          <p>
            © 2026 JembeeKart
          </p>

        </footer>

      </div>

    </div>

  );

}
