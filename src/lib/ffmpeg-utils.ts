import ffmpeg from 'ffmpeg-static';
import ffprobe from 'ffprobe-static';
import fs from 'fs';

export const getFFmpegPath = () => {
    const ffmpegPath = ffmpeg;
    console.log(`[FFmpeg Diagnostic] Resolved ffmpegPath: ${ffmpegPath}`);
    
    if (ffmpegPath && fs.existsSync(ffmpegPath)) {
        return ffmpegPath;
    }
    
    throw new Error(`[FFmpeg Error] Binary not found at: ${ffmpegPath}`);
};

export const getFFprobePath = () => {
    const ffprobePath = ffprobe.path;
    console.log(`[FFprobe Diagnostic] Resolved ffprobePath: ${ffprobePath}`);
    
    if (ffprobePath && fs.existsSync(ffprobePath)) {
        return ffprobePath;
    }
    
    throw new Error(`[FFprobe Error] Binary not found at: ${ffprobePath}`);
};
