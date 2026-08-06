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
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const destinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  
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
    return () => {
      unsubscribe();
      // Cleanup audio nodes on unmount
      audioContextRef.current?.close();
    };
  }, []);

  const startRecording = useCallback(async () => {
    if (!streamRef.current) return;
    
    recordedChunksRef.current = [];
    
    // Ensure original video is playing for the creator to hear, but NOT capturing its audio
    if (videoRef.current) {
        videoRef.current.muted = false;
        videoRef.current.volume = 1;
        await videoRef.current.play();
    }
    
    // Create MediaRecorder stream using ONLY camera video track
    const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' });
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };
    mediaRecorder.onstop = async () => {
      console.log("DEBUG: mediaRecorder.onstop triggered");
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      console.log("DEBUG: Blob created, size:", blob.size);
      const file = new File([blob], 'recording.webm', { type: 'video/webm' });
      
      // Submit to Backend Merge API
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', 'user-id-placeholder');
      formData.append('originalVideoUrl', videoUrl || "");
      
      console.log("DEBUG: Sending request to /api/mlm/merge");
      try {
        const response = await fetch('/api/mlm/merge', { method: 'POST', body: formData });
        console.log("DEBUG: Response status:", response.status);
        const result = await response.json();
        console.log("DEBUG: Response result:", result);
        
        if (result.success) {
          console.log("DEBUG: Setting previewUrl:", result.videoUrl);
          setPreviewUrl(result.videoUrl);
        } else {
          console.error("DEBUG: Merge failed:", result);
          alert("Merge failed: " + JSON.stringify(result));
        }
      } catch (error) {
        console.error("DEBUG: Exception in onstop:", error);
        alert("Exception in onstop: " + error);
      }
      
      recordedChunksRef.current = [];
    };
    
    console.debug("MediaRecorder started (camera only)");
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorderRef.current.start();
    setIsRecording(true);
    setTimer(0);
  }, [videoUrl]);

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
          onClick={() => {
            console.log("DEBUG: Next button clicked");
            if (previewUrl) {
              console.log("DEBUG: Navigating to:", `/mlm/watch-earn/upload?url=${encodeURIComponent(previewUrl)}`);
              router.push(`/mlm/watch-earn/upload?url=${encodeURIComponent(previewUrl)}`);
            } else {
              console.warn("DEBUG: Next button clicked but previewUrl is null. State:", { previewUrl, recordedBlob });
            }
          }}
          disabled={!previewUrl}
          className={`px-4 py-2 rounded-full font-bold text-sm ${previewUrl ? 'bg-pink-600' : 'bg-gray-600'}`}
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
