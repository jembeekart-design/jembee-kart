import { NextResponse } from 'next/server';

export async function GET() {
  // Aapke Sandbox Credentials
  const CLIENT_ID = "827265200202480"; 
  const SANDBOX_SECRET = "027adcc4db029cc81ea763cd35147f38d7d70e308da144eff2cebfa9e0619508"; 

  try {
    // Sandbox API call
    const response = await fetch('https://api.qikink.com/v1/products', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'key': CLIENT_ID,
        'secret': SANDBOX_SECRET
      }
    });

    const data = await response.json();

    return NextResponse.json({
      status: response.status,
      body: data
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
