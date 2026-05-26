import { useState, useRef, useEffect } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { AppState, AnalysisResult } from './types';
import { UploadView } from './components/UploadView';
import { AnalysisLoading } from './components/AnalysisLoading';
import { DashboardView } from './components/DashboardView';
import { processImageWithAI } from './mockData';

export default function App() {
  const [appState, setAppState] = useState<AppState>('upload');
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [uploadedImageURL, setUploadedImageURL] = useState<string | null>(null);
  const [arModeActive, setArModeActive] = useState<boolean>(false);
  const [frameColor, setFrameColor] = useState({ hex: '#0f172a', name: 'Midnight' });
  const arVideoRef = useRef<HTMLVideoElement>(null);
  const [arStream, setArStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (arModeActive) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          setArStream(stream);
        })
        .catch(err => {
          console.error("Camera access denied:", err);
        });
    } else {
      if (arStream) {
        arStream.getTracks().forEach(track => track.stop());
        setArStream(null);
      }
    }
  }, [arModeActive]);

  useEffect(() => {
    if (arVideoRef.current && arStream) {
      arVideoRef.current.srcObject = arStream;
    }
  }, [arStream, arModeActive]);

  const handleUpload = async (file: File | null) => {
    setAppState('analyzing');
    setArModeActive(false);
    if (file) {
      setUploadedImageURL(URL.createObjectURL(file));
    }
    
    // Panggil fungsi mock AI prosesor
    const result = await processImageWithAI(file);
    
    // Simpan hasil dan transisi ke dashboard
    setAnalysisData(result);
    setAppState('results');
  };

  const handleReset = () => {
    setAppState('upload');
    setAnalysisData(null);
    setArModeActive(false);
    if (uploadedImageURL) {
      URL.revokeObjectURL(uploadedImageURL);
      setUploadedImageURL(null);
    }
  };

  return (
    <div className="h-screen w-full bg-slate-50 flex items-center justify-center p-0 md:p-6 font-sans overflow-hidden text-slate-800">
      <div className="h-full w-full max-w-5xl bg-slate-50 md:rounded-[2rem] flex flex-col overflow-hidden border border-slate-200 shadow-xl">
        
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
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-500">
            <span className="text-pink-600">AI Analysis</span>
            <span>Appointments</span>
            <span>History</span>
          </nav>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden p-4 md:p-6 gap-4 md:gap-6 bg-slate-50">
          
          {/* Sidebar: Input Section */}
          <section className="w-full md:w-1/3 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col shrink-0 overflow-y-auto">
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
                    <div className="relative w-full flex-1 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center mb-4">
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
                              <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(236,72,153,0.8)]"></div>
                              FACE MESH DETECTED
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
                            initial={{ y: -50, opacity: 0, scale: 0.9 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                            className="absolute top-[38%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[60%] z-30 pointer-events-none"
                          >
                            <motion.div 
                              animate={{ y: [-1, 2, -1], rotateZ: [-0.5, 0.5, -0.5] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                              className="relative w-full aspect-[2.6/1] flex items-center justify-between"
                            >
                                {/* Bridge */}
                                <div 
                                  className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[12%] h-[4px] rounded-full shadow-lg transition-colors duration-300"
                                  style={{ backgroundColor: frameColor.hex }}
                                ></div>
                                
                                {/* Left Lens (Cat Eye) */}
                                <div 
                                  className="relative w-[46%] h-[90%] border-[5px] backdrop-blur-[2px] bg-sky-200/20 shadow-xl flex items-center justify-center overflow-hidden transition-colors duration-300"
                                  style={{ 
                                    borderRadius: "30% 70% 50% 60% / 30% 60% 50% 50%",
                                    borderColor: frameColor.hex
                                  }}
                                >
                                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/50 to-white/0 -translate-x-[150%] animate-shimmer"></div>
                                </div>
                                
                                {/* Right Lens (Cat Eye) */}
                                <div 
                                  className="relative w-[46%] h-[90%] border-[5px] backdrop-blur-[2px] bg-sky-200/20 shadow-xl flex items-center justify-center overflow-hidden transition-colors duration-300"
                                  style={{ 
                                    borderRadius: "70% 30% 60% 50% / 60% 30% 50% 50%",
                                    borderColor: frameColor.hex
                                  }}
                                >
                                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/50 to-white/0 -translate-x-[150%] animate-shimmer" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                            </motion.div>
                            
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.6 }}
                              className="absolute -bottom-10 w-full text-center"
                            >
                              <span className="text-[10px] font-mono tracking-wider bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded shadow-lg border border-white/20">
                                {frameColor.name.toUpperCase()} (CAT-EYE)
                              </span>
                            </motion.div>
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
          <section className="flex-1 overflow-hidden flex flex-col">
            {appState !== 'results' ? (
              <div id="dashboard-empty" className="flex-1 flex flex-col items-center justify-center bg-white border border-slate-100 rounded-2xl text-slate-400 opacity-60 p-8 text-center shadow-sm">
                <Sparkles className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-bold text-slate-600">Hasil Analisis Akan Muncul Di Sini</p>
                <p className="text-sm mt-1">Unggah foto untuk memulai diagnosis AI</p>
              </div>
            ) : (
              analysisData && <DashboardView data={analysisData} onReset={handleReset} onTryOnAR={() => setArModeActive(true)} />
            )}
          </section>

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
          <p className="text-[10px] text-slate-400 font-mono tracking-wider">SCAN_ID: LX-890122-AI</p>
        </footer>

      </div>
    </div>
  );
}
