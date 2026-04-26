import { NextResponse } from 'next/server';

export async function GET() {
  const API_KEY = "YOUR_QIKINK_API_KEY_HERE"; // Apni key yahan daalein

  try {
    const response = await fetch('https://api.qikink.com/v1/products', {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
