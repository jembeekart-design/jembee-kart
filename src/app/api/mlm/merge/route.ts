import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { adminDb } from '@/firebase/admin';

// Helper to get stream info
const getStreamInfo = async (filePath: string): Promise<string> => {
    return new Promise((resolve) => {
        const proc = spawn('ffmpeg', ['-i', filePath]);
        let output = '';
        proc.stderr.on('data', (data) => output += data);
        proc.on('close', () => resolve(output));
    });
};

// Helper to execute ffmpeg
const runFFmpeg = (args: string[]): Promise<{stderr: string, code: number | null}> => {
  return new Promise((resolve, reject) => {
    console.log("DIAGNOSTIC: Executing FFmpeg command:", 'ffmpeg ' + args.join(' '));
    const process = spawn('ffmpeg', args);
    let stderr = '';
    process.stderr.on('data', (data) => stderr += data);
    process.on('close', (code) => {
      console.log("DIAGNOSTIC: FFmpeg finished with code:", code);
      console.log("DIAGNOSTIC: FFmpeg stderr:", stderr);
      resolve({stderr, code});
    });
  });
};

export async function POST(req: Request) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'merge-'));
  
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const originalVideoUrl = formData.get('originalVideoUrl') as string;

    if (!file || !originalVideoUrl) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }

    const recordedPath = path.join(tempDir, 'recorded.mp4');
    const originalPath = path.join(tempDir, 'original.mp4');
    const outputPath = path.join(tempDir, 'output.mp4');

    await fs.writeFile(recordedPath, Buffer.from(await file.arrayBuffer()));
    
    // Download original video
    const resp = await fetch(originalVideoUrl);
    if (!resp.ok) throw new Error('Failed to fetch original video');
    await fs.writeFile(originalPath, Buffer.from(await resp.arrayBuffer()));
    
    console.log("DIAGNOSTIC: Stream info for recorded file:");
    console.log(await getStreamInfo(recordedPath));
    console.log("DIAGNOSTIC: Stream info for original file:");
    console.log(await getStreamInfo(originalPath));

    // Try merging with FFmpeg
    const ffmpegArgs = ['-i', recordedPath, '-i', originalPath];

    // ... (logic remains same as before)
    const audioRegex = /Stream\s+#\d+:\d+(?:\(.*\))?:\s+Audio:/;
    const hasRecordedAudio = audioRegex.test(await getStreamInfo(recordedPath));
    const hasOriginalAudio = audioRegex.test(await getStreamInfo(originalPath));

    if (hasRecordedAudio && hasOriginalAudio) {
      ffmpegArgs.push(
        '-filter_complex', '[0:a][1:a]amix=inputs=2:duration=first[aout]',
        '-map', '0:v:0',
        '-map', '[aout]'
      );
    } else if (hasOriginalAudio) {
      ffmpegArgs.push('-map', '0:v:0', '-map', '1:a:0');
    } else if (hasRecordedAudio) {
      ffmpegArgs.push('-map', '0:v:0', '-map', '0:a:0');
    } else {
      ffmpegArgs.push('-map', '0:v:0');
    }

    ffmpegArgs.push(
      '-c:v', 'libx264',
      '-c:a', 'aac',
      '-shortest',
      outputPath
    );

    const {code, stderr} = await runFFmpeg(ffmpegArgs);
    if (code !== 0) throw new Error(`FFmpeg failed with code ${code}: ${stderr}`);
    
    console.log("DIAGNOSTIC: Stream info for output file:");
    console.log(await getStreamInfo(outputPath));

    const mergedBuffer = await fs.readFile(outputPath);
    const uploadFile = new File([mergedBuffer], 'merged.mp4', { type: 'video/mp4' });

    // Upload to Cloudinary
    const cloudinaryResponse = await uploadToCloudinary(uploadFile, 'video');
    console.log("DIAGNOSTIC: Cloudinary upload URL:", cloudinaryResponse.secure_url);

    // Cleanup
    await fs.rm(tempDir, { recursive: true, force: true });

    // Save to Firestore
    await adminDb.collection('watchEarnVideos').add({
      userId,
      video: cloudinaryResponse.secure_url,
      createdAt: Date.now()
    });

    return NextResponse.json({ success: true, videoUrl: cloudinaryResponse.secure_url });
  } catch (error) {
    console.error('Merge API Error:', error);
    await fs.rm(tempDir, { recursive: true, force: true });
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
