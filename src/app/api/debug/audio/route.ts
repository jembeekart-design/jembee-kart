import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const runFFmpeg = (args: string[]): Promise<{stderr: string, code: number | null}> => {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('FFmpeg process timed out after 60 seconds'));
        }, 60000);

        const process = spawn('ffmpeg', args);
        let stderr = '';
        process.stderr.on('data', (data) => stderr += data);
        process.on('close', (code) => {
            clearTimeout(timeout);
            resolve({stderr, code});
        });
        process.on('error', (err) => {
            clearTimeout(timeout);
            reject(err);
        });
    });
};

const withTimeout = async <T>(promise: Promise<T>, stepName: string, ms = 30000): Promise<T> => {
    let timeoutHandle: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutHandle = setTimeout(() => {
            reject(new Error(`Step "${stepName}" timed out after ${ms}ms`));
        }, ms);
    });

    console.log(`[${new Date().toISOString()}] Starting step: ${stepName}`);
    try {
        const result = await Promise.race([promise, timeoutPromise]);
        console.log(`[${new Date().toISOString()}] Finished step: ${stepName}`);
        return result;
    } finally {
        clearTimeout(timeoutHandle!);
    }
};

const getStreamInfo = async (filePath: string): Promise<string> => {
    return new Promise((resolve) => {
        const proc = spawn('ffmpeg', ['-i', filePath]);
        let output = '';
        proc.stderr.on('data', (data) => output += data);
        proc.on('close', () => resolve(output));
    });
};

const hasAudio = async (filePath: string): Promise<boolean> => {
    const info = await getStreamInfo(filePath);
    return /Stream\s+#\d+:\d+(?:\(.*\))?:\s+Audio:/.test(info);
};

export async function POST(req: Request) {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'debug-audio-'));
    
    try {
        const formData = await req.formData();
        const recordedFile = formData.get('recorded') as File;
        const originalUrl = formData.get('originalUrl') as string;

        const recordedPath = path.join(tempDir, 'recorded.mp4');
        const originalPath = path.join(tempDir, 'original.mp4');
        const outputPath = path.join(tempDir, 'output.mp4');

        await withTimeout(fs.writeFile(recordedPath, Buffer.from(await recordedFile.arrayBuffer())), 'fs.writeFile(recorded)');
        
        const resp = await withTimeout(fetch(originalUrl), 'fetch(originalVideoUrl)');
        await withTimeout(fs.writeFile(originalPath, Buffer.from(await resp.arrayBuffer())), 'fs.writeFile(original)');
        
        const hasRecordedAudio = await hasAudio(recordedPath);
        const hasOriginalAudio = await hasAudio(originalPath);

        const ffmpegArgs = ['-i', recordedPath, '-i', originalPath];
        if (hasRecordedAudio && hasOriginalAudio) {
            ffmpegArgs.push('-filter_complex', '[0:a][1:a]amix=inputs=2:duration=first[aout]', '-map', '0:v:0', '-map', '[aout]');
        } else if (hasOriginalAudio) {
            ffmpegArgs.push('-map', '0:v:0', '-map', '1:a:0');
        } else if (hasRecordedAudio) {
            ffmpegArgs.push('-map', '0:v:0', '-map', '0:a:0');
        } else {
            ffmpegArgs.push('-map', '0:v:0');
        }
        ffmpegArgs.push('-c:v', 'libx264', '-c:a', 'aac', '-shortest', outputPath);

        const {code, stderr} = await withTimeout(runFFmpeg(ffmpegArgs), 'runFFmpeg', 60000);
        
        const outputHasAudio = await hasAudio(outputPath);
        const outputInfo = await withTimeout(getStreamInfo(outputPath), 'getStreamInfo(output)');

        return NextResponse.json({
            command: 'ffmpeg ' + ffmpegArgs.join(' '),
            stderr,
            exitCode: code,
            infoRecorded: await withTimeout(getStreamInfo(recordedPath), 'getStreamInfo(recorded)'),
            infoOriginal: await withTimeout(getStreamInfo(originalPath), 'getStreamInfo(original)'),
            infoOutput: outputInfo,
            hasRecordedAudio,
            hasOriginalAudio,
            hasOutputAudio: outputHasAudio,
        });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    } finally {
        await fs.rm(tempDir, { recursive: true, force: true });
    }
}
