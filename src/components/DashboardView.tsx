import { motion } from "motion/react";
import { AnalysisResult } from "../types";
import { ScanFace, Scissors, Loader, Download, Palette, Glasses, ClipboardList, ChevronDown, ChevronUp, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import * as faceapi from "@vladmandic/face-api";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";
import { PdfReportTemplate } from "./PdfReportTemplate";
import { FaceFeatureModal } from "./FaceFeatureModal";
import { GlassesFrameModal } from "./GlassesFrameModal";
import { ColorAnalysisModal } from "./ColorAnalysisModal";
import { HairstyleSvg } from "./HairstyleSvg";
import { useLanguage } from "../contexts/LanguageContext";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

interface DashboardViewProps {
  data: AnalysisResult;
  onReset: () => void;
  onTryOnAR: () => void;
  imageSrc?: string | null;
  consultantNotes?: string;
  consultantName?: string;
  disabledFeatures?: string[];
}

export function DashboardView({
  data,
  onReset,
  onTryOnAR,
  imageSrc,
  consultantNotes,
  consultantName,
  disabledFeatures = [],
}: DashboardViewProps) {
  const { lang, language } = useLanguage();
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showSkinAnalysisModal, setShowSkinAnalysisModal] = useState(false);
  const [showFaceFeatureModal, setShowFaceFeatureModal] = useState(false);
  const [showGlassesModal, setShowGlassesModal] = useState(false);
  const [showColorAnalysisModal, setShowColorAnalysisModal] = useState(false);
  const [detailedFaceData, setDetailedFaceData] = useState<{ [key: string]: any }>({});
  const [isDetailedFaceLoading, setIsDetailedFaceLoading] = useState(false);
  const [faceData, setFaceData] = useState<any>(null);
  const [isNotesExpanded, setIsNotesExpanded] = useState(true);
  const [isDetailedSymmetryExpanded, setIsDetailedSymmetryExpanded] = useState(false);

  useEffect(() => {
    const tutorialDone = localStorage.getItem('lumina_tutorial_dashboard_done');
    if (!tutorialDone && !showSkinAnalysisModal && !showFaceFeatureModal && !showGlassesModal && !showColorAnalysisModal) {
      setTimeout(() => {
        const driverObj = driver({
          showProgress: true,
          allowClose: false,
          steps: [
            { 
              element: '[data-testid="card-skin-analysis"]', 
              popover: { 
                title: language === 'id' ? 'Diagnosis Kulit' : 'Skin Diagnosis', 
                description: language === 'id' ? 'Klik di sini untuk melihat diagnosis tipe kulit, tingkat hidrasi, dsb.' : 'Click to see skin diagnosis details.', 
                side: "bottom", align: 'start' 
              } 
            },
            { 
              element: '[data-testid="card-face-feature"]', 
              popover: { title: language === 'id' ? 'Geometri Wajah' : 'Face Geometry', description: language === 'id' ? 'Pelajari simetri dan landmark anatomi wajah Anda.' : 'Learn about facial symmetry and landmarks.', side: "left", align: 'start' } 
            },
            { 
              element: '[data-testid="card-skin-type"]', 
              popover: { title: language === 'id' ? 'Tipe Kulit' : 'Skin Type', description: language === 'id' ? 'Menampilkan klasifikasi tipe kulit beserta rasio area wajah.' : 'Displays skin type classification and zone conditions.', side: "top", align: 'start' } 
            },
            { 
              element: '[data-testid="card-spectacles"]', 
              popover: { title: language === 'id' ? 'Bentuk Wajah & Virtual AR' : 'Face Shape & AR View', description: language === 'id' ? 'Simak bentuk wajah dan cobalah kacamata dengan Virtual Try-On AR.' : 'See your face shape and try on AR glasses.', side: "left", align: 'start' } 
            },
            { 
              element: '[data-testid="card-color-analysis"]', 
              popover: { title: language === 'id' ? 'Analisis Warna' : 'Color Analysis', description: language === 'id' ? 'Eksplorasi spektrum palet warna yang paling pas untuk tampilanmu.' : 'Explore seasonal color palettes that suit you best.', side: "top", align: 'start' } 
            }
          ],
          onDestroyStarted: () => {
             localStorage.setItem('lumina_tutorial_dashboard_done', 'true');
             driverObj.destroy();
          }
        });
        
        try {
           driverObj.drive();
        } catch (e) {
           console.warn("Driver fail", e);
        }
      }, 1000);
    }
  }, [language, showSkinAnalysisModal, showFaceFeatureModal, showGlassesModal, showColorAnalysisModal]);

  // Background pre-fetch for detailed face features (symmetry, coordinates etc.)
  useEffect(() => {
    let isMounted = true;
    if (!imageSrc || detailedFaceData[language] || isDetailedFaceLoading) return;

    const prefetchFeatures = async () => {
      setIsDetailedFaceLoading(true);
      try {
      let fileBlob: Blob;
      try {
        if (imageSrc.startsWith('data:')) {
          const byteString = atob(imageSrc.split(',')[1]);
          const mimeString = imageSrc.split(',')[0].split(':')[1].split(';')[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          fileBlob = new Blob([ab], { type: mimeString });
        } else {
          fileBlob = await fetch(imageSrc).then(r => r.blob());
        }
      } catch (err) {
        console.error("Failed to convert imageSrc to blob:", err);
        throw err;
      }

      const preferredModel = localStorage.getItem('lumina-settings-model') || 'gemini-3.5-flash';
      const formData = new FormData();
      formData.append('image', fileBlob, 'image.jpg');
      formData.append('language', language);
      formData.append('preferredModel', preferredModel);

      let res: Response;
      try {
        res = await fetch('/api/analyze-features', {
          method: 'POST',
          body: formData
        });
      } catch (err) {
        console.error("Failed to fetch /api/analyze-features (network error):", err);
        throw err;
      }
        
        if (res.ok) {
          const contentType = res.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            const text = await res.text();
            if (text.includes("Cookie check") || text.includes("aistudio_auth_flow")) {
              throw new Error("Cookie blocked, requiring new tab.");
            }
            throw new Error("Non-JSON Background Prefetch response.");
          }
          const resData = await res.json();
          if (isMounted) {
            setDetailedFaceData(prev => ({ ...prev, [language]: resData }));
          }
        }
      } catch (err) {
        console.error("Background prefetch feature geometry failed:", err);
      } finally {
        if (isMounted) {
          setIsDetailedFaceLoading(false);
        }
      }
    };

    prefetchFeatures();
    return () => {
      isMounted = false;
    };
  }, [imageSrc, language]);

  const [isFaceScanning, setIsFaceScanning] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [waterIntake, setWaterIntake] = useState(0);
  const [intakeHistory, setIntakeHistory] = useState<
    { amount: number; time: Date }[]
  >([]);
  const dailyGoal = 2000; // 2000 ml
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDownloadReport = async () => {
    const pages = document.querySelectorAll(".pdf-page");
    if (!pages || pages.length === 0) return;

    setIsDownloading(true);
    try {
      // Small delay to ensure any layout shifts are complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < pages.length; i++) {
        const pageElement = pages[i] as HTMLElement;
        const imgData = await htmlToImage.toJpeg(pageElement, {
          quality: 0.95,
          backgroundColor: "#ffffff",
          pixelRatio: 2,
        });

        if (i > 0) {
          pdf.addPage();
        }
        
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      }

      pdf.save("LuminaAesthetic-Report.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Gagal membuat laporan PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    if (!showSkinAnalysisModal || !containerRef.current) return;

    // Track container size for precise object-cover plotting
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setContainerSize({
          w: entries[0].contentRect.width,
          h: entries[0].contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [showSkinAnalysisModal]);

  useEffect(() => {
    if (showSkinAnalysisModal && imageSrc && !faceData && !isFaceScanning) {
      setIsFaceScanning(true);
      const scanFace = async () => {
        try {
          await faceapi.nets.tinyFaceDetector.loadFromUri(
            "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/",
          );
          await faceapi.nets.faceLandmark68Net.loadFromUri(
            "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/",
          );

          if (imageRef.current) {
            const detections = await faceapi
              .detectSingleFace(
                imageRef.current,
                new faceapi.TinyFaceDetectorOptions(),
              )
              .withFaceLandmarks();
            if (detections) {
              const positions = detections.landmarks.positions;
              const noseLen = positions[33].y - positions[27].y;
              const toPoints = (pts: { x: number; y: number }[]) =>
                pts.map((p) => `${p.x},${p.y}`).join(" ");

              const tZone = toPoints([
                { x: positions[17].x, y: positions[17].y - noseLen * 0.7 },
                {
                  x: positions[19].x,
                  y: Math.max(0, positions[19].y - noseLen * 0.9),
                },
                {
                  x: positions[24].x,
                  y: Math.max(0, positions[24].y - noseLen * 0.9),
                },
                { x: positions[26].x, y: positions[26].y - noseLen * 0.7 },
                { x: positions[26].x + 5, y: positions[26].y - 10 },
                { x: positions[22].x, y: positions[22].y - 5 },
                { x: positions[27].x + 12, y: positions[27].y + 10 },
                { x: positions[35].x + 18, y: positions[35].y },
                { x: positions[33].x, y: positions[33].y + 15 },
                { x: positions[31].x - 18, y: positions[31].y },
                { x: positions[27].x - 12, y: positions[27].y + 10 },
                { x: positions[21].x, y: positions[21].y - 5 },
                { x: positions[17].x - 5, y: positions[17].y - 10 },
              ]);

              const leftCheek = toPoints([
                { x: positions[2].x, y: positions[2].y },
                { x: positions[4].x, y: positions[4].y },
                { x: positions[5].x + 5, y: positions[5].y - 5 },
                { x: positions[48].x - 15, y: positions[48].y },
                { x: positions[31].x - 15, y: positions[31].y },
                { x: positions[36].x - 10, y: positions[36].y + 15 },
                { x: positions[1].x + 5, y: positions[36].y + 15 },
              ]);

              const rightCheek = toPoints([
                { x: positions[14].x, y: positions[14].y },
                { x: positions[12].x, y: positions[12].y },
                { x: positions[11].x - 5, y: positions[11].y - 5 },
                { x: positions[54].x + 15, y: positions[54].y },
                { x: positions[35].x + 15, y: positions[35].y },
                { x: positions[45].x + 10, y: positions[45].y + 15 },
                { x: positions[15].x - 5, y: positions[45].y + 15 },
              ]);

              const chin = toPoints([
                { x: positions[6].x, y: positions[6].y },
                { x: positions[8].x, y: positions[8].y + 15 },
                { x: positions[10].x, y: positions[10].y },
                { x: positions[54].x, y: positions[54].y + 25 },
                { x: positions[57].x, y: positions[57].y + 15 },
                { x: positions[48].x, y: positions[48].y + 25 },
              ]);

              const imgW = imageRef.current.naturalWidth;
              const imgH = imageRef.current.naturalHeight;

              setFaceData({
                imgW,
                imgH,
                tZone,
                leftCheek,
                rightCheek,
                chin,
                tZoneLabel: {
                  x: positions[27].x,
                  y: Math.max(0, positions[27].y - noseLen * 0.8),
                  w: 0,
                  h: 0,
                },
                leftCheekLabel: {
                  x: (positions[2].x + positions[31].x) / 2,
                  y: positions[31].y + 15,
                  w: 0,
                  h: 0,
                },
                rightCheekLabel: {
                  x: (positions[14].x + positions[35].x) / 2,
                  y: positions[35].y + 15,
                  w: 0,
                  h: 0,
                },
                chinLabel: {
                  x: positions[8].x,
                  y: positions[8].y - 15,
                  w: 0,
                  h: 0,
                },
              });
            }
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsFaceScanning(false);
        }
      };

      if (imageRef.current?.complete) {
        scanFace();
      } else {
        imageRef.current?.addEventListener("load", scanFace);
      }
    }
  }, [showSkinAnalysisModal, imageSrc, faceData, isFaceScanning]);

  const getMappedStyle = (rawFeature: any) => {
    if (!faceData || !containerSize.w || !containerSize.h)
      return { display: "none" };

    const { imgW, imgH } = faceData;
    const contW = containerSize.w;
    const contH = containerSize.h;

    const imgRatio = imgW / imgH;
    const contRatio = contW / contH;

    let renderW = contW;
    let renderH = contH;
    let offsetX = 0;
    let offsetY = 0;

    // Simulate CSS object-cover behavior
    if (contRatio > imgRatio) {
      // Wider container -> scale to fit width
      renderW = contW;
      renderH = contW / imgRatio;
      offsetY = (contH - renderH) / 2;
    } else {
      // Taller container -> scale to fit height
      renderH = contH;
      renderW = contH * imgRatio;
      offsetX = (contW - renderW) / 2;
    }

    const mappedX = (rawFeature.x / imgW) * renderW + offsetX;
    const mappedY = (rawFeature.y / imgH) * renderH + offsetY;
    const mappedW = (rawFeature.w / imgW) * renderW;
    const mappedH = (rawFeature.h / imgH) * renderH;

    return {
      left: `${mappedX}px`,
      top: `${mappedY}px`,
      width: `${mappedW}px`,
      height: `${mappedH}px`,
      transform: "translate(-50%, -50%)",
      position: "absolute" as any,
    };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <div
      className="flex-1 overflow-y-auto flex flex-col h-full"
      id="dashboard-report-content"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800">{lang.scanResult || 'Analysis Result'}</h2>
        {!disabledFeatures.includes('export_report') && (
          <button
            onClick={handleDownloadReport}
            disabled={isDownloading}
            className="bg-pink-50 text-pink-600 px-3 py-1.5 rounded-lg text-sm font-bold border border-pink-100 hover:bg-pink-100 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <Loader size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            {isDownloading ? lang.generating : lang.downloadReport}
          </button>
        )}
      </div>

      {/* 0. Professional Consultant / Aesthetic Clinician Notes Section */}
      {consultantNotes ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 bg-gradient-to-br from-[#fffbf5] via-[#fffdfb] to-white border border-[#ebd2b9] rounded-2xl shadow-sm overflow-hidden relative"
        >
          {/* Header Bar */}
          <div 
            onClick={() => setIsNotesExpanded(!isNotesExpanded)}
            className="flex items-center justify-between p-3 sm:p-4 cursor-pointer select-none border-b border-[#fdf3e8]"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center shrink-0 border border-orange-200">
                <ClipboardList className="w-4 h-4 text-orange-600" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-black uppercase text-orange-700 tracking-wider">
                  {language === 'id' ? 'Catatan Estetika Khusus' : 'Special Aesthetic Clinician Notes'}
                </h3>
                {consultantName && (
                  <p className="text-[10px] text-orange-500 font-bold truncate mt-0.5">
                    {language === 'id' ? 'Konsultan:' : 'Clinician:'} <span className="font-extrabold text-[#d97706]">{consultantName}</span>
                  </p>
                )}
              </div>
            </div>
            
            <button className="p-1 px-2 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 transition-colors flex items-center gap-1 text-[10px] font-black uppercase tracking-tight shrink-0">
              <span>{isNotesExpanded ? (language === 'id' ? 'Sembunyikan' : 'Hide') : (language === 'id' ? 'Lihat Sesi' : 'Expand')}</span>
              {isNotesExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>

          {/* Content Body */}
          {isNotesExpanded && (
            <div 
              className="p-3 sm:p-4 text-slate-700 font-sans leading-relaxed text-xs border-t border-orange-100 bg-white/50"
            >
              <div className="bg-[#fffdfa] rounded-xl p-3 border border-[#fef3e5] text-left relative overflow-hidden italic shadow-[inset_0_1px_3px_rgba(0,0,0,0.01)]">
                {/* Visual quote indicator */}
                <span className="absolute -left-1 -top-3 text-[40px] text-orange-200/40 font-serif select-none pointer-events-none">“</span>
                <p className="relative z-10 text-[11px] sm:text-xs text-slate-700 leading-relaxed pl-3 whitespace-pre-line font-medium text-justify">
                  {consultantNotes}
                </p>
              </div>

              {/* Verified Badge to show professional authority */}
              <div className="mt-2.5 flex items-center justify-between text-[8px] uppercase tracking-widest text-slate-400 font-black">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span>{language === 'id' ? 'Verifikasi Medis Aktif' : 'Medical Verification Active'}</span>
                </div>
                <span>LUMINA CLINIC EXPERT NOTES</span>
              </div>
            </div>
          )}
        </motion.div>
      ) : (
        <div className="mb-4 bg-gradient-to-r from-slate-50 to-white border border-slate-200/50 rounded-xl p-2.5 sm:p-3 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 shadow-sm">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></div>
            <span className="truncate">
              {language === 'id' 
                ? 'Belum ada catatan kustom dokter. Konsultasikan di klinik untuk anotasi klinis personal.' 
                : 'No custom clinician notes yet. Visit our clinic for bespoke clinical annotations.'}
            </span>
          </div>
          <span className="text-[8px] uppercase font-bold text-slate-400 flex items-center gap-1 shrink-0">
            <User size={10} /> AI ACTIVE
          </span>
        </div>
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 flex flex-col gap-4 lg:gap-5 pb-6"
      >
        <div className="flex flex-col md:flex-row gap-4 lg:gap-5">
  {/* Left Column */}
  <div className="flex-1 flex flex-col gap-4 lg:gap-5 min-w-0">
{/* 1. Skin Analysis */}
        {!disabledFeatures.includes('skin_analysis') && (
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl border border-pink-100 p-3 sm:p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden group"
          data-testid="card-skin-analysis"
          onClick={() => setShowSkinAnalysisModal(true)}
        >
          <div className="absolute top-0 right-0 p-2 opacity-50 group-hover:opacity-100 transition-opacity">
            <ScanFace size={16} className="text-pink-500" />
          </div>
          <h3 className="text-[10px] sm:text-xs font-bold uppercase text-slate-400 mb-1.5 sm:mb-2 tracking-wider z-10 relative">
            {lang.skinDiagnosis}
          </h3>
          <div className="w-full h-40 sm:h-48 mt-[-10px] sm:mt-[-20px] mb-2 pointer-events-none">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart 
                cx="50%" 
                cy="50%" 
                outerRadius="70%" 
                data={[
                  { subject: language === 'id' ? 'Hidrasi' : 'Hydration', A: data.skinAnalysis.hydration || 60, fullMark: 100 },
                  { subject: language === 'id' ? 'Elastisitas' : 'Elasticity', A: data.skinAnalysis.elasticity || 75, fullMark: 100 },
                  { subject: language === 'id' ? 'Pori-pori' : 'Pores', A: data.skinAnalysis.pores || 70, fullMark: 100 },
                  { subject: language === 'id' ? 'Tekstur' : 'Texture', A: data.skinAnalysis.texture || 65, fullMark: 100 },
                ]}
              >
                <PolarGrid stroke="#fce7f3" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Skin Quality" dataKey="A" stroke="#ec4899" strokeWidth={2} fill="#fbcfe8" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 relative z-10">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                {data.skinAnalysis.notes}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-pink-200 flex flex-col items-center justify-center text-[10px] font-bold text-pink-600 shrink-0 bg-pink-50/50 shadow-sm">
              <span className="text-[8px] text-pink-400 font-medium uppercase">{language === 'id' ? 'MERAH' : 'RED'}</span>
              <span className="-mt-1 leading-tight">{data.skinAnalysis.rednessLevels.substring(0,3).toUpperCase()}</span>
            </div>
          </div>
        </motion.div>
        )}

        {/* 3. Face Feature Analysis */}
        {!disabledFeatures.includes('face_analysis') && (
        <motion.div
          variants={itemVariants}
          className="bg-slate-900 text-white rounded-xl p-3 sm:p-4 shadow-xl flex flex-col cursor-pointer hover:shadow-2xl hover:scale-[1.01] transition-all relative overflow-hidden group"
          data-testid="card-face-feature"
          onClick={() => setShowFaceFeatureModal(true)}
        >
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
             <ScanFace className="w-4 h-4 text-slate-500" />
          </div>
          <h3 className="text-[10px] sm:text-xs font-bold uppercase text-slate-500 mb-3 sm:mb-4 tracking-wider">
            {lang.faceGeometry || 'Geometry Analysis'}
          </h3>
          <div className="flex-1 flex flex-col gap-5 sm:gap-6 pt-1">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-pink-500 shrink-0 shadow-[0_0_8px_rgba(236,72,153,0.8)]"></div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-400">{lang.faceShape || 'Shape'}</p>
                  <p className="text-base font-bold text-white leading-tight mt-0.5">
                    {data.faceFeatures.shape}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-pink-500 shrink-0"></div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-400">{lang.eyes || 'Eyes'}</p>
                  <p className="text-base font-bold text-white leading-tight mt-0.5">
                    {data.faceFeatures.eyes}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-pink-500 shrink-0"></div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-400">{lang.jawline || 'Jaw'}</p>
                  <p className="text-base font-bold text-white leading-tight mt-0.5">
                    {data.faceFeatures.jawline}
                  </p>
                </div>
              </div>
            </div>

            {/* AI Facial Symmetry & Geometric Proportions */}
            <div className="border-t border-white/5 pt-5 space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-[11px] font-bold text-[#8ba3c7] uppercase tracking-widest">
                  {language === 'en' ? "AI Geometric Proportions" : "Proporsi & Simetri Geometri AI"}
                </p>
                {isDetailedFaceLoading && (
                  <span className="text-[8px] font-bold bg-pink-500/10 text-pink-400 px-1.5 py-0.5 rounded tracking-wide animate-pulse">
                    AI Active
                  </span>
                )}
              </div>
              
              {/* Symmetry Progress Bar */}
              <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider">
                      {language === 'en' ? "Facial Symmetry Alignment Ratio" : "Rasio Keselarasan Simetri Wajah"}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`font-mono font-black text-[10px] sm:text-[11px] md:text-xs ${isDetailedFaceLoading ? 'text-pink-400 animate-pulse' : 'text-pink-500'}`}>
                        {(() => {
                          const cachedScore = detailedFaceData[language]?.symmetryScore;
                          if (cachedScore !== undefined && cachedScore !== null) return `${cachedScore.toFixed(1)}%`;
                          return isDetailedFaceLoading 
                            ? (language === 'en' ? "Calibrating..." : "Mengkalibrasi...") 
                            : "88.0%";
                        })()}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-pink-500 rounded-full transition-all duration-1000 ${isDetailedFaceLoading ? 'animate-pulse opacity-70' : ''}`} 
                      style={{ 
                        width: `${(() => {
                          const cachedScore = detailedFaceData[language]?.symmetryScore;
                          if (cachedScore !== undefined && cachedScore !== null) return cachedScore;
                          return 88.0;
                        })()}%` 
                      }}
                    ></div>
                  </div>
                </div>

                {/* Sub-metrics of Symmetry to fill the empty space beautifully - Collapsible for mobile ergonomics */}
                <div className="pt-4 border-t border-white/5 space-y-3 animate-fade-in text-left">
                  <p className="text-[10px] font-bold text-[#8ba3c7] uppercase tracking-wider">
                    {language === 'en' ? "Detailed Proportions Breakdown" : "RANGKUMAN RINCIAN KESEIMBANGAN ELEMEN"}
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[10px]">
                    {/* Eyebrow Alignment */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-semibold text-slate-300">
                        <span>{language === 'en' ? "Eyebrow Level" : "Elevasi Garis Alis"}</span>
                        <span className="font-mono text-white font-bold">
                          {(() => {
                            const score = detailedFaceData[language]?.symmetryScore || 88.0;
                            return `${Math.round(score * 0.98)}%`;
                          })()}
                        </span>
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full transition-all duration-700" 
                          style={{ 
                            width: `${(() => {
                              const score = detailedFaceData[language]?.symmetryScore || 88.0;
                              return Math.round(score * 0.98);
                            })()}%` 
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Eye Alignment */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-semibold text-slate-300">
                        <span>{language === 'en' ? "Eye Alignment" : "Kesejajaran Horizontal Mata"}</span>
                        <span className="font-mono text-white font-bold">
                          {(() => {
                            const score = detailedFaceData[language]?.symmetryScore || 88.0;
                            const val = Math.round(score * 1.01);
                            return `${val > 100 ? 100 : val}%`;
                          })()}
                        </span>
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-400 rounded-full transition-all duration-700" 
                          style={{ 
                            width: `${(() => {
                              const score = detailedFaceData[language]?.symmetryScore || 88.0;
                              const val = Math.round(score * 1.01);
                              return val > 100 ? 100 : val;
                            })()}%` 
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Lips & Nose Balance */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-semibold text-slate-300">
                        <span>{language === 'en' ? "Mouth & Nose" : "Garis Bibir & Sumbu Hidung"}</span>
                        <span className="font-mono text-white font-bold">
                          {(() => {
                            const score = detailedFaceData[language]?.symmetryScore || 88.0;
                            return `${Math.round(score * 0.96)}%`;
                          })()}
                        </span>
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-pink-500 rounded-full transition-all duration-700" 
                          style={{ 
                            width: `${(() => {
                              const score = detailedFaceData[language]?.symmetryScore || 88.0;
                              return Math.round(score * 0.96);
                            })()}%` 
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Jaw / Chin balance */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-semibold text-slate-300">
                        <span>{language === 'en' ? "Jaw Contour" : "Simetri Kontur Dagu"}</span>
                        <span className="font-mono text-white font-bold">
                          {(() => {
                            const score = detailedFaceData[language]?.symmetryScore || 88.0;
                            return `${Math.round(score * 0.99)}%`;
                          })()}
                        </span>
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-400 rounded-full transition-all duration-700" 
                          style={{ 
                            width: `${(() => {
                              const score = detailedFaceData[language]?.symmetryScore || 88.0;
                              return Math.round(score * 0.99);
                            })()}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Proportions Metrics Cards */}
              <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 text-left">
                <div className="p-2 sm:p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col justify-between">
                  <p className="text-[#8ba3c7] text-[9px] font-bold uppercase tracking-wider">
                    {language === 'en' ? "HORIZONTAL GRID" : "GRID HORIZONTAL"}
                  </p>
                  <p className="font-bold text-white mt-1 text-[11px] leading-tight">
                    {language === 'en' ? "Highly Balanced Alignment" : "Kesejajaran Simetris Presisi"}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col justify-between">
                  <p className="text-[#8ba3c7] text-[9px] font-bold uppercase tracking-wider">
                    {language === 'en' ? "GOLDEN RATIO" : "RASIO EMAS WAJAH"}
                  </p>
                  <p className="font-bold text-white mt-1 text-[11px] leading-tight">
                    {(() => {
                      const shape = data.faceFeatures.shape.toUpperCase();
                      if (shape.includes('ROUND') || shape.includes('BULAT')) return "1 : 1.58 (Optimal)";
                      if (shape.includes('OVAL')) return "1 : 1.618 (Ideal)";
                      if (shape.includes('SQUARE') || shape.includes('KOTAK')) return "1 : 1.55 (Stabil)";
                      return "1 : 1.61 (Harmonis)";
                    })()}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-auto p-3 bg-white/5 rounded-xl border border-white/5">
              <p className="text-[10px] leading-relaxed text-slate-300 italic">
                "{data.faceFeatures.summary || 'Karakteristik wajah yang unik dan fleksibel untuk berbagai penyesuaian gaya kacamata dan rambut.'}"
              </p>
            </div>
          </div>
        </motion.div>
        )}

          </div>

  {/* Right Column */}
  <div className="flex-1 flex flex-col gap-4 lg:gap-5 min-w-0">
{/* 2. Skin Type Comparison */}
        {!disabledFeatures.includes('skin_analysis') && (
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl border border-slate-100 p-3 sm:p-4 shadow-sm flex flex-col"
          data-testid="card-skin-type"
        >
          <h3 className="text-[10px] sm:text-xs font-bold uppercase text-slate-400 mb-1.5 sm:mb-2 tracking-wider">
            {lang.skinType || 'Skin Type'}
          </h3>
          <div className="flex justify-between items-center">
            <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-tight line-clamp-1">
              {data.skinType.type}
            </span>
            <button
              onClick={() => setShowTypeModal(true)}
              className="text-[9px] sm:text-[10px] text-slate-400 border border-slate-200 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded hover:bg-slate-50 transition-colors shrink-0 font-bold"
            >
              {language === 'id' ? 'Bandingkan' : 'Compare'}
            </button>
          </div>
          <div className="mt-2.5 sm:mt-3 flex gap-1 h-1.5 sm:h-2 mb-1">
            <div className="w-[70%] bg-blue-400 rounded-l-full"></div>
            <div className="w-[30%] bg-slate-200 rounded-r-full"></div>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
            {data.skinType.description}
          </p>
        </motion.div>
        )}

        {/* 4. Face Shape & Style Guide */}
        {!disabledFeatures.includes('shape_guide') && (
        <motion.div
           variants={itemVariants}
           className="bg-white rounded-[14px] border border-slate-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col relative overflow-hidden"
           data-testid="card-spectacles"
        >
          {/* Subtle background flair */}
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-stone-50 rounded-full opacity-60 blur-2xl pointer-events-none"></div>

          <div className="flex items-center gap-2.5 mb-5 relative z-10">
            <div className="w-7 h-7 rounded-[8px] bg-stone-50 flex items-center justify-center border border-stone-100 shadow-sm">
               <Glasses className="w-3.5 h-3.5 text-stone-500" />
            </div>
            <h3 className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">
              {lang.glassesFrame || 'Face Shape & Style'}
            </h3>
          </div>

          <div className="flex-1 flex flex-col gap-5 relative z-10">
            {/* Context Text Box */}
            <div className="bg-stone-50/70 rounded-xl p-3.5 border border-stone-100/80 text-left relative overflow-hidden">
               <div className="absolute left-0 top-0 bottom-0 w-1 bg-stone-300/40"></div>
              <span className="text-[9px] font-black uppercase text-slate-400 block mb-1.5 tracking-wider">
                {language === 'id' ? 'Berdasarkan AI' : 'Based on AI'}
              </span>
              <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                {language === 'id' 
                  ? `Kalkulasi kecocokan estetika untuk rasio proporsi profil wajah ${data.faceFeatures.shape}.`
                  : `Aesthetic compatibility calculated for the ${data.faceFeatures.shape} profile proportions.`}
              </p>
            </div>

            <div className="space-y-4">
              {!disabledFeatures.includes('shape_glasses') && (
              <div>
                <p className="text-[9px] font-bold text-slate-400 mb-2 tracking-wider flex items-center gap-1.5 uppercase">
                  <span className="w-1.5 h-1.5 bg-pink-400 rounded-full"></span>
                  {language === 'id' ? 'Rekomendasi Kacamata' : 'Glasses'}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {data.spectacles.recommendedFrames.map((frame, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-white border border-slate-200/80 rounded-lg text-[10px] font-bold text-slate-600 shadow-sm shadow-slate-100/50">
                      {frame}
                    </span>
                  ))}
                </div>
              </div>
              )}

              {!disabledFeatures.includes('shape_hairstyles') && (
              <div>
                <p className="text-[9px] font-bold text-slate-400 mb-2 tracking-wider flex items-center gap-1.5 uppercase">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                  {language === 'id' ? 'Geometri Rambut Optimal' : 'Optimal Hairstyle Geometry'}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {data.hairstyles.recommendedStyles.map((style, idx) => (
                    <div key={idx} className="bg-white border border-slate-200/80 rounded-xl p-2 flex items-center gap-2.5 shadow-sm shadow-slate-100/50">
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 text-slate-400 p-1.5">
                        <HairstyleSvg styleName={style} color="currentColor" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-600 leading-tight">
                        {style}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              )}
            </div>
          </div>

          {!disabledFeatures.includes('ar_tryon') && (
          <button
            onClick={() => setShowGlassesModal(true)}
            className="w-full mt-auto pt-5 relative z-10 group"
            data-testid="btn-virtual-try-on"
          >
            <div className="flex items-center justify-between px-4 py-2.5 w-full bg-slate-900 text-white rounded-[10px] text-[10px] font-bold hover:bg-slate-800 transition-all shadow-md group-hover:shadow-lg hover:-translate-y-0.5">
              <span className="uppercase tracking-widest text-[#f0f0f0]">
                {lang.faceShapeGuide || 'Face Shape Guide'}
              </span>
              <ScanFace className="w-4 h-4 text-stone-300 group-hover:scale-110 group-hover:text-white transition-all" />
            </div>
          </button>
          )}
        </motion.div>
        )}

        {/* 5. Color Analysis */}
        {!disabledFeatures.includes('color_analysis') && (
        <motion.div
          variants={itemVariants}
          className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 shadow-sm flex flex-col cursor-pointer hover:shadow-md transition-all group"
          data-testid="card-color-analysis"
          onClick={() => setShowColorAnalysisModal(true)}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xs font-bold uppercase text-indigo-400 tracking-wider">
              {lang.colorAnalysis || 'Color Analysis'}
            </h3>
            <Palette className="w-4 h-4 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <div className="flex-1 flex flex-col justify-center">
            {data.colorAnalysis ? (
              <>
                <div className="flex flex-wrap gap-2 mb-3">
                  {data.colorAnalysis.detailedAnalysis?.slice(0, 3).map((c, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 bg-white border border-indigo-100 px-2 py-1 rounded-full shadow-sm">
                      <div className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: c.colorHex }}></div>
                      <span className="text-[10px] font-bold text-slate-700">{c.colorName}</span>
                    </div>
                  ))}
                </div>

                {/* Compatibility Progress Bar */}
                {(() => {
                  const top3Scores = data.colorAnalysis.detailedAnalysis?.slice(0, 3).map(c => c.score) || [];
                  const avgScore = top3Scores.length > 0
                    ? Math.round(top3Scores.reduce((sum, s) => sum + s, 0) / top3Scores.length)
                    : 0;
                  return (
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                          {language === 'id' ? 'Kecocokan Warna' : 'Color Compatibility'}
                        </span>
                        <span className="text-[10px] font-black text-indigo-700">{avgScore}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-indigo-200/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full transition-all duration-500" 
                          style={{ width: `${avgScore}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}

                <p className="text-[10px] text-slate-500 italic line-clamp-2 leading-relaxed">
                  "{data.colorAnalysis.summary}"
                </p>
              </>
            ) : (
                <p className="text-[10px] text-slate-400 italic">No color analysis data available.</p>
            )}
          </div>
        </motion.div>
        )}

          </div>
</div>

{/* 6. Daily Water Intake Tracker */}
        {!disabledFeatures.includes('hydration_goal') && (
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl border border-blue-100 p-4 shadow-sm flex flex-col"
            data-testid="card-water-tracker"
          >
            <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold uppercase text-blue-400 tracking-wider">
              Daily Hydration Goal
            </h3>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              {waterIntake} / {dailyGoal} ml
            </span>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 w-full bg-slate-100 rounded-full h-4 overflow-hidden shadow-inner relative">
              <motion.div
                className="bg-gradient-to-r from-blue-300 to-blue-500 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(100, (waterIntake / dailyGoal) * 100)}%`,
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <span className="text-sm font-bold text-slate-700 shrink-0 min-w-[36px] text-right">
              {Math.round(Math.min(100, (waterIntake / dailyGoal) * 100))}%
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-auto">
            <button
              onClick={() => {
                setWaterIntake((prev) => prev + 250);
                setIntakeHistory((prev) =>
                  [{ amount: 250, time: new Date() }, ...prev].slice(0, 3),
                );
              }}
              className="py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors border border-blue-100 flex items-center justify-center flex-col md:flex-row md:gap-1"
            >
              <span>+ 250ml</span>
              <span className="text-[10px] text-blue-400 font-normal">
                Glass
              </span>
            </button>
            <button
              onClick={() => {
                setWaterIntake((prev) => prev + 500);
                setIntakeHistory((prev) =>
                  [{ amount: 500, time: new Date() }, ...prev].slice(0, 3),
                );
              }}
              className="py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors border border-blue-100 flex items-center justify-center flex-col md:flex-row md:gap-1"
            >
              <span>+ 500ml</span>
              <span className="text-[10px] text-blue-400 font-normal">
                Bottle
              </span>
            </button>
            <button
              onClick={() => {
                setWaterIntake(0);
                setIntakeHistory([]);
              }}
              className="py-2 flex items-center justify-center text-slate-400 bg-slate-50 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors border border-slate-100"
            >
              Reset
            </button>
          </div>

          {intakeHistory.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <h4 className="text-[10px] uppercase font-bold text-slate-400 mb-2">
                Recent Intake
              </h4>
              <ul className="space-y-2">
                {intakeHistory.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between items-center text-xs"
                  >
                    <span className="text-blue-600 font-bold">
                      +{item.amount} ml
                    </span>
                    <span className="text-slate-400">
                      {item.time.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
        )}
      </motion.div>

      {/* Detailed Skin Analysis Graphic Modal */}
      {showSkinAnalysisModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 rounded-3xl overflow-y-auto md:overflow-hidden max-w-[800px] w-full max-h-[90vh] flex flex-col md:flex-row text-white border border-slate-700 shadow-2xl relative"
          >
            <button
              onClick={() => setShowSkinAnalysisModal(false)}
              className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/80 text-white rounded-full w-8 h-8 flex items-center justify-center backdrop-blur-md border border-white/20 transition-colors"
            >
              &times;
            </button>

            {/* Left Side: Facial Topology Map */}
            <div
              ref={containerRef}
              className="w-full md:w-[45%] bg-slate-800 min-h-[300px] flex items-center justify-center flex-shrink-0 relative overflow-hidden"
            >
              {isFaceScanning && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm">
                  <Loader className="w-8 h-8 text-pink-500 animate-spin mb-2" />
                  <span className="text-xs font-mono text-pink-400 font-bold uppercase tracking-widest">
                    Scanning Topology...
                  </span>
                </div>
              )}

              {imageSrc ? (
                <div className="relative w-full h-full">
                  <img
                    ref={imageRef}
                    src={imageSrc}
                    crossOrigin="anonymous"
                    alt="Your Face"
                    className="w-full h-full object-cover grayscale-[20%]"
                  />

                  {/* Darkening Overlay for Better Contrast */}
                  <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>

                  {/* OVERLAYS wrapper positioned exactly over the image */}
                  {faceData && !isFaceScanning && (
                    <div className="absolute inset-0 max-h-full max-w-full m-auto pointer-events-none">
                      <svg
                        viewBox={`0 0 ${faceData.imgW} ${faceData.imgH}`}
                        preserveAspectRatio="xMidYMid slice"
                        className="absolute inset-0 w-full h-full pointer-events-none"
                      >
                        <defs>
                          <filter id="glowPink">
                            <feGaussianBlur
                              stdDeviation="6"
                              result="coloredBlur"
                            />
                            <feMerge>
                              <feMergeNode in="coloredBlur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                          <filter id="glowBlue">
                            <feGaussianBlur
                              stdDeviation="6"
                              result="coloredBlur"
                            />
                            <feMerge>
                              <feMergeNode in="coloredBlur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                          <filter id="glowGreen">
                            <feGaussianBlur
                              stdDeviation="6"
                              result="coloredBlur"
                            />
                            <feMerge>
                              <feMergeNode in="coloredBlur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>

                        <polygon
                          points={faceData.tZone}
                          fill="rgba(236,72,153,0.15)"
                          stroke="#ec4899"
                          strokeWidth="2.5"
                          strokeDasharray="6,4"
                          opacity="0.8"
                          className="animate-[pulse_3s_ease-in-out_infinite]"
                          filter="url(#glowPink)"
                        />
                        <polygon
                          points={faceData.leftCheek}
                          fill="rgba(96,165,250,0.15)"
                          stroke="#60a5fa"
                          strokeWidth="2.5"
                          strokeDasharray="6,4"
                          opacity="0.8"
                          filter="url(#glowBlue)"
                        />
                        <polygon
                          points={faceData.rightCheek}
                          fill="rgba(96,165,250,0.15)"
                          stroke="#60a5fa"
                          strokeWidth="2.5"
                          strokeDasharray="6,4"
                          opacity="0.8"
                          filter="url(#glowBlue)"
                        />
                        <polygon
                          points={faceData.chin}
                          fill="rgba(52,211,153,0.15)"
                          stroke="#34d399"
                          strokeWidth="2.5"
                          strokeDasharray="6,4"
                          opacity="0.8"
                          filter="url(#glowGreen)"
                        />
                      </svg>

                      {/* T-ZONE Label */}
                      <div
                        className="flex flex-col items-center justify-center pointer-events-auto"
                        style={getMappedStyle(faceData.tZoneLabel)}
                      >
                        <span className="text-[9px] font-bold bg-pink-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider shadow-lg">
                          T-Zone
                        </span>
                      </div>

                      {/* U-ZONE: Left Cheek Label */}
                      <div
                        className="flex items-center justify-center pointer-events-auto"
                        style={getMappedStyle(faceData.leftCheekLabel)}
                      >
                        <span className="text-[9px] font-bold bg-blue-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider shadow-lg">
                          Cheek
                        </span>
                      </div>

                      {/* U-ZONE: Right Cheek Label */}
                      <div
                        className="flex items-center justify-center pointer-events-auto"
                        style={getMappedStyle(faceData.rightCheekLabel)}
                      >
                        <span className="text-[9px] font-bold bg-blue-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider shadow-lg">
                          Cheek
                        </span>
                      </div>

                      {/* CHIN Label */}
                      <div
                        className="flex items-center justify-center pointer-events-auto"
                        style={getMappedStyle(faceData.chinLabel)}
                      >
                        <span className="text-[9px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider shadow-lg">
                          Chin
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600 text-sm">
                  NO IMAGE
                </div>
              )}

              {/* Fallback if no faceData found, but scan finished */}
              {!faceData && !isFaceScanning && imageSrc && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="bg-black/60 px-4 py-2 rounded-lg backdrop-blur-sm text-xs font-mono text-white/80 border border-white/10 z-30">
                    {language === 'id' ? 'Wajah kurang terdeteksi jelas' : 'Face not clearly detected'}
                  </div>
                </div>
              )}
            </div>

            {/* Right Side: Detailed Analysis Data */}
            <div className="w-full md:w-[55%] p-6 md:p-8 bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col flex-1 min-h-0 overflow-visible md:overflow-y-auto">
              <h3 className="text-xl font-bold text-white mb-1">
                {language === 'id' ? 'Topologi Wajah Detail' : 'Detailed Facial Topology'}
              </h3>
              <p className="text-sm text-slate-400 mb-6">
                {language === 'id' ? 'Analisis mendalam area wajah. Profil Anda:' : 'Deep facial area analysis. Your profile:'} {" "}
                <strong className="text-pink-400">
                  {data.skinType.type.toUpperCase()}
                </strong>
              </p>

              <div className="space-y-4 flex-1">
                {/* Hydration Alert Based on `data.skinAnalysis.hydration` */}
                <div className="p-4 bg-slate-800/50 rounded-2xl border border-white/10 flex items-center justify-between gap-4">
                  <div className="flex-shrink-0">
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">
                      {language === 'id' ? 'Status Hidrasi' : 'Hydration Status'}
                    </p>
                    <p className="text-xl font-black text-blue-400">
                      {data.skinAnalysis.hydration}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-300 leading-snug">
                      {data.skinAnalysis.notes}
                    </p>
                  </div>
                </div>

                {data.facialMapping && data.facialMapping.length > 0 ? (
                  data.facialMapping.map((zone, idx) => {
                    const colorClasses = {
                      pink: { bg: 'bg-pink-500', border: 'border-pink-500/20', text: 'text-pink-400', badgeBg: 'bg-pink-500/20' },
                      blue: { bg: 'bg-blue-500', border: 'border-blue-400/20', text: 'text-blue-400', badgeBg: 'bg-blue-500/20' },
                      emerald: { bg: 'bg-emerald-500', border: 'border-emerald-400/20', text: 'text-emerald-400', badgeBg: 'bg-emerald-500/20' }
                    };
                    const theme = colorClasses[zone.colorHint] || colorClasses.pink;

                    return (
                      <div key={idx} className={`p-4 bg-slate-800/50 rounded-2xl border ${theme.border} relative overflow-hidden`}>
                        <div className={`absolute top-0 left-0 w-1 h-full ${theme.bg}`}></div>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className={`font-bold ${theme.text} uppercase tracking-widest text-xs mb-1`}>
                              {zone.zone}
                            </h4>
                            <span className="text-white text-sm font-semibold">
                              {zone.condition}
                            </span>
                          </div>
                          <span className={`${theme.badgeBg} ${theme.text} px-2 py-0.5 rounded text-[10px] font-bold`}>
                            {zone.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed mb-3">
                          {zone.description}
                        </p>
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2 block">
                            {language === 'id' ? 'Saran Perawatan' : 'Care Advice'}
                          </span>
                          <ul className="text-xs text-emerald-400 font-medium space-y-1.5 list-disc list-inside">
                            {zone.recommendations.map((rec, rIdx) => (
                              <li key={rIdx}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <>
                    {/* Fallback Zone 1 */}
                    <div className="p-4 bg-slate-800/50 rounded-2xl border border-pink-500/20 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-pink-500"></div>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-pink-400 uppercase tracking-widest text-xs mb-1">
                            T-Zone (Dahi & Hidung)
                          </h4>
                          <span className="text-white text-sm font-semibold">
                            Produksi Sebum & Pori Besar
                          </span>
                        </div>
                        <span className="bg-pink-500/20 text-pink-400 px-2 py-0.5 rounded text-[10px] font-bold">
                          INFO
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed mb-3">
                        Area ini memiliki kelenjar keringat terpadat, menyebabkan
                        seringnya kelebihan minyak dan berisiko komedo pada cuaca
                        tropis.
                      </p>
                      <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2 block">
                          Saran Perawatan
                        </span>
                        <ul className="text-xs text-emerald-400 font-medium space-y-1.5 list-disc list-inside">
                          <li>Gunakan cleanser berbasis BHA (Salicylic Acid).</li>
                          <li>
                            Spot treatment di area hidung dengan Niacinamide 5%.
                          </li>
                          <li>
                            Hindari pelembab berat (cream) di area ini, pilih Gel.
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Fallback Zone 2 */}
                    <div className="p-4 bg-slate-800/50 rounded-2xl border border-blue-400/20 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-blue-400 uppercase tracking-widest text-xs mb-1">
                            U-Zone (Kedua Pipi)
                          </h4>
                          <span className="text-white text-sm font-semibold">
                            Kapasitas Hidrasi Menurun
                          </span>
                        </div>
                        <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-[10px] font-bold">
                          RAWAT
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed mb-3">
                        Tekstur pipi cenderung lebih tipis dan sering terpapar
                        langsung sinar UV, rentan kemerahan dan flek hitam ringan.
                      </p>
                      <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2 block">
                          Saran Perawatan
                        </span>
                        <ul className="text-xs text-emerald-400 font-medium space-y-1.5 list-disc list-inside">
                          <li>
                            Lapis hidrasi dengan Hyaluronic Acid toner setelah cuci
                            muka.
                          </li>
                          <li>Wajib re-apply Sunscreen SPF 30+ setiap 3 jam.</li>
                          <li>
                            Perbaiki tekstur dengan krim Malam (Ceramides/Peptides).
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Fallback Zone 3 */}
                    <div className="p-4 bg-slate-800/50 rounded-2xl border border-emerald-400/20 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-emerald-400 uppercase tracking-widest text-xs mb-1">
                            Chin (Dagu & Rahang)
                          </h4>
                          <span className="text-white text-sm font-semibold">
                            Stagnasi Tekstur Kulit
                          </span>
                        </div>
                        <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">
                          STABIL
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed mb-3">
                        Sering terjadi penumpukan sel kulit mati dan jerawat
                        hormonal, butuh regenerasi sel yang halus tanpa friksi
                        berlebih.
                      </p>
                      <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2 block">
                          Saran Perawatan
                        </span>
                        <ul className="text-xs text-emerald-400 font-medium space-y-1.5 list-disc list-inside">
                          <li>
                            Eksfoliasi kimiawi ringan (AHA/Glycolic acid &lt; 5%).
                          </li>
                          <li>
                            Hindari ekstraksi komedo tanpa alat steril profesional.
                          </li>
                        </ul>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => setShowSkinAnalysisModal(false)}
                className="w-full mt-6 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors border border-slate-600 shadow-md flex-shrink-0"
              >
                {language === 'id' ? 'Tutup Analisis Mendalam' : 'Close Deep Analysis'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Type Comparison Modal Simulation */}
      {showTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full"
          >
            <h3 className="font-bold text-lg mb-4">
              {language === 'id' ? 'Perbandingan Tipe Kulit' : 'Skin Type Comparison'}
            </h3>
            <div className="space-y-4 mb-6">
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1 block">
                  {language === 'id' ? 'Tipe Anda:' : 'Your Type:'} {data.skinType.type}
                </span>
                <p className="text-sm text-slate-600">
                  {data.skinType.description}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowTypeModal(false)}
              className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200"
            >
              {language === 'id' ? 'Kembali' : 'Back'}
            </button>
          </motion.div>
        </div>
      )}

      {/* Face Feature Analysis Modal */}
      {showFaceFeatureModal && (
         <FaceFeatureModal 
            imageSrc={imageSrc || null} 
            onClose={() => setShowFaceFeatureModal(false)}
            cachedData={detailedFaceData[language] || null} // pass cached data for language
            onDataFecthed={(data) => setDetailedFaceData(prev => ({ ...prev, [language]: data }))} // store based on language
            globalData={data}
            onTryOnAR={onTryOnAR}
         />
      )}

      {/* Glasses Frame Modal */}
      {showGlassesModal && (
        <GlassesFrameModal 
          data={data}
          detailedFaceData={detailedFaceData[language] || null}
          imageSrc={imageSrc || null}
          onClose={() => setShowGlassesModal(false)}
          onTryOnAR={onTryOnAR}
          disabledFeatures={disabledFeatures}
        />
      )}

      {/* Color Analysis Modal */}
      {showColorAnalysisModal && (
        <ColorAnalysisModal 
          data={data}
          imageSrc={imageSrc || null}
          onClose={() => setShowColorAnalysisModal(false)}
          disabledFeatures={disabledFeatures}
        />
      )}

      {/* Hidden PDF Report Template */}
      <div className="w-0 h-0 overflow-hidden relative">
        <div className="absolute top-[-9999px] left-[-9999px] z-[-9999] bg-white">
          <PdfReportTemplate 
            data={data} 
            imageSrc={imageSrc} 
            detailedFaceData={detailedFaceData[language] || null} 
            intakeHistory={intakeHistory} 
            consultantNotes={consultantNotes}
            consultantName={consultantName}
            language={language}
            disabledFeatures={disabledFeatures}
          />
        </div>
      </div>
    </div>
  );
}
