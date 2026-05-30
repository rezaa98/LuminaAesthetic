import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Shield, X, Check, EyeOff, Save, Loader } from 'lucide-react';
import { updateDoc, doc, db } from '../firebase';

interface FeatureAccessModalProps {
  user: User;
  onClose: () => void;
  onAddAuditLog: (action: string, details?: string) => void;
  language: 'id' | 'en';
}

const ALL_FEATURES = [
  { id: 'face_analysis', label: 'Dashboard Analisis Wajah (Utama)' },
  { id: 'face_dimensions', label: 'Sub-Menu Dimensi Wajah' },
  { id: 'skin_analysis', label: 'Sub-Menu Analisis Kulit (Usia/Gender)' },
  
  { id: 'shape_guide', label: 'Dashboard Panduan Bentuk Wajah' },
  { id: 'shape_geometry', label: 'Sub-Menu Info Geometris' },
  { id: 'shape_hairstyles', label: 'Sub-Menu Rekomendasi Gaya Rambut' },
  { id: 'shape_glasses', label: 'Sub-Menu Rekomendasi Kacamata' },
  
  { id: 'color_analysis', label: 'Dashboard Analisis Warna' },
  { id: 'color_original', label: 'Sub-Menu Foto Asli' },
  { id: 'color_silhouette', label: 'Sub-Menu Siluet Avatar' },
  { id: 'color_palettes', label: 'Sub-Menu Rekomendasi Makeup/Warna' },
  
  { id: 'skincare_routine', label: 'Fitur Rekomendasi Skincare' },
  { id: 'hydration_goal', label: 'Fitur Daily Hydration Goal' },
  { id: 'ar_tryon', label: 'Fitur AR Try-On Kacamata' },
  { id: 'export_report', label: 'Fitur Ekspor / Cetak Laporan PDF' }
];

export const FeatureAccessModal: React.FC<FeatureAccessModalProps> = ({ user, onClose, onAddAuditLog, language }) => {
  const isEn = language === 'en';
  const [disabledFeatures, setDisabledFeatures] = useState<string[]>(user.disabledFeatures || []);
  const [saving, setSaving] = useState(false);

  const toggleFeature = (featureId: string) => {
    setDisabledFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.id), { disabledFeatures });
      onAddAuditLog(
        'Modifikasi Akses Fitur',
        `Memperbarui hak akses fitur untuk user @${user.username}. (${disabledFeatures.length} fitur dinonaktifkan)`
      );
      onClose();
    } catch (e) {
      console.error(e);
      alert(isEn ? 'Failed to save feature permissions.' : 'Gagal menyimpan akses fitur.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col font-sans max-h-[90dvh] overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-slate-100 shrink-0">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-black text-slate-800 tracking-tight">{isEn ? 'Feature Access Control' : 'Kelola Akses Fitur'}</h3>
            <p className="text-[10.5px] text-slate-500 font-semibold uppercase tracking-widest block font-mono mt-0.5">TARGET: @{user.username}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-700 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 font-sans hide-scrollbar bg-slate-50/50">
          <div className="mb-4 text-xs font-semibold text-slate-600">
            {isEn ? "Select which features should be HIDDEN for this user. Checked items will be forcefully disabled." : "Pilih fitur mana saja yang akan DINONAKTIFKAN (Hidden) untuk pengguna ini."}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ALL_FEATURES.map((feat) => {
              const takesHidden = disabledFeatures.includes(feat.id);
              return (
                <div 
                  key={feat.id}
                  onClick={() => toggleFeature(feat.id)}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                    takesHidden 
                      ? 'bg-rose-50 border-rose-200 shadow-sm' 
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-5 h-5 mt-0.5 rounded flex items-center justify-center shrink-0 border ${
                    takesHidden ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white border-slate-300'
                  }`}>
                    {takesHidden && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <h4 className={`text-xs font-extrabold ${takesHidden ? 'text-rose-700' : 'text-slate-700'}`}>
                      {feat.label}
                    </h4>
                    <p className={`text-[9.5px] font-semibold mt-1 ${takesHidden ? 'text-rose-500' : 'text-slate-400'}`}>
                      ID: {feat.id}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="p-5 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-5 py-2 hover:bg-slate-50 text-slate-500 font-bold text-sm tracking-wide rounded-xl transition-colors disabled:opacity-50"
          >
            {isEn ? 'Cancel' : 'Batal'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm tracking-wide rounded-xl transition-colors shadow-lg shadow-indigo-200 flex items-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEn ? 'Save Layout Profile' : 'Terapkan Akses'}
          </button>
        </div>
      </div>
    </div>
  );
};
