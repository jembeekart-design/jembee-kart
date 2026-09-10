"use client";

import { useEffect, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

type Effect = {
  id: string;
  name: string;
  emoji: string;
};

const EFFECTS: Effect[] = [
  { id: "none", name: "None", emoji: "" },
  { id: "glasses", name: "Glasses", emoji: "🕶️" },
  { id: "heart", name: "Hearts", emoji: "💖" },
  { id: "crown", name: "Crown", emoji: "👑" },
  { id: "cap", name: "Cap", emoji: "🧢" },
  { id: "cool", name: "Cool", emoji: "😎" },
  { id: "love", name: "Love", emoji: "😍" },
  { id: "star", name: "Stars", emoji: "⭐" },
  { id: "fire", name: "Fire", emoji: "🔥" },
  { id: "flower", name: "Flower", emoji: "🌸" },
  { id: "cat", name: "Cat", emoji: "🐱" },
  { id: "dog", name: "Dog", emoji: "🐶" },
  { id: "bear", name: "Bear", emoji: "🐻" },
  { id: "rabbit", name: "Rabbit", emoji: "🐰" },
  { id: "devil", name: "Devil", emoji: "😈" },
  { id: "angel", name: "Angel", emoji: "😇" },
  { id: "mask", name: "Mask", emoji: "🎭" },
  { id: "laugh", name: "Laugh", emoji: "😂" },
  { id: "wow", name: "Wow", emoji: "🤩" },
  { id: "money", name: "Money", emoji: "🤑" },
  { id: "rainbow", name: "Rainbow", emoji: "🌈" },
  { id: "sparkle", name: "Sparkle", emoji: "✨" },
  { id: "flower2", name: "Flower 2", emoji: "🌺" },
  { id: "sunglasses", name: "Sun Glasses", emoji: "😎" },
];

type AIVideoCreatorProps = { file: File | null; onProcessed?: (file: File) => void; };

export default function AIVideoCreator({ file, onProcessed }: AIVideoCreatorProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const animationRef = useRef<number | null>(null);

  const [effect, setEffect] = useState("none");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadFaceModel() {
      try {
        setLoading(true);
        setError("");

        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm"
        );

        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "/models/face_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numFaces: 4,
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true,
        });

        if (!cancelled) {
          landmarkerRef.current = landmarker;
          setReady(true);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("AI face model load nahi ho saka.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadFaceModel();

    return () => {
      cancelled = true;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      landmarkerRef.current?.close();
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !file) return;

    const url = URL.createObjectURL(file);
    video.src = url;

    const draw = () => {
      const ctx = canvas.getContext("2d");
      const landmarker = landmarkerRef.current;

      if (!ctx || !landmarker || video.readyState < 2) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      canvas.width = video.videoWidth || 720;
      canvas.height = video.videoHeight || 1280;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (effect !== "none") {
        try {
          const result = landmarker.detectForVideo(video, performance.now());

          for (const face of result.faceLandmarks || []) {
            drawEffect(ctx, face, effect, canvas.width, canvas.height);
          }
        } catch (err) {
          console.warn("Face tracking:", err);
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    const start = () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      draw();
    };

    video.addEventListener("loadeddata", start);

    return () => {
      video.removeEventListener("loadeddata", start);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      URL.revokeObjectURL(url);
    };
  }, [file, effect, ready]);

  function drawEffect(
    ctx: CanvasRenderingContext2D,
    landmarks: any[],
    id: string,
    width: number,
    height: number
  ) {
    const nose = landmarks[1];
    const left = landmarks[234];
    const right = landmarks[454];
    const top = landmarks[10];

    if (!nose || !left || !right || !top) return;

    const cx = nose.x * width;
    const cy = nose.y * height;

    const faceWidth =
      Math.abs(right.x - left.x) * width;

    const size = Math.max(40, faceWidth * 0.8);

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (id === "glasses" || id === "sunglasses") {
      ctx.font = `${size * 0.72}px sans-serif`;
      ctx.fillText("🕶️", cx, cy - size * 0.08);
    } else if (id === "crown") {
      ctx.font = `${size * 0.65}px sans-serif`;
      ctx.fillText("👑", cx, top.y * height - size * 0.25);
    } else if (id === "cap") {
      ctx.font = `${size * 0.7}px sans-serif`;
      ctx.fillText("🧢", cx, top.y * height - size * 0.15);
    } else if (id === "mask") {
      ctx.font = `${size * 0.65}px sans-serif`;
      ctx.fillText("🎭", cx, cy);
    } else {
      const item = EFFECTS.find((x) => x.id === id);
      if (item?.emoji) {
        ctx.font = `${size * 0.62}px sans-serif`;
        ctx.fillText(item.emoji, cx, top.y * height - size * 0.1);
      }
    }

    ctx.restore();
  }

  function chooseVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] || null;
    if (!selected) return;
    if (!selected.type.startsWith("video/")) {
      setError("Sirf video file select karein.");
      e.target.value = "";
      return;
    }
    if (selected.size > 100 * 1024 * 1024) {
      setError("Video 100MB se zyada nahi hona chahiye.");
      e.target.value = "";
      return;
    }
    setError("");
    setEffect("none");
    onProcessed?.(selected);
  }

  async function exportProcessedVideo() {
    if (!file || !canvasRef.current || !videoRef.current) return;

    if (effect === "none") {
      onProcessed?.(file);
      return;
    }

    if (!ready || !landmarkerRef.current) {
      setError("AI Face Tracking abhi ready nahi hai.");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    setProcessing(true);
    setError("");

    try {
      const mimeTypes = [
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm"
      ];
      const mimeType = mimeTypes.find((type) =>
        MediaRecorder.isTypeSupported(type)
      );

      if (!mimeType) {
        throw new Error("Is device/browser par video recording supported nahi hai.");
      }

      const stream = canvas.captureStream(30);
      const source = typeof video.captureStream === "function"
        ? video.captureStream()
        : null;

      if (source) {
        source.getAudioTracks().forEach((track) => stream.addTrack(track));
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks=[];
      recorder.ondataavailable=(e)=>{
        if(e.data.size>0) chunks.push(e.data);
      };

      const finished=new Promise((resolve,reject)=>{
        recorder.onstop=resolve;
        recorder.onerror=()=>reject(new Error("Processed video recording failed."));
      });

      video.currentTime=0;
      await video.play();
      recorder.start(250);

      await new Promise((resolve)=>{
        const done=()=>{
          video.removeEventListener("ended",done);
          resolve();
        };
        video.addEventListener("ended",done);
      });

      recorder.stop();
      await finished;

      stream.getTracks().forEach((track)=>track.stop());

      const blob=new Blob(chunks,{type:mimeType});
      const processedFile=new File(
        [blob],
        file.name.replace(/\.[^.]+$/,"")+"-ai-effects.webm",
        {type:"video/webm"}
      );

      onProcessed?.(processedFile);
    } catch(err) {
      console.error("AI video export:",err);
      setError(err instanceof Error ? err.message : "Processed video create nahi ho saka.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="w-full rounded-3xl bg-black p-4 text-white">
      <div className="mb-4">
        <h2 className="text-xl font-bold">AI Video Creator</h2>
        <p className="text-sm text-white/60">
          Face tracking ke saath fun AR effects
        </p>
      </div>

      <input
        type="file"
        accept="video/*"
        onChange={chooseVideo}
        className="mb-4 block w-full text-sm"
      />

      {loading && (
        <div className="rounded-xl bg-white/10 p-3 text-sm">
          AI Face Model load ho raha hai...
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl bg-red-500/20 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="relative mx-auto aspect-[9/16] w-full max-w-md overflow-hidden rounded-2xl bg-zinc-900">
        {!file && (
          <div className="flex h-full items-center justify-center text-white/40">
            Pehle video select karein
          </div>
        )}

        <video
          ref={videoRef}
          muted
          playsInline
          controls
          className={file ? "hidden" : "h-full w-full object-cover"}
        />

        <canvas
          ref={canvasRef}
          className={file ? "h-full w-full object-contain" : "hidden"}
        />
      </div>

      {file && (
        <div className="mt-4">
          <div className="mb-2 text-sm font-semibold">
            Face Effects
          </div>

          <div className="grid grid-cols-4 gap-2">
            {EFFECTS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setEffect(item.id)}
                className={`rounded-xl p-2 text-center text-xs ${
                  effect === item.id
                    ? "bg-white text-black"
                    : "bg-white/10 text-white"
                }`}
              >
                <div className="text-2xl">{item.emoji || "✕"}</div>
                <div className="mt-1">{item.name}</div>
              </button>
            ))}
          </div>

          {file && ready && (
            <button
              type="button"
              onClick={exportProcessedVideo}
              disabled={processing}
              className="mt-4 w-full rounded-2xl bg-white px-4 py-4 text-sm font-black text-black disabled:opacity-50"
            >
              {processing ? "AI Video Create ho raha hai..." : "✨ Apply Effect & Create Video"}
            </button>
          )}

          {!ready && (
            <p className="mt-3 text-center text-xs text-white/50">
              AI tracking initialize ho raha hai...
            </p>
          )}

          {ready && (
            <p className="mt-3 text-center text-xs text-green-400">
              ✓ AI Face Tracking Ready
            </p>
          )}
        </div>
      )}
    </div>
  );
}
