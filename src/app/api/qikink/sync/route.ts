import { NextResponse } from 'next/server';

export async function GET() {
  const CLIENT_ID = "827265200202480"; 
  const CLIENT_SECRET = "412b38894b18d959c59a9e861f66dcba0da47a7a0be4fe240711bcccecf1d093"; 

  try {
    console.log("--- Qikink Sync Started ---");
    
    // Sabse pehle 'my_products' check karte hain
    const response = await fetch('https://api.qikink.com/v1/my_products', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'key': CLIENT_ID,
        'secret': CLIENT_SECRET
      }
    });

    const status = response.status;
    const rawData = await response.json();

    console.log("Response Status:", status);
    console.log("Raw Response Data:", JSON.stringify(rawData));

    // Agar status 200 hai par data empty hai toh humein Qikink ko contact karna hoga
    return NextResponse.json({
      status,
      success: rawData.success || false,
      message: rawData.message || "No message from API",
      data: rawData.data || rawData.products || [],
      fullResponse: rawData // Ye debugging ke liye hai
    });

  } catch (error: any) {
    console.error("Critical Sync Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
