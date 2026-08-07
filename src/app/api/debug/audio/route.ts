import { NextResponse } from 'next/server';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import ffmpegPath from "ffmpeg-static";
import ffprobe from "ffprobe-static";

if (!ffmpegPath) {
    throw new Error("ffmpegPath is null");
}
const ffprobePath = ffprobe.path;

const runFFmpeg = (args: string[]): Promise<{stderr: string, code: number | null}> => {
    return new Promise((resolve, reject) => {
        const process: ChildProcessWithoutNullStreams = spawn(ffmpegPath!, args);
        let stderr = '';
        process.stderr.on('data', (data: Buffer) => stderr += data.toString());
        process.on('close', (code: number) => {
            resolve({stderr, code});
        });
        process.on('error', (err: Error) => {
            reject(err);
        });
    });
};

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

const getStreamInfo = async (filePath: string): Promise<string> => {
    return new Promise((resolve) => {
        const proc: ChildProcessWithoutNullStreams = spawn(ffmpegPath!, ['-i', filePath]);
        let output = '';
        proc.stderr.on('data', (data: Buffer) => output += data.toString());
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

        // 1. fetch(originalVideoUrl)
        const resp = await withInstrumentedTimeout(fetch(originalUrl), 'fetch(originalVideoUrl)');
        
        // 2. response.arrayBuffer()
        const recordedBuffer = await withInstrumentedTimeout(recordedFile.arrayBuffer(), 'recordedFile.arrayBuffer()');
        const originalBuffer = await withInstrumentedTimeout(resp.arrayBuffer(), 'originalResponse.arrayBuffer()');

        // 3. fs.writeFile(recorded)
        await withInstrumentedTimeout(fs.writeFile(recordedPath, Buffer.from(recordedBuffer)), 'fs.writeFile(recorded)');
        
        // 4. fs.writeFile(original)
        await withInstrumentedTimeout(fs.writeFile(originalPath, Buffer.from(originalBuffer)), 'fs.writeFile(original)');
        
        // 5. ffprobe original / 6. ffprobe recorded
        const hasRecordedAudio = await withInstrumentedTimeout(hasAudio(recordedPath), 'ffprobe recorded');
        const hasOriginalAudio = await withInstrumentedTimeout(hasAudio(originalPath), 'ffprobe original');

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

        // 7. ffmpeg start / 8. ffmpeg finish
        const {code, stderr} = await withInstrumentedTimeout(runFFmpeg(ffmpegArgs), 'ffmpeg execution', 300000); // Allow 5 mins for ffmpeg as it's the main task
        
        // 9. fs.readFile(output)
        const outputHasAudio = await withInstrumentedTimeout(hasAudio(outputPath), 'ffprobe output');
        const outputInfo = await withInstrumentedTimeout(getStreamInfo(outputPath), 'getStreamInfo(output)');

        return NextResponse.json({
            command: 'ffmpeg ' + ffmpegArgs.join(' '),
            stderr,
            exitCode: code,
            infoRecorded: await withInstrumentedTimeout(getStreamInfo(recordedPath), 'getStreamInfo(recorded)'),
            infoOriginal: await withInstrumentedTimeout(getStreamInfo(originalPath), 'getStreamInfo(original)'),
            infoOutput: outputInfo,
            hasRecordedAudio,
            hasOriginalAudio,
            hasOutputAudio: outputHasAudio,
        });
    } catch (error) {
        try {
            const errObj = JSON.parse((error as Error).message);
            if (errObj.failedStep) {
                return NextResponse.json(errObj, { status: 504 });
            }
        } catch {}
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    } finally {
        await fs.rm(tempDir, { recursive: true, force: true });
    }
}
