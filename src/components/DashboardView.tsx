import { motion } from "motion/react";
import { AnalysisResult } from "../types";
import { ScanFace, Scissors, Loader, Download } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import * as faceapi from "@vladmandic/face-api";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";
import { PdfReportTemplate } from "./PdfReportTemplate";
import { FaceFeatureModal } from "./FaceFeatureModal";

interface DashboardViewProps {
  data: AnalysisResult;
  onReset: () => void;
  onTryOnAR: () => void;
  imageSrc?: string | null;
}

export function DashboardView({
  data,
  onReset,
  onTryOnAR,
  imageSrc,
}: DashboardViewProps) {
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showSkinAnalysisModal, setShowSkinAnalysisModal] = useState(false);
  const [showFaceFeatureModal, setShowFaceFeatureModal] = useState(false);
  const [detailedFaceData, setDetailedFaceData] = useState<any>(null);
  const [faceData, setFaceData] = useState<any>(null);
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
    const reportElement = document.getElementById("pdf-report-template");
    if (!reportElement) return;

    setIsDownloading(true);
    try {
      // Small delay to ensure any layout shifts are complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      const imgData = await htmlToImage.toJpeg(reportElement, {
        quality: 0.95,
        backgroundColor: "#ffffff",
        pixelRatio: 2,
      });

      const img = new Image();
      img.src = imgData;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      // Calculate the width and height to fit the A4 page (A4 size: 595.28 x 841.89 pt)
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (img.height * pdfWidth) / img.width;

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
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
        <h2 className="text-xl font-bold text-slate-800">Analisis Result</h2>
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
          {isDownloading ? "Generating..." : "Download Report"}
        </button>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 pb-6"
      >
        {/* 1. Skin Analysis */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl border border-pink-100 p-4 shadow-sm col-span-1 md:row-span-1 cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden group"
          data-testid="card-skin-analysis"
          onClick={() => setShowSkinAnalysisModal(true)}
        >
          <div className="absolute top-0 right-0 p-2 opacity-50 group-hover:opacity-100 transition-opacity">
            <ScanFace size={16} className="text-pink-500" />
          </div>
          <h3 className="text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">
            Skin Diagnosis
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">
                Tingkat Hidrasi:{" "}
                <span className="text-pink-600">
                  {data.skinAnalysis.hydration}%
                </span>
              </p>
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed line-clamp-3">
                {data.skinAnalysis.notes}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-pink-500 flex items-center justify-center text-[10px] font-bold text-pink-600 shrink-0">
              MOD
            </div>
          </div>
        </motion.div>

        {/* 2. Skin Type Comparison */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm col-span-1 md:row-span-1 flex flex-col"
          data-testid="card-skin-type"
        >
          <h3 className="text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">
            Skin Type
          </h3>
          <div className="flex justify-between items-center">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-tight line-clamp-1">
              {data.skinType.type}
            </span>
            <button
              onClick={() => setShowTypeModal(true)}
              className="text-[10px] text-slate-400 border border-slate-200 px-2 py-1 rounded hover:bg-slate-50 transition-colors shrink-0"
            >
              Compare
            </button>
          </div>
          <div className="mt-3 flex gap-1 h-2 mb-1">
            <div className="w-[70%] bg-blue-400 rounded-l-full"></div>
            <div className="w-[30%] bg-slate-200 rounded-r-full"></div>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
            {data.skinType.description}
          </p>
        </motion.div>

        {/* 3. Face Feature Analysis */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-900 text-white rounded-xl p-4 shadow-xl col-span-1 md:row-span-2 flex flex-col cursor-pointer hover:shadow-2xl hover:scale-[1.01] transition-all relative overflow-hidden group"
          data-testid="card-face-feature"
          onClick={() => setShowFaceFeatureModal(true)}
        >
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
             <ScanFace className="w-4 h-4 text-slate-500" />
          </div>
          <h3 className="text-xs font-bold uppercase text-slate-500 mb-4 tracking-wider">
            Geometry Analysis
          </h3>
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)]"></div>
              <div>
                <p className="text-xs text-slate-400">Face Shape</p>
                <p className="text-sm font-semibold">
                  {data.faceFeatures.shape}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-pink-500"></div>
              <div>
                <p className="text-xs text-slate-400">Eye Type</p>
                <p className="text-sm font-semibold">
                  {data.faceFeatures.eyes}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-pink-500"></div>
              <div>
                <p className="text-xs text-slate-400">Jawline</p>
                <p className="text-sm font-semibold">
                  {data.faceFeatures.jawline}
                </p>
              </div>
            </div>
            <div className="mt-auto p-3 bg-white/5 rounded-lg border border-white/10">
              <p className="text-[11px] leading-relaxed text-slate-300 italic">
                "Bentuk wajah oval sangat fleksibel untuk berbagai gaya kacamata
                dan rambut."
              </p>
            </div>
          </div>
        </motion.div>

        {/* 4. Spectacles Guide */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm col-span-1 md:row-span-1 flex flex-col"
          data-testid="card-spectacles"
        >
          <h3 className="text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">
            Glasses Frame
          </h3>
          <div className="grid grid-cols-2 gap-2 flex-1">
            {data.spectacles.recommendedFrames.map((frame, idx) => (
              <div
                key={idx}
                className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex flex-col justify-center"
              >
                <p className="text-[11px] font-bold line-clamp-2 leading-tight">
                  {frame}
                </p>
              </div>
            ))}
          </div>
          <button
            onClick={onTryOnAR}
            className="w-full mt-3 py-1.5 bg-pink-50 text-pink-600 rounded-lg text-[10px] font-bold border border-pink-100 hover:bg-pink-100 transition-colors uppercase tracking-wider text-center"
            data-testid="btn-virtual-try-on"
          >
            Virtual Try-On
          </button>
        </motion.div>

        {/* 5. Hairstyles Analysis */}
        <motion.div
          variants={itemVariants}
          className="bg-pink-500 text-white rounded-xl p-4 shadow-sm col-span-1 md:row-span-1 flex flex-col"
          data-testid="card-hairstyles"
        >
          <h3 className="text-xs font-bold uppercase text-pink-200 mb-2 tracking-wider">
            Hairstyle Recs
          </h3>
          <div className="flex gap-3 items-center flex-1">
            <div className="flex-1 flex flex-col justify-center gap-2">
              {data.hairstyles.recommendedStyles.map((style, idx) => (
                <p key={idx} className="text-sm font-bold leading-tight">
                  {style}
                </p>
              ))}
            </div>
            <Scissors
              className="w-10 h-10 text-white opacity-20"
              viewBox="0 0 24 24"
              strokeWidth={1}
            />
          </div>
        </motion.div>

        {/* 6. Daily Water Intake Tracker */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl border border-blue-100 p-4 shadow-sm col-span-1 md:col-span-2 flex flex-col"
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
      </motion.div>

      {/* Detailed Skin Analysis Graphic Modal */}
      {showSkinAnalysisModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 rounded-3xl overflow-hidden max-w-[800px] w-full max-h-[90vh] flex flex-col md:flex-row text-white border border-slate-700 shadow-2xl relative"
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
                    Wajah kurang terdeteksi jelas
                  </div>
                </div>
              )}
            </div>

            {/* Right Side: Detailed Analysis Data */}
            <div className="w-full md:w-[55%] p-6 md:p-8 bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col overflow-y-auto">
              <h3 className="text-xl font-bold text-white mb-1">
                Detailed Facial Topology
              </h3>
              <p className="text-sm text-slate-400 mb-6">
                Analisis mendalam area wajah. Profil Anda:{" "}
                <strong className="text-pink-400">
                  {data.skinType.type.toUpperCase()}
                </strong>
              </p>

              <div className="space-y-4 flex-1">
                {/* Hydration Alert Based on `data.skinAnalysis.hydration` */}
                <div className="p-4 bg-slate-800/50 rounded-2xl border border-white/10 flex items-center justify-between gap-4">
                  <div className="flex-shrink-0">
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">
                      Status Hidrasi
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

                {/* Zone 1 */}
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

                {/* Zone 2 */}
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

                {/* Zone 3 */}
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
              </div>

              <button
                onClick={() => setShowSkinAnalysisModal(false)}
                className="w-full mt-6 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors border border-slate-600 shadow-md flex-shrink-0"
              >
                Tutup Analisis Mendalam
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
            <h3 className="font-bold text-lg mb-4">Perbandingan Tipe Kulit</h3>
            <div className="space-y-4 mb-6">
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1 block">
                  Tipe Anda: Oily
                </span>
                <p className="text-sm text-slate-600">
                  Pori-pori besar, rentan jerawat, kilap di T-Zone.
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                  Kering (Dry)
                </span>
                <p className="text-sm text-slate-600">
                  Terasa ketat, bersisik, kurang kelembapan alami.
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                  Kombinasi
                </span>
                <p className="text-sm text-slate-600">
                  Berminyak di T-Zone, namun kering di area pipi.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowTypeModal(false)}
              className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200"
            >
              Kembali
            </button>
          </motion.div>
        </div>
      )}

      {/* Face Feature Analysis Modal */}
      {showFaceFeatureModal && (
         <FaceFeatureModal 
            imageSrc={imageSrc || null} 
            onClose={() => setShowFaceFeatureModal(false)}
            cachedData={detailedFaceData}
            onDataFecthed={(data) => setDetailedFaceData(data)}
         />
      )}

      {/* Hidden PDF Report Template */}
      <div className="w-0 h-0 overflow-hidden relative">
        <div className="absolute top-[-9999px] left-[-9999px] z-[-9999] bg-white">
          <PdfReportTemplate data={data} imageSrc={imageSrc} />
        </div>
      </div>
    </div>
  );
}
