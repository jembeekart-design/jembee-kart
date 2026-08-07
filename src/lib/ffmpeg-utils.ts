import ffmpeg from "ffmpeg-static";
import ffprobe from "ffprobe-static";

export const getFFmpegPath = () => {
  return ffmpeg as string;
};

export const getFFprobePath = () => {
  return (ffprobe as any).path || ffprobe;
};
