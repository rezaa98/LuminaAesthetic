import React from 'react';
import { AnalysisResult } from '../types';
import { glassesModels, GlassesSvg } from './GlassesFrameModal';
import { HairstyleSvg } from './HairstyleSvg';

interface PdfReportTemplateProps {
  data: AnalysisResult;
  imageSrc?: string | null;
  detailedFaceData?: any;
  intakeHistory?: { amount: number; time: Date }[];
  consultantNotes?: string;
  consultantName?: string;
  language?: 'en' | 'id';
  disabledFeatures?: string[];
}

export const PdfReportTemplate: React.FC<PdfReportTemplateProps> = ({ 
  data, 
  imageSrc, 
  detailedFaceData, 
  intakeHistory,
  consultantNotes,
  consultantName,
  language = 'en',
  disabledFeatures = []
}) => {
  const carePlans = data.personalizedCarePlan?.length ? data.personalizedCarePlan : [
    { title: "Hydration Strategy", description: "Target minimum daily water intake of 2000ml to improve skin elasticity and moisture barrier from within." },
    { title: "Targeted Exfoliation", description: "Focus on the T-Zone (Forehead & Nose) with BHA to control sebum production and minimize pores." },
    { title: "U-Zone Maintenance", description: "Apply hydrating toners and Ceramides strictly on the Cheeks to combat hydration loss and protect barrier." }
  ];

  // Season Helper (identical to original model logic)
  const determineSeason = (data: AnalysisResult) => {
    const summary = (data.colorAnalysis?.summary || "").toLowerCase();
    if (summary.includes("cool") || summary.includes("dingin") || summary.includes("summer") || summary.includes("winter")) {
      if (summary.includes("soft") || summary.includes("muted")) return "Soft Summer";
      return "Cool Winter";
    }
    if (summary.includes("warm") || summary.includes("hangat") || summary.includes("autumn") || summary.includes("spring")) {
      if (summary.includes("deep") || summary.includes("muted") || summary.includes("autumn") || summary.includes("gugur")) return "Soft Autumn";
      return "Warm Spring";
    }
    return "Soft Summer"; // default
  };

  const getSeasonDetails = (seasonName: string) => {
    switch (seasonName) {
      case 'Soft Summer':
        return {
          title: 'SOFT SUMMER',
          hueLabel: 'COOL',
          valueLabel: 'LIGHT-MEDIUM',
          chromaLabel: 'SOFT / MUTED',
          hueVal: 80, 
          valueVal: 45, 
          chromaVal: 20, 
          neutrals: [
            { name: 'Soft Navy', hex: '#2F3C54' },
            { name: 'Slate Gray', hex: '#707C94' },
            { name: 'Cool Taupe', hex: '#A89F91' },
            { name: 'Silver Gray', hex: '#C2C5CC' }
          ],
          accessories: [
            { name: 'Silver Jewelry', desc: 'Silver, Platinum, White Gold', emoji: '💍' },
            { name: 'Muted Bag', desc: 'Soft Mauve, Slate Blue', emoji: '👜' },
            { name: 'Cool Scarf', desc: 'Soft Lavender, Sage', emoji: '🧣' },
            { name: 'Gray/Taupe Frames', desc: 'Muted grey frames match', emoji: '👓' }
          ],
          colorDots: ['#9EA1C4', '#667C9D', '#7E9C96', '#9C8592', '#C4A9B1', '#E5D1D0', '#DCE0DC']
        };
      case 'Cool Winter':
        return {
          title: 'COOL WINTER',
          hueLabel: 'ICE COOL',
          valueLabel: 'MEDIUM-DARK CONTRAST',
          chromaLabel: 'CLEAR & BRIGHT',
          hueVal: 95, 
          valueVal: 75, 
          chromaVal: 85,
          neutrals: [
            { name: 'Pure Black', hex: '#111111' },
            { name: 'Crisp White', hex: '#FFFFFF' },
            { name: 'Charcoal Gray', hex: '#374151' },
            { name: 'True Navy', hex: '#1E3A8A' }
          ],
          accessories: [
            { name: 'White Gold / Gem', desc: 'Diamante, Platinum, White Gold', emoji: '💍' },
            { name: 'Bold Onyx Bag', desc: 'Shiny black or intense cobalt', emoji: '👜' },
            { name: 'Royal Scarf', desc: 'Emerald, Sapphire shades', emoji: '🧣' },
            { name: 'Sharp Black Frames', desc: 'High-contrast definition', emoji: '🕶️' }
          ],
          colorDots: ['#1E3A8A', '#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F43F5E', '#111827']
        };
      case 'Soft Autumn':
        return {
          title: 'SOFT AUTUMN',
          hueLabel: 'WARM / EARTHY',
          valueLabel: 'MEDIUM-DARK',
          chromaLabel: 'MUTED & RICH',
          hueVal: 25, 
          valueVal: 65, 
          chromaVal: 35,
          neutrals: [
            { name: 'Olive Drab', hex: '#4B5320' },
            { name: 'Espresso brown', hex: '#3E2723' },
            { name: 'Rich Ivory', hex: '#FFFDD0' },
            { name: 'Warm Taupe', hex: '#B38B6D' }
          ],
          accessories: [
            { name: 'Warm Gold / Bronze', desc: 'Bright yellow or brushed gold', emoji: '👑' },
            { name: 'Terracotta Bag', desc: 'Rich brown or earth clay red', emoji: '👜' },
            { name: 'Mustard Scarf', desc: 'Ochre, Sage or Camel shades', emoji: '🧣' },
            { name: 'Tortoiseshell Frames', desc: 'Warm mottled amber frames', emoji: '👓' }
          ],
          colorDots: ['#8A7968', '#9B8E7A', '#6B7A65', '#8C6C58', '#AB7A5E', '#D9A05B', '#E6C594']
        };
      case 'Warm Spring':
      default:
        return {
          title: 'WARM SPRING',
          hueLabel: 'WARM & SHINY',
          valueLabel: 'MEDIUM-LIGHT',
          chromaLabel: 'VIBRANT / BRIGHT',
          hueVal: 35, 
          valueVal: 30, 
          chromaVal: 80,
          neutrals: [
            { name: 'Camel Tan', hex: '#C19A6B' },
            { name: 'Warm Honey', hex: '#D4AF37' },
            { name: 'Ivory Cream', hex: '#FFFFF0' },
            { name: 'Golden Khaki', hex: '#F0E68C' }
          ],
          accessories: [
            { name: 'Bright Yellow Gold', desc: 'Highly polished radiant gold', emoji: '👑' },
            { name: 'Coral Pink Bag', desc: 'Vibrant Peach or sunny nectar', emoji: '👜' },
            { name: 'Golden Scarf', desc: 'Clear turquoise or soft apricot', emoji: '🧣' },
            { name: 'Clear/Gold Frames', desc: 'Translucent amber/champagne', emoji: '👓' }
          ],
          colorDots: ['#F59E0B', '#10B981', '#F472B6', '#EF4444', '#14B8A6', '#FBBF24', '#FFFF00']
        };
    }
  };

  const season = determineSeason(data);
  const details = getSeasonDetails(season);

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

  const getSuitabilityDetails = (modelId: string, shape: string, mapping: { suitable: string[] }) => {
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
      ? `Contrasts beautifully with your ${shape} outline. It adds structural balance and lift.`
      : `Mimics your existing ${shape} proportions too intensely.`;
      
    const rationaleId = isSuitable
      ? `Memberikan kontras dinamis yang ideal pada bentuk wajah ${shape} Anda. Memperkuat harmoni dan menyeimbangkan rasio wajah.`
      : `Meniru proporsi ${shape} Anda secara berlebihan dan membuat wajah terlihat tidak seimbang.`;

    return { score, isSuitable, rationale: language === 'id' ? rationaleId : rationaleEn };
  };

  const faceShape = data.faceFeatures.shape;
  const glassesMapping = getGlassesMapping(faceShape);

  return (
    <div id="pdf-report-template" className="flex flex-col gap-12 bg-slate-100 p-8">
      
      {/* ================= PAGE 1: SKIN DIAGNOSIS & INITIAL RECOMMENDATIONS ================= */}
      <div className="pdf-page w-[800px] h-[1131px] bg-white p-12 text-slate-800 flex flex-col font-sans relative overflow-hidden shrink-0">
        {/* Header */}
        <div className="flex justify-between items-end border-b-2 border-pink-500 pb-6 mb-8 shrink-0">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-1">Lumina <span className="text-pink-500">Aesthetic</span></h1>
            <p className="text-sm font-semibold text-slate-500">Comprehensive AI Facial Analysis Report</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date())}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8 flex-1">
          {/* Left Column: Image & Basic Info */}
          <div className="col-span-1 flex flex-col gap-6">
            <div className="w-full aspect-[3/4] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
              {imageSrc ? (
                <img src={imageSrc} alt="Patient" className="w-full h-full object-cover grayscale-[10%]" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">NO IMAGE</div>
              )}
            </div>
            
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <h3 className="text-xs uppercase font-bold text-slate-400 mb-4 tracking-wider">Face Profile</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase">Face Shape</p>
                  <p className="text-sm font-bold">{data.faceFeatures.shape}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase">Jawline</p>
                  <p className="text-sm font-bold">{data.faceFeatures.jawline}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase">Eyes</p>
                  <p className="text-sm font-bold">{data.faceFeatures.eyes}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Columns: Analysis & Recs */}
          <div className="col-span-2 flex flex-col gap-6">
            {/* Section 1: Skin Diagnosis */}
            <div>
              <h2 className="text-xl font-bold border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pink-500"></span> Skin Diagnosis
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-pink-50 rounded-xl border border-pink-100">
                  <p className="text-xs text-pink-500 uppercase font-bold tracking-wider mb-1">Skin Type</p>
                  <p className="text-lg font-black text-slate-800">{data.skinType.type}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-xs text-blue-500 uppercase font-bold tracking-wider mb-1">Hydration Level</p>
                  <p className="text-lg font-black text-slate-800">{data.skinAnalysis.hydration}%</p>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-sm text-slate-600 leading-relaxed font-medium">{data.skinType.description}</p>
                <p className="text-sm text-slate-600 leading-relaxed font-medium mt-2">{data.skinAnalysis.notes}</p>
              </div>
            </div>

            {/* Section 2: Recommendations */}
            <div>
              <h2 className="text-xl font-bold border-b border-slate-200 pb-2 mb-4 flex items-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Recommendations
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs uppercase font-bold text-slate-400 mb-2 tracking-wider">
                    {language === 'id' ? 'Gaya Rambut' : 'Hairstyles'}
                  </h3>
                  <ul className="space-y-1.5">
                    {data.hairstyles.recommendedStyles.slice(0, 3).map((style, idx) => (
                      <li key={idx} className="text-xs font-bold flex items-center gap-2 text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                        {style}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs uppercase font-bold text-slate-400 mb-2 tracking-wider">Glasses Frames</h3>
                  <ul className="space-y-1.5">
                    {glassesMapping.suitable.slice(0, 3).map((frameId, idx) => {
                      const model = glassesModels.find(m => m.id === frameId);
                      return (
                        <li key={idx} className="text-xs font-bold flex items-center gap-2 text-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                          {model?.nameEn}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 3: Treatment Plan */}
            <div className="mt-2">
              <h2 className="text-xl font-bold border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Personalized Care Plan
              </h2>
              <div className="space-y-2.5">
                {carePlans.slice(0, 3).map((plan, idx) => (
                  <div key={idx} className="p-3 border border-slate-200 rounded-lg flex items-start gap-3 bg-white">
                    <div className="w-5.5 h-5.5 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold shrink-0">{idx + 1}</div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{plan.title}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{plan.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {consultantNotes && (
                <div className="mt-4 p-4 bg-pink-50/50 border border-pink-100/80 rounded-xl">
                  <span className="text-[9px] font-black uppercase tracking-wider text-pink-500 block mb-1">Catatan Khusus Konsultan Estetika</span>
                  <p className="text-[11px] text-slate-700 font-medium italic leading-relaxed">
                    "{consultantNotes}"
                  </p>
                  <span className="text-[9px] font-mono text-slate-400 font-bold block mt-2 text-right">— {consultantName || 'Dr. Lumina'}</span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Footer Page 1 */}
        <div className="mt-auto pt-6 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-widest shrink-0">
          <p>Lumina Aesthetic Clinic &copy; {new Date().getFullYear()}</p>
          <p>Page 1 of 4</p>
        </div>
      </div>

      {/* ================= PAGE 2: ADVANCED DIAGNOSTICS & HYDRATION HISTORY ================= */}
      <div className="pdf-page w-[800px] h-[1131px] bg-white p-12 text-slate-800 flex flex-col font-sans relative overflow-hidden shrink-0">
        {/* Header */}
        <div className="flex justify-between items-end border-b border-slate-200 pb-6 mb-8 shrink-0">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800 mb-1">Advanced Diagnostics</h1>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Page 2 of 4 • Facial Geometry Ledger</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-6">
          {/* Detailed Face Geometry Section */}
          <div>
            <h2 className="text-lg font-extrabold pb-2 mb-4 flex items-center gap-2 text-slate-800">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Detailed Face Geometry Analysis
            </h2>

            {detailedFaceData ? (
              // IF GENERATED SUCCESSFULLY
              <div>
                {detailedFaceData.symmetryScore !== undefined && (
                  <div className="mb-5 p-5 bg-purple-50/60 rounded-2xl border border-purple-100/80 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-purple-600 uppercase font-black tracking-widest mb-1.5">Facial Symmetry Score</p>
                      <div className="flex items-end gap-3 border-l-4 border-purple-500 pl-4 py-0.5">
                        <span className="text-4xl font-black text-slate-900 leading-none">{detailedFaceData.symmetryScore.toFixed(1)}%</span>
                        <span className="text-xs font-bold text-slate-600 max-w-sm leading-relaxed">{detailedFaceData.symmetryDescription}</span>
                      </div>
                    </div>
                    <div className="w-20 h-20 opacity-15">
                      <svg viewBox="0 0 100 100" className="w-full h-full text-purple-600 fill-current">
                        <path d="M50 0 L100 25 L100 75 L50 100 L0 75 L0 25 Z" />
                      </svg>
                    </div>
                  </div>
                )}

                {detailedFaceData.features && detailedFaceData.features.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {detailedFaceData.features.slice(0, 4).map((f: any) => (
                      <div key={f.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <h3 className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2 flex justify-between items-center">
                          <span>{f.name}</span>
                          <span className="px-2 py-0.5 bg-white border border-slate-200/60 rounded-full text-[9px] text-slate-500">{f.label}</span>
                        </h3>
                        <ul className="space-y-1.5">
                          {f.points.slice(0, 2).map((pt: string, idx: number) => (
                            <li key={idx} className="text-xs font-medium text-slate-600 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0"></span>
                              <span className="leading-snug">{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // IF NOT YET GENERATED (OPTION B INFOBAR)
              <div className="p-8 bg-slate-50 border border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-xl mb-3">⚠️</div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-1">Detail Geometri Wajah Belum Dianalisis</h3>
                <p className="text-xs text-slate-400 max-w-md leading-relaxed mb-4">
                  Sistem mendeteksi bahwa analisis geometri simetri wajah belum dijalankan untuk sesi pemindaian foto ini.
                </p>
                <div className="bg-white px-4 py-3 rounded-xl border border-slate-200 text-left w-full max-w-sm">
                  <span className="text-[9px] font-black text-purple-500 uppercase tracking-wider block mb-1">Manfaat yang Akan Didapatkan:</span>
                  <ul className="text-[10px] text-slate-500 space-y-1 font-semibold">
                    <li className="flex gap-2 items-center">● Persentase Skor Simetri Wajah Akurat</li>
                    <li className="flex gap-2 items-center">● Analisis Penyelarasan Mata & Alis</li>
                    <li className="flex gap-2 items-center">● Detail Garis Rahang & Proporsi Dahi</li>
                  </ul>
                </div>
                <p className="text-[10px] text-indigo-500 font-bold mt-4">
                  💡 Aktifkan modul "Geo Face" di dasbor web Lumina untuk memuat data ini ke dalam laporan PDF.
                </p>
              </div>
            )}
          </div>

          {/* Hydration Tracker Section */}
          <div className="mt-4">
            <h2 className="text-lg font-extrabold pb-2 mb-4 flex items-center gap-2 text-slate-800">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span> Hydration Tracker History
            </h2>
            
            {intakeHistory && intakeHistory.length > 0 ? (
              <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/60 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3 font-bold uppercase tracking-wider text-[10px]">Recording Time (Waktu Rekor)</th>
                      <th className="px-5 py-3 font-bold uppercase tracking-wider text-[10px]">Intake Amount (Jumlah Air Minum)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {intakeHistory.slice(-5).map((log, idx) => (
                      <tr key={idx} className="bg-white hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3 font-medium text-slate-600">{log.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="px-5 py-3 font-black text-cyan-500">+{log.amount} ml</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 bg-slate-50/50 border border-slate-100 rounded-2xl text-center text-xs text-slate-400 font-bold tracking-wide">
                💧 Tidak ada riwayat pencatatan air minum untuk hari ini.
              </div>
            )}
          </div>
        </div>

        {/* Footer Page 2 */}
        <div className="mt-auto pt-6 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-widest shrink-0">
          <p>Lumina Aesthetic Clinic &copy; {new Date().getFullYear()}</p>
          <p>Page 2 of 4</p>
        </div>
      </div>

      {/* ================= PAGE 3: PERSONAL COLOR ANALYSIS & SEASON PROFILE ================= */}
      {!disabledFeatures.includes('color_analysis') && (
      <div className="pdf-page w-[800px] h-[1131px] bg-white p-12 text-slate-800 flex flex-col font-sans relative overflow-hidden shrink-0">
        {/* Header */}
        <div className="flex justify-between items-end border-b border-slate-200 pb-6 mb-8 shrink-0">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800 mb-1">Personal Color Spectrum</h1>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Page 3 of 4 • Seasonal Fitting Guidelines</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-6">
          {data.colorAnalysis ? (
            // IF GENERATED SUCCESSFULLY
            <div className="flex flex-col gap-6">
              
              {/* Season Head banner */}
              <div className="p-5 bg-[#F8F7F4] rounded-2xl border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="text-[9px] font-black text-indigo-500 tracking-wider uppercase block mb-1">Detected Skin Season Profile</span>
                  <p className="text-2xl font-black text-slate-800 tracking-tight">{season.toUpperCase()}</p>
                  <p className="text-[11px] font-medium text-slate-500 mt-1 max-w-lg leading-relaxed">{data.colorAnalysis.summary}</p>
                </div>
                {/* Visual spectrum circles */}
                <div className="flex gap-1.5">
                  {details.colorDots.slice(0, 4).map((c, i) => (
                    <div key={i} className="w-5.5 h-5.5 rounded-full border border-slate-300 shadow bg-cover" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>

              {/* Sliders spectrum container */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[9.5px] font-black tracking-widest text-slate-400 uppercase block mb-3 font-mono">SEASON SPECTRUM CHARACTERISTICS</span>
                <div className="grid grid-cols-3 gap-6 font-mono text-[9px] text-slate-500">
                  <div>
                    <div className="flex justify-between mb-1 text-[8px] font-black">
                      <span>WARM</span>
                      <span className="text-indigo-500 font-bold">COOL</span>
                    </div>
                    <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-stone-200 to-indigo-400 rounded-full relative">
                      <div className="w-3 h-3 rounded-full border border-stone-400 bg-white shadow absolute -top-0.5" style={{ left: `${details.hueVal}%`, transform: 'translateX(-50%)' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1 text-[8px] font-black">
                      <span>LIGHT</span>
                      <span>DARK</span>
                    </div>
                    <div className="h-1.5 w-full bg-gradient-to-r from-stone-50 via-stone-300 to-stone-900 rounded-full relative">
                      <div className="w-3 h-3 rounded-full border border-stone-400 bg-white shadow absolute -top-0.5" style={{ left: `${details.valueVal}%`, transform: 'translateX(-50%)' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1 text-[8px] font-black">
                      <span>MUTED (SOFT)</span>
                      <span>BRIGHT (CLEAR)</span>
                    </div>
                    <div className="h-1.5 w-full bg-gradient-to-r from-stone-300 via-stone-400 to-rose-400 rounded-full relative">
                      <div className="w-3 h-3 rounded-full border border-stone-400 bg-white shadow absolute -top-0.5" style={{ left: `${details.chromaVal}%`, transform: 'translateX(-50%)' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid clothing suitings */}
              <div>
                <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase block mb-3">BEST CLOTHING RECOMENDATIONS (PAKAIAN TERBAIK)</span>
                <div className="grid grid-cols-2 gap-4">
                  {data.colorAnalysis.detailedAnalysis.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full border border-slate-300 shadow shrink-0" style={{ backgroundColor: item.colorHex }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-xs font-black text-slate-800 truncate">{item.colorName.toUpperCase()}</span>
                          <span className="text-[9px] font-mono text-purple-500 font-bold">{item.score}% Match</span>
                        </div>
                        <span className="text-[9px] text-pink-500 font-black tracking-widest uppercase block mb-1">{item.compatibility}</span>
                        <p className="text-[10px] text-slate-400 leading-normal line-clamp-2 md:line-clamp-none">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic accessories list */}
              <div>
                <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase block mb-3">BEST ACCESSORIES (AKSESORIS PENDUKUNG TERBAIK)</span>
                <div className="grid grid-cols-2 gap-4">
                  {(data.colorAnalysis.accessories || details.accessories).slice(0, 4).map((acc, idx) => {
                    const descText = 'desc' in acc ? (acc as { desc: string }).desc : 'description' in acc ? (acc as { description: string }).description : '';
                    return (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100/60 flex items-start gap-3">
                        <div className="w-9 h-9 bg-white border border-slate-200/50 rounded-lg flex items-center justify-center text-lg shrink-0 select-none">
                          {acc.emoji || '✨'}
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-800 block mb-0.5">{acc.name}</span>
                          <p className="text-[9.5px] text-slate-500 leading-snug">{descText}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          ) : (
            // IF NOT YET GENERATED (OPTION B INFOBAR)
            <div className="p-8 bg-slate-50 border border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-xl mb-3">🎨</div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-1">Analisis Warna Pribadi Belum Digenerated</h3>
              <p className="text-xs text-slate-400 max-w-md leading-relaxed mb-4">
                Pencocokan warna (Personal Color Analysis) serta virtual try-on aksesoris kulit belum digenerasikan untuk sesi ini.
              </p>
              <div className="bg-white px-4 py-3 rounded-xl border border-slate-200 text-left w-full max-w-sm">
                <span className="text-[9px] font-black text-indigo-500 uppercase tracking-wider block mb-1">Aura Warna yang Dapat Terbuka:</span>
                <ul className="text-[10px] text-slate-500 space-y-1 font-semibold">
                  <li className="flex gap-2 items-center font-bold">● Profil Musim Personal (Winter, Summer, Spring, Autumn)</li>
                  <li className="flex gap-2 items-center">● Rekomendasi Pakaian yang Mencerahkan Wajah</li>
                  <li className="flex gap-2 items-center">● Rekomendasi Aksesoris Kulit berbasis AI</li>
                </ul>
              </div>
              <p className="text-[10px] text-indigo-500 font-bold mt-4">
                💡 Silakan aktifkan modul "Analisis Warna" di dasbor utama Lumina untuk memuat laporan spektrum warna penuh.
              </p>
            </div>
          )}
        </div>

        {/* Footer Page 3 */}
        <div className="mt-auto pt-6 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-widest shrink-0">
          <p>Lumina Aesthetic Clinic &copy; {new Date().getFullYear()}</p>
          <p>Page 3 of 4</p>
        </div>
      </div>
      )}

      {/* Page 4 - Spectacles Guide */}
      <div className="pdf-page w-[800px] h-[1131px] bg-white p-12 text-slate-800 flex flex-col font-sans relative overflow-hidden shrink-0">
        {/* Header */}
        <div className="flex justify-between items-end border-b border-slate-200 pb-6 mb-8 shrink-0">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800 mb-1">
              {language === 'id' ? 'Panduan Bingkai Estetik' : 'Aesthetic Spectacles Guide'}
            </h1>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              {language === 'id' ? 'Halaman 4 dari 4 • Rekomendasi Spasial' : 'Page 4 of 4 • Spatial Recommendations'}
            </p>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-6">
             <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col h-full">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                  {language === 'id' ? 'Rekomendasi Bentuk Kacamata' : 'Recommended Glasses Shapes'}
                </h3>
                <div className="flex-1 space-y-3">
                   {glassesMapping.suitable.slice(0, 4).map((frameId, idx) => {
                      const model = glassesModels.find(m => m.id === frameId);
                      if (!model) return null;
                      const suitDetails = getSuitabilityDetails(model.id, faceShape, glassesMapping);
                      return (
                         <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-3">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-6 text-slate-800 shrink-0 drop-shadow-sm">
                                 <GlassesSvg type={model.id} color="currentColor" />
                              </div>
                              <div>
                                 <div className="flex items-center gap-2">
                                    <p className="font-bold text-slate-700 text-sm leading-none">
                                      {language === 'id' ? model.nameId : model.nameEn}
                                    </p>
                                    <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-black tracking-widest uppercase rounded">
                                       {suitDetails.score}% {language === 'id' ? 'Cocok' : 'Match'}
                                    </span>
                                 </div>
                                 <p className="text-[10px] text-slate-400 mt-1">
                                  {language === 'id' ? model.descId : model.descEn}
                                 </p>
                              </div>
                            </div>
                            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                              <p className="text-[9.5px] leading-relaxed text-slate-500">
                                 <span className="font-bold text-slate-600 mr-1">
                                  {language === 'id' ? 'Dasar Pemikiran:' : 'Rationale:'}
                                 </span>
                                 {suitDetails.rationale}
                              </p>
                            </div>
                         </div>
                      );
                   })}
                </div>
             </div>
             
             <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col h-full">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                  {language === 'id' ? 'Geometri Rambut Optimal' : 'Optimal Hairstyle Geometry'}
                </h3>
                <div className="flex-1 space-y-3">
                   {data.hairstyles && data.hairstyles.recommendedStyles && data.hairstyles.recommendedStyles.map((style, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 p-1.5 text-slate-500">
                            <HairstyleSvg styleName={style} color="currentColor" />
                         </div>
                         <p className="font-bold text-slate-700">{style}</p>
                      </div>
                   ))}
                </div>
             </div>
          </div>

          <div className="bg-slate-800 text-white rounded-2xl p-6 mt-4">
             <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300 mb-4">
               {language === 'id' ? 'Tips Presisi Estetika' : 'Aesthetic Precision Tip'}
             </h3>
             <p className="text-sm leading-relaxed text-slate-200">
               {language === 'id' 
                ? `Untuk mencapai harmoni yang optimal, pilih kacamata dan gaya rambut yang menyeimbangkan dimensi wajah ${data.faceFeatures.shape} alami Anda. Bentuk yang berlawanan biasanya paling mendukung estetika; contohnya bingkai kotak tajam untuk wajah melengkung, atau bingkai membulat untuk struktur tulang wajah yang tegas.` 
                : `To achieve optimal symmetry, aim to select frames and hairstyles that balance your natural ${data.faceFeatures.shape} dimensions. Contrast shapes are usually flattering, e.g. sharp frames for curved features or softly curved frames for strong angular bone structures.`}
             </p>
          </div>
        </div>

        {/* Footer Page 4 */}
        <div className="mt-auto pt-6 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-widest shrink-0">
          <p>Lumina Aesthetic Clinic &copy; {new Date().getFullYear()}</p>
          <p>{language === 'id' ? 'Halaman 4 dari 4' : 'Page 4 of 4'}</p>
        </div>
      </div>

    </div>
  );
};
