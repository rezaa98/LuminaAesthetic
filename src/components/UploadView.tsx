import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Camera, X, CircleDot } from 'lucide-react';
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
  const { lang, language } = useLanguage();

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
            className="w-full h-full object-cover"
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
            <div className="absolute top-16 left-4 right-4 text-center px-4 py-2.5 bg-slate-950/80 backdrop-blur-md rounded-xl border border-white/10 mx-6">
              <p className="text-[10px] font-black text-pink-400 tracking-wider uppercase mb-0.5 flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping"></span>
                {language === 'id' ? 'Kalibrasi Posisi Wajah' : 'Face Calibration Guide'}
              </p>
              <p className="text-[9.5px] text-slate-300 font-semibold leading-relaxed">
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
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-slate-300 hover:scale-105 transition-transform cursor-pointer"
            >
              <CircleDot className="text-pink-500" size={32} />
            </button>
          </div>
        </div>
      ) : null}

      <div 
        className={`w-full flex-1 min-h-[250px] rounded-xl border-2 border-dashed p-6 transition-colors duration-200 flex flex-col items-center justify-center gap-4 ${dragActive ? 'border-pink-400 bg-pink-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-pink-500">
          <UploadCloud size={28} strokeWidth={1.5} />
        </div>
        <div className="text-center">
          <p className="text-slate-700 font-bold text-xs mb-1">{lang.uploadTitle || 'Unggah foto atau buka kamera'}</p>
          <p className="text-slate-400 text-[10px]">PNG, JPG up to 5MB</p>
        </div>
        
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="mt-2 bg-pink-500 hover:bg-pink-600 text-white px-6 py-2.5 rounded-full text-xs font-bold transition-colors shadow-lg shadow-pink-100 w-full cursor-pointer"
          data-testid="btn-upload-photo"
        >
          {lang.browseText || 'Pilih Foto'}
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

      {/* Guidelines section under upload box */}
      <div className="mt-3.5 bg-[#eff6ff]/60 border border-blue-100 rounded-xl p-3.5 text-left animate-fade-in">
        <p className="text-[9.5px] font-black text-blue-800 uppercase tracking-widest mb-2 flex items-center gap-1.5 font-mono">
          <CircleDot className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
          {language === 'id' ? 'Pedoman Foto Presisi Estetika AI' : 'AI Precision Photo Guidelines'}
        </p>
        <ul className="text-[10.5px] text-slate-600 space-y-1.5 font-semibold list-decimal pl-3.5 leading-relaxed">
          <li>
            <strong className="text-slate-700">{language === 'id' ? 'Posisi Sejajar:' : 'Upright Alignment:'}</strong>{' '}
            {language === 'id' ? 'Tatap lurus ke kamera, sejajarkan wajah secara tegak dan horisontal.' : 'Look directly at the camera, keeping your face symmetric.'}
          </li>
          <li>
            <strong className="text-slate-700">{language === 'id' ? 'Pencahayaan Merata:' : 'Bright & Even Light:'}</strong>{' '}
            {language === 'id' ? 'Pastikan cahaya alami/ruangan cukup terang dan tidak berbayang sebelah.' : 'Use bright, glare-free environments to eliminate shadows.'}
          </li>
          <li>
            <strong className="text-slate-700">{language === 'id' ? 'Eskpresi Alami:' : 'Natural Expression:'}</strong>{' '}
            {language === 'id' ? 'Pertahankan raut wajah netral (jangan terlalu tersenyum lebar/cemberut).' : 'Maintain a neutral expression (no broad smiling or frowning).'}
          </li>
          <li>
            <strong className="text-slate-700">{language === 'id' ? 'Deteksi Jelas:' : 'Unobstructed Face:'}</strong>{' '}
            {language === 'id' ? 'Ikat atau singkirkan rambut dari dahi & lepas kacamata sementara waktu.' : 'Pull back hair to expose the forehead and remove glasses.'}
          </li>
        </ul>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <button 
          onClick={startCamera}
          className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-3 rounded-xl text-xs font-semibold transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          data-testid="btn-camera-capture"
        >
          <Camera size={16} className="text-slate-500" />
          {language === 'id' ? 'Gunakan Kamera Sistem' : 'Use System Camera'}
        </button>
        <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest leading-relaxed mt-2 font-semibold">
          {language === 'id' ? 'Privasi Terjamin \u2022 Keamanan Tingkat Medis' : 'Privacy Guaranteed \u2022 Medical Grade Security'}
        </p>
      </div>
    </div>
  );
}
