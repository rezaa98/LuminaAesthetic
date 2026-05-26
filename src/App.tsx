import { useState, useRef, useEffect } from 'react';
import { Sparkles, ArrowRight, Loader } from 'lucide-react';
import { motion } from 'motion/react';
import * as faceapi from '@vladmandic/face-api';
import { AppState, AnalysisResult, HistoryItem } from './types';
import localforage from 'localforage';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
import { UploadView } from './components/UploadView';
import { AnalysisLoading } from './components/AnalysisLoading';
import { DashboardView } from './components/DashboardView';
import { HistoryView } from './components/HistoryView';
import { ChangelogModal } from './components/ChangelogModal';
import { processImageWithAI } from './mockData';

export default function App() {
  const [appState, setAppState] = useState<AppState>('upload');
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [uploadedImageURL, setUploadedImageURL] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showChangelog, setShowChangelog] = useState<boolean>(false);

  useEffect(() => {
    localforage.getItem<HistoryItem[]>('lumina-history').then(data => {
      if (data) {
        setHistory(data);
      }
    });
  }, []);

  const [arModeActive, setArModeActive] = useState<boolean>(false);
  const [frameColor, setFrameColor] = useState({ hex: '#0f172a', name: 'Midnight' });
  const arVideoRef = useRef<HTMLVideoElement>(null);
  const arContainerRef = useRef<HTMLDivElement>(null);
  const [arStream, setArStream] = useState<MediaStream | null>(null);
  
  // AR Face Tracking States
  const [arModelsLoaded, setArModelsLoaded] = useState<boolean>(false);
  const [arStatus, setArStatus] = useState<string>('MENUNGGU MODEL...');
  const [faceData, setFaceData] = useState<{ x: number, y: number, width: number, angle: number } | null>(null);
  const reqRef = useRef<number>();

  useEffect(() => {
    let active = true;
    const loadModels = async () => {
      try {
        setArStatus('MENGUNDUH MODEL AI (5MB)...');
        // Use tinyFaceDetector for better performance
        await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/');
        await faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/');
        if (active) {
          setArModelsLoaded(true);
          setArStatus('MENCARI WAJAH...');
        }
      } catch (err) {
        console.error("Failed to load face-api models", err);
        if (active) setArStatus('GAGAL MEMUAT MODEL');
      }
    };
    
    if (arModeActive && !arModelsLoaded) {
      loadModels();
    }
    return () => { active = false; };
  }, [arModeActive, arModelsLoaded]);

  useEffect(() => {
    if (arModeActive) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        .then(stream => {
          setArStream(stream);
        })
        .catch(err => {
          console.error("Camera access denied:", err);
          setArStatus('AKSES KAMERA DITOLAK');
        });
    } else {
      if (arStream) {
        arStream.getTracks().forEach(track => track.stop());
        setArStream(null);
      }
      setFaceData(null);
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    }
  }, [arModeActive]);

  useEffect(() => {
    if (arVideoRef.current && arStream) {
      arVideoRef.current.srcObject = arStream;
    }
  }, [arStream, arModeActive]);

  const detectFace = async () => {
    if (!arVideoRef.current || !arContainerRef.current || !arModeActive) return;
    
    const videoEl = arVideoRef.current;
    if (videoEl.readyState >= 2 && !videoEl.paused) {
      const detections = await faceapi.detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions({ inputSize: 224 })).withFaceLandmarks();
      
      if (detections) {
        setArStatus('FACE MESH DETECTED');
        const leftEye = detections.landmarks.getLeftEye();
        const rightEye = detections.landmarks.getRightEye();
        
        const leftEyeCenter = leftEye.reduce((acc, curr) => ({ x: acc.x + curr.x, y: acc.y + curr.y }), { x: 0, y: 0 });
        leftEyeCenter.x /= leftEye.length;
        leftEyeCenter.y /= leftEye.length;
        
        const rightEyeCenter = rightEye.reduce((acc, curr) => ({ x: acc.x + curr.x, y: acc.y + curr.y }), { x: 0, y: 0 });
        rightEyeCenter.x /= rightEye.length;
        rightEyeCenter.y /= rightEye.length;
        
        // Ensure we know which eye is on the left side of the raw image
        let leftSideEye, rightSideEye;
        if (leftEyeCenter.x < rightEyeCenter.x) {
          leftSideEye = leftEyeCenter;
          rightSideEye = rightEyeCenter;
        } else {
          leftSideEye = rightEyeCenter;
          rightSideEye = leftEyeCenter;
        }
        
        const dx = rightSideEye.x - leftSideEye.x;
        const dy = rightSideEye.y - leftSideEye.y;
        
        const distance = Math.hypot(dx, dy); // distance between eyes
        
        // Since we mirror the X axis for rendering, the rotation direction is inverted.
        // dx is always positive here, so Math.atan2(dy, dx) is between -90 and 90 degrees.
        const angle = -Math.atan2(dy, dx) * (180 / Math.PI);
        
        const eyeCenterX = (leftSideEye.x + rightSideEye.x) / 2;
        const eyeCenterY = (leftSideEye.y + rightSideEye.y) / 2;
        
        // Map to container
        const vidW = videoEl.videoWidth;
        const vidH = videoEl.videoHeight;
        const contW = arContainerRef.current.clientWidth;
        const contH = arContainerRef.current.clientHeight;
        
        const vidRatio = vidW / vidH;
        const contRatio = contW / contH;
        let renderW = contW;
        let renderH = contH;
        let offsetX = 0;
        let offsetY = 0;
        
        if (contRatio > vidRatio) {
          renderH = contW / vidRatio;
          offsetY = (renderH - contH) / 2;
        } else {
          renderW = contH * vidRatio;
          offsetX = (renderW - contW) / 2;
        }
        
        const xRaw = (eyeCenterX / vidW) * renderW - offsetX;
        const yMapped = (eyeCenterY / vidH) * renderH - offsetY;
        
        // Mirror X
        const xMapped = contW - xRaw;
        
        // Scale glasses width based on eye distance. Usually glasses are ~2.2x the distance between pupils
        const mappedEyeDist = (distance / vidW) * renderW;
        const glassesWidth = mappedEyeDist * 2.5;

        setFaceData({
          x: xMapped,
          y: yMapped,
          width: glassesWidth,
          angle: angle
        });
      } else {
        setArStatus('MENCARI WAJAH...');
        // Smoothly fade out or keep old position? Better to reset or keep for a bit.
        // For simplicity, we just set null, or keep it. Let's set null so it hides or uses default.
      }
    }
    reqRef.current = requestAnimationFrame(detectFace);
  };

  useEffect(() => {
    if (arModeActive && arModelsLoaded && arStream) {
       reqRef.current = requestAnimationFrame(detectFace);
    }
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    }
  }, [arModeActive, arModelsLoaded, arStream]);

  const handleUpload = async (file: File | null) => {
    setAppState('analyzing');
    setArModeActive(false);
    if (file) {
      setUploadedImageURL(URL.createObjectURL(file));
    }
    
    try {
      // Panggil fungsi AI prosesor sungguhan
      const result = await processImageWithAI(file);
      
      let base64Image = null;
      if (file) {
        base64Image = await fileToBase64(file);
      } else if (uploadedImageURL) {
        base64Image = uploadedImageURL;
      }

      // Simpan hasil dan transisi ke dashboard
      setAnalysisData(result);
      
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: new Date(),
        imageUrl: base64Image,
        analysisData: result,
      };
      
      setHistory(prev => {
        const next = [newHistoryItem, ...prev];
        localforage.setItem('lumina-history', next);
        return next;
      });
      
      setAppState('results');
    } catch (e: any) {
      console.error(e);
      alert('Gagal memproses gambar dengan AI: ' + e.message);
      handleReset();
    }
  };

  const handleReset = () => {
    setAppState('upload');
    setAnalysisData(null);
    setArModeActive(false);
    // DO NOT revokeObjectURL here anymore because history needs it!
    setUploadedImageURL(null);
  };
  
  const handleViewHistory = () => {
    setAppState('history');
  };
  
  const handleSelectHistoryItem = (item: HistoryItem) => {
    setAnalysisData(item.analysisData);
    setUploadedImageURL(item.imageUrl);
    setAppState('results');
  };

  return (
    <div className="min-h-[100dvh] md:h-screen w-full bg-slate-50 flex items-center justify-center p-0 md:p-6 font-sans md:overflow-hidden text-slate-800">
      <div className="min-h-[100dvh] md:h-full w-full max-w-5xl bg-slate-50 md:rounded-[2rem] flex flex-col md:overflow-hidden border-0 md:border border-slate-200 md:shadow-xl">
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="text-white w-4 h-4" />
            </div>
            <span className="font-semibold text-xl tracking-tight text-slate-900">
              Lumina<span className="text-pink-500 underline decoration-2">Aesthetic</span>
            </span>
          </div>
          <nav className="flex gap-4 md:gap-6 text-xs md:text-sm font-medium text-slate-500">
            <button onClick={handleReset} className={`hover:text-slate-800 transition-colors ${appState !== 'history' ? 'text-pink-600 font-bold' : ''}`}>Analysis</button>
            <button className="hidden md:block hover:text-slate-800 transition-colors cursor-not-allowed opacity-50">Appointments</button>
            <button onClick={handleViewHistory} className={`hover:text-slate-800 transition-colors ${appState === 'history' ? 'text-pink-600 font-bold' : ''}`}>History</button>
          </nav>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col md:flex-row md:overflow-hidden p-4 md:p-6 gap-4 md:gap-6 bg-slate-50 relative">
          
          {appState === 'history' ? (
            <div className="w-full h-full absolute inset-0 md:static z-40 p-4 md:p-0 bg-slate-50 md:bg-transparent">
               <HistoryView 
                 history={history} 
                 onSelect={handleSelectHistoryItem} 
                 onBack={() => setAppState('upload')} 
               />
            </div>
          ) : (
            <>
              {/* Sidebar: Input Section */}
              <section className="w-full md:w-1/3 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col shrink-0 md:overflow-y-auto">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900 shrink-0">
              <Sparkles className="w-5 h-5 text-pink-500" />
              Input Wajah
            </h2>

            <div className="flex-1 flex flex-col relative w-full h-full min-h-[400px]">
              {appState === 'upload' && <UploadView onUpload={handleUpload} />}
              {appState === 'analyzing' && <AnalysisLoading />}
              {appState === 'results' && (
                <div className="flex flex-col h-full relative">
                  {uploadedImageURL ? (
                    <div ref={arContainerRef} className="relative w-full flex-1 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center mb-4 min-h-[300px] md:min-h-0">
                      {arModeActive && arStream && (
                        <video 
                          ref={arVideoRef} 
                          autoPlay 
                          playsInline 
                          muted 
                          className="absolute inset-0 w-full h-full object-cover z-10 transform scale-x-[-1]" 
                        />
                      )}
                      <img src={uploadedImageURL} alt="Uploaded face" className={`w-full h-full object-cover ${arModeActive && arStream ? 'opacity-0' : 'opacity-100'}`} />
                      
                      {arModeActive ? (
                        /* AR Glasses Overlay */
                        <div className="absolute inset-0 z-20 flex flex-col pointer-events-auto bg-slate-900/10 backdrop-blur-[1px] rounded-xl overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.1)]">
                          {/* AR Tracking Tech UI */}
                          <div className="absolute top-4 left-4 right-4 flex justify-between items-center text-[10px] text-pink-500 font-mono font-bold tracking-widest z-30 drop-shadow-md">
                            <div className="flex items-center gap-2">
                              {arModelsLoaded ? (
                                <>
                                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(236,72,153,0.8)]"></div>
                                  {arStatus}
                                </>
                              ) : (
                                <>
                                  <Loader className="w-3 h-3 animate-spin text-pink-500" />
                                  {arStatus}
                                </>
                              )}
                            </div>
                            <span className="hidden sm:inline-block border border-pink-500/30 px-2 py-0.5 rounded bg-pink-500/10 backdrop-blur-md">AR.TRACKING.ACTIVE</span>
                          </div>

                          {/* Eye/Face Trackers */}
                          <motion.div 
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 pointer-events-none"
                          >
                            <div className="absolute top-[20%] left-[20%] w-6 h-6 border-t-2 border-l-2 border-pink-500/80"></div>
                            <div className="absolute top-[20%] right-[20%] w-6 h-6 border-t-2 border-r-2 border-pink-500/80"></div>
                            <div className="absolute bottom-[20%] left-[20%] w-6 h-6 border-b-2 border-l-2 border-pink-500/80"></div>
                            <div className="absolute bottom-[20%] right-[20%] w-6 h-6 border-b-2 border-r-2 border-pink-500/80"></div>
                          </motion.div>

                          {/* Virtual Glasses */}
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: faceData ? 1 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute top-0 left-0 z-30 pointer-events-none origin-center"
                            style={{
                              transform: faceData 
                                ? `translate(${faceData.x}px, ${faceData.y}px) translate(-50%, -50%) rotate(${faceData.angle}deg)`
                                : 'translate(50%, 50%)',
                              width: faceData ? `${faceData.width}px` : '60%'
                            }}
                          >
                            <div className="relative w-full aspect-[2.6/1] flex items-center justify-between">
                                {/* Bridge */}
                                <div 
                                  className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[12%] h-[4px] rounded-full shadow-lg transition-colors duration-300"
                                  style={{ backgroundColor: frameColor.hex }}
                                ></div>
                                
                                {/* Left Lens (Cat Eye) */}
                                <div 
                                  className="relative w-[46%] h-[90%] border-[4px] backdrop-blur-[2px] bg-sky-200/20 shadow-xl flex items-center justify-center overflow-hidden transition-colors duration-300"
                                  style={{ 
                                    borderRadius: "30% 70% 50% 60% / 30% 60% 50% 50%",
                                    borderColor: frameColor.hex
                                  }}
                                >
                                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/50 to-white/0 -translate-x-[150%] animate-shimmer"></div>
                                </div>
                                
                                {/* Right Lens (Cat Eye) */}
                                <div 
                                  className="relative w-[46%] h-[90%] border-[4px] backdrop-blur-[2px] bg-sky-200/20 shadow-xl flex items-center justify-center overflow-hidden transition-colors duration-300"
                                  style={{ 
                                    borderRadius: "70% 30% 60% 50% / 60% 30% 50% 50%",
                                    borderColor: frameColor.hex
                                  }}
                                >
                                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/50 to-white/0 -translate-x-[150%] animate-shimmer" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                            </div>
                            
                            <div className="absolute -bottom-8 w-full text-center">
                              <span className="text-[8px] font-mono tracking-wider bg-black/70 backdrop-blur-sm text-white px-2 py-0.5 rounded shadow-lg border border-white/20 whitespace-nowrap">
                                {frameColor.name.toUpperCase()} (CAT-EYE)
                              </span>
                            </div>
                          </motion.div>

                          {/* AR Controls UI */}
                          <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-white/95 backdrop-blur-xl p-3 px-4 rounded-2xl shadow-xl z-30 border border-slate-200/50"
                          >
                            <div className="flex gap-2">
                              {[
                                { hex: '#0f172a', name: 'Midnight' },
                                { hex: '#be123c', name: 'Rose' },
                                { hex: '#b45309', name: 'Tortoise' },
                                { hex: '#0ea5e9', name: 'Azure' }
                              ].map((color) => (
                                <button 
                                  key={color.hex}
                                  onClick={() => setFrameColor(color)} 
                                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 active:scale-95 ${frameColor.hex === color.hex ? 'border-pink-500 scale-110' : 'border-white'} shadow-md`}
                                  style={{ backgroundColor: color.hex }}
                                  title={color.name}
                                />
                              ))}
                            </div>
                            <button 
                              onClick={() => setArModeActive(false)} 
                              className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors"
                            >
                              Selesai
                            </button>
                          </motion.div>
                        </div>
                      ) : (
                        /* Face Analysis Points */
                        <>
                          <div className="absolute top-[35%] left-[30%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                            <div className="w-4 h-4 bg-pink-500/30 rounded-full animate-ping absolute"></div>
                            <div className="w-2 h-2 bg-pink-500 rounded-full relative z-10 border border-white"></div>
                          </div>
                          <div className="absolute top-[35%] right-[30%] translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                            <div className="w-4 h-4 bg-pink-500/30 rounded-full animate-ping absolute"></div>
                            <div className="w-2 h-2 bg-pink-500 rounded-full relative z-10 border border-white"></div>
                          </div>
                          <div className="absolute top-[55%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                            <div className="w-6 h-6 bg-blue-500/30 rounded-full animate-ping absolute"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full relative z-10 border border-white"></div>
                            <span className="absolute -bottom-6 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded shadow whitespace-nowrap">T-Zone</span>
                          </div>
                          <div className="absolute top-[75%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full relative z-10 border border-white"></div>
                          </div>
                          
                          {/* Scanning Line Effect */}
                          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-pink-500 to-transparent animate-[scan_3s_ease-in-out_infinite] opacity-50 shadow-[0_0_10px_rgba(236,72,153,0.8)]"></div>
                        </>
                      )}
                      
                      <div className="absolute inset-0 border-4 border-pink-500/20 rounded-xl pointer-events-none"></div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <div className="w-32 h-32 rounded-full border-4 border-pink-100 bg-pink-50 flex items-center justify-center text-pink-500 mb-6 shadow-inner">
                        <Sparkles size={48} />
                      </div>
                      <h3 className="font-bold text-slate-800 text-lg">Analisis Selesai</h3>
                    </div>
                  )}
                  
                  <button 
                    onClick={handleReset} 
                    className="mt-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-colors text-sm w-full flex items-center justify-center gap-2 shadow-lg shadow-slate-200 shrink-0"
                    data-testid="btn-reset-analysis"
                  >
                    Mulai Analisis Baru <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </section>
          
          {/* Main Content: Dashboard Results */}
          <section className="flex-1 md:overflow-hidden flex flex-col">
            {appState !== 'results' ? (
              <div id="dashboard-empty" className="flex-1 flex flex-col items-center justify-center bg-white border border-slate-100 rounded-2xl text-slate-400 opacity-60 p-8 text-center shadow-sm">
                <Sparkles className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-bold text-slate-600">Hasil Analisis Akan Muncul Di Sini</p>
                <p className="text-sm mt-1">Unggah foto untuk memulai diagnosis AI</p>
              </div>
            ) : (
              analysisData && <DashboardView data={analysisData} onReset={handleReset} onTryOnAR={() => setArModeActive(true)} imageSrc={uploadedImageURL} />
            )}
          </section>
          </>
          )}

        </main>

        {/* Footer Stats */}
        <footer className="h-12 bg-white border-t border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 relative flex items-center justify-center">
                {appState === 'analyzing' && <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping"></span>}
              </span>
              <span className="text-[11px] text-slate-500 font-medium tracking-tight">System Ready</span>
            </div>
            <div className="flex items-center gap-1.5 hidden md:flex">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="text-[11px] text-slate-500 font-medium tracking-tight">v2.4 Engine Active</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-[10px] text-slate-400 font-mono tracking-wider">SCAN_ID: LX-890122-AI</p>
            <button 
              onClick={() => setShowChangelog(true)} 
              className="text-[10px] text-pink-500 hover:text-pink-600 font-mono tracking-wider font-bold underline decoration-pink-500/30 underline-offset-2 transition-colors cursor-pointer"
            >
              v2.1.3 Updates
            </button>
          </div>
        </footer>

      </div>
      
      {showChangelog && (
        <ChangelogModal onClose={() => setShowChangelog(false)} />
      )}
    </div>
  );
}
