import React, { useState, useEffect } from "react";
import { X, Settings, Target, EyeOff, Save, Loader2 } from "lucide-react";
import { SystemSettings } from "../types";
import { doc, getDoc, updateDoc, db } from "../firebase";

interface GlobalSettingsModalProps {
  onClose: () => void;
  language: "en" | "id";
  onAddAuditLog: (action: string, details: string) => void;
}

export const GlobalSettingsModal: React.FC<GlobalSettingsModalProps> = ({
  onClose,
  language,
  onAddAuditLog
}) => {
  const [settings, setSettings] = useState<SystemSettings>({
    guestDailyLimit: 1,
    userDailyLimit: 5,
    globalDisabledFeatures: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docSnap = await getDoc(doc(db, "system_settings", "global"));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSettings({
            guestDailyLimit: data.guestDailyLimit ?? 1,
            userDailyLimit: data.userDailyLimit ?? 5,
            globalDisabledFeatures: data.globalDisabledFeatures ?? []
          });
        }
      } catch (err) {
        console.error("Error loading system settings:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "system_settings", "global"), {
        ...settings
      });
      onAddAuditLog(
        "UPDATE_GLOBAL_SETTINGS",
        `Memperbarui batas tamu: ${settings.guestDailyLimit}, batas user: ${settings.userDailyLimit}.`
      );
      onClose();
    } catch (err) {
      console.error("Error saving global settings", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleFeature = (featureId: string) => {
    setSettings((prev) => {
      const isCurrentlyDisabled = prev.globalDisabledFeatures.includes(featureId);
      let newFeatures = [];
      if (isCurrentlyDisabled) {
        newFeatures = prev.globalDisabledFeatures.filter((f) => f !== featureId);
      } else {
        newFeatures = [...prev.globalDisabledFeatures, featureId];
      }
      return { ...prev, globalDisabledFeatures: newFeatures };
    });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  const FEATURES = [
    { id: "skin_analysis", name: "Analisis Kulit Dasar" },
    { id: "face_analysis", name: "Analisis Bentuk Wajah" },
    { id: "color_analysis", name: "Analisis Personal Color" },
    { id: "hydration_goal", name: "Hydration Tracking" },
    { id: "export_report", name: "Export Laporan PDF" },
    { id: "ar_tryon", name: "Try-On Kacamata AR" },
    { id: "shape_guide", name: "Panduan Bentuk Wajah" },
    { id: "shape_glasses", name: "Rekomendasi Kacamata" },
    { id: "shape_hairstyles", name: "Rekomendasi Gaya Rambut" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative animate-fade-in-up border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 shadow-sm border border-violet-200">
              <Settings size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                {language === "id" ? "Pengaturan Sistem Global" : "Global System Settings"}
              </h2>
              <p className="text-xs text-slate-500 font-medium">Configure global limits and features</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <div className="space-y-8">
            
            <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Target size={18} className="text-blue-500" />
                <h3 className="font-bold text-slate-800 tracking-tight">Usage Limits</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Guest Daily Limit</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono"
                    value={settings.guestDailyLimit}
                    onChange={(e) => setSettings(s => ({ ...s, guestDailyLimit: parseInt(e.target.value) || 0 }))}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Base value: 1</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">User Daily Limit</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono"
                    value={settings.userDailyLimit}
                    onChange={(e) => setSettings(s => ({ ...s, userDailyLimit: parseInt(e.target.value) || 0 }))}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Base value: 5</p>
                </div>
              </div>
            </section>

            <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <EyeOff size={18} className="text-red-500" />
                <h3 className="font-bold text-slate-800 tracking-tight">Globally Disabled Features</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">Toggle features to disable them for ALL users globally.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {FEATURES.map(feat => {
                  const isCurrentlyDisabled = settings.globalDisabledFeatures.includes(feat.id);
                  return (
                    <div 
                      key={feat.id} 
                      onClick={() => handleToggleFeature(feat.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isCurrentlyDisabled 
                          ? 'border-red-200 bg-red-50' 
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span className={`text-sm font-medium ${isCurrentlyDisabled ? 'text-red-700' : 'text-slate-700'}`}>
                        {feat.name}
                      </span>
                      <div className={`w-10 h-6 rounded-full p-1 transition-colors flex items-center ${isCurrentlyDisabled ? 'bg-red-500 justify-end' : 'bg-slate-200 justify-start'}`}>
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
            
          </div>
        </div>

        <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-white shrink-0">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 transition-colors"
          >
            {language === "id" ? "Batal" : "Cancel"}
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {language === "id" ? "Simpan Pengaturan" : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
};
