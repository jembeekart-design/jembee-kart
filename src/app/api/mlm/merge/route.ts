import { NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { getAdminDb } from '@/firebase/admin';

export async function POST(req: Request) {
  try {
    const adminDb = getAdminDb();
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }

    // Upload recorded video directly to Cloudinary
    const cloudinaryResponse = await uploadToCloudinary(file, 'video');

    // Save to Firestore
    await adminDb.collection('watchEarnVideos').add({
      userId,
      video: cloudinaryResponse.secure_url,
      createdAt: Date.now()
    });

    return NextResponse.json({ success: true, videoUrl: cloudinaryResponse.secure_url });
  } catch (error) {
    console.error('Merge API Error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
