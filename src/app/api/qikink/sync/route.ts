import { NextResponse } from 'next/server';

/**
 * Qikink API Sync Route
 * Yeh backend route Qikink API se products fetch karta hai.
 * Headers mein 'key' aur 'secret' ka use authentication ke liye kiya gaya hai.
 */

export async function GET() {
  // Aapka Dashboard Client ID aur Secret
  const CLIENT_ID = "827265200202480"; 
  const CLIENT_SECRET = "412b38894b18d959c59a9e861f66dcba0da47a7a0be4fe240711bcccecf1d093"; 

  try {
    const response = await fetch('https://api.qikink.com/v1/products', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Qikink v1 API standard headers
        'key': CLIENT_ID,
        'secret': CLIENT_SECRET
      }
    });

    // Agar API response error de toh handle karein
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Qikink API Error Response:", errorText);
      return NextResponse.json(
        { error: `Qikink API Error: ${response.status}` }, 
        { status: response.status }
      );
    }

    const data = await response.json();

    // Data ko frontend par bhej rahe hain taaki Firestore mein save ho sake
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Fetch Exception:", error.message);
    return NextResponse.json(
      { error: "Failed to connect to Qikink", details: error.message }, 
      { status: 500 }
    );
  }
}
