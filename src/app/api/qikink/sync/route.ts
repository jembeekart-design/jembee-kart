import { NextResponse } from 'next/server';

export async function GET() {
  const CLIENT_ID = "827265200202480"; // Aapka Client ID
  const CLIENT_SECRET = "027adcc4db029cc81ea763cd35147f38d7d70e308da144eff2cebfa9e0619508"; 

  try {
    // STEP 1: Pehle Token generate karein
    const tokenResponse = await fetch('https://sandbox.qikink.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        'ClientId': CLIENT_ID,
        'client_secret': CLIENT_SECRET
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      return NextResponse.json({ error: "Token generation failed", details: errorText }, { status: tokenResponse.status });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.Accesstoken; // Token yahan se milega

    // STEP 2: Token milne ke baad Orders/Products list fetch karein
    const apiResponse = await fetch('https://sandbox.qikink.com/api/order', {
      method: 'GET',
      headers: {
        'ClientId': CLIENT_ID,
        'Accesstoken': accessToken // Naya token yahan use hoga
      }
    });

    const finalData = await apiResponse.json();

    return NextResponse.json({
      success: true,
      token_generated: !!accessToken,
      data: finalData
    });

  } catch (error: any) {
    // Agar server connect hi na ho (Network error)
    return NextResponse.json({ 
      error: "Server connection failed", 
      message: error.message 
    }, { status: 500 });
  }
}
