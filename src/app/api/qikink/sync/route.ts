import { NextResponse } from 'next/server';

export async function GET() {
  const CLIENT_ID = "827265200202480"; 
  const CLIENT_SECRET = "412b38894b18d959c59a9e861f66dcba0da47a7a0be4fe240711bcccecf1d093"; 

  try {
    // 💡 Tip: Agar 'products' se data nahi aa raha, toh 'my_products' try karein
    const response = await fetch('https://api.qikink.com/v1/products', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'key': CLIENT_ID,
        'secret': CLIENT_SECRET
      }
    });

    const data = await response.json();

    // Debugging: Vercel logs mein check karne ke liye
    console.log("Qikink API Response:", JSON.stringify(data));

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
