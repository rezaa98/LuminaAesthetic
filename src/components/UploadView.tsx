import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Camera, X, CircleDot } from 'lucide-react';

interface UploadViewProps {
  onUpload: (file: File | null) => void;
}

export function UploadView({ onUpload }: UploadViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setIsCameraOpen(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Tidak dapat mengakses kamera. Pastikan Anda telah memberikan izin.");
    }
  };

  useEffect(() => {
    if (isCameraOpen && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [isCameraOpen, stream]);

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
            stopCamera();
            onUpload(file);
          }
        }, 'image/jpeg');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center relative">
      {isCameraOpen ? (
        <div className="absolute inset-0 z-20 bg-black flex flex-col rounded-xl overflow-hidden">
          <div className="absolute top-4 right-4 z-30">
            <button onClick={stopCamera} className="w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 backdrop-blur-md">
              <X size={20} />
            </button>
          </div>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
            onLoadedMetadata={() => videoRef.current?.play()}
          />
          <div className="absolute bottom-6 left-0 right-0 flex justify-center">
            <button 
              onClick={capturePhoto}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-slate-300 hover:scale-105 transition-transform"
            >
              <CircleDot className="text-pink-500" size={32} />
            </button>
          </div>
        </div>
      ) : null}

      <div 
        className={`w-full flex-1 min-h-[300px] rounded-xl border-2 border-dashed p-6 transition-colors duration-200 flex flex-col items-center justify-center gap-4 ${dragActive ? 'border-pink-400 bg-pink-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-pink-500 mb-2">
          <UploadCloud size={32} strokeWidth={1.5} />
        </div>
        <div className="text-center">
          <p className="text-slate-700 font-medium mb-1">Unggah foto atau buka kamera</p>
          <p className="text-slate-400 text-xs">PNG, JPG up to 5MB</p>
        </div>
        
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 bg-pink-500 hover:bg-pink-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-lg shadow-pink-100 w-full"
          data-testid="btn-upload-photo"
        >
          Pilih Foto
        </button>
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileChange}
          data-testid="input-file-upload"
        />
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <button 
          onClick={startCamera}
          className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-3 rounded-xl text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
          data-testid="btn-camera-capture"
        >
          <Camera size={18} className="text-slate-500" />
          Gunakan Kamera Sistem
        </button>
        <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest leading-relaxed mt-2">
          Privasi Terjamin &bull; Keamanan Tingkat Medis
        </p>
      </div>
    </div>
  );
}
