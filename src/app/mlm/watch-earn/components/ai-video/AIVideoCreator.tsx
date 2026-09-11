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

const GLASSES_STYLES = [
  { id: "classic", name: "Classic", emoji: "🕶️" },
  { id: "round", name: "Round", emoji: "👓" },
  { id: "aviator", name: "Aviator", emoji: "🕶️" },
  { id: "sports", name: "Sports", emoji: "🥽" },
  { id: "big", name: "Big", emoji: "😎" },
  { id: "small", name: "Small", emoji: "👓" },
  { id: "colorful", name: "Colorful", emoji: "🌈" },
  { id: "transparent", name: "Transparent", emoji: "🤓" },
  { id: "retro", name: "Retro", emoji: "🕶️" },
  { id: "square", name: "Square", emoji: "⬛" },
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
  const [glassesStyle, setGlassesStyle] = useState("classic");
  const [glassesSize, setGlassesSize] = useState(100);
  const [glassesX, setGlassesX] = useState(0);
  const [glassesY, setGlassesY] = useState(-10);
  const glassesStyleRef = useRef(glassesStyle);
  const glassesSizeRef = useRef(glassesSize);
  const glassesXRef = useRef(glassesX);
  const glassesYRef = useRef(glassesY);

  useEffect(() => { glassesStyleRef.current = glassesStyle; }, [glassesStyle]);
  useEffect(() => { glassesSizeRef.current = glassesSize; }, [glassesSize]);
  useEffect(() => { glassesXRef.current = glassesXRef.current; }, [glassesX]);
  useEffect(() => { glassesYRef.current = glassesYRef.current; }, [glassesY]);

  useEffect(() => {
    let cancelled = false;

    async function loadFaceModel() {
      try {
        setLoading(true);
        setError("");

        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm"
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

    let lastFaceLandmarks: any[] | null = null;
    const draw = () => {
      const ctx = canvas.getContext("2d");
      const landmarker = landmarkerRef.current;

      if (!ctx || !landmarker || video.readyState < 2) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      if (canvas.width !== (video.videoWidth || 720)) canvas.width = video.videoWidth || 720;
      if (canvas.height !== (video.videoHeight || 1280)) canvas.height = video.videoHeight || 1280;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (effect !== "none") {
        try {
          const result = landmarker.detectForVideo(video, performance.now());

          const detectedFaces = result.faceLandmarks || [];
          if (detectedFaces.length > 0) lastFaceLandmarks = detectedFaces[0];
          if (lastFaceLandmarks) {
            drawEffect(ctx, lastFaceLandmarks, effect, canvas.width, canvas.height);
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

    video.addEventListener("loadeddata", start); video.addEventListener("play", start);

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
    const leftFace = landmarks[234];
    const rightFace = landmarks[454];
    const top = landmarks[10];

    if (!nose || !leftFace || !rightFace || !top) return;

    const cx = nose.x * width;
    const cy = nose.y * height;

    const faceWidth = Math.abs(rightFace.x - leftFace.x) * width;
    const baseSize = Math.max(40, faceWidth * 0.8);

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (id === "glasses" || id === "sunglasses") {
      const l1 = landmarks[33];
      const l2 = landmarks[133];
      const r1 = landmarks[362];
      const r2 = landmarks[263];

      if (!l1 || !l2 || !r1 || !r2) {
        ctx.restore();
        return;
      }

      const lx = ((l1.x + l2.x) / 2) * width;
      const ly = ((l1.y + l2.y) / 2) * height;
      const rx = ((r1.x + r2.x) / 2) * width;
      const ry = ((r1.y + r2.y) / 2) * height;

      const gx = (lx + rx) / 2 + glassesX;
      const gy = (ly + ry) / 2 + glassesY;
      const eyeDistance = Math.hypot(rx - lx, ry - ly);
      const angle = Math.atan2(ry - ly, rx - lx);
      const scale = glassesSizeRef.current / 100;
      const w = Math.max(70, eyeDistance * 2.35) * scale;
      const h = Math.max(34, eyeDistance * 0.82) * scale;

      ctx.translate(gx, gy);
      ctx.rotate(angle);

      const drawLens = (x:number, y:number, lensW:number, lensH:number) => {
        ctx.beginPath();
        ctx.roundRect(x - lensW / 2, y - lensH / 2, lensW, lensH, lensH * 0.25);

        if (glassesStyleRef.current === "round") {
          ctx.beginPath();
          ctx.arc(x, y, Math.min(lensW, lensH) * 0.48, 0, Math.PI * 2);
        } else if (glassesStyle === "aviator") {
          ctx.beginPath();
          ctx.moveTo(x - lensW * 0.48, y - lensH * 0.35);
          ctx.lineTo(x + lensW * 0.48, y - lensH * 0.35);
          ctx.lineTo(x + lensW * 0.38, y + lensH * 0.42);
          ctx.lineTo(x, y + lensH * 0.5);
          ctx.lineTo(x - lensW * 0.38, y + lensH * 0.42);
          ctx.closePath();
        } else if (glassesStyle === "sports") {
          ctx.beginPath();
          ctx.ellipse(x, y, lensW * 0.5, lensH * 0.5, 0, 0, Math.PI * 2);
        } else {
          ctx.beginPath();
          ctx.roundRect(x - lensW / 2, y - lensH / 2, lensW, lensH, glassesStyle === "square" ? 4 : lensH * 0.22);
        }

        ctx.fillStyle =
          glassesStyle === "transparent" ? "rgba(220,240,255,0.22)" :
          glassesStyle === "colorful" ? "rgba(80,160,255,0.72)" :
          glassesStyle === "sports" ? "rgba(30,80,180,0.78)" :
          glassesStyle === "small" ? "rgba(10,10,10,0.9)" :
          "rgba(5,5,5,0.9)";
        ctx.fill();

        ctx.lineWidth = Math.max(2, w * 0.025);
        ctx.strokeStyle =
          glassesStyle === "retro" ? "#7a3f20" :
          glassesStyle === "colorful" ? "#ff3ea5" :
          glassesStyle === "transparent" ? "rgba(255,255,255,0.8)" :
          glassesStyle === "aviator" ? "#c9a227" :
          "#222";
        ctx.stroke();
      };

      const lensGap = w * 0.06;
      const lensW = glassesStyle === "big" ? w * 0.44 :
        glassesStyle === "small" ? w * 0.32 : w * 0.40;
      const lensH = glassesStyle === "big" ? h * 1.12 :
        glassesStyle === "small" ? h * 0.78 : h;

      drawLens(-lensGap - lensW / 2, 0, lensW, lensH);
      drawLens(lensGap + lensW / 2, 0, lensW, lensH);

      ctx.beginPath();
      ctx.moveTo(-lensGap, 0);
      ctx.lineTo(lensGap, 0);
      ctx.lineWidth = Math.max(3, w * 0.035);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-w * 0.49, -h * 0.08);
      ctx.lineTo(-w * 0.62, -h * 0.02);
      ctx.moveTo(w * 0.49, -h * 0.08);
      ctx.lineTo(w * 0.62, -h * 0.02);
      ctx.stroke();

      if (id === "sunglasses") {
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fillRect(-w * 0.46, -h * 0.08, w * 0.92, h * 0.16);
      }
    } else {
      const size = baseSize;

      if (id === "crown") {
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
      const videoWithCapture = video as HTMLVideoElement & { captureStream?: () => MediaStream };
      const source = typeof videoWithCapture.captureStream === "function"
        ? videoWithCapture.captureStream()
        : null;

      if (source) {
        source.getAudioTracks().forEach((track: MediaStreamTrack) => stream.addTrack(track));
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];
      recorder.ondataavailable=(e)=>{
        if(e.data.size>0) chunks.push(e.data);
      };

      const finished=new Promise<void>((resolve,reject)=>{
        recorder.onstop=()=>resolve(undefined);
        recorder.onerror=()=>reject(new Error("Processed video recording failed."));
      });

      video.currentTime=0;
      await video.play();
      recorder.start(250);

      await new Promise((resolve)=>{
        const done=()=>{
          video.removeEventListener("ended",done);
          resolve(undefined);
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
          className={file && effect !== "none" ? "hidden" : "h-full w-full object-cover"}
        />

        <canvas
          ref={canvasRef}
          className={file && effect !== "none" ? "h-full w-full object-contain" : "hidden"}
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

          {(effect === "glasses" || effect === "sunglasses") && (
            <div className="mt-4 rounded-2xl bg-white/10 p-4">
              <div className="mb-3 text-sm font-bold text-white">
                🕶️ Glasses Settings
              </div>

              <div className="mb-4">
                <div className="mb-1 flex justify-between text-xs text-white/80">
                  <span>Style</span>
                  <span>{glassesStyle}</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {GLASSES_STYLES.map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setGlassesStyle(style.id)}
                      className={`rounded-xl bg-white/10 px-2 py-2 text-center text-xs ${glassesStyle === style.id ? "bg-white text-black" : "text-white"}`}
                    >
                      <div className="text-lg">{style.emoji}</div>
                      <div>{style.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <label className="mb-3 block text-xs text-white">
                Size: {glassesSize}%
                <input
                  type="range"
                  min="50"
                  max="160"
                  value={glassesSize}
                  onChange={(e) => setGlassesSize(Number(e.target.value))}
                  className="mt-2 w-full"
                />
              </label>

              <label className="mb-3 block text-xs text-white">
                Left / Right: {glassesX}
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={glassesX}
                  onChange={(e) => setGlassesX(Number(e.target.value))}
                  className="mt-2 w-full"
                />
              </label>

              <label className="block text-xs text-white">
                Up / Down: {glassesY}
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={glassesY}
                  onChange={(e) => setGlassesY(Number(e.target.value))}
                  className="mt-2 w-full"
                />
              </label>
            </div>
          )}

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
