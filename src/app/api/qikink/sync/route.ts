import { NextResponse } from 'next/server';

export async function GET() {
  // Aapke Live API Credentials (Source: Dashboard Screenshot)
  const CLIENT_ID = "827265200202480";
  const CLIENT_SECRET = "412b38894b18d959c59a9e861f66dcba0da47a7a0be4fe240711bcccecf1d093";

  try {
    const response = await fetch('https://api.qikink.com/v1/products', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'key': CLIENT_ID,
        'secret': CLIENT_SECRET
      }
    });

    const data = await response.json();
    
    // Response check karne ke liye
    if (!response.ok) {
        return NextResponse.json({ error: "Qikink API Error" }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
