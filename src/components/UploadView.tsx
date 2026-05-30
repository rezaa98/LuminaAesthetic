import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Camera, X, CircleDot, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface UploadViewProps {
  onUpload: (file: File | null) => void;
}

export function UploadView({ onUpload }: UploadViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { lang, language } = useLanguage();

  const [isDetecting, setIsDetecting] = useState(false);

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
      alert(language === 'id' ? "Tidak dapat mengakses kamera. Pastikan Anda telah memberikan izin." : "Cannot access camera. Please ensure you have granted permission.");
    }
  };

  useEffect(() => {
    if (isCameraOpen && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [isCameraOpen, stream]);

  const capturePhoto = async () => {
    if (videoRef.current) {
      setIsDetecting(true);
      setErrorMessage(null);
      
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        setIsDetecting(false);
        return;
      }
      
      // Mirror the context so captured photo matches preview
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      
      ctx.drawImage(videoRef.current, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
          stopCamera();
          onUpload(file);
        }
        setIsDetecting(false);
      }, 'image/jpeg');
    }
  };

  const handleFileSelected = async (file: File) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      if (!file.type.startsWith('image/')) {
        const isId = language === 'id';
        setErrorMessage(isId ? 'Hanya file gambar yang didukung.' : 'Only image files are supported.');
        return;
      }
      
      const isId = language === 'id';
      setErrorMessage(isId ? 'Ukuran file melebihi 10MB. Sedang mengompresi gambar otomatis...' : 'File size exceeds 10MB. Auto-compressing image...');
      
      try {
        const compressedFile = await compressImage(file, maxSize);
        setErrorMessage(null);
        onUpload(compressedFile);
      } catch (err) {
        console.error("Compression failed:", err);
        setErrorMessage(isId ? 'Gagal mengompresi gambar. Silakan unggah file yang lebih kecil.' : 'Failed to compress image. Please upload a smaller file.');
      }
      return;
    }
    setErrorMessage(null);
    onUpload(file);
  };

  const compressImage = (file: File, maxSize: number): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Max dimensions logic to ensure size reduction
          const maxDimension = 2000;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            
            // Loop to compress further until size is less than maxSize or quality is too low
            let quality = 0.8;
            const checkSize = () => {
              canvas.toBlob((blob) => {
                if (!blob) {
                  reject(new Error("Blob creation failed"));
                  return;
                }
                if (blob.size < maxSize || quality < 0.2) {
                  resolve(new File([blob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                  }));
                } else {
                  quality -= 0.15;
                  checkSize();
                }
              }, 'image/jpeg', quality);
            };
            checkSize();
          } else {
            reject(new Error("Canvas context is null"));
          }
        };
        img.onerror = () => reject(new Error("Image load error"));
      };
      reader.onerror = () => reject(new Error("File read error"));
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
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
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-start md:justify-center gap-y-3 pt-1 md:pt-0 relative">
      <style>{`
        @keyframes scanEffect {
          0% { transform: translateY(-135px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(135px); opacity: 0; }
        }
        .animate-scan-custom {
          animation: scanEffect 3s linear infinite;
        }
      `}</style>

      {errorMessage && (
        <div id="file-size-error" className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl flex items-start gap-2.5 animate-fadeIn relative shadow-sm">
          <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={16} />
          <div className="flex-1 text-left min-w-0 pr-6">
            <h4 className="font-extrabold text-[9px] uppercase tracking-wider text-rose-900 mb-0.5">
              {language === 'id' ? 'Berkas Terlalu Besar' : 'File Too Large'}
            </h4>
            <p className="text-[9px] leading-relaxed font-semibold text-rose-700">
              {errorMessage}
            </p>
          </div>
          <button 
            type="button"
            onClick={() => setErrorMessage(null)} 
            className="absolute top-2 right-2 text-rose-400 hover:text-rose-600 transition-colors cursor-pointer"
            title={language === 'id' ? 'Tutup' : 'Close'}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {isCameraOpen ? (
        <div className="absolute inset-0 z-20 bg-black flex flex-col rounded-xl overflow-hidden">
          <div className="absolute top-4 right-4 z-30">
            <button onClick={stopCamera} className="w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 backdrop-blur-md cursor-pointer">
              <X size={20} />
            </button>
          </div>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover -scale-x-100"
            onLoadedMetadata={() => videoRef.current?.play()}
          />

          {/* Face Alignment Guideline Oval Overlay */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-25">
            {/* Silhouette outline */}
            <div className="w-[200px] h-[270px] sm:w-[230px] sm:h-[310px] rounded-[100px/140px] border-2 border-dashed border-pink-500/80 shadow-[0_0_20px_rgba(236,72,153,0.35)] relative flex items-center justify-center">
              {/* Glowing Scanning Line */}
              <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-pink-400 to-transparent shadow-[0_0_8px_rgba(236,72,153,0.7)] animate-scan-custom"></div>
              
              {/* Subtle facial alignment crosshair/dots */}
              <div className="absolute w-1.5 h-1.5 rounded-full bg-pink-500/50 top-1/4"></div>
              <div className="absolute w-1.5 h-1.5 rounded-full bg-pink-500/50 top-1/2"></div>
              <div className="absolute w-1.5 h-1.5 rounded-full bg-pink-500/50 bottom-1/4"></div>
              <div className="absolute w-10 h-0.5 bg-pink-500/20 left-1/2 -ml-5 top-1/2 -mt-0.5"></div>
              <div className="absolute h-10 w-0.5 bg-pink-500/20 left-1/2 -ml-0.5 top-1/2 -mt-5"></div>
            </div>

            {/* Instructions badge at the top overlay */}
            <div className="absolute top-4 left-4 right-16 text-center px-3 py-2 bg-slate-950/80 backdrop-blur-md rounded-xl border border-white/10">
              <p className="text-[10px] font-black text-pink-400 tracking-wider uppercase mb-0.5 flex items-center justify-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-pink-50 animate-ping"></span>
                {language === 'id' ? 'Kalibrasi Posisi Wajah' : 'Face Calibration Guide'}
              </p>
              <p className="text-[9px] text-slate-300 font-semibold leading-relaxed">
                {language === 'id' 
                  ? 'Paskan wajah di dalam garis putus-putus. Tatap tegak lurus ke depan dengan cahaya merata.' 
                  : 'Align your face within the dashed container. Look straight forward with even lighting.'}
              </p>
            </div>

            {/* Position Checkpoints Checklist overlay above the capture button */}
            <div className="absolute bottom-24 flex gap-3 text-[8.5px] font-bold text-white bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 uppercase tracking-widest font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                {language === 'id' ? 'Presisi' : 'Align'}
              </span>
              <span className="text-white/20">|</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                {language === 'id' ? 'Terang' : 'Bright'}
              </span>
              <span className="text-white/20">|</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                {language === 'id' ? 'Netral' : 'Neutral'}
              </span>
            </div>
          </div>

          <div className="absolute bottom-6 left-0 right-0 flex justify-center z-30">
            <button 
              onClick={capturePhoto}
              disabled={isDetecting}
              className={`w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-slate-300 transition-transform ${isDetecting ? 'opacity-80 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}`}
            >
              {isDetecting ? (
                <Loader2 className="text-pink-500 animate-spin" size={32} />
              ) : (
                <CircleDot className="text-pink-500" size={32} />
              )}
            </button>
          </div>
        </div>
      ) : null}

      {/* 1. PRIMARY: AI Camera Capture Card (Beautifully centered, elegant stack) */}
      <div 
        onClick={startCamera}
        className="w-full bg-[#fdf5f8] hover:bg-[#fcf1f5] rounded-xl border border-pink-200/50 p-4 text-center cursor-pointer transition-all duration-300 hover:shadow-sm flex flex-col items-center justify-center relative overflow-hidden"
      >
        {/* Compact Recommended Tag */}
        <div className="absolute top-2 right-2 bg-pink-500 text-white font-mono text-[7px] font-extrabold tracking-wider px-1.5 py-0.5 rounded uppercase">
          {language === 'id' ? 'Rekomendasi' : 'Recommend'}
        </div>

        <div className="w-10 h-10 rounded-xl bg-pink-500 text-white shadow-sm flex items-center justify-center mb-2.5 shrink-0">
          <Camera size={18} strokeWidth={2} />
        </div>

        <div className="max-w-[95%]">
          <h3 className="text-slate-800 font-bold text-xs mb-0.5 flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {language === 'id' ? 'Ambil Foto (Kamera AI Live)' : 'Take Photo (Live AI Camera)'}
          </h3>
          <p className="text-slate-500 text-[9.5px] leading-relaxed font-semibold">
            {language === 'id' 
              ? 'Gunakan kamera depan untuk memindai struktur wajah Anda secara instan dengan presisi estetika tinggi.' 
              : 'Scan face structure with front camera for instant and highly precise aesthetic results.'}
          </p>
        </div>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            startCamera();
          }}
          className="mt-2.5 bg-pink-600 hover:bg-pink-700 text-white px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all duration-150 transform active:scale-95 cursor-pointer flex items-center gap-1"
        >
          <Camera size={10} />
          {language === 'id' ? 'Buka Kamera' : 'Open Camera'}
        </button>
      </div>

      {/* Elegant Separator */}
      <div className="my-3 flex items-center justify-center uppercase tracking-widest text-slate-300 font-extrabold text-[7.5px] font-mono select-none px-4">
        <div className="flex-1 h-px bg-slate-100"></div>
        <span className="px-2 text-slate-400">{language === 'id' ? 'atau unggah berkas' : 'or upload file'}</span>
        <div className="flex-1 h-px bg-slate-100"></div>
      </div>

      {/* 2. SECONDARY: Gallery selection without extra 'Pilih File' button */}
      <div 
        className={`w-full rounded-xl border border-dashed transition-all duration-200 p-2.5 flex items-center gap-2.5 cursor-pointer hover:border-slate-350 ${dragActive ? 'border-pink-300 bg-pink-50/20' : 'border-slate-200 bg-slate-50/25 hover:bg-slate-100/20'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="w-7 h-7 rounded-lg bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
          <UploadCloud size={13} strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="text-slate-700 font-bold text-[10px]">
            {language === 'id' ? 'Pilih Gambar dari Galeri' : 'Pick Image from Gallery'}
          </p>
          <p className="text-slate-400 text-[8.5px] font-medium mt-0.5">
            PNG, JPG, HEIC up to 10MB
          </p>
        </div>
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileChange}
          data-testid="input-file-upload"
        />
      </div>

      <p className="text-[7.5px] text-slate-400 text-center uppercase tracking-wider mt-3.5 font-bold">
        {language === 'id' ? 'Kerahasiaan Privasi Diperlakukan Secara Profesional' : 'Patient Privacy Professionally Protected'}
      </p>
    </div>
  );
}
