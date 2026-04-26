import { NextResponse } from 'next/server';

export async function GET() {
  const CLIENT_ID = "827265200202480";
  const CLIENT_SECRET = "027adcc4db029cc81ea763cd35147f38d7d70e308da144eff2cebfa9e0619508";

  try {
    // 1. Get Access Token
    const tokenRes = await fetch('https://sandbox.qikink.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        'ClientId': CLIENT_ID,
        'client_secret': CLIENT_SECRET
      })
    });

    const tokenData = await tokenRes.json();
    const token = tokenData.Accesstoken;

    if (!token) {
      return NextResponse.json({ error: "Token generation failed", details: tokenData }, { status: 401 });
    }

    // 2. Fetch Products using the Token
    // Note: Sandbox URL structure different ho sakta hai, standard 'api/order' check ke liye hai
    // Products ke liye hum naye documentation ke hisaab se endpoint hit karenge
    const productRes = await fetch('https://sandbox.qikink.com/api/order', { // List check karne ke liye
      method: 'GET',
      headers: {
        'ClientId': CLIENT_ID,
        'Accesstoken': token
      }
    });

    const products = await productRes.json();

    return NextResponse.json({
      status: productRes.status,
      token: token,
      data: products
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
