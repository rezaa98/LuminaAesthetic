import React from 'react';
import { AnalysisResult } from '../types';

interface PdfReportTemplateProps {
  data: AnalysisResult;
  imageSrc?: string | null;
}

export const PdfReportTemplate: React.FC<PdfReportTemplateProps> = ({ data, imageSrc }) => {
  return (
    <div
      id="pdf-report-template"
      className="w-[800px] bg-white p-12 text-slate-800 flex flex-col font-sans"
    >
      {/* Header */}
      <div className="flex justify-between items-end border-b-2 border-pink-500 pb-6 mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-1">Lumina <span className="text-pink-500">Aesthetic</span></h1>
          <p className="text-sm font-semibold text-slate-500">Comprehensive AI Facial Analysis Report</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date())}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Left Column: Image & Basic Info */}
        <div className="col-span-1 flex flex-col gap-6">
          <div className="w-full aspect-[3/4] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
            {imageSrc ? (
              <img src={imageSrc} alt="Patient" className="w-full h-full object-cover grayscale-[30%]" />
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
            <h2 className="text-xl font-bold border-b border-slate-200 pb-2 mb-4 flex items-center gap-2 mt-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Recommendations
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-xs uppercase font-bold text-slate-400 mb-3 tracking-wider">Hairstyles</h3>
                <ul className="space-y-2">
                  {data.hairstyles.recommendedStyles.map((style, idx) => (
                    <li key={idx} className="text-sm font-bold flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                      {style}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs uppercase font-bold text-slate-400 mb-3 tracking-wider">Glasses Frames</h3>
                <ul className="space-y-2">
                  {data.spectacles.recommendedFrames.map((frame, idx) => (
                    <li key={idx} className="text-sm font-bold flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                      {frame}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3: Treatment Plan */}
          <div className="mt-4">
            <h2 className="text-xl font-bold border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> Personalized Care Plan
            </h2>
            <div className="space-y-3">
              <div className="p-3 border border-slate-200 rounded-lg flex items-start gap-3 bg-white">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold shrink-0">1</div>
                <div>
                  <p className="text-sm font-bold">Hydration Strategy</p>
                  <p className="text-xs text-slate-500 mt-1">Target minimum daily water intake of 2000ml to improve skin elasticity and moisture barrier from within.</p>
                </div>
              </div>
              <div className="p-3 border border-slate-200 rounded-lg flex items-start gap-3 bg-white">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold shrink-0">2</div>
                <div>
                  <p className="text-sm font-bold">Targeted Exfoliation</p>
                  <p className="text-xs text-slate-500 mt-1">Focus on the T-Zone (Forehead & Nose) with BHA to control sebum production and minimize pores.</p>
                </div>
              </div>
              <div className="p-3 border border-slate-200 rounded-lg flex items-start gap-3 bg-white">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold shrink-0">3</div>
                <div>
                  <p className="text-sm font-bold">U-Zone Maintenance</p>
                  <p className="text-xs text-slate-500 mt-1">Apply hydrating toners and Ceramides strictly on the Cheeks to combat hydration loss and protect barrier.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-8 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
        <p>Lumina Aesthetic Clinic &copy; {new Date().getFullYear()}</p>
        <p>This report is AI-generated and for consultation purposes only.</p>
      </div>
    </div>
  );
};
