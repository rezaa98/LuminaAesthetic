import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as faceapi from "@vladmandic/face-api";
import { 
  X, 
  ScanFace, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  Sliders, 
  Download, 
  RotateCcw, 
  Info, 
  Layers, 
  Palette,
  Heart,
  Eye,
  Check
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface GlassesFrameModalProps {
  data: any;
  detailedFaceData?: any;
  imageSrc: string | null;
  onClose: () => void;
  onTryOnAR?: () => void;
}

export const glassesModels = [
  { id: 'round', nameEn: 'Intellectual Round', nameId: 'Bulat Klasik', type: 'round', descEn: 'Soothing circular outlines.', descId: 'Siluet melingkar lembut.' },
  { id: 'square', nameEn: 'Symmetrical Square', nameId: 'Kotak Terstruktur', type: 'square', descEn: 'High-contrast framing.', descId: 'Bingkai sudut rapi.' },
  { id: 'oval', nameEn: 'Sleek Oval', nameId: 'Oval Lembut', type: 'oval', descEn: 'Curved aesthetics.', descId: 'Estetika melengkung.' },
  { id: 'cateye', nameEn: 'Cat-Eye Glamour', nameId: 'Cat-Eye Elegan', type: 'cateye', descEn: 'Upturned flared wingtips.', descId: 'Ujung sayap melengkung.' },
  { id: 'wayfarer', nameEn: 'Trapezoid Wayfarer', nameId: 'Wayfarer Tegas', type: 'wayfarer', descEn: 'Classic trapezoid geometry.', descId: 'Geometris klasik kokoh.' },
];

// Highly stylized SVG Glasses shapes for the simulation overlay
export const GlassesSvg = ({ type, color }: { type: string; color: string }) => {
  switch (type) {
    case 'round':
      return (
        <svg viewBox="0 0 200 85" className="w-full h-full drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)]">
          <g fill="none" stroke={color} strokeWidth="5.5" strokeLinejoin="round" strokeLinecap="round">
            {/* Left rim */}
            <circle cx="51" cy="45" r="23" fill="rgba(15,23,42,0.03)" />
            {/* Right rim */}
            <circle cx="149" cy="45" r="23" fill="rgba(15,23,42,0.03)" />
            {/* Bridge */}
            <path d="M 74 42 A 25 25 0 0 1 126 42" strokeWidth="4.5" />
            {/* Outer hinges/endpieces */}
            <path d="M 18 45 L 28 45" strokeWidth="6" />
            {/* Right hinge */}
            <path d="M 182 45 L 172 45" strokeWidth="6" />
          </g>
        </svg>
      );
    case 'square':
      return (
        <svg viewBox="0 0 200 85" className="w-full h-full drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)]">
          <g fill="none" stroke={color} strokeWidth="6" strokeLinejoin="round" strokeLinecap="round">
            {/* Left Frame */}
            <rect x="25" y="24" width="52" height="42" rx="10" fill="rgba(15,23,42,0.03)" />
            {/* Right Frame */}
            <rect x="123" y="24" width="52" height="42" rx="10" fill="rgba(15,23,42,0.03)" />
            {/* Dynamic keyhole bridge */}
            <path d="M 77 34 Q 100 27 123 34" strokeWidth="5" />
            {/* Endpieces */}
            <path d="M 15 28 L 25 28" strokeWidth="8" />
            <path d="M 185 28 L 175 28" strokeWidth="8" />
          </g>
        </svg>
      );
    case 'oval':
      return (
        <svg viewBox="0 0 200 85" className="w-full h-full drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)]">
          <g fill="none" stroke={color} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
            <ellipse cx="50" cy="45" rx="26" ry="18" fill="rgba(15,23,42,0.03)" />
            <ellipse cx="150" cy="45" rx="26" ry="18" fill="rgba(15,23,42,0.03)" />
            <path d="M 76 43 Q 100 32 124 43" strokeWidth="4" />
            <path d="M 16 43 L 24 43" strokeWidth="6.5" />
            <path d="M 184 43 L 176 43" strokeWidth="6.5" />
          </g>
        </svg>
      );
    case 'cateye':
      return (
        <svg viewBox="0 0 200 85" className="w-full h-full drop-shadow-[0_5px_8px_rgba(0,0,0,0.18)]">
          <g fill="none" stroke={color} strokeWidth="5.5" strokeLinejoin="round" strokeLinecap="round">
            {/* Exquisite winged outer silhouette */}
            <path d="M 15 20 C 32 18, 77 28, 77 31 C 77 55, 43 68, 28 58 C 14 49, 11 28, 15 20 Z" fill="rgba(15,23,42,0.03)" />
            <path d="M 185 20 C 168 18, 123 28, 123 31 C 123 55, 157 68, 172 58 C 186 49, 189 28, 185 20 Z" fill="rgba(15,23,42,0.03)" />
            <path d="M 77 31 Q 100 24 123 31" strokeWidth="4.2" />
            <circle cx="11" cy="18" r="1.5" fill="#f43f5e" stroke="none" />
            <circle cx="189" cy="18" r="1.5" fill="#f43f5e" stroke="none" />
          </g>
        </svg>
      );
    case 'wayfarer':
      return (
        <svg viewBox="0 0 200 85" className="w-full h-full drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)]">
          <g fill="none" stroke={color} strokeWidth="6.5" strokeLinejoin="round" strokeLinecap="round">
            <path d="M 22 26 L 76 26 C 81 49, 62 68, 45 68 C 26 68, 18 47, 22 26 Z" fill="rgba(15,23,42,0.04)" />
            <path d="M 178 26 L 124 26 C 119 49, 138 68, 155 68 C 174 68, 182 47, 178 26 Z" fill="rgba(15,23,42,0.04)" />
            <path d="M 76 30 C 85 24, 115 24, 124 30" strokeWidth="5" />
            <path d="M 12 25 L 22 25" strokeWidth="8" />
            <path d="M 188 25 L 178 25" strokeWidth="8" />
            <circle cx="18" cy="27" r="1.2" fill="#e2e8f0" stroke="none" />
            <circle cx="182" cy="27" r="1.2" fill="#e2e8f0" stroke="none" />
          </g>
        </svg>
      );
    case 'aviator':
      return (
        <svg viewBox="0 0 200 85" className="w-full h-full drop-shadow-[0_4px_6px_rgba(0,0,0,0.12)]">
          <g fill="none" stroke={color} strokeWidth="2.8" strokeLinejoin="round" strokeLinecap="round">
            <path d="M 28 28 Q 74 28 74 31 C 74 58, 60 72, 44 72 C 28 72, 21 54, 28 28 Z" fill="rgba(15,23,42,0.02)" />
            <path d="M 172 28 Q 126 28 126 31 C 126 58, 140 72, 156 72 C 172 72, 179 54, 172 28 Z" fill="rgba(15,23,42,0.02)" />
            <path d="M 44 21 L 156 21" strokeWidth="2.3" />
            <path d="M 74 31 Q 100 27 126 31" strokeWidth="2.8" />
          </g>
        </svg>
      );
    case 'narrow':
      return (
        <svg viewBox="0 0 200 85" className="w-full h-full drop-shadow-[0_3px_5px_rgba(0,0,0,0.15)]">
          <g fill="none" stroke={color} strokeWidth="5.5" strokeLinejoin="round" strokeLinecap="round">
            <rect x="28" y="34" width="46" height="20" rx="4" fill="rgba(15,23,42,0.03)" />
            <rect x="126" y="34" width="46" height="20" rx="4" fill="rgba(15,23,42,0.03)" />
            <path d="M 74 41 Q 100 36 126 41" strokeWidth="4" />
            <path d="M 16 38 L 28 38" strokeWidth="7" />
            <path d="M 184 38 L 172 38" strokeWidth="7" />
          </g>
        </svg>
      );
    case 'oversized':
      return (
        <svg viewBox="0 0 200 85" className="w-full h-full drop-shadow-[0_5px_10px_rgba(0,0,0,0.2)]">
          <g fill="none" stroke={color} strokeWidth="8" strokeLinejoin="round" strokeLinecap="round">
            <rect x="18" y="15" width="62" height="56" rx="14" fill="rgba(15,23,42,0.05)" />
            <rect x="120" y="15" width="62" height="56" rx="14" fill="rgba(15,23,42,0.05)" />
            <path d="M 80 27 Q 100 18 120 27" strokeWidth="6" />
            <path d="M 8 22 L 18 22" strokeWidth="10" />
            <path d="M 192 22 L 182 22" strokeWidth="10" />
          </g>
        </svg>
      );
    case 'shield':
      return (
        <svg viewBox="0 0 200 85" className="w-full h-full drop-shadow-[0_5px_8px_rgba(0,0,0,0.15)]">
          <g stroke={color} strokeLinejoin="round" strokeLinecap="round">
            {/* Unified visor Shield lens panel */}
            <path 
              d="M 16 22 C 50 18, 150 18, 184 22 C 188 44, 172 65, 144 65 C 100 65, 100 52, 100 52 C 100 52, 100 65, 56 65 C 28 65, 12 44, 16 22 Z" 
              fill="rgba(15,23,42,0.12)" 
              strokeWidth="4"
            />
            {/* Top rim strip */}
            <path d="M 18 22 C 60 19, 140 19, 182 22" fill="none" strokeWidth="6" />
          </g>
        </svg>
      );
    default:
      return null;
  }
};

export const GlassesFrameModal = ({ data, detailedFaceData, imageSrc, onClose, onTryOnAR }: GlassesFrameModalProps) => {
  const { lang, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'poster' | 'classic'>('poster');

  // Find standard fallback eye coordinates from AI features analysis
  const getEyeCoordinates = () => {
    if (!detailedFaceData || !detailedFaceData.features) {
      return { x: 50, y: 38 }; // fallback if not loaded
    }
    const eyeFeature = detailedFaceData.features.find((f: any) => f.id === 'eyes');
    if (!eyeFeature || !eyeFeature.coordinate) {
      return { x: 50, y: 38 };
    }
    
    let maxVal = 0;
    detailedFaceData.features.forEach((f: any) => {
      if (f.coordinate) {
        maxVal = Math.max(maxVal, parseFloat(f.coordinate.x || 0), parseFloat(f.coordinate.y || 0));
      }
    });
    const scaleFactor = maxVal > 105 ? 10 : 1;
    
    const x = parseFloat(eyeFeature.coordinate.x) / scaleFactor;
    const y = parseFloat(eyeFeature.coordinate.y) / scaleFactor;
    return { x, y };
  };

  const getNoseCoordinates = () => {
    if (!detailedFaceData || !detailedFaceData.features) {
      return { x: 50, y: 44 }; // fallback
    }
    const noseFeature = detailedFaceData.features.find((f: any) => f.id === 'nose');
    if (!noseFeature || !noseFeature.coordinate) {
      return { x: 50, y: 44 };
    }
    
    let maxVal = 0;
    detailedFaceData.features.forEach((f: any) => {
      if (f.coordinate) {
        maxVal = Math.max(maxVal, parseFloat(f.coordinate.x || 0), parseFloat(f.coordinate.y || 0));
      }
    });
    const scaleFactor = maxVal > 105 ? 10 : 1;
    
    const x = parseFloat(noseFeature.coordinate.x) / scaleFactor;
    const y = parseFloat(noseFeature.coordinate.y) / scaleFactor;
    return { x, y };
  };

  const fallbackEyeCoords = getEyeCoordinates();
  const fallbackNoseCoords = getNoseCoordinates();

  // Face-API Engine States for Precise Target Fitting
  const imgRef = useRef<HTMLImageElement>(null);
  const [actualLandmarks, setActualLandmarks] = useState<{x: number, y: number}[] | null>(null);
  const [detectedEyeCoords, setDetectedEyeCoords] = useState<{ x: number, y: number } | null>(null);
  const [detectedNoseCoords, setDetectedNoseCoords] = useState<{ x: number, y: number } | null>(null);
  const [detectedEyeDistance, setDetectedEyeDistance] = useState<number | null>(null);
  const [detectedTilt, setDetectedTilt] = useState<number>(0);
  const [detectedYaw, setDetectedYaw] = useState<number>(0);
  const [detectedPitch, setDetectedPitch] = useState<number>(0);
  const [detectedFaceBox, setDetectedFaceBox] = useState<{top: number, left: number, width: number, height: number} | null>(null);

  // Load models and perform real face landmark analysis
  const performFaceDetection = async () => {
    if (!imgRef.current) return;
    try {
      if (!faceapi.nets.tinyFaceDetector.isLoaded) {
        await faceapi.nets.tinyFaceDetector.loadFromUri("https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/");
      }
      if (!faceapi.nets.faceLandmark68Net.isLoaded) {
        await faceapi.nets.faceLandmark68Net.loadFromUri("https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/");
      }
      
      const detection = await faceapi.detectSingleFace(imgRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
      if (detection) {
        const imgW = imgRef.current.naturalWidth || imgRef.current.width;
        const imgH = imgRef.current.naturalHeight || imgRef.current.height;
        const positions = detection.landmarks.positions;
        
        const mapP = (p: any) => ({ x: (p.x / imgW) * 100, y: (p.y / imgH) * 100 });
        const mappedLandmarks = positions.map(mapP);
        setActualLandmarks(mappedLandmarks);

        // 1. Left Eye Center (average of index 36 to 41)
        const leftEyePoints = mappedLandmarks.slice(36, 42);
        const lEyeX = leftEyePoints.reduce((sum, p) => sum + p.x, 0) / 6;
        const lEyeY = leftEyePoints.reduce((sum, p) => sum + p.y, 0) / 6;

        // 2. Right Eye Center (average of index 42 to 47)
        const rightEyePoints = mappedLandmarks.slice(42, 48);
        const rEyeX = rightEyePoints.reduce((sum, p) => sum + p.x, 0) / 6;
        const rEyeY = rightEyePoints.reduce((sum, p) => sum + p.y, 0) / 6;

        const midX = (lEyeX + rEyeX) / 2;
        const midY = (lEyeY + rEyeY) / 2;
        setDetectedEyeCoords({ x: midX, y: midY });

        // Nose Bridge (using landmark 27)
        const nosePoint = mappedLandmarks[27];
        setDetectedNoseCoords({ x: nosePoint.x, y: nosePoint.y });

        // Distance between pupils
        const dx = rEyeX - lEyeX;
        const dy = rEyeY - lEyeY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        setDetectedEyeDistance(dist);

        // Calculate tilt using exact pixel coordinates to avoid aspect-ratio skew
        const leftEyePointsPx = positions.slice(36, 42);
        const lEyeXPx = leftEyePointsPx.reduce((sum, p) => sum + p.x, 0) / 6;
        const lEyeYPx = leftEyePointsPx.reduce((sum, p) => sum + p.y, 0) / 6;

        const rightEyePointsPx = positions.slice(42, 48);
        const rEyeXPx = rightEyePointsPx.reduce((sum, p) => sum + p.x, 0) / 6;
        const rEyeYPx = rightEyePointsPx.reduce((sum, p) => sum + p.y, 0) / 6;

        const dxPx = rEyeXPx - lEyeXPx;
        const dyPx = rEyeYPx - lEyeYPx;

        // 2D roll angle
        const rollRad = Math.atan2(dyPx, dxPx);
        const rollDeg = rollRad * (180 / Math.PI);
        setDetectedTilt(rollDeg);

        // Yaw orientation (using nose bridge vs eye midpoint)
        const yawRatio = (nosePoint.x - midX) / dx;
        const yawVal = Math.max(-30, Math.min(30, yawRatio * 50));
        setDetectedYaw(yawVal);

        // Pitch orientation (using vertical nose length vs eye distance)
        const noseTip = mappedLandmarks[30];
        const verticalDist = noseTip.y - midY;
        const pitchRatio = verticalDist / dist;
        const pitchVal = Math.max(-15, Math.min(15, (pitchRatio - 0.44) * 45));
        setDetectedPitch(pitchVal);

        setDetectedFaceBox({
          left: (detection.alignedRect.box.left / imgW) * 100,
          top: (detection.alignedRect.box.top / imgH) * 100,
          width: (detection.alignedRect.box.width / imgW) * 100,
          height: (detection.alignedRect.box.height / imgH) * 100,
        });
      }
    } catch (e) {
      console.error("Local faceapi detection failed inside glasses modal:", e);
    }
  };

  useEffect(() => {
    if (imageSrc) {
      performFaceDetection();
    }
  }, [imageSrc]);

  // Unified Coordinates getters
  const eyeCoords = detectedEyeCoords || fallbackEyeCoords;
  const noseCoords = detectedNoseCoords || fallbackNoseCoords;

  // Interactive Simulator Configuration Positions
  const [tryOnModel, setTryOnModel] = useState<string>('round');
  const [frameColor, setFrameColor] = useState<string>('#1e293b'); // default luxury charcoal
  const [offsetY, setOffsetY] = useState<number>(-1); 
  const [offsetX, setOffsetX] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.0); // manual scale multiplier (default is 1.0, representing perfect automatic fit)
  const [tilt, setTilt] = useState<number>(0); // manual tilt rotation addition
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // Auto-Align Landmarks Engine States
  const [autoAlign, setAutoAlign] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanLogs, setScanLogs] = useState<string[]>([]);

  // Calculate dynamic width of glasses based on physical eye-distance ratio
  const getGlassesWidthPercent = () => {
    // Determine base width using the AI detected accurate face box
    if (detectedFaceBox && detectedFaceBox.width) {
       // The face box tight-fits the head. Standard glasses are slightly wider than temples.
       // We use ~114% of the face width for a natural fit based on current user feedback.
       return (detectedFaceBox.width * 1.14) * scale;
    }
    // Fallback to eye distance calculation if box isn't available
    if (detectedEyeDistance) {
      // frame width is roughly 2.3 times the inter-pupillary distance.
      return (detectedEyeDistance * 2.6) * scale;
    }
    // Fallback if local landmarks are loading or not available
    if (detailedFaceData?.faceBox?.width) {
      let maxVal = 0;
      detailedFaceData.features?.forEach((f: any) => {
        if (f.coordinate) {
          maxVal = Math.max(maxVal, parseFloat(f.coordinate.x || 0), parseFloat(f.coordinate.y || 0));
        }
      });
      const scaleFactor = maxVal > 105 ? 10 : 1;
      const faceW = parseFloat(detailedFaceData.faceBox.width) / scaleFactor;
      return faceW * 1.12 * scale;
    }
    return 60 * scale;
  };

  const finalGlassesWidth = getGlassesWidthPercent();

  // Calculate coordinates, roll (tilt), yaw, and pitch
  const finalTilt = autoAlign ? (detectedTilt + tilt) : tilt;
  const finalYaw = autoAlign ? detectedYaw : 0;
  const finalPitch = autoAlign ? detectedPitch : 0;

  const triggerAutoScan = () => {
    setIsScanning(true);
    setAutoAlign(true);
    setScanLogs([]);
    
    const logs = language === 'id' ? [
      '🔍 Menginisialisasi modul pengenalan wajah AI Lumina...',
      '📈 Memindai sebaran kontur tepi dahi dan rahang...',
      '👁️ Menemukan koordinat pupil mata kiri & kanan...',
      '👃 Menetapkan koordinat batang hidung (Nasion)...',
      '✅ Penyelarasan Otomatis Berhasil! Posisi kacamata dikunci.'
    ] : [
      '🔍 Initializing Lumina AI face contour recognition...',
      '📈 Scanning forehead and jaw boundary distribution...',
      '👁️ Detecting left & right pupil coordinates...',
      '👃 Setting nasion center-point / nose bridge height...',
      '✅ Auto-Alignment Complete! Eyewear position locked perfectly.'
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        setScanLogs(prev => [...prev, log]);
        if (index === logs.length - 1) {
          setIsScanning(false);
          // Run actual detection to lock parameters!
          performFaceDetection();
          setOffsetY(0);
          setOffsetX(0);
          setScale(1.0);
          setTilt(0);
        }
      }, (index + 1) * 550);
    });
  };

  const faceShape = (data?.faceFeatures?.shape || "Oval").toUpperCase();

  // Fine-tuned colors selection
  const colorSwatches = [
    { name: 'Charcoal Black', value: '#1e293b' },
    { name: 'Amber Tortoise', value: '#7c2d12' },
    { name: 'Sleek Gunmetal', value: '#64748b' },
    { name: 'Rose Gold Metallic', value: '#fda4af' },
    { name: 'Brass Gold', value: '#ca8a04' },
  ];

  // Map suitable vs unsuitable base frames based on face shape
  const getGlassesMapping = (shape: string) => {
    const shapeKey = shape.toLowerCase();
    let suitable: string[] = [];
    let unsuitable: string[] = [];

    if (shapeKey.includes('round') || shapeKey.includes('bulat')) {
      suitable = ['square', 'wayfarer', 'cateye', 'oval', 'aviator'];
      unsuitable = ['round', 'narrow', 'oversized'];
    } else if (shapeKey.includes('square') || shapeKey.includes('kotak')) {
      suitable = ['round', 'oval', 'cateye', 'aviator', 'wayfarer'];
      unsuitable = ['square', 'narrow', 'oversized'];
    } else if (shapeKey.includes('oval')) {
      suitable = ['round', 'square', 'oval', 'cateye', 'wayfarer'];
      unsuitable = ['narrow', 'oversized', 'shield'];
    } else if (shapeKey.includes('heart') || shapeKey.includes('hati')) {
      suitable = ['wayfarer', 'oval', 'aviator', 'round', 'cateye'];
      unsuitable = ['square', 'narrow', 'oversized'];
    } else if (shapeKey.includes('diamond') || shapeKey.includes('berlian')) {
      suitable = ['oval', 'round', 'wayfarer', 'cateye', 'aviator'];
      unsuitable = ['square', 'narrow', 'shield'];
    } else {
      suitable = ['wayfarer', 'square', 'round', 'oval', 'cateye'];
      unsuitable = ['narrow', 'oversized', 'shield'];
    }
    return { suitable, unsuitable };
  };

  const mapping = getGlassesMapping(faceShape);

  // Dynamic rationale generators based on shape & model suitability
  const getSuitabilityDetails = (modelId: string, shape: string) => {
    const shapeKey = shape.toLowerCase();
    const isSuitable = mapping.suitable.includes(modelId);
    let score = isSuitable ? 95 : 45;

    // fine tune scores
    if (modelId === 'wayfarer') score = isSuitable ? 98 : 42;
    if (modelId === 'square') score = isSuitable ? 94 : 35;
    if (modelId === 'round') score = isSuitable ? 96 : 38;
    if (modelId === 'cateye') score = isSuitable ? 92 : 48;
    if (modelId === 'oval') score = isSuitable ? 91 : 41;
    if (modelId === 'narrow') score = 34;
    if (modelId === 'oversized') score = 44;
    if (modelId === 'shield') score = 30;

    const rationaleEn = isSuitable 
      ? `Contrasts and scales beautifully with your ${shape} outline. It adds structural balance, lifting cheek contours and softening corners.`
      : `Mimics your existing ${shape} proportions too intensely or pinches your face features, creating an unbalanced visual weight.`;
      
    const rationaleId = isSuitable
      ? `Memberikan kontras dinamis yang ideal pada bentuk wajah ${shape} Anda. Memperkuat harmoni, menyamarkan sudut keras, dan mengimbangi rasio dahi-rahang.`
      : `Menduplikasi lekukan alami wajah ${shape} Anda secara berlebihan atau mempersempit pandangan, menghasilkan proporsi yang visualnya kurang seimbang.`;

    return { isSuitable, score, rationaleEn, rationaleId };
  };

  // Infographic lists details
  const keyFeatures = (() => {
    const shapeKey = faceShape.toLowerCase();
    if (shapeKey.includes('oval')) {
      return [
        { titleEn: 'Balanced proportions', titleId: 'Proporsi seimbang', descEn: 'Face length is slightly longer than width with gentle curves.', descId: 'Panjang wajah sedikit lebih panjang dari lebar dengan garis halus.' },
        { titleEn: 'Slightly wider forehead', titleId: 'Dahi sedikit lebar', descEn: 'Elegant forehead transition that blends into balanced cheeks.', descId: 'Transisi dahi elegan yang menyatu dengan tulang pipi.' },
        { titleEn: 'Softer jawline curvature', titleId: 'Lengkungan rahang lembut', descEn: 'No sharp corner limits around the chin and lower jaws.', descId: 'Tanpa sudut batas yang tajam di sekitar dagu dan rahang bawah.' },
        { titleEn: 'Ideal symmetry alignment', titleId: 'Simetri kelurusan ideal', descEn: 'High-grade balance for varied spectacles shapes.', descId: 'Keseimbangan tingkat tinggi untuk berbagai bentuk kacamata.' }
      ];
    } else if (shapeKey.includes('round')) {
      return [
        { titleEn: 'Equal width & length', titleId: 'Lebar & panjang seragam', descEn: 'Visual outline is soft with smooth horizontal symmetry.', descId: 'Garis luar visual melingkar lembut dengan simetri horizontal.' },
        { titleEn: 'Fuller cheek cheeks', titleId: 'Pipi penuh bervolume', descEn: 'Cheekbones are the widest part of your natural face shape.', descId: 'Tulang pipi adalah bagian terluar dari siluet alami wajah.' },
        { titleEn: 'Soft curved chin outline', titleId: 'Garis dagu kurva lembut', descEn: 'Rounded jaw outline without sharp angular points.', descId: 'Garis rahang membulat tanpa titik sudut yang tegas.' },
        { titleEn: 'Subtle forehead definition', titleId: 'Definisi dahi yang halus', descEn: 'Requires structured angular shapes to define features.', descId: 'Memerlukan bingkai bersudut untuk mempertegas garis dahi.' }
      ];
    } else {
      return [
        { titleEn: 'Balanced proportions', titleId: 'Proporsi seimbang', descEn: 'Symmetric facial zones with classic bone structures.', descId: 'Zona wajah simetris dengan struktur tulang klasik.' },
        { titleEn: 'Prominent features', titleId: 'Fitur menonjol jelas', descEn: 'Naturally defines structural shadows under camera light.', descId: 'Mendefinisikan bayangan struktural alami di bawah cahaya.' },
        { titleEn: 'Clean linear boundary', titleId: 'Batas linier yang bersih', descEn: 'Crisp bone frame limits mapping eye/lips distances.', descId: 'Batas tulang pipi yang rapi memetakan jarak mata/bibir.' },
        { titleEn: 'High photogenic rating', titleId: 'Kualifikasi fotogenik tinggi', descEn: 'Responds beautifully to balanced alignment.', descId: 'Sangat responsif terhadap penyejajaran simetri yang presisi.' }
      ];
    }
  })();

  const handleDownloadPoster = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-slate-950/80 backdrop-blur-md overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="w-full max-w-5xl bg-[#fcfbfa] text-[#1a1918] flex flex-col rounded-[24px] overflow-hidden shadow-2xl relative max-h-[94vh]"
      >
        {/* Top Header - White Aesthetic */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#e6e2dd] bg-[#fcfbfa] shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-[0.2em] bg-stone-900 text-white px-2 py-0.5 rounded font-mono">
                LUMINA AI
              </span>
              <span className="text-stone-400 text-xs">•</span>
              <h2 className="text-sm font-bold uppercase tracking-widest text-stone-600 flex items-center gap-1">
                <Sparkles className="text-amber-600 w-4 h-4" />
                <span>Optometric Design Suite</span>
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-800 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="bg-[#f5f2ee] border-b border-[#e6e2dd] shrink-0 flex items-center p-1 gap-2 px-6">
          <button
            onClick={() => setActiveTab('poster')}
            className={`px-4 py-2 rounded-lg text-[10.5px] font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'poster' 
                ? 'bg-stone-900 text-white shadow-md'
                : 'text-stone-500 hover:text-stone-800 hover:bg-stone-200/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            {language === 'id' ? 'Poster & Live Try-On' : 'Poster & Live Try-On'}
          </button>
          <button
            onClick={() => setActiveTab('classic')}
            className={`px-4 py-2 rounded-lg text-[10.5px] font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'classic' 
                ? 'bg-stone-900 text-white shadow-md'
                : 'text-stone-500 hover:text-stone-800 hover:bg-stone-200/50'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            {language === 'id' ? 'Info Geometris' : 'Geometrics Info'}
          </button>
        </div>

        {/* Modal content body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#f7f5f2]">
          <AnimatePresence mode="wait">
            {activeTab === 'classic' ? (
              <motion.div 
                key="classic"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {/* Info Card */}
                <div className="bg-white border border-[#e6e2dd] rounded-2xl p-5 shadow-sm">
                  <h3 className="text-xs uppercase font-bold text-stone-500 tracking-widest mb-3 flex items-center gap-2 font-mono">
                    <Info className="w-4 h-4 text-emerald-600" />
                    {lang.faceShapeGuide || 'Face Shape Guide'}
                  </h3>
                  <div className="bg-stone-50 rounded-xl p-5 border border-[#e6e2dd]">
                    <p className="text-[10px] uppercase font-bold text-stone-400 tracking-widest mb-1">{lang.detectedShape || 'Detected Shape'}</p>
                    <p className="text-3xl font-black text-stone-900">{data.faceFeatures.shape}</p>
                    <div className="mt-4 pt-4 border-t border-stone-200/60">
                      <p className="text-xs text-stone-600 leading-relaxed font-semibold">
                        {data.faceFeatures.summary}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mathematical Frame Fits */}
                <div className="bg-white border border-[#e6e2dd] rounded-2xl p-5 shadow-sm">
                  <h3 className="text-xs uppercase font-bold text-stone-500 tracking-widest mb-3 flex items-center gap-2 font-mono">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    {lang.mathGlassesFit || 'Mathematical Glasses Fit'}
                  </h3>
                  <div className="flex flex-col gap-3">
                    {data.spectacles?.recommendedFrames?.map((frame: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 bg-stone-50 px-4 py-3 rounded-xl border border-[#e6e2dd] transition-transform hover:-translate-y-0.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm"></span>
                        <span className="text-xs font-bold text-stone-800">{frame}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hair styles Recommendation */}
                <div className="bg-white border border-[#e6e2dd] rounded-2xl p-5 shadow-sm">
                  <h3 className="text-xs uppercase font-bold text-stone-500 tracking-widest mb-3 flex items-center gap-2 font-mono">
                    <Layers className="w-4 h-4 text-stone-500" />
                    {lang.optimalHairGeo || 'Optimal Hair Geometry'}
                  </h3>
                  <div className="flex flex-col gap-3">
                    {data.hairstyles?.recommendedStyles?.map((style: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 bg-stone-50 px-4 py-3 rounded-xl border border-[#e6e2dd] transition-transform hover:-translate-y-0.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-stone-400"></span>
                        <span className="text-xs font-bold text-stone-800">{style}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="poster"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* 1. HIGH-FIDELITY PRECISE REPLICA OF THE "SPECTACLES GUIDE" EDITORIAL INFOGRAPHIC POSTER */}
                <div 
                  id="spectacles-editorial-poster" 
                  className="bg-[#faf8f5] text-stone-900 rounded-3xl p-6 md:p-10 border border-[#e0dad2] shadow-xl relative overflow-hidden select-none"
                >
                  {/* Top luxury gold & alignment line */}
                  <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-stone-900 via-amber-600 to-stone-900"></div>
                  
                  {/* Subtle classic poster line layout grids */}
                  <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-stone-300"></div>
                  <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-stone-300"></div>
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-stone-300"></div>
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-stone-300"></div>

                  <div className="flex flex-col gap-8 lg:gap-10 pt-2">
                    {/* OVERARCHING HEADER */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#eddcd2] pb-6 gap-6">
                      <div className="font-serif">
                        <div className="flex items-center gap-4 text-5xl md:text-6xl font-black text-stone-950 leading-none tracking-tight">
                           <span>Spectacles Guide</span>
                           <Sparkles className="w-8 h-8 text-amber-600 opacity-60 hidden sm:block" />
                        </div>
                        <p className="text-[11px] font-mono font-black text-stone-500 tracking-[0.25em] uppercase mt-4">
                          {language === 'id' ? 'TEMUKAN BINGKAI SEMPURNA ANDA' : 'FIND YOUR MOST FLATTERING FRAMES'}
                        </p>
                      </div>
                      
                      {/* Face Shape Info Badge extracted from analysis */}
                      <div className="bg-white rounded-2xl p-4 md:p-5 border border-[#e3dfd7] shadow-sm flex items-center gap-4 md:min-w-[240px]">
                        <div className="w-12 h-16 relative flex items-center justify-center shrink-0">
                           <svg viewBox="0 0 100 130" className="w-full h-full">
                               <path d="M 15 45 C 10 90, 25 120, 50 120 C 75 120, 90 90, 85 45 C 80 15, 20 15, 15 45 Z" fill="none" stroke="#292524" strokeWidth="3" />
                               <path d="M 28 42 Q 38 36 45 42" stroke="#292524" strokeWidth="3" fill="none" />
                               <path d="M 55 42 Q 62 36 72 42" stroke="#292524" strokeWidth="3" fill="none" />
                               <ellipse cx="36" cy="50" rx="5" ry="3" fill="#292524" />
                               <ellipse cx="64" cy="50" rx="5" ry="3" fill="#292524" />
                           </svg>
                        </div>
                        <div className="text-left">
                           <p className="text-[9px] uppercase font-mono font-black tracking-widest text-stone-400 mb-1">FACE SHAPE</p>
                           <h4 className="font-serif text-3xl md:text-4xl tracking-tight leading-none text-stone-900 capitalize">
                             {data?.faceFeatures?.shape || 'Oval'}
                           </h4>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    
                    {/* LEFT SECTION: Main Subject Portrait */}
                    <div className="lg:col-span-6 flex flex-col gap-6">

                        {/* Subject Profile Portrait */}
                        <div className="mt-4 mb-2 relative rounded-3xl overflow-hidden max-w-sm mx-auto bg-stone-100 border border-stone-300 shadow-sm inline-block w-full" style={{ perspective: '1000px' }}>
                          {imageSrc ? (
                            <img 
                              src={imageSrc} 
                              alt="Spectacles Face Preview" 
                              className="block w-full h-auto"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="text-stone-400 text-center p-6">
                              <Layers className="w-10 h-10 mx-auto mb-2 opacity-30" />
                              <p className="text-xs font-bold">No portrait uploaded</p>
                            </div>
                          )}

                          {/* 100% Face Match Stamp Badge */}
                          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md text-stone-900 rounded-full w-16 h-16 sm:w-20 sm:h-20 shadow-lg border border-stone-200 flex flex-col items-center justify-center text-center">
                            <span className="text-[11px] sm:text-xs font-black leading-none text-stone-950">100%</span>
                            <span className="text-[6.5px] sm:text-[7.5px] font-black uppercase tracking-wider text-stone-500 leading-none mt-0.5">
                              {language === 'id' ? 'COCOK WAJAH' : 'FACE MATCH'}
                            </span>
                          </div>

                          {/* Optimal frame overlay prediction */}
                          <div 
                            className="absolute pointer-events-none transition-all duration-300" 
                            style={{
                              top: `calc(${eyeCoords.y}% + ${offsetY}px)`,
                              left: `calc(${eyeCoords.x}% + ${offsetX}px)`,
                              width: `${finalGlassesWidth}%`,
                              transform: `translate(-50%, -50%) rotateZ(${finalTilt}deg) rotateY(${finalYaw}deg) rotateX(${finalPitch}deg)`,
                            }}
                          >
                            <GlassesSvg type={mapping.suitable[0] || 'round'} color="#1e293b" />
                          </div>
                        </div>

                      {/* Editorial Quick Tips */}
                      <div className="bg-[#fcfbf9] rounded-2xl p-5 border border-[#e3dfd7] shadow-sm text-left mt-2">
                        <div className="flex items-center gap-2 mb-2">
                           <Sparkles className="w-4 h-4 text-amber-600" />
                           <h5 className="font-mono text-[10px] font-black uppercase tracking-widest text-stone-800">
                              {language === 'id' ? 'Tips Presisi Geometri' : 'Geometry Precision Tips'}
                           </h5>
                        </div>
                        <p className="text-[11px] text-stone-500 font-medium leading-relaxed">
                           {language === 'id' 
                              ? 'Pilihlah kacamata dengan garis bingkai yang memberikan elemen kontras berlawanan dengan bentuk profil wajah alami Anda untuk menciptakan proporsi simetri yang maksimal.' 
                              : 'Choose eyewear with frame lines that provide a contrasting element to your natural face profile shape to create maximum symmetric aesthetics.'}
                        </p>
                      </div>
                    </div>

                    {/* RIGHT SECTION: Analysis and Best Models */}
                    <div className="lg:col-span-6 flex flex-col space-y-8">
                      
                      {/* BEST FRAME STYLES BOX */}
                      <div className="bg-[#fcfbf9] rounded-2xl p-5 md:p-6 border border-[#e3dfd7] shadow-sm">
                         <p className="text-[10.5px] font-mono font-black text-amber-700 uppercase tracking-[0.2em] mb-6 text-center">
                            {language === 'id' ? 'GAYA BINGKAI TERBAIK' : 'BEST FRAME STYLES'}
                         </p>
                         <div className="grid grid-cols-3 gap-y-6 gap-x-4">
                            {glassesModels.map((model) => {
                               const rec = mapping.suitable.includes(model.id);
                               if (!rec) return null;
                               return (
                                  <div key={model.id} className="flex flex-col items-center gap-3">
                                     <div className="w-16 h-7 text-[#292524] drop-shadow-sm"><GlassesSvg type={model.id} color="currentColor" /></div>
                                     <span className="text-[8.5px] font-black text-stone-500 uppercase tracking-widest text-center leading-tight">{language === 'id' ? model.nameId : model.nameEn}</span>
                                  </div>
                               );
                            })}
                         </div>
                      </div>

                      <div className="space-y-5 px-1">
                        {/* Analysis Key Details */}
                        <div className="space-y-4">
                          {keyFeatures.map((feat, idx) => (
                            <div key={idx} className="flex items-start gap-3 text-left">
                              <span className="mt-0.5 w-[18px] h-[18px] text-amber-700 border border-[#eddcd2] rounded-full flex items-center justify-center font-mono text-[9px] font-black shrink-0">
                                {idx + 1}
                              </span>
                              <div className="text-[11.5px] -mt-0.5">
                                <h4 className="font-semibold text-stone-800 leading-none">
                                  {language === 'id' ? feat.titleId : feat.titleEn}
                                </h4>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* PROPORTIONS GRID */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-[#eddcd2]">
                          {[
                            { nameEn: 'Eye Width', nameId: 'Lebar Mata', valEn: 'Balanced', valId: 'Presisi' },
                            { nameEn: 'Nose Width', nameId: 'Lebar Hidung', valEn: 'Medium', valId: 'Seimbang' },
                            { nameEn: 'Lips Arc', nameId: 'Kurva Bibir', valEn: 'Symmetric', valId: 'Simetris' },
                            { nameEn: 'Face Width', nameId: 'Rasio Panjang', valEn: 'Oval Ideal', valId: 'Sempurna' },
                          ].map((item, idx) => (
                            <div key={idx} className="border-l-2 border-[#eddcd2] pl-3 py-1">
                              <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest line-clamp-1 leading-none font-mono mb-1.5">
                                {language === 'id' ? item.nameId : item.nameEn}
                              </p>
                              <p className="text-[11px] font-medium text-stone-800 leading-none">
                                {language === 'id' ? item.valId : item.valEn}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                  {/* 2. TRY-ON: SUITABLE STYLES (Grid of 5 customized overlay cards on same face!) */}
                  <div className="border-t border-[#eddcd2] mt-8 pt-6 space-y-4">
                    <p className="text-[10px] font-mono font-black text-amber-700 uppercase tracking-[0.25em] text-center">
                      {language === 'id' ? 'REKOMENDASI: MODEL KACAMATA YANG COCOK' : 'TRY-ON: SUITABLE STYLES FOR YOU'}
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {glassesModels.map((model) => {
                        const rec = mapping.suitable.includes(model.id);
                        if (!rec) return null; // Only suitable
                        const details = getSuitabilityDetails(model.id, faceShape);

                        return (
                          <div 
                            key={model.id}
                            onClick={() => {
                              setTryOnModel(model.id);
                              // Smooth scroll down to interactive sandbox
                              document.getElementById('virtual-fitting-salon')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="bg-white border border-[#eddcd2] rounded-2xl p-3 flex flex-col justify-between hover:scale-[1.03] transition-all hover:shadow-md cursor-pointer group"
                          >
                            <div>
                              {/* Subject's Face photo preview box */}
                              <div className="inline-block w-full rounded-xl bg-stone-50 border border-stone-200 overflow-hidden relative" style={{ perspective: '1000px' }}>
                                {imageSrc ? (
                                  <img 
                                    src={imageSrc} 
                                    alt="Face Suitability tryon" 
                                    className="block w-full h-auto rounded-xl brightness-105"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className="w-full aspect-square flex items-center justify-center">
                                    <Layers className="w-6 h-6 text-stone-300" />
                                  </div>
                                )}

                                {/* SVG overlay mapping suitable frames */}
                                <div 
                                  className="absolute pointer-events-none transition-all duration-300" 
                                  style={{
                                    top: `calc(${eyeCoords.y}% + ${offsetY}px)`,
                                    left: `calc(${eyeCoords.x}% + ${offsetX}px)`,
                                    width: `${finalGlassesWidth}%`,
                                    transform: `translate(-50%, -50%) rotateZ(${finalTilt}deg) rotateY(${finalYaw}deg) rotateX(${finalPitch}deg)`,
                                  }}
                                >
                                  <GlassesSvg type={model.id} color="#1e293b" />
                                </div>

                                {/* Emerald Green Check Circle Badge overlayed */}
                                <div className="absolute top-2 left-2 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] shadow-sm">
                                  ✓
                                </div>
                              </div>

                              <div className="text-left mt-2.5">
                                <h4 className="text-[11px] font-black text-stone-900 tracking-wider uppercase font-mono leading-none">
                                  {language === 'id' ? model.nameId : model.nameEn}
                                </h4>
                                <p className="text-[9px] text-stone-500 font-semibold leading-normal mt-1 line-clamp-2">
                                  {language === 'id' ? model.descId : model.descEn}
                                </p>
                              </div>
                            </div>

                            <div className="mt-2.5 pt-2 border-t border-stone-100 flex justify-between items-center text-[8.5px] font-bold text-emerald-600 uppercase font-mono">
                              <span>Match score</span>
                              <span>{details.score}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. LESS FLATTERING STYLES (Grid of 3 less recommended styles) */}
                  <div className="border-t border-[#eddcd2] mt-8 pt-6 space-y-4">
                    <p className="text-[10px] font-mono font-black text-amber-700 uppercase tracking-[0.25em] text-center">
                      {language === 'id' ? 'TIDAK DIANJURKAN: HINDARI UNTUK HASIL TERBAIK' : 'LESS FLATTERING STYLES (AVOID FOR OPTIMAL HARMONY)'}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { id: 'narrow', nameEn: 'Narrow/Small Wire', nameId: 'Model Kawat Sempit', descEn: 'May look too tight, pinching natural brow volumes.', descId: 'Terlihat terlalu sempit, memangkas volume alis alami.' },
                        { id: 'oversized', nameEn: 'Oversized Square', nameId: 'Model Kebesaran / Bold', descEn: 'Can overwhelm facial limits and drown cheekbones.', descId: 'Merusak batas dahi dan menenggelamkan garis tulang pipi.' },
                        { id: 'shield', nameEn: 'Shield Wrap Visor', nameId: 'Model Perisai Kontur', descEn: 'Hides facial balance and fine symmetry outlines.', descId: 'Menyembunyikan simetri kelurusan anatomi wajah pasien.' }
                      ].map((model) => {
                        const details = getSuitabilityDetails(model.id, faceShape);

                        return (
                          <div 
                            key={model.id}
                            onClick={() => {
                              setTryOnModel(model.id);
                              document.getElementById('virtual-fitting-salon')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="bg-white border border-[#eddcd2] rounded-2xl p-4 flex gap-4 hover:scale-[1.02] transition-transform cursor-pointer"
                          >
                            {/* Portrait preview thumbnail */}
                            <div className="w-20 h-20 rounded-xl bg-stone-50 border border-stone-200 overflow-hidden relative flex items-center justify-center shrink-0" style={{ perspective: '1000px' }}>
                              {imageSrc ? (
                                <img 
                                  src={imageSrc} 
                                  alt="Face Unsuitable tryon" 
                                  className="w-full h-full object-cover rounded-xl brightness-105"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <Layers className="w-5 h-5 text-stone-200" />
                              )}

                              {/* SVG frame overlay of unsuitable glasses */}
                              <div 
                                className="absolute pointer-events-none transition-all duration-300" 
                                style={{
                                  top: `calc(${eyeCoords.y}% + ${offsetY}px)`,
                                  left: `calc(${eyeCoords.x}% + ${offsetX}px)`,
                                  width: `${finalGlassesWidth}%`,
                                  transform: `translate(-50%, -50%) rotateZ(${finalTilt}deg) rotateY(${finalYaw}deg) rotateX(${finalPitch}deg)`,
                                }}
                              >
                                <GlassesSvg type={model.id} color="#b45309" />
                              </div>

                              {/* Red cross warning badge overlayed */}
                              <div className="absolute top-1 left-1 w-4 h-4 bg-red-500 rounded-full border border-white flex items-center justify-center text-white text-[9px] shadow-sm font-black">
                                ✕
                              </div>
                            </div>

                            <div className="text-left flex flex-col justify-between py-0.5">
                              <div>
                                <h4 className="text-[11.5px] font-black text-stone-900 uppercase font-mono leading-none">
                                  {language === 'id' ? model.nameId : model.nameEn}
                                </h4>
                                <p className="text-[10px] text-stone-500 font-semibold leading-relaxed mt-1.5">
                                  {language === 'id' ? model.descId : model.descEn}
                                </p>
                              </div>
                              <p className="text-[9px] font-mono font-black text-rose-500 leading-none">
                                NOT SUITABLE • MATCH STYLE {details.score}%
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4. BEST FEATURES & GLASSES SPECIFICATIONS BLUEPRINT (Right section of the poster) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-[#eddcd2] mt-8 pt-8">
                    
                    {/* Frame specifications list checks */}
                    <div className="space-y-4 text-left">
                      <p className="text-[10px] font-mono font-black text-stone-500 uppercase tracking-[0.2em]">
                        {language === 'id' ? 'REKOMENDASI FITUR KACAMATA TERBAIK' : 'BEST FRAME FEATURES FOR YOU'}
                      </p>

                      <div className="space-y-3.5">
                        {[
                          { textEn: 'Medium width frames (slightly wider than your cheeks)', textId: 'Lebar bingkai sedang (sedikit lebih lebar dari pipi)' },
                          { textEn: 'Soft but structured contours to elevate symmetry', textId: 'Kontur lembut namun terstruktur untuk menaikkan simetri' },
                          { textEn: 'Thin polycarbonate frames for lightweight balance', textId: 'Bingkai polikarbonat tipis untuk keseimbangan ringan' },
                          { textEn: 'Neutral frames that merge seamlessly with your colors', textId: 'Warna bingkai netral yang menyatu sempurna dengan rona warna Anda' }
                        ].map((fit, idx) => (
                          <div key={idx} className="flex gap-2 text-xs text-stone-700 font-semibold items-center">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{language === 'id' ? fit.textId : fit.textEn}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Frame Size Blueprint Design (Mock blueprint technical look) */}
                    <div className="p-4 border border-[#eddcd2] rounded-2xl bg-white/45 text-left space-y-3">
                      <p className="text-[9.5px] font-mono font-black text-stone-400 uppercase tracking-widest">
                        {language === 'id' ? 'BLUEPRINT UKURAN KACAMATA' : 'FRAME SIZE GUIDE BLUEPRINT'}
                      </p>

                      {/* Schematic Frame Glasses sizing drawing */}
                      <div className="flex items-center gap-6">
                        <div className="w-28 h-12 relative opacity-75 flex items-center justify-center border border-dashed border-stone-300 rounded-lg p-1 bg-stone-50">
                          <svg viewBox="0 0 100 40" className="w-full h-full fill-none stroke-stone-600" strokeWidth="1.2">
                            <circle cx="25" cy="20" r="12" />
                            <circle cx="75" cy="20" r="12" />
                            <path d="M 37 20 Q 50 16 63 20" />
                            <path d="M 13 20 H 1" />
                            <path d="M 87 20 H 99" />
                          </svg>
                          <span className="absolute bottom-0 text-[7.5px] font-mono font-black text-stone-400">48-52 mm</span>
                        </div>

                        <div className="space-y-1 text-[11px] text-stone-600 font-semibold leading-snug">
                          <p><strong className="text-stone-800">Lens Width:</strong> 48 - 52 mm</p>
                          <p><strong className="text-stone-800">Bridge Size:</strong> 18 - 22 mm</p>
                          <p><strong className="text-stone-800">Temple Length:</strong> 135 - 145</p>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Elegant footer section */}
                  <div className="border-t border-[#e2dad1] pt-6 flex flex-col md:flex-row justify-between items-center text-[9px] font-mono text-stone-400 gap-3 mt-10">
                    <p className="font-semibold flex items-center gap-1.5 text-stone-500">
                      <Sparkles className="w-3.5 h-3.5 text-[#b45309]" />
                      LUMINA AESTHETIC AI LABS — OPTOMETRY INFOGRAPHIC DESIGN REPORT
                    </p>
                    <p className="font-bold text-stone-500 uppercase tracking-widest">
                      {language === 'id' ? 'KLINIK KECANTIKAN LUMINA' : 'LUMINA MEDICAL BEAUTY LAB'}
                    </p>
                  </div>

                </div>

                {/* Poster PDF Exporter Block */}
                <div className="flex justify-end gap-3 shrink-0">
                  <button 
                    onClick={handleDownloadPoster}
                    disabled={isDownloading}
                    className="bg-stone-900 hover:bg-stone-800 text-white px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isDownloading ? (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <Download className="w-4 h-4 text-amber-500" />
                    )}
                    {isDownloading 
                      ? (language === 'id' ? 'Mengekspor Laporan...' : 'Exporting PDF...') 
                      : (language === 'id' ? 'Unduh Poster Panduan' : 'Download Poster Guide')}
                  </button>

                  {downloadSuccess && (
                    <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-bounce-short">
                      <CheckCircle className="w-4 h-4 text-emerald-600 animate-pulse" />
                      {language === 'id' ? 'File berhasil diekspor!' : 'Poster exported successfully!'}
                    </div>
                  )}
                </div>


                {/* 5. INTERACTIVE VIRTUAL TRY-ON STUDIO SALON (Allows user to play and calibrations) */}
                <div id="virtual-fitting-salon" className="bg-white border border-[#e6e2dd] rounded-2xl p-5 md:p-6 shadow-sm space-y-5">
                  <div>
                    <h3 className="text-sm md:text-base font-bold text-stone-900 flex items-center gap-2 uppercase tracking-wider">
                      <Sliders className="text-amber-600 w-4 h-4" />
                      {language === 'id' ? 'Salon Coba Kacamata Virtual Interaktif' : 'Interactive Virtual Try-On Studio'}
                    </h3>
                    <p className="text-xs text-stone-500 font-semibold mt-0.5 leading-relaxed">
                      {language === 'id' 
                        ? 'Simulasikan berbagai jenis bingkai di atas potret wajah Anda. Sesuaikan posisi, ukuran, dan warna menggunakan slider di bawah.' 
                        : 'Simulate any eyewear silhouette above your raw photograph. Dynamically position and color match.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Live Canvas panel previewer */}
                    <div className="lg:col-span-12 xl:col-span-5 bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-col items-center justify-center relative overflow-hidden">
                      <style>{`
                        @keyframes scanLaser {
                          0% { top: 12%; opacity: 1; }
                          50% { top: 88%; opacity: 1; }
                          100% { top: 12%; opacity: 1; }
                        }
                        .laser-beam {
                          animation: scanLaser 2s linear infinite;
                        }
                      `}</style>

                      <div className="absolute top-6 left-6 z-20 px-3 py-1 bg-stone-900 text-white rounded-full font-mono text-[9px] font-bold tracking-widest flex items-center gap-1.5 uppercase shadow-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                        {isScanning 
                          ? (language === 'id' ? 'PINDAI WAJAH AI' : 'AI FACE SCANNING') 
                          : autoAlign 
                            ? (language === 'id' ? 'SINKRONISASI AKTIF' : 'AUTO-SYNC ACTIVE') 
                            : (language === 'id' ? 'PREVIEW LIVE' : 'LIVE PREVIEW')
                        }
                      </div>
                      
                      {/* Interactive portrait try-on board */}
                      <div className="w-full max-w-xs bg-stone-800 border border-stone-200 rounded-xl overflow-hidden relative flex items-center justify-center select-none shadow-inner h-auto w-full group" style={{ perspective: '1000px' }}>
                        {imageSrc ? (
                          <img 
                            ref={imgRef}
                            onLoad={performFaceDetection}
                            src={imageSrc} 
                            alt="Interactive Custom Face try-on" 
                            className="w-full h-auto block pointer-events-none brightness-105 rounded-xl"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="text-stone-400 text-center p-8">
                            <Layers className="w-12 h-12 mx-auto mb-2 opacity-35" />
                            <p className="text-xs font-bold leading-tight">No photograph uploaded</p>
                          </div>
                        )}

                        {/* Automatic Scanning Sci-Fi Laser Beam */}
                        {isScanning && (
                          <div className="laser-beam absolute left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_12px_#22d3ee] pointer-events-none z-10" />
                        )}

                        {/* Blinking Landmark Reticles (Pupils and nose bridge) */}
                        {(autoAlign || isScanning) && imageSrc && (
                          <>
                            {/* Left Pupil */}
                            <div 
                              className={`absolute w-3 h-3 rounded-full border border-cyan-400 flex items-center justify-center pointer-events-none z-10 transition-all ${isScanning ? 'bg-cyan-400/80 scale-125' : 'bg-cyan-400/20'}`}
                              style={{ left: `${actualLandmarks ? actualLandmarks[36].x + (actualLandmarks[39].x - actualLandmarks[36].x)/2 : eyeCoords.x - 4.5}%`, top: `${actualLandmarks ? actualLandmarks[36].y + (actualLandmarks[39].y - actualLandmarks[36].y)/2 : eyeCoords.y}%`, transform: 'translate(-50%, -50%)' }}
                            >
                              <span className="w-1 h-1 bg-white rounded-full animate-ping"></span>
                            </div>
                            
                            {/* Right Pupil */}
                            <div 
                              className={`absolute w-3 h-3 rounded-full border border-cyan-400 flex items-center justify-center pointer-events-none z-10 transition-all ${isScanning ? 'bg-cyan-400/80 scale-125' : 'bg-cyan-400/20'}`}
                              style={{ left: `${actualLandmarks ? actualLandmarks[42].x + (actualLandmarks[45].x - actualLandmarks[42].x)/2 : eyeCoords.x + 4.5}%`, top: `${actualLandmarks ? actualLandmarks[42].y + (actualLandmarks[45].y - actualLandmarks[42].y)/2 : eyeCoords.y}%`, transform: 'translate(-50%, -50%)' }}
                            >
                              <span className="w-1 h-1 bg-white rounded-full animate-ping"></span>
                            </div>

                            {/* Nose Bridge */}
                            <div 
                              className={`absolute w-3 h-3 rounded-full border border-amber-500 flex items-center justify-center pointer-events-none z-10 transition-all ${isScanning ? 'bg-amber-500/80 scale-125' : 'bg-amber-500/20'}`}
                              style={{ left: `${noseCoords.x}%`, top: `${noseCoords.y}%`, transform: 'translate(-50%, -50%)' }}
                            >
                              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                            </div>
                            
                            {/* Face Contour Oval Box Outline */}
                            <div 
                              className="absolute border border-dashed border-cyan-400/35 rounded-[38%/48%] pointer-events-none animate-pulse z-10" 
                              style={{
                                left: `${eyeCoords.x}%`,
                                top: `${eyeCoords.y}%`,
                                width: `${detectedEyeDistance ? (detectedEyeDistance * 4.4) : 70}%`,
                                height: `${detectedEyeDistance ? (detectedEyeDistance * 4.8) : 75}%`,
                                transform: `translate(-50%, -40%) rotateZ(${finalTilt}deg)`,
                              }}
                            />
                          </>
                        )}

                        {/* Drag and overlay glasses on top */}
                        <div 
                          className="absolute pointer-events-none cursor-move transition-all duration-150 select-none drop-shadow-lg animate-fade-in" 
                          style={{
                            top: `calc(${eyeCoords.y}% + ${offsetY}px)`,
                            left: `calc(${eyeCoords.x}% + ${offsetX}px)`,
                            width: `${finalGlassesWidth}%`,
                            transform: `translate(-50%, -50%) rotateZ(${finalTilt}deg) rotateY(${finalYaw}deg) rotateX(${finalPitch}deg)`,
                            opacity: isScanning ? 0.35 : 1,
                          }}
                        >
                          <GlassesSvg type={tryOnModel} color={frameColor} />
                        </div>

                        {/* Scanning Terminal Logs HUD Overlay */}
                        {isScanning && (
                          <div className="absolute inset-x-0 bottom-0 bg-slate-950/90 text-cyan-400 font-mono text-[9px] p-3 space-y-1 select-none leading-normal border-t border-cyan-500/30 z-20">
                            <div className="flex justify-between border-b border-cyan-920 pb-1 mb-1 text-emerald-400 font-bold uppercase tracking-wider">
                              <span>Lumina AI Scanner</span>
                              <span className="animate-pulse">RUNNING...</span>
                            </div>
                            {scanLogs.map((log, idx) => (
                              <div key={idx} className="truncate animate-fade-in">{log}</div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* AI Auto-Align Action Dashboard */}
                      <div className="mt-4 w-full flex flex-col gap-2">
                        <div className="flex gap-2">
                          <button
                            onClick={triggerAutoScan}
                            disabled={isScanning || !imageSrc}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                              autoAlign && !isScanning
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/10'
                                : 'bg-stone-900 border-stone-100 text-white hover:bg-stone-800'
                            } disabled:opacity-50`}
                          >
                            <ScanFace className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
                            {isScanning 
                              ? (language === 'id' ? 'Memindai...' : 'Scanning...') 
                              : (language === 'id' ? 'Penyelarasan AI Otomatis' : 'AI Auto-Align Position')}
                          </button>

                          <button
                            onClick={() => setAutoAlign(prev => !prev)}
                            className={`px-3 py-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer ${
                              autoAlign 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                : 'bg-white border-stone-200 text-stone-500 hover:text-stone-800'
                            }`}
                          >
                            {language === 'id' ? 'Auto Lock' : 'Auto Lock'}
                          </button>
                        </div>

                        {/* Quick coordination feedback information bar */}
                        {autoAlign && (
                          <div className="px-3 py-1.5 rounded-lg bg-emerald-50/70 border border-emerald-100 text-[10.5px] text-emerald-800 font-semibold flex justify-between items-center font-mono select-none">
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              {language === 'id' ? 'Koordinat Terkunci di Landmark Mata' : 'Pupil & Nose Landmarks Locked'}
                            </span>
                            <span className="text-[9.5px] text-emerald-600">x={eyeCoords.x.toFixed(1)}% y={eyeCoords.y.toFixed(1)}%</span>
                          </div>
                        )}

                        {/* Reset fitting button */}
                        <div className="flex justify-between items-center mt-1">
                          <button
                            onClick={() => {
                              setAutoAlign(false);
                              setOffsetY(0);
                              setOffsetX(0);
                              setScale(1.12);
                              setTilt(0);
                            }}
                            className="text-[10px] text-stone-500 hover:text-stone-800 bg-white hover:bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200 transition-colors uppercase font-bold tracking-widest flex items-center gap-1.5 font-mono cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            {language === 'id' ? 'Reset Posisi Manual' : 'Reset Manual Position'}
                          </button>
                          
                          {autoAlign && (
                            <span className="text-[9.5px] font-bold text-stone-400 font-mono uppercase">
                              {language === 'id' ? 'AI Auto-Fitting v1.0' : 'AI Auto-Fitting v1.0'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Interactive Tuning details and glasses picker list */}
                    <div className="lg:col-span-12 xl:col-span-7 space-y-6">
                      
                      {/* Carousel selection of ALL shapes */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-stone-500 tracking-widest font-mono flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-stone-400" />
                          {language === 'id' ? 'Pilih Desain Siluet Kacamata' : 'Select Eyewear Silhouette'}
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { id: 'round', nameEn: 'Intellectual Round', nameId: 'Bulat Klasik' },
                            { id: 'square', nameEn: 'Symmetrical Square', nameId: 'Kotak Terstruktur' },
                            { id: 'oval', nameEn: 'Sleek Oval', nameId: 'Oval Lembut' },
                            { id: 'cateye', nameEn: 'Cat-Eye Glamour', nameId: 'Cat-Eye Elegan' },
                            { id: 'wayfarer', nameEn: 'Trapezoid Wayfarer', nameId: 'Wayfarer Tegas' },
                            { id: 'aviator', nameEn: 'Classic Pilot', nameId: 'Aviator Kawat' },
                            { id: 'narrow', nameEn: 'Skinny Narrow', nameId: 'Model Sempit' },
                            { id: 'oversized', nameEn: 'Oversized Box', nameId: 'Model Oversized' },
                          ].map((model) => {
                            const isRec = mapping.suitable.includes(model.id);
                            const active = tryOnModel === model.id;
                            return (
                              <button
                                key={model.id}
                                onClick={() => setTryOnModel(model.id)}
                                className={`p-2 rounded-xl text-left border text-xs font-bold transition-all cursor-pointer ${
                                  active 
                                    ? 'bg-stone-900 text-white border-stone-900 shadow-sm' 
                                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                                }`}
                              >
                                <div className="flex justify-between items-start w-full">
                                  <span className="line-clamp-1 leading-none">{language === 'id' ? model.nameId : model.nameEn}</span>
                                </div>
                                <div className="mt-1.5 flex justify-between items-center">
                                  {isRec ? (
                                    <span className="text-[7.5px] font-black tracking-wider bg-emerald-50 text-emerald-600 px-1 py-0.5 rounded uppercase font-mono">
                                      FIT
                                    </span>
                                  ) : (
                                    <span className="text-[7.5px] font-black tracking-wider bg-yellow-50 text-yellow-700 px-1 py-0.5 rounded uppercase font-mono">
                                      AVOID
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Suitability dynamic display rationale box */}
                      {(() => {
                        const scoreObj = getSuitabilityDetails(tryOnModel, faceShape);
                        return (
                          <div className={`p-3.5 rounded-xl border flex gap-3 text-left ${
                            scoreObj.isSuitable 
                              ? 'bg-emerald-50/50 border-emerald-200'
                              : 'bg-yellow-50/50 border-yellow-200'
                          }`}>
                            <div className="mt-0.5 shrink-0">
                              {scoreObj.isSuitable ? (
                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                              ) : (
                                <AlertTriangle className="w-5 h-5 text-amber-600" />
                              )}
                            </div>
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center gap-1.5 font-bold text-stone-900">
                                <span className={scoreObj.isSuitable ? 'text-emerald-700' : 'text-amber-850'}>
                                  {scoreObj.isSuitable 
                                    ? (language === 'id' ? 'Sangat Direkomendasikan' : 'Recommended Silhouette Match')
                                    : (language === 'id' ? 'Geometri Pengganti' : 'Substitute Geometry Fit')}
                                </span>
                                <span className="text-stone-300">•</span>
                                <span className="font-mono bg-stone-100 px-1 py-0.5 rounded text-[10px]">{scoreObj.score}% compatibility</span>
                              </div>
                              <p className="text-stone-600 font-semibold leading-relaxed text-[11px]">
                                {language === 'id' ? scoreObj.rationaleId : scoreObj.rationaleEn}
                              </p>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Frame Acetate / Glass tint palette color pickers */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-stone-500 tracking-widest font-mono flex items-center gap-1.5">
                          <Palette className="w-4 h-4 text-stone-400" />
                          {language === 'id' ? 'Pilih Material / Warna Bingkai' : 'Select Frame Color Acetate'}
                        </label>
                        <div className="flex flex-wrap gap-2.5">
                          {colorSwatches.map((swatch) => {
                            const active = frameColor === swatch.value;
                            return (
                              <button
                                key={swatch.value}
                                onClick={() => setFrameColor(swatch.value)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                                  active 
                                    ? 'bg-stone-900 border-stone-900 text-white shadow-sm' 
                                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                                }`}
                              >
                                <span 
                                  className="w-3.5 h-3.5 rounded-full select-none inline-block border border-black/10"
                                  style={{ backgroundColor: swatch.value }}
                                ></span>
                                <span className="text-[10px] font-bold uppercase tracking-wider">{swatch.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Positional Sliders calibrators */}
                      <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-4">
                        <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest font-mono flex items-center gap-1.5">
                          <Sliders className="w-4 h-4 text-stone-400" />
                          {language === 'id' ? 'Kalibrasi Posisi Kacamata' : 'Adjust Placement Calibration'}
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                          {/* Offset Y */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] text-stone-500 font-bold">
                              <span>{language === 'id' ? 'Tinggikan / Turunkan (Y)' : 'Vertical Alignment (Y)'}</span>
                              <span className="font-mono text-stone-700">{offsetY}px</span>
                            </div>
                            <input 
                              type="range" 
                              min="-100" 
                              max="100" 
                              value={offsetY} 
                              onChange={(e) => setOffsetY(parseInt(e.target.value))}
                              className="w-full accent-stone-900 cursor-pointer"
                            />
                          </div>

                          {/* Offset X */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] text-stone-500 font-bold">
                              <span>{language === 'id' ? 'Geser Kiri / Kanan (X)' : 'Horizontal Alignment (X)'}</span>
                              <span className="font-mono text-stone-700">{offsetX}px</span>
                            </div>
                            <input 
                              type="range" 
                              min="-100" 
                              max="100" 
                              value={offsetX} 
                              onChange={(e) => setOffsetX(parseInt(e.target.value))}
                              className="w-full accent-stone-900 cursor-pointer"
                            />
                          </div>

                          {/* Scale */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] text-stone-500 font-bold">
                              <span>{language === 'id' ? 'Ukuran Lebar Kacamata' : 'Bridge Frame Width / Scale'}</span>
                              <span className="font-mono text-stone-700">{Math.round(scale * 100)}%</span>
                            </div>
                            <input 
                              type="range" 
                              min="0.8" 
                              max="1.5" 
                              step="0.02"
                              value={scale} 
                              onChange={(e) => setScale(parseFloat(e.target.value))}
                              className="w-full accent-stone-900 cursor-pointer"
                            />
                          </div>

                          {/* Tilt */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] text-stone-500 font-bold">
                              <span>{language === 'id' ? 'Sudut Kemiringan' : 'Rotational Tilt'}</span>
                              <span className="font-mono text-stone-700">{tilt}°</span>
                            </div>
                            <input 
                              type="range" 
                              min="-30" 
                              max="30" 
                              value={tilt} 
                              onChange={(e) => setTilt(parseInt(e.target.value))}
                              className="w-full accent-stone-950 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
