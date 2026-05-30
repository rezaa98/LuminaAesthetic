import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, UserCircle, Eye, Loader, ScanFace, Droplet, Smile } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import * as faceapi from "@vladmandic/face-api";
import { useLanguage } from '../contexts/LanguageContext';

interface FaceFeatureModalProps {
  imageSrc: string | null;
  onClose: () => void;
  cachedData?: any;
  onDataFecthed?: (data: any) => void;
  globalData?: any;
  onTryOnAR?: () => void;
}

interface DetailedFeature {
  id: string; // shape, eyes, eyebrows, nose, cheeks, lips
  name: string;
  label: string;
  points: string[];
  coordinate?: { x: number; y: number };
  areaPolygon?: { x: number; y: number }[];
}

export const FaceFeatureModal = ({ imageSrc, onClose, cachedData, onDataFecthed, globalData, onTryOnAR }: FaceFeatureModalProps) => {
  const { lang, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [features, setFeatures] = useState<DetailedFeature[]>([]);
  const [symmetryScore, setSymmetryScore] = useState<number | null>(null);
  const [symmetryDescription, setSymmetryDescription] = useState<string | null>(null);
  const [faceBox, setFaceBox] = useState<{top: number, left: number, width: number, height: number} | null>(null);
  const [symmetryMode, setSymmetryMode] = useState<'original' | 'left' | 'right'>('original');
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [hiddenFeatures, setHiddenFeatures] = useState<string[]>([]);
  const [scaleFactor, setScaleFactor] = useState<number>(1);
  const imgRef = useRef<HTMLImageElement>(null);
  const [actualLandmarks, setActualLandmarks] = useState<{x: number, y: number}[] | null>(null);
  const [actualFaceBox, setActualFaceBox] = useState<{top: number, left: number, width: number, height: number} | null>(null);

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
              const mapP = (p: any) => ({ x: (p.x / imgW) * 100, y: (p.y / imgH) * 100 });
              
              setActualLandmarks(detection.landmarks.positions.map(mapP));
              setActualFaceBox({
                  left: (detection.alignedRect.box.left / imgW) * 100,
                  top: (detection.alignedRect.box.top / imgH) * 100,
                  width: (detection.alignedRect.box.width / imgW) * 100,
                  height: (detection.alignedRect.box.height / imgH) * 100,
              });
          }
      } catch (e) {
          console.error("Local faceapi detection failed in modal:", e);
      }
  };

  useEffect(() => {
    if (imgRef.current?.complete && !actualLandmarks) {
        performFaceDetection();
    }
  }, [imageSrc, symmetryMode]);

  useEffect(() => {
    if (!imageSrc) return;
    
    // Validasi cache: Pastikan data memiliki areaPolygon agar refetch terjadi jika hanya data lama yang tersimpan
    const hasValidCache = cachedData && cachedData.features && cachedData.features.some((f: any) => f.areaPolygon && f.areaPolygon.length >= 3);

    const checkScale = (data: any) => {
        let max = 0;
        if (data.faceBox) {
            max = Math.max(max, parseFloat(data.faceBox.width || 0), parseFloat(data.faceBox.height || 0), parseFloat(data.faceBox.left || 0), parseFloat(data.faceBox.top || 0));
        }
        data.features?.forEach((f: any) => {
            if (f.coordinate) max = Math.max(max, parseFloat(f.coordinate.x || 0), parseFloat(f.coordinate.y || 0));
            f.areaPolygon?.forEach((p: any) => max = Math.max(max, parseFloat(p.x || 0), parseFloat(p.y || 0)));
        });
        return max > 105 ? 10 : 1; 
    };

    if (hasValidCache) {
        setScaleFactor(checkScale(cachedData));
        setFeatures(cachedData.features || []);
        if (cachedData.symmetryScore !== undefined) setSymmetryScore(cachedData.symmetryScore);
        if (cachedData.symmetryDescription) setSymmetryDescription(cachedData.symmetryDescription);
        if (cachedData.faceBox) setFaceBox(cachedData.faceBox);
        setLoading(false);
        return;
    }

    let isMounted = true;

    const analyzeFeatures = async () => {
      setLoading(true);
      setError(null);
      try {
        let fileBlob = await fetch(imageSrc).then(r => r.blob());

        const preferredModel = localStorage.getItem('lumina-settings-model') || 'gemini-3.5-flash';
        
        const formData = new FormData();
        formData.append('image', fileBlob, 'image.jpg');
        formData.append('language', language);
        formData.append('preferredModel', preferredModel);

        const res = await fetch('/api/analyze-features', {
          method: 'POST',
          body: formData
        });
        
        if (!res.ok) {
          const contentType = res.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            const text = await res.text();
            console.error("Non-JSON Feature Error Response received:", text);
            throw new Error("Server returned non-JSON error response for feature analysis. Please check your config.");
          }
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || 'Analysis failed');
        }

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await res.text();
          console.error("Non-JSON Feature Success Response received:", text);
          throw new Error("Server returned non-JSON response in feature analysis path. Please try again.");
        }

        const data = await res.json();
        if (isMounted) {
          setScaleFactor(checkScale(data));
          setFeatures(data.features || []);
          if (data.symmetryScore !== undefined) setSymmetryScore(data.symmetryScore);
          if (data.symmetryDescription) setSymmetryDescription(data.symmetryDescription);
          if (data.faceBox) setFaceBox(data.faceBox);
          if (onDataFecthed) onDataFecthed(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Error running analysis');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    analyzeFeatures();

    return () => {
      isMounted = false;
    };
  }, [imageSrc, cachedData, onDataFecthed]);

  const getIconForFeature = (id: string, className: string = "w-4 h-4") => {
    switch (id) {
      case 'shape': return <UserCircle className={className} />;
      case 'eyes': return <Eye className={className} />;
      case 'eyebrows': return <ScanFace className={className} />;
      case 'nose': return <Droplet className={className} />;
      case 'cheeks': return <Smile className={className} />;
      case 'lips': return <Smile className={className} />; // Or another icon
      default: return <CheckCircle2 className={className} />;
    }
  };

  const renderFeatureCard = (feature: DetailedFeature, alignRight: boolean = false) => {
    return (
      <motion.div 
        initial={{ opacity: 0, x: alignRight ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`bg-white rounded-xl shadow-sm border border-slate-100 p-4 max-w-sm w-full relative z-10 flex flex-col items-start text-left ${alignRight ? 'md:items-end md:text-right' : ''}`}
      >
        <div className={`flex items-center gap-3 mb-2 ${alignRight ? 'md:flex-row-reverse' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 shrink-0">
            {getIconForFeature(feature.id)}
          </div>
          <div>
            <h4 className="text-[10px] font-bold tracking-widest uppercase text-slate-400">{feature.name}</h4>
            <h3 className="text-sm font-black text-slate-800">{feature.label}</h3>
          </div>
        </div>
        <ul className={`space-y-1.5 mt-2 text-left ${alignRight ? 'md:text-right' : ''}`}>
          {feature.points.map((pt, idx) => (
            <li key={idx} className={`text-xs text-slate-600 font-medium flex items-start gap-1.5 ${alignRight ? 'md:flex-row-reverse' : ''}`}>
              <div className={`w-1 h-1 rounded-full bg-slate-300 shrink-0 mt-1.5`}></div>
              <span>{pt}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    );
  };

  const getTransformOrigin = (box: any) => {
     return '50% 50%';
  };

  const getTransformScale = (box: any) => {
      return 'scale(1)';
  };

  const activeFaceBox = actualFaceBox ? { ...actualFaceBox, scaleFactor: 1 } : (faceBox ? { ...faceBox, scaleFactor } : null);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-6xl h-[90vh] bg-slate-50 flex flex-col rounded-3xl overflow-hidden shadow-2xl relative"
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-white shrink-0 z-20">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <ScanFace className="text-pink-500 w-5 h-5" />
              {lang.detailedAnalysis || 'Detailed Face Geometry Analysis'}
            </h2>
            <p className="text-sm font-semibold text-slate-500 mt-1">{language === 'id' ? 'Analisis struktur fitur wajah mendalam menggunakan AI' : 'AI-powered deep facial feature structure analysis'}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto relative w-full flex items-start justify-center p-6 py-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center space-y-4 h-full">
              <div className="relative">
                 <div className="w-16 h-16 border-4 border-pink-100 rounded-full"></div>
                 <div className="absolute top-0 left-0 w-16 h-16 border-4 border-pink-500 rounded-full border-t-transparent animate-spin"></div>
                 <ScanFace className="w-6 h-6 text-pink-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <p className="text-sm font-bold text-slate-600 animate-pulse tracking-wide">{lang.fetchingData || 'ANALYZING FACIAL MAP...'}</p>
            </div>
          ) : error ? (
            <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-red-100 max-w-md my-auto">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4">
                <X className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">{language === 'id' ? 'Analisis Gagal' : 'Analysis Failed'}</h3>
              <p className="text-sm text-slate-600">{error}</p>
            </div>
          ) : (
            <div className="w-full min-h-full flex flex-col">
              <div className="w-full max-w-5xl mx-auto relative flex flex-col md:flex-row items-center md:items-start justify-center gap-8 md:gap-16">
              
              {/* Left Column Data */}
              <div className="flex flex-col gap-6 w-full md:w-1/3 order-2 md:order-1 items-center md:items-end relative z-10">
                {features.filter((f, i) => i % 2 === 0).map(f => (
                   <div key={f.id} className={`relative w-full flex justify-center md:justify-end transition-opacity duration-300 ${hiddenFeatures.includes(f.id) ? 'opacity-30' : 'opacity-100'}`}>
                      {renderFeatureCard(f, true)}
                   </div>
                ))}
              </div>

              {/* Center Portrait & Symmetry */}
              <div className="flex flex-col items-center w-full max-w-xs sm:max-w-sm md:w-1/3 order-1 md:order-2 shrink-0 z-20 gap-4 md:sticky md:top-8">
                <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-200">
                  {imageSrc && (
                    <div 
                       className="relative w-full h-auto transition-transform duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]"
                       style={{
                          transformOrigin: getTransformOrigin(activeFaceBox),
                          transform: getTransformScale(activeFaceBox)
                       }}
                    >
                      {symmetryMode === 'original' && (
                         <img ref={imgRef} onLoad={performFaceDetection} src={imageSrc} alt="Portrait" crossOrigin="anonymous" className="w-full h-auto block" />
                      )}
                      
                      {symmetryMode === 'left' && (
                         <>
                           <img ref={imgRef} onLoad={performFaceDetection} src={imageSrc} alt="Left" crossOrigin="anonymous" className="w-full h-auto block" style={{ clipPath: `polygon(0 0, ${activeFaceBox ? (parseFloat(activeFaceBox.left) + parseFloat(activeFaceBox.width)/2)/(activeFaceBox.scaleFactor||1) : 50}% 0, ${activeFaceBox ? (parseFloat(activeFaceBox.left) + parseFloat(activeFaceBox.width)/2)/(activeFaceBox.scaleFactor||1) : 50}% 100%, 0 100%)` }} />
                           <img src={imageSrc} alt="Left Flipped" crossOrigin="anonymous" className="w-full h-auto block absolute top-0 left-0" style={{ transformOrigin: `${activeFaceBox ? (parseFloat(activeFaceBox.left) + parseFloat(activeFaceBox.width)/2)/(activeFaceBox.scaleFactor||1) : 50}% 50%`, transform: 'scaleX(-1)', clipPath: `polygon(${activeFaceBox ? (parseFloat(activeFaceBox.left) + parseFloat(activeFaceBox.width)/2)/(activeFaceBox.scaleFactor||1) : 50}% 0, 100% 0, 100% 100%, ${activeFaceBox ? (parseFloat(activeFaceBox.left) + parseFloat(activeFaceBox.width)/2)/(activeFaceBox.scaleFactor||1) : 50}% 100%)` }} />
                         </>
                      )}

                      {symmetryMode === 'right' && (
                         <>
                           <img ref={imgRef} onLoad={performFaceDetection} src={imageSrc} alt="Right" crossOrigin="anonymous" className="w-full h-auto block" style={{ clipPath: `polygon(${activeFaceBox ? (parseFloat(activeFaceBox.left) + parseFloat(activeFaceBox.width)/2)/(activeFaceBox.scaleFactor||1) : 50}% 0, 100% 0, 100% 100%, ${activeFaceBox ? (parseFloat(activeFaceBox.left) + parseFloat(activeFaceBox.width)/2)/(activeFaceBox.scaleFactor||1) : 50}% 100%)` }} />
                           <img src={imageSrc} alt="Right Flipped" crossOrigin="anonymous" className="w-full h-auto block absolute top-0 left-0" style={{ transformOrigin: `${activeFaceBox ? (parseFloat(activeFaceBox.left) + parseFloat(activeFaceBox.width)/2)/(activeFaceBox.scaleFactor||1) : 50}% 50%`, transform: 'scaleX(-1)', clipPath: `polygon(0 0, ${activeFaceBox ? (parseFloat(activeFaceBox.left) + parseFloat(activeFaceBox.width)/2)/(activeFaceBox.scaleFactor||1) : 50}% 0, ${activeFaceBox ? (parseFloat(activeFaceBox.left) + parseFloat(activeFaceBox.width)/2)/(activeFaceBox.scaleFactor||1) : 50}% 100%, 0 100%)` }} />
                         </>
                      )}
                      
                      {/* Geometry Grid Interactive Layer */}
                      {showGrid && (
                        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-10 transition-opacity duration-300">
                          {/* Face Midline */}
                          <line 
                             x1={`${activeFaceBox ? (parseFloat(activeFaceBox.left) + parseFloat(activeFaceBox.width)/2)/(activeFaceBox.scaleFactor||1) : 50}%`} y1="0%" 
                             x2={`${activeFaceBox ? (parseFloat(activeFaceBox.left) + parseFloat(activeFaceBox.width)/2)/(activeFaceBox.scaleFactor||1) : 50}%`} y2="100%" 
                             stroke="rgba(236,72,153,0.8)" 
                             strokeWidth="1.5" 
                             strokeDasharray="4 4" 
                          />
                          
                          {/* Horizontal Alignment Lines */}
                          {features.map((f, i) => {
                             if (hiddenFeatures.includes(f.id)) return null;
                             
                             let y: number;
                             if (actualLandmarks) {
                                 if (f.id === 'shape') { y = actualLandmarks[8].y; }
                                 else if (f.id === 'nose') { y = actualLandmarks[30].y; }
                                 else if (f.id === 'lips') { y = actualLandmarks[62].y; }
                                 else if (f.id === 'eyes') { y = actualLandmarks[39].y; }
                                 else if (f.id === 'eyebrows') { y = actualLandmarks[20].y; }
                                 else if (f.id === 'cheeks') { y = actualLandmarks[2].y; }
                                 else return null;
                             } else {
                                 if (!f.coordinate || !Number.isFinite(parseFloat(f.coordinate.y as any))) return null;
                                 y = parseFloat(f.coordinate.y as any) / scaleFactor;
                             }
                             
                             return (
                               <line 
                                  key={`hgrid-${i}`} 
                                  x1="0%" y1={`${y}%`} 
                                  x2="100%" y2={`${y}%`} 
                                  stroke="rgba(59,130,246,0.3)" 
                                  strokeWidth="1" 
                               />
                             );
                          })}
                        </svg>
                      )}

                      {/* Connection Lines (SVG) - Hidden when grid is shown for less clutter */}
                      {!showGrid && (
                        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-10">
                          {features.map((f, i) => {
                             if (hiddenFeatures.includes(f.id)) return null;
                             const isLeft = i % 2 === 0;
                             let x: number, y: number;
                             
                             if (actualLandmarks) {
                                 if (f.id === 'shape') { x = actualLandmarks[8].x; y = actualLandmarks[8].y; }
                                 else if (f.id === 'nose') { x = actualLandmarks[30].x; y = actualLandmarks[30].y; }
                                 else if (f.id === 'lips') { x = actualLandmarks[62].x; y = actualLandmarks[62].y; }
                                 else if (f.id === 'eyes') { x = (actualLandmarks[39].x + actualLandmarks[42].x)/2; y = actualLandmarks[39].y; }
                                 else if (f.id === 'eyebrows') { x = (actualLandmarks[20].x + actualLandmarks[23].x)/2; y = actualLandmarks[20].y; }
                                 else if (f.id === 'cheeks') { x = isLeft ? actualLandmarks[2].x : actualLandmarks[14].x; y = actualLandmarks[2].y; }
                                 else return null;
                             } else {
                                 if (!f.coordinate || !Number.isFinite(parseFloat(f.coordinate.x as any)) || !Number.isFinite(parseFloat(f.coordinate.y as any))) return null;
                                 x = parseFloat(f.coordinate.x as any) / scaleFactor;
                                 y = parseFloat(f.coordinate.y as any) / scaleFactor;
                             }
                             
                             return (
                                <line 
                                   key={`line-${f.id}`}
                                   x1={`${x}%`} 
                                   y1={`${y}%`} 
                                   x2={isLeft ? "-50%" : "150%"} 
                                   y2={`${y}%`} 
                                   stroke="rgba(236,72,153,0.5)" 
                                   strokeWidth="0.5"
                                   strokeDasharray="1,1"
                                />
                             );
                          })}
                        </svg>
                      )}

                       {/* Feature Areas & Dots */}
                       <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
                         <defs>
                           {/* Glow Filters */}
                           <filter id="glowEmerald" x="-20%" y="-20%" width="140%" height="140%">
                             <feGaussianBlur stdDeviation="1" result="coloredBlur" />
                             <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                           </filter>
                           <filter id="glowBlue" x="-20%" y="-20%" width="140%" height="140%">
                             <feGaussianBlur stdDeviation="1" result="coloredBlur" />
                             <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                           </filter>
                           <filter id="glowAmber" x="-20%" y="-20%" width="140%" height="140%">
                             <feGaussianBlur stdDeviation="1" result="coloredBlur" />
                             <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                           </filter>
                           <filter id="glowRose" x="-20%" y="-20%" width="140%" height="140%">
                             <feGaussianBlur stdDeviation="1" result="coloredBlur" />
                             <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                           </filter>
                           <filter id="glowPinkArea" x="-20%" y="-20%" width="140%" height="140%">
                             <feGaussianBlur stdDeviation="1" result="coloredBlur" />
                             <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                           </filter>

                           {/* Gradients */}
                           <linearGradient id="gradEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
                             <stop offset="0%" stopColor="rgba(16,185,129,0.3)" />
                             <stop offset="100%" stopColor="rgba(16,185,129,0.05)" />
                           </linearGradient>
                           <linearGradient id="gradBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                             <stop offset="0%" stopColor="rgba(59,130,246,0.3)" />
                             <stop offset="100%" stopColor="rgba(59,130,246,0.05)" />
                           </linearGradient>
                           <linearGradient id="gradAmber" x1="0%" y1="0%" x2="100%" y2="100%">
                             <stop offset="0%" stopColor="rgba(245,158,11,0.3)" />
                             <stop offset="100%" stopColor="rgba(245,158,11,0.05)" />
                           </linearGradient>
                           <linearGradient id="gradRose" x1="0%" y1="0%" x2="100%" y2="100%">
                             <stop offset="0%" stopColor="rgba(244,63,94,0.3)" />
                             <stop offset="100%" stopColor="rgba(244,63,94,0.05)" />
                           </linearGradient>
                           <linearGradient id="softGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                             <stop offset="0%" stopColor="rgba(236,72,153,0.3)" />
                             <stop offset="100%" stopColor="rgba(236,72,153,0.05)" />
                           </linearGradient>
                         </defs>
                         
                         {actualLandmarks ? (
                            <>
                               {/* Shape (Jawline) */}
                               {!hiddenFeatures.includes('shape') && (
                                   <polyline
                                       points={actualLandmarks.slice(0, 17).map(p => `${p.x},${p.y}`).join(' ')}
                                       fill="none"
                                       stroke="url(#gradEmerald)"
                                       strokeWidth="1.5"
                                       strokeDasharray="2,2"
                                       filter="url(#glowEmerald)"
                                   />
                               )}
                               
                               {/* Left Eye */}
                               {!hiddenFeatures.includes('eyes') && (
                                   <polygon
                                       points={actualLandmarks.slice(36, 42).map(p => `${p.x},${p.y}`).join(' ')}
                                       fill="url(#gradBlue)" stroke="rgba(59,130,246,0.6)" strokeWidth="0.5" filter="url(#glowBlue)"
                                   />
                               )}
                               
                               {/* Right Eye */}
                               {!hiddenFeatures.includes('eyes') && (
                                   <polygon
                                       points={actualLandmarks.slice(42, 48).map(p => `${p.x},${p.y}`).join(' ')}
                                       fill="url(#gradBlue)" stroke="rgba(59,130,246,0.6)" strokeWidth="0.5" filter="url(#glowBlue)"
                                   />
                               )}

                               {/* Left Eyebrow */}
                               {!hiddenFeatures.includes('eyebrows') && (
                                   <polyline
                                       points={actualLandmarks.slice(17, 22).map(p => `${p.x},${p.y}`).join(' ')}
                                       fill="none" stroke="rgba(59,130,246,0.6)" strokeWidth="1.2" filter="url(#glowBlue)"
                                   />
                               )}

                               {/* Right Eyebrow */}
                               {!hiddenFeatures.includes('eyebrows') && (
                                   <polyline
                                       points={actualLandmarks.slice(22, 27).map(p => `${p.x},${p.y}`).join(' ')}
                                       fill="none" stroke="rgba(59,130,246,0.6)" strokeWidth="1.2" filter="url(#glowBlue)"
                                   />
                               )}

                               {/* Nose */}
                               {!hiddenFeatures.includes('nose') && (
                                   <polygon
                                       points={[...actualLandmarks.slice(27, 36)].map(p => `${p.x},${p.y}`).join(' ')}
                                       fill="url(#gradAmber)" stroke="rgba(245,158,11,0.6)" strokeWidth="0.5" filter="url(#glowAmber)"
                                   />
                               )}

                               {/* Lips */}
                               {!hiddenFeatures.includes('lips') && (
                                   <polygon
                                       points={actualLandmarks.slice(48, 60).map(p => `${p.x},${p.y}`).join(' ')}
                                       fill="url(#gradRose)" stroke="rgba(244,63,94,0.6)" strokeWidth="0.5" filter="url(#glowRose)"
                                   />
                               )}
                            </>
                         ) : (
                           features.map((f) => {
                             if (hiddenFeatures.includes(f.id)) return null;
                             
                             // Draw polygon if we have at least 3 points
                             if (f.areaPolygon && f.areaPolygon.length >= 3) {
                                const pointsStr = f.areaPolygon.map(p => `${parseFloat(p.x as any)/scaleFactor},${parseFloat(p.y as any)/scaleFactor}`).join(" ");
                                
                                let fillGrad = "url(#softGradient)";
                                let strokeCol = "rgba(236,72,153,0.6)";
                                let filterUrl = "url(#glowPinkArea)";
                                
                                if (f.id === 'shape' || f.id === 'cheeks') { fillGrad = "url(#gradEmerald)"; strokeCol = "rgba(16,185,129,0.6)"; filterUrl = "url(#glowEmerald)"; }
                                else if (f.id === 'nose') { fillGrad = "url(#gradAmber)"; strokeCol = "rgba(245,158,11,0.6)"; filterUrl = "url(#glowAmber)"; }
                                else if (f.id === 'lips') { fillGrad = "url(#gradRose)"; strokeCol = "rgba(244,63,94,0.6)"; filterUrl = "url(#glowRose)"; }
                                else if (f.id === 'eyes' || f.id === 'eyebrows') { fillGrad = "url(#gradBlue)"; strokeCol = "rgba(59,130,246,0.6)"; filterUrl = "url(#glowBlue)"; }
                                
                                return (
                                   <polygon
                                      key={`poly-${f.id}`}
                                      points={pointsStr}
                                      fill={fillGrad}
                                      stroke={strokeCol}
                                      strokeWidth="0.5"
                                      strokeDasharray="1,1"
                                      opacity="0.8"
                                      filter={filterUrl}
                                   />
                                );
                             }
                             return null;
                           })
                         )}
                       </svg>

                       {/* Feature Dots (Fallback or Center Points) */}
                       {actualLandmarks ? (
                           <>
                               {/* Just render one dot per feature at an approx center */}
                               {!hiddenFeatures.includes('shape') && <div className="absolute w-[4px] h-[4px] rounded-full bg-emerald-500 ring-[2px] ring-white shadow-[0_0_6px_rgba(16,185,129,1)] z-20" style={{ top: `${actualLandmarks[8].y}%`, left: `${actualLandmarks[8].x}%`, transform: 'translate(-50%, -50%)' }} />}
                               {!hiddenFeatures.includes('nose') && <div className="absolute w-[4px] h-[4px] rounded-full bg-amber-500 ring-[2px] ring-white shadow-[0_0_6px_rgba(245,158,11,1)] z-20" style={{ top: `${actualLandmarks[30].y}%`, left: `${actualLandmarks[30].x}%`, transform: 'translate(-50%, -50%)' }} />}
                               {!hiddenFeatures.includes('lips') && <div className="absolute w-[4px] h-[4px] rounded-full bg-rose-500 ring-[2px] ring-white shadow-[0_0_6px_rgba(244,63,94,1)] z-20" style={{ top: `${actualLandmarks[62].y}%`, left: `${actualLandmarks[62].x}%`, transform: 'translate(-50%, -50%)' }} />}
                               {!hiddenFeatures.includes('eyes') && <div className="absolute w-[4px] h-[4px] rounded-full bg-blue-500 ring-[2px] ring-white shadow-[0_0_6px_rgba(59,130,246,1)] z-20" style={{ top: `${actualLandmarks[39].y}%`, left: `${(actualLandmarks[39].x + actualLandmarks[42].x)/2}%`, transform: 'translate(-50%, -50%)' }} />}
                           </>
                       ) : (
                           features.map((f) => {
                             if (hiddenFeatures.includes(f.id) || !f.coordinate || !Number.isFinite(parseFloat(f.coordinate.x as any)) || !Number.isFinite(parseFloat(f.coordinate.y as any))) return null;
                             
                             let dotColor = "bg-pink-500 ring-white shadow-[0_0_6px_rgba(236,72,153,1)]";
                             if (f.id === 'shape' || f.id === 'cheeks') dotColor = "bg-emerald-500 ring-white shadow-[0_0_6px_rgba(16,185,129,1)]";
                             else if (f.id === 'nose') dotColor = "bg-amber-500 ring-white shadow-[0_0_6px_rgba(245,158,11,1)]";
                             else if (f.id === 'lips') dotColor = "bg-rose-500 ring-white shadow-[0_0_6px_rgba(244,63,94,1)]";
                             else if (f.id === 'eyes' || f.id === 'eyebrows') dotColor = "bg-blue-500 ring-white shadow-[0_0_6px_rgba(59,130,246,1)]";

                             return (
                              <div 
                                 key={`point-${f.id}`}
                                 className="absolute flex items-center justify-center pointer-events-none z-20"
                                 style={{ 
                                     top: `${parseFloat(f.coordinate.y as any)/scaleFactor}%`, 
                                     left: `${parseFloat(f.coordinate.x as any)/scaleFactor}%`, 
                                     transform: 'translate(-50%, -50%)',
                                 }}
                              >
                                 <div className={`w-[4px] h-[4px] rounded-full ring-[2px] ${dotColor}`} />
                              </div>
                             );
                           })
                       )}
                      
                      {/* Scanner Effect */}
                      <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-overlay">
                        <div className="w-full h-full relative">
                          <div className="absolute top-0 left-0 right-0 h-[1px] bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,1)] animate-[scan_3s_ease-in-out_infinite]"></div>
                          <div className="absolute inset-0 bg-blue-500/5"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Interactive Controls Overlay */}
                <div className="w-full flex justify-center mt-[-10px] z-30 px-2">
                   <div className="bg-white/90 backdrop-blur-md rounded-3xl md:rounded-full shadow-lg border border-slate-100 p-1.5 flex flex-wrap justify-center gap-1 items-center">
                     <button 
                       onClick={() => setSymmetryMode('original')}
                       className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${symmetryMode === 'original' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
                     >
                       {language === 'id' ? 'Asli' : 'Original'}
                     </button>
                     <button 
                       onClick={() => setSymmetryMode('left')}
                       className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${symmetryMode === 'left' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'}`}
                     >
                       {language === 'id' ? 'Kiri Mirrored' : 'Left Mirrored'}
                     </button>
                     <button 
                       onClick={() => setSymmetryMode('right')}
                       className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${symmetryMode === 'right' ? 'bg-pink-500 text-white shadow-sm' : 'text-slate-500 hover:bg-pink-50 hover:text-pink-600'}`}
                     >
                       {language === 'id' ? 'Kanan Mirrored' : 'Right Mirrored'}
                     </button>
                   </div>
                </div>

                <div className="w-full flex justify-center z-30 mb-2">
                   <label className="flex items-center gap-2 cursor-pointer bg-slate-100/80 px-3 py-1.5 rounded-full border border-slate-200 shadow-sm hover:bg-slate-200 transition-colors">
                      <input 
                         type="checkbox" 
                         checked={showGrid} 
                         onChange={(e) => setShowGrid(e.target.checked)} 
                         className="rounded text-pink-500 focus:ring-pink-500 border-slate-300 w-3.5 h-3.5"
                      />
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600">Symmetry Grid</span>
                   </label>
                </div>

                <div className="flex flex-wrap justify-center items-center gap-1.5 z-30 mb-2 px-4 max-w-full">
                   {features.map((f) => (
                      <button 
                         key={`toggle-${f.id}`} 
                         onClick={() => setHiddenFeatures(prev => prev.includes(f.id) ? prev.filter(id => id !== f.id) : [...prev, f.id])}
                         className={`px-2.5 py-1 rounded-md text-[9px] font-bold tracking-wide uppercase transition-all border ${!hiddenFeatures.includes(f.id) ? 'bg-pink-50 text-pink-600 border-pink-200' : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60'}`}
                      >
                         {f.name}
                      </button>
                   ))}
                </div>

                {symmetryScore !== null && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl w-full p-4 shadow-sm border border-slate-100 flex flex-col items-center text-center mt-2 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-pink-400 to-rose-600 transition-all duration-1000" style={{ width: `${symmetryScore}%` }}></div>
                    <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mt-1 mb-1">Symmetry Score</span>
                    <div className="flex items-end justify-center gap-1 mb-1">
                      <span className="text-3xl font-black text-slate-800 leading-none">{symmetryScore}</span>
                      <span className="text-sm font-bold text-slate-400 mb-1">/100</span>
                    </div>
                    {symmetryDescription && (
                      <p className="text-xs font-semibold text-slate-500 mt-1 pb-1">{symmetryDescription}</p>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Right Column Data */}
              <div className="flex flex-col gap-6 w-full md:w-1/3 order-3 items-center md:items-start relative z-10">
                {features.filter((f, i) => i % 2 !== 0).map(f => (
                   <div key={f.id} className={`relative w-full flex justify-center md:justify-start transition-opacity duration-300 ${hiddenFeatures.includes(f.id) ? 'opacity-30' : 'opacity-100'}`}>
                      {renderFeatureCard(f, false)}
                   </div>
                ))}
              </div>

            </div>
          </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
