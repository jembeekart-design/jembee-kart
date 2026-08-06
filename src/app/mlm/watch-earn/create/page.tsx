"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Camera, Mic, MicOff, Play, Pause, RotateCcw, X, Upload, Zap, FlipHorizontal, Camera as CameraIcon } from "lucide-react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/config";
import ProductCard from "@/components/products/ProductCard";
import Link from "next/link";

interface Product {
  id: string;
  title?: string;
  images?: string[];
  image?: string;
  price?: number;
  discountPrice?: number;
  rating?: number;
  reviews?: number;
}

export default function CreateStudioPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const videoUrl = searchParams.get('url');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [timer, setTimer] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    async function startCamera() {
      try {
        // Request camera only
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (cameraRef.current) cameraRef.current.srcObject = stream;
        streamRef.current = stream;
      } catch (err) {
        console.error("Camera access failed", err);
      }
    }
    startCamera();

    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    });
    return () => unsubscribe();
  }, []);

  const startRecording = useCallback(async () => {
    if (!streamRef.current || !videoRef.current) return;
    
    recordedChunksRef.current = [];
    
    // Ensure original video is unmuted so it's captured and audible
    videoRef.current.muted = false;
    videoRef.current.volume = 1;
    
    // Setup AudioContext
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = audioContext;
    
    let audioTrack: MediaStreamTrack | undefined;
    
    try {
      // Create MediaElementSource(videoRef.current)
      const videoSource = audioContext.createMediaElementSource(videoRef.current);
      const destination = audioContext.createMediaStreamDestination();
      
      // Connect to BOTH: speaker (destination) and recorder (destination)
      videoSource.connect(audioContext.destination);
      videoSource.connect(destination);
      
      audioTrack = destination.stream.getAudioTracks()[0];
    } catch (e) {
      console.warn("Could not capture original video audio (likely CORS restriction):", e);
    }
    
    const videoTrack = streamRef.current.getVideoTracks()[0];
    
    // Create MediaRecorder stream using camera video track + original video audio track (if available)
    const tracks = [videoTrack];
    if (audioTrack) {
      tracks.push(audioTrack);
    }
    
    const mixedStream = new MediaStream(tracks);
    
    const mediaRecorder = new MediaRecorder(mixedStream, { mimeType: 'video/webm' });
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
      setPreviewUrl(URL.createObjectURL(blob));
      recordedChunksRef.current = [];
      
      // Cleanup
      audioContextRef.current?.close();
      audioContextRef.current = null;
    };
    
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorderRef.current.start();
    setIsRecording(true);
    setTimer(0);
    setRecordedBlob(null);
    setPreviewUrl(null);
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }, []);

  return (
    <main className="fixed inset-0 bg-black text-white flex flex-col">
      {/* Top Controls */}
      <div className="p-4 flex justify-between items-center z-50">
        <button onClick={() => router.back()}><X /></button>
        <div className="font-bold">Create with Original</div>
        <button 
          disabled={!recordedBlob}
          className={`px-4 py-2 rounded-full font-bold text-sm ${recordedBlob ? 'bg-pink-600' : 'bg-gray-600'}`}
        >
          Next
        </button>
      </div>

      {/* Main Studio Area (Side-by-side) */}
      <div className="flex-1 flex gap-1 p-1">
        <div className="flex-1 relative bg-gray-900 rounded-lg overflow-hidden">
          {previewUrl ? (
            <video src={previewUrl} className="w-full h-full object-cover" controls />
          ) : (
            <video ref={videoRef} src={videoUrl || ""} className="w-full h-full object-cover" />
          )}
          {!previewUrl && (
            <div className="absolute bottom-2 left-2 flex gap-1">
               <button onClick={() => videoRef.current?.play()} className="bg-black/50 p-1 rounded-full"><Play size={16} /></button>
               <button onClick={() => videoRef.current?.pause()} className="bg-black/50 p-1 rounded-full"><Pause size={16} /></button>
            </div>
          )}
        </div>
        <div className="flex-1 relative bg-gray-900 rounded-lg overflow-hidden">
          <video ref={cameraRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          <div className="absolute top-2 right-2"><FlipHorizontal size={20} /></div>
          {isRecording && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
              REC {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
            </div>
          )}
        </div>
      </div>

      {/* Recording Controls */}
      <div className="p-4 flex justify-center">
        <button 
          onClick={isRecording ? stopRecording : startRecording} 
          className={`w-14 h-14 rounded-full border-4 border-white ${isRecording ? 'bg-red-500' : 'bg-transparent'}`} 
        />
      </div>

      {/* Compact Product Slider */}
      <div className="h-28 p-2 flex gap-2 overflow-x-auto">
        {products.map(product => (
          <Link key={product.id} href={`/product/${product.id}`} className="w-24 flex-shrink-0">
             <ProductCard {...product} />
          </Link>
        ))}
      </div>
    </main>
  );
}
