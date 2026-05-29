import { useState, useRef, useEffect } from 'react';
import { Sparkles, ArrowRight, Loader, LogIn, LogOut, ChevronRight, UserCog, UserCheck, Shield, Target, Sun, Smile, ShieldCheck, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import * as faceapi from '@vladmandic/face-api';
import { AppState, AnalysisResult, HistoryItem, User, AuditLog, UserRole } from './types';
import localforage from 'localforage';
import { useLanguage } from './contexts/LanguageContext';
import { auth, db, onAuthStateChanged, collection, query, where, onSnapshot, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, orderBy, signOut } from './firebase';

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
import { LandingPage } from './components/LandingPage';
import { AuthView } from './components/AuthView';
import { AdminPanel } from './components/AdminPanel';

export default function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeRolePreset, setActiveRolePreset] = useState<UserRole | undefined>(undefined);
  const [activeScanId, setActiveScanId] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [analysisCache, setAnalysisCache] = useState<Record<string, AnalysisResult>>({});
  const [uploadedImageURL, setUploadedImageURL] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showChangelog, setShowChangelog] = useState<boolean>(false);
  const { lang, language, setLanguage } = useLanguage();

  // Load User Session & History On Mount
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            let currentRole = userData.role;
            
            // Auto-grant super_admin to reza.yusuf98@gmail.com
            if (firebaseUser.email === 'reza.yusuf98@gmail.com' && currentRole !== 'super_admin') {
               currentRole = 'super_admin';
               await updateDoc(doc(db, 'users', firebaseUser.uid), { role: 'super_admin' });
               userData.role = 'super_admin';
            }

            setCurrentUser({ id: userDoc.id, ...userData });
            if (currentRole === 'admin' || currentRole === 'super_admin') {
               setAppState('admin');
            } else {
               setAppState('upload');
            }
          } else {
            // New user via Google Login, default role to user
            const role: UserRole = firebaseUser.email === 'reza.yusuf98@gmail.com' ? 'super_admin' : 'user';
            const newUser: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email || 'User',
              username: firebaseUser.email?.split('@')[0] || 'user',
              role,
              createdAt: Date.now().toString()
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), {
             name: newUser.name,
             username: newUser.username,
             role: newUser.role,
             createdAt: Date.now()
            });
            setCurrentUser(newUser);
            if ((role as string) === 'admin' || role === 'super_admin') {
               setAppState('admin');
            } else {
               setAppState('upload');
            }
          }
        } catch (e) {
          console.error('Error fetching user profile:', e);
        }
      } else {
        setCurrentUser(null);
        if (appState !== 'landing' && appState !== 'login') {
            setAppState('landing');
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!currentUser) {
        setHistory([]);
        return;
    }

    const historyRef = collection(db, 'history');
    const q = (currentUser.role === 'admin' || currentUser.role === 'super_admin') 
              ? query(historyRef, orderBy('timestamp', 'desc'))
              : query(historyRef, where('userId', '==', currentUser.id));

    const unsubscribeHistory = onSnapshot(q, (snapshot) => {
      let historyData: HistoryItem[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HistoryItem[];
      
      // Sort in memory for users without composite index
      if (currentUser.role !== 'admin' && currentUser.role !== 'super_admin') {
        historyData.sort((a, b) => b.timestamp - a.timestamp);
      }
      setHistory(historyData);
    }, (error) => {
      console.error('Error fetching history:', error);
    });

    return () => unsubscribeHistory();
  }, [currentUser]);

  // Sync session and handle audit tracking
  const handleAddAuditLog = async (action: string, details?: string) => {
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin')) return;

    try {
      await addDoc(collection(db, 'audit_logs'), {
        timestamp: Date.now(),
        userId: currentUser.id,
        username: currentUser.username,
        role: currentUser.role,
        action,
        details: details || ''
      });
    } catch (e) {
      console.error('Error adding audit log:', e);
    }
  };

  const handleSaveConsultantNotes = async (scanId: string, notes: string) => {
    try {
      await updateDoc(doc(db, 'history', scanId), {
        consultantNotes: notes,
        consultantName: currentUser?.name || 'Consultant'
      });
      // The local state will update via the onSnapshot listener from Firestore
    } catch (e) {
        console.error('Error saving notes:', e);
    }
  };

  const handleDeleteHistoryItem = async (scanId: string) => {
     try {
       await deleteDoc(doc(db, 'history', scanId));
       handleAddAuditLog('Delete Record', `Admin deleted history record ID: ${scanId}`);
     } catch (e) {
       console.error('Error deleting record:', e);
     }
  };

  // Filter history: regular users see their own scans only, admins/super admins see everything,
  // guests only see scans in active guest state.
  const visibleHistory = currentUser
    ? (currentUser.role === 'admin' || currentUser.role === 'super_admin'
      ? history
      : history.filter(h => h.userId === currentUser.id))
    : history.filter(h => h.userId === 'guest' || !h.userId);

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
      const result = await processImageWithAI(file, language);
      
      let base64Image = null;
      if (file) {
        base64Image = await fileToBase64(file);
      } else if (uploadedImageURL) {
        base64Image = uploadedImageURL;
      }

      // Simpan hasil dan transisi ke dashboard
      setAnalysisCache({ [language]: result });
      setAnalysisData(result);
      
      const historyRef = collection(db, 'history');
      const docRef = await addDoc(historyRef, {
        timestamp: Date.now(),
        imageUrl: base64Image,
        analysisData: result,
        userId: currentUser?.id || 'guest',
        userDisplayName: currentUser?.name || 'Tamu Estetika'
      });
      
      setActiveScanId(docRef.id);

      // Audit Logger Activity
      handleAddAuditLog('Scan Wajah AI', `Melakukan scan digital mandiri; Tipe Kulit: ${result.skinType.type}, Hidrasi: ${result.skinAnalysis.hydration}%`);
      
      setAppState('results');
    } catch (e: any) {
      console.error(e);
      alert('Gagal memproses gambar dengan AI: ' + e.message);
      handleReset();
    }
  };

  const handleReset = () => {
    setAppState('upload');
    setAnalysisCache({});
    setAnalysisData(null);
    setArModeActive(false);
    setActiveScanId(null);
    // DO NOT revokeObjectURL here anymore because history needs it!
    setUploadedImageURL(null);
  };
  
  const handleViewHistory = () => {
    setAppState('history');
  };
  
  const handleSelectHistoryItem = (item: HistoryItem) => {
    setAnalysisCache({ [language]: item.analysisData });
    setAnalysisData(item.analysisData);
    setUploadedImageURL(item.imageUrl);
    setActiveScanId(item.id);
    setAppState('results');
  };

  const prevLangRef = useRef(language);
  
  useEffect(() => {
    if (appState === 'results' && uploadedImageURL && prevLangRef.current !== language) {
      const targetLang = language;
      if (analysisCache[targetLang]) {
        setAnalysisData(analysisCache[targetLang]);
        prevLangRef.current = targetLang;
      } else {
        const fetchTranslation = async () => {
          setAppState('analyzing');
          try {
            const response = await fetch(uploadedImageURL);
            const blob = await response.blob();
            const file = new File([blob], 'image.jpg', { type: blob.type });
            const result = await processImageWithAI(file, targetLang);
            setAnalysisCache(prev => ({ ...prev, [targetLang]: result }));
            setAnalysisData(result);
            prevLangRef.current = targetLang;
          } catch (e) {
            console.error("Failed to re-translate", e);
          }
          setAppState('results');
        };
        fetchTranslation();
      }
    } else {
      prevLangRef.current = language;
    }
  }, [language, appState, uploadedImageURL, analysisCache]);

  const activeScanItem = history.find(h => h.id === activeScanId);
  const consultantNotes = activeScanItem?.consultantNotes;
  const consultantName = activeScanItem?.consultantName;

  if (appState === 'landing') {
    return (
      <div className="min-h-[100dvh] md:h-screen w-full bg-slate-50 flex items-center justify-center p-0 md:p-6 font-sans md:overflow-hidden text-slate-800">
        <div className="min-h-[100dvh] md:h-full w-full max-w-5xl bg-slate-50 md:rounded-[2rem] flex flex-col md:overflow-hidden border-0 md:border border-slate-200 md:shadow-xl relative bg-white">
          <header className="h-16 bg-white border-b border-slate-200/60 px-4 md:px-8 flex items-center justify-between shrink-0 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 md:w-8 md:h-8 bg-pink-500 rounded-lg flex items-center justify-center shrink-0">
                <Sparkles className="text-white w-3.5 h-3.5 md:w-4 md:h-4" />
              </div>
              <span className="font-extrabold text-[15px] md:text-lg tracking-tight text-slate-900 flex shrink-0">
                Lumina<span className="text-pink-500 underline decoration-2 hidden sm:inline">Aesthetic</span>
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <div className="flex items-center gap-1.5 md:gap-2">
                <button 
                  onClick={() => setLanguage('id')} 
                  className={`font-semibold text-[10px] sm:text-xs transition-colors ${language === 'id' ? 'text-pink-600' : 'text-slate-400 hover:text-slate-500'}`}
                >
                  ID
                </button>
                <span className="text-slate-300 text-[10px] sm:text-xs">|</span>
                <button 
                  onClick={() => setLanguage('en')} 
                  className={`font-semibold text-[10px] sm:text-xs transition-colors ${language === 'en' ? 'text-pink-600' : 'text-slate-400 hover:text-slate-500'}`}
                >
                  EN
                </button>
              </div>
              
              <button
                onClick={() => {
                  setActiveRolePreset(undefined);
                  setAppState('login');
                }}
                className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-slate-900 hover:bg-slate-800 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-lg sm:rounded-xl transition-colors shadow-md flex items-center gap-1.5 whitespace-nowrap"
                id="btn-landing-login-topbar"
              >
                <LogIn className="w-3.5 h-3.5 hidden sm:inline-block" />
                <span>{language === 'id' ? 'Masuk' : 'Sign In'}</span>
              </button>
            </div>
          </header>

          <LandingPage 
            onStartAsGuest={() => {
              setCurrentUser(null);
              setAppState('upload');
            }}
            onOpenLogIn={(presetRole) => {
              setActiveRolePreset(presetRole);
              setAppState('login');
            }}
            language={language}
          />
        </div>
      </div>
    );
  }

  if (appState === 'login') {
    return (
      <div className="min-h-[100dvh] md:h-screen w-full bg-[#fcfbfb] flex items-center justify-center p-4 sm:p-6 font-sans md:overflow-hidden text-slate-800">
        <AuthView 
          onBackToLanding={() => setAppState('landing')}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            handleAddAuditLog('Login Sistem', `Pengguna mengautentikasi ke sistem dengan hak akses ${user.role.toUpperCase()}`);
            if (user.role === 'admin' || user.role === 'super_admin') {
              setAppState('admin');
            } else {
              setAppState('upload');
            }
          }}
          language={language}
          initialRolePreset={activeRolePreset}
        />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] md:h-screen w-full bg-slate-50 flex items-center justify-center p-0 md:p-6 font-sans md:overflow-hidden text-slate-800">
      <div className="min-h-[100dvh] md:h-full w-full max-w-5xl bg-slate-50 md:rounded-[2rem] flex flex-col md:overflow-hidden border-0 md:border border-slate-200 md:shadow-xl">
        
        {/* Header */}
        <header className="h-auto md:h-16 bg-white border-b border-slate-200 px-4 md:px-8 py-3 md:py-0 flex flex-col md:flex-row items-center justify-between shrink-0 gap-3 md:gap-0">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="text-white w-4 h-4" />
            </div>
            <span className="font-semibold text-xl tracking-tight text-slate-900">
              {lang.headerTitle}<span className="text-pink-500 underline decoration-2">{lang.headerSubtitle}</span>
            </span>
          </div>
          <nav className="flex items-center justify-center md:justify-end gap-3 md:gap-6 text-xs md:text-sm font-medium text-slate-500 w-full overflow-x-auto hide-scrollbar pb-1 md:pb-0">
            
            {currentUser && (currentUser.role === 'admin' || currentUser.role === 'super_admin') && (
              <button 
                onClick={() => setAppState('admin')} 
                className={`font-black uppercase tracking-tight pb-1 border-b-2 whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${appState === 'admin' ? 'text-indigo-600 border-indigo-505 border-indigo-500' : 'text-indigo-400 border-transparent hover:text-indigo-650 hover:text-indigo-600'}`}
                id="btn-header-admin-portal"
              >
                <Shield className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                {language === 'id' ? 'Panel Admin' : 'Admin Panel'}
              </button>
            )}

            <button onClick={handleReset} className={`hover:text-slate-800 shrink-0 whitespace-nowrap transition-colors ${appState !== 'history' && appState !== 'admin' ? 'text-pink-600 font-bold' : ''}`}>{lang.navAnalysis}</button>
            <button className="hidden md:block hover:text-slate-800 transition-colors cursor-not-allowed opacity-50 shrink-0">{lang.navAppointments}</button>
            <button onClick={handleViewHistory} className={`hover:text-slate-800 shrink-0 whitespace-nowrap transition-colors ${appState === 'history' ? 'text-pink-600 font-bold' : ''}`}>{lang.navHistory}</button>
            
            <div className="flex items-center gap-2 ml-2 md:ml-4 pl-2 md:pl-4 border-l border-slate-200 shrink-0">
              <button 
                onClick={() => setLanguage('id')} 
                className={`font-bold transition-colors ${language === 'id' ? 'text-pink-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                ID
              </button>
              <span className="text-slate-300">|</span>
              <button 
                onClick={() => setLanguage('en')} 
                className={`font-bold transition-colors ${language === 'en' ? 'text-pink-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                EN
              </button>
            </div>

            {/* Logout Trigger button inside clinical ecosystem */}
            <div className="flex items-center gap-2 border-l border-slate-200 pl-2 md:pl-4 shrink-0">
              <span className="text-[10px] font-mono whitespace-nowrap font-black uppercase text-slate-400 bg-slate-50 px-2 py-1 border border-slate-200 rounded leading-none hidden sm:block">
                {currentUser?.name ? currentUser.name.split(' ')[0] : 'Guest'}
              </span>
              <button
                onClick={async () => {
                  handleAddAuditLog('Logout Sistem', 'Pengguna mereset sesi aktif dan keluar ke gerbang utama');
                  await signOut(auth);
                  setCurrentUser(null);
                  setAppState('landing');
                }}
                className="p-1.5 hover:bg-slate-50 hover:text-rose-500 border border-transparent hover:border-slate-200 rounded-lg text-slate-400 transition-all cursor-pointer"
                title={language === 'id' ? 'Keluar Sesi' : 'Sign Out'}
                id="btn-nav-logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </nav>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col md:flex-row md:overflow-hidden p-4 md:p-6 gap-4 md:gap-6 bg-slate-50 relative">
          
          {appState === 'admin' ? (
            <div className="w-full h-full absolute inset-0 md:static z-40 p-4 md:p-0 bg-slate-50 md:bg-transparent">
              <AdminPanel 
                currentUser={currentUser || { id: 'guest', name: 'Guest', username: 'guest', role: 'user', createdAt: '' }}
                history={history}
                onAddAuditLog={handleAddAuditLog}
                onSaveConsultantNotes={handleSaveConsultantNotes}
                onDeleteHistoryItem={handleDeleteHistoryItem}
                language={language}
              />
            </div>
          ) : appState === 'history' ? (
            <div className="w-full h-full absolute inset-0 md:static z-40 p-4 md:p-0 bg-slate-50 md:bg-transparent">
               <HistoryView 
                 history={visibleHistory} 
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
              {language === 'id' ? 'Input Wajah' : 'Face Input'}
            </h2>

            <div className="flex-1 flex flex-col relative w-full h-full min-h-[340px] md:min-h-0">
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
                    {language === 'id' ? 'Mulai Analisis Baru' : 'Start New Analysis'} <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </section>
          
          {/* Main Content: Dashboard Results */}
          <section className={`flex-1 md:overflow-hidden flex flex-col ${appState !== 'results' ? 'hidden md:flex' : ''}`}>
            {appState !== 'results' ? (
              <div id="dashboard-empty" className="flex-1 flex flex-col justify-center gap-y-5 md:gap-y-6 bg-white border border-slate-100 rounded-2xl p-5 md:p-8 text-center shadow-sm">
                
                {/* Header Welcome Title */}
                <div className="max-w-xl mx-auto mt-2">
                  <div className="inline-flex items-center gap-1.5 bg-pink-50 text-pink-500 text-[9px] uppercase font-mono font-black tracking-widest px-3 py-1 rounded-full mb-2">
                    <Sparkles className="w-3 h-3 animate-pulse" />
                    {language === 'id' ? 'Ekosistem Estetika AI' : 'AI Aesthetic Diagnostics'}
                  </div>
                  <h3 className="text-slate-800 font-extrabold text-[15px] md:text-lg tracking-tight leading-snug">
                    {language === 'id' ? 'Pedoman Presisi Foto Wajah AI' : 'AI Precision Photo Guidelines'}
                  </h3>
                  <p className="text-slate-500 text-[11px] md:text-xs leading-relaxed font-semibold mt-1 max-w-lg mx-auto">
                    {language === 'id' 
                      ? 'Posisikan foto wajah Anda sesuai dengan indikator medis di bawah ini demi menjamin keakuratan pemindaian kontur & struktur rahang.' 
                      : 'Align your facial capture with standard clinical guidelines to ensure highly precise metric calculations for jaw alignments.'}
                  </p>
                </div>

                {/* 2x2 Clean Bento Grid for Guidelines */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto w-full my-4">
                  
                  {/* Card 1 */}
                  <div className="p-3.5 bg-slate-50/60 border border-slate-100 rounded-xl hover:shadow-xs transition-shadow flex gap-3 text-left">
                    <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                      <Target size={16} />
                    </div>
                    <div>
                      <h4 className="text-[10.5px] font-bold text-slate-800 uppercase tracking-wide">
                        {language === 'id' ? 'Posisi Sejajar' : 'Upright Alignment'}
                      </h4>
                      <p className="text-[10px] text-slate-500 leading-normal font-semibold mt-0.5">
                        {language === 'id' 
                          ? 'Tatap lurus tegak ke arah kamera, pastikan posisi mata seimbang & sejajar secara horisontal.' 
                          : 'Look directly at the front lens, ensuring eye level is straight and aligned horizontally.'}
                      </p>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="p-3.5 bg-slate-50/60 border border-slate-100 rounded-xl hover:shadow-xs transition-shadow flex gap-3 text-left">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                      <Sun size={16} />
                    </div>
                    <div>
                      <h4 className="text-[10.5px] font-bold text-slate-800 uppercase tracking-wide">
                        {language === 'id' ? 'Cahaya Terang' : 'Bright Lighting'}
                      </h4>
                      <p className="text-[10px] text-slate-500 leading-normal font-semibold mt-0.5">
                        {language === 'id' 
                          ? 'Gunakan cahaya ruangan yang cukup terang dan merata tanpa ada bayangan tebal di satu sisi wajah.' 
                          : 'Use bright ambient or natural light. Avoid harsh shadows cast diagonally across your cheekbones.'}
                      </p>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="p-3.5 bg-slate-50/60 border border-slate-100 rounded-xl hover:shadow-xs transition-shadow flex gap-3 text-left">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                      <Smile size={16} />
                    </div>
                    <div>
                      <h4 className="text-[10.5px] font-bold text-slate-800 uppercase tracking-wide">
                        {language === 'id' ? 'Ekspresi Netral' : 'Natural Expression'}
                      </h4>
                      <p className="text-[10px] text-slate-500 leading-normal font-semibold mt-0.5">
                        {language === 'id' 
                          ? 'Rilekskan otot wajah Anda. Hindari tersenyum terlalu lebar agar proporsi alami terukur.' 
                          : 'Maintain natural facial musculature. Avoid smiling widely so basic ratios stay true.'}
                      </p>
                    </div>
                  </div>

                  {/* Card 4 */}
                  <div className="p-3.5 bg-[#fbfdfb] border border-emerald-100/50 rounded-xl hover:shadow-xs transition-shadow flex gap-3 text-left">
                    <div className="w-8 h-8 rounded-lg bg-emerald-105 bg-emerald-100 text-emerald-650 text-emerald-600 flex items-center justify-center shrink-0">
                      <ShieldCheck size={16} />
                    </div>
                    <div>
                      <h4 className="text-[10.5px] font-bold text-slate-850 text-slate-800 uppercase tracking-wide">
                        {language === 'id' ? 'Wajah Bersih' : 'Unobstructed Face'}
                      </h4>
                      <p className="text-[10px] text-slate-500 leading-normal font-semibold mt-0.5">
                        {language === 'id' 
                          ? 'Singkirkan helaian rambut dari kening/dahi serta lepas kacamata sementara waktu untuk kalibrasi.' 
                          : 'Pull back loose locks of hair from your face/forehead. Remove high reflections/glasses.'}
                      </p>
                    </div>
                  </div>

                </div>

                {/* Patient Safety Integrity Trust badge under guidelines */}
                <div className="border-t border-slate-100 pt-3 flex flex-col sm:flex-row items-center justify-between text-[8.5px] font-bold uppercase tracking-wider text-slate-400 gap-2 px-1">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{language === 'id' ? 'Enkripsi & Kerahasiaan Sesi HIPAA Aktif' : 'Secure Session & Medical HIPAA Compliant'}</span>
                  </div>
                  <div className="text-slate-450 text-slate-400 font-mono text-[8px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {language === 'id' ? 'Data Diolah Secara Lokal' : 'Locally Shielded Sandbox Mode'}
                  </div>
                </div>

              </div>
            ) : (
              analysisData && (
                <DashboardView 
                  data={analysisData} 
                  onReset={handleReset} 
                  onTryOnAR={() => setArModeActive(true)} 
                  imageSrc={uploadedImageURL} 
                  consultantNotes={consultantNotes}
                  consultantName={consultantName}
                />
              )
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
              v2.29.0 Updates
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
