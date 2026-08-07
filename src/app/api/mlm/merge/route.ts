import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { adminDb } from '@/firebase/admin';

const withInstrumentedTimeout = async <T>(promise: Promise<T>, stepName: string, ms = 30000): Promise<T> => {
    const start = Date.now();
    let timeoutHandle: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutHandle = setTimeout(() => {
            const elapsed = Date.now() - start;
            reject(new Error(JSON.stringify({
                failedStep: stepName,
                elapsedMs: elapsed
            })));
        }, ms);
    });

    console.log(`[${new Date().toISOString()}] Starting step: ${stepName}`);
    try {
        const result = await Promise.race([promise, timeoutPromise]);
        const elapsed = Date.now() - start;
        console.log(`[${new Date().toISOString()}] Finished step: ${stepName} in ${elapsed}ms`);
        return result;
    } finally {
        clearTimeout(timeoutHandle!);
    }
};

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
    const process = spawn('ffmpeg', args);
    let stderr = '';
    process.stderr.on('data', (data) => stderr += data);
    process.on('close', (code) => {
      resolve({stderr, code});
    });
    process.on('error', (err) => {
      reject(err);
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

    // 1. fetch(originalVideoUrl)
    const resp = await withInstrumentedTimeout(fetch(originalVideoUrl), 'fetch(originalVideoUrl)');
    if (!resp.ok) throw new Error('Failed to fetch original video');
    
    // 2. response.arrayBuffer()
    const fileBuffer = await withInstrumentedTimeout(file.arrayBuffer(), 'file.arrayBuffer()');
    const originalBuffer = await withInstrumentedTimeout(resp.arrayBuffer(), 'originalResponse.arrayBuffer()');

    // 3. fs.writeFile(recorded)
    await withInstrumentedTimeout(fs.writeFile(recordedPath, Buffer.from(fileBuffer)), 'fs.writeFile(recorded)');
    
    // 4. fs.writeFile(original)
    await withInstrumentedTimeout(fs.writeFile(originalPath, Buffer.from(originalBuffer)), 'fs.writeFile(original)');
    
    // 5. ffprobe recorded / 6. ffprobe original
    const audioRegex = /Stream\s+#\d+:\d+(?:\(.*\))?:\s+Audio:/;
    const hasRecordedAudio = audioRegex.test(await withInstrumentedTimeout(getStreamInfo(recordedPath), 'ffprobe recorded'));
    const hasOriginalAudio = audioRegex.test(await withInstrumentedTimeout(getStreamInfo(originalPath), 'ffprobe original'));

    // Try merging with FFmpeg
    const ffmpegArgs = ['-i', recordedPath, '-i', originalPath];

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

    // 7. ffmpeg start / 8. ffmpeg finish
    const {code, stderr} = await withInstrumentedTimeout(runFFmpeg(ffmpegArgs), 'ffmpeg execution', 300000);
    if (code !== 0) throw new Error(`FFmpeg failed with code ${code}: ${stderr}`);
    
    // 9. fs.readFile(output)
    const mergedBuffer = await withInstrumentedTimeout(fs.readFile(outputPath), 'fs.readFile(output)');
    const uploadFile = new File([mergedBuffer], 'merged.mp4', { type: 'video/mp4' });

    // 10. uploadToCloudinary
    const cloudinaryResponse = await withInstrumentedTimeout(uploadToCloudinary(uploadFile, 'video'), 'uploadToCloudinary');

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
    try {
        const errObj = JSON.parse((error as Error).message);
        if (errObj.failedStep) {
            return NextResponse.json(errObj, { status: 504 });
        }
    } catch {}
    console.error('Merge API Error:', error);
    await fs.rm(tempDir, { recursive: true, force: true });
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
