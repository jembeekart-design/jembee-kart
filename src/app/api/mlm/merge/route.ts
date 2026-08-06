import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { adminDb } from '@/firebase/admin';

// Helper to execute ffmpeg
const runFFmpeg = (args: string[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    const process = spawn('ffmpeg', args);
    process.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg failed with code ${code}`));
    });
  });
};

export async function POST(req: Request) {
  const tempDir = await fs.mkdtemp(path.join('/tmp', 'merge-'));
  
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const originalVideoUrl = formData.get('originalVideoUrl') as string;

    if (!file || !originalVideoUrl) {
      return NextResponse.json({ success: false, message: 'Invalid input' }, { status: 400 });
    }

    const recordedPath = path.join(tempDir, 'recorded.mp4');
    const originalPath = path.join(tempDir, 'original.mp4');
    const outputPath = path.join(tempDir, 'output.mp4');

    // 1. Save recorded camera video
    await fs.writeFile(recordedPath, Buffer.from(await file.arrayBuffer()));

    // 2. Download original video (simplified - assume it's publicly accessible)
    const resp = await fetch(originalVideoUrl);
    await fs.writeFile(originalPath, Buffer.from(await resp.arrayBuffer()));

    // 3. Merge with FFmpeg
    await runFFmpeg([
      '-i', recordedPath,
      '-i', originalPath,
      '-map', '0:v:0',
      '-map', '1:a:0',
      '-c:v', 'copy',
      '-c:a', 'aac',
      '-shortest',
      outputPath
    ]);

    // 4. Upload merged video
    const mergedBuffer = await fs.readFile(outputPath);
    const mergedFile = new File([mergedBuffer], 'merged.mp4', { type: 'video/mp4' });
    const cloudinaryResponse = await uploadToCloudinary(mergedFile, 'video');

    // 5. Cleanup
    await fs.rm(tempDir, { recursive: true, force: true });

    // 6. Save to Firestore (using Admin SDK syntax)
    await adminDb.collection('watchEarnVideos').add({
      userId,
      video: cloudinaryResponse.secure_url,
      createdAt: Date.now()
    });

    return NextResponse.json({ success: true, videoUrl: cloudinaryResponse.secure_url });
  } catch (error) {
    console.error('Merge API Error:', error);
    await fs.rm(tempDir, { recursive: true, force: true });
    return NextResponse.json({ success: false, message: 'Merge failed' }, { status: 500 });
  }
}
