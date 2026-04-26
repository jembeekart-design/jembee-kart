import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 🔥 अभी static data (sandbox)
    const products = [
      {
        id: 1,
        name: "T-Shirt White",
        sku: "UHd-Wh-M",
        price: 500,
        image:
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
      },
      {
        id: 2,
        name: "T-Shirt Black",
        sku: "UHd-Bl-M",
        price: 550,
        image:
          "https://images.unsplash.com/photo-1503341504253-dff4815485f1",
      },
    ];

    return NextResponse.json(products);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch products" });
  }
}
