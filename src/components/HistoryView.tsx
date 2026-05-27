import { HistoryItem } from '../types';
import { Clock, Image as ImageIcon, ChevronRight, SplitSquareHorizontal, Filter } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface HistoryViewProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onBack: () => void;
}

export const HistoryView = ({ history, onSelect, onBack }: HistoryViewProps) => {
  const { lang, language } = useLanguage();
  const [minHydration, setMinHydration] = useState<number>(0);
  const [skinTypeFilter, setSkinTypeFilter] = useState<string>('Semua');
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState<boolean>(false);

  const filteredHistory = history.filter(item => {
    if (item.analysisData.skinAnalysis.hydration < minHydration) return false;
    if (skinTypeFilter !== 'Semua' && item.analysisData.skinType.type !== skinTypeFilter) return false;
    return true;
  });

  const skinTypes = ['Semua', ...Array.from(new Set(history.map(item => item.analysisData.skinType.type)))];

  const handleToggleCompare = (id: string) => {
    if (selectedCompareIds.includes(id)) {
      setSelectedCompareIds(prev => prev.filter(i => i !== id));
    } else {
      if (selectedCompareIds.length < 2) {
        setSelectedCompareIds(prev => [...prev, id]);
      } else {
        // Replace oldest selection
        setSelectedCompareIds(prev => [prev[1], id]);
      }
    }
  };

  const handleStartCompare = () => {
    if (selectedCompareIds.length === 2) {
      setShowComparison(true);
    }
  };

  if (showComparison) {
    const item1 = history.find(i => i.id === selectedCompareIds[0]);
    const item2 = history.find(i => i.id === selectedCompareIds[1]);

    if (!item1 || !item2) return null;

    return (
      <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
            <SplitSquareHorizontal className="w-5 h-5 text-pink-500" />
            Perbandingan Progress
          </h2>
          <button 
            onClick={() => setShowComparison(false)}
            className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Tutup Perbandingan
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 flex flex-col md:flex-row gap-6">
          <div className="flex-1 flex flex-col gap-4">
            <div className="text-sm font-bold text-slate-400 bg-white p-3 rounded-lg text-center shadow-sm">
              {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item1.timestamp))}
            </div>
            <img src={item1.imageUrl || ''} alt="1" className="w-full aspect-square object-cover rounded-xl shadow-sm" />
            <div className="p-4 bg-white rounded-xl shadow-sm">
              <p className="font-bold text-slate-800 mb-2">Skor Hidrasi</p>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400" style={{ width: `${item1.analysisData.skinAnalysis.hydration}%` }} />
              </div>
              <p className="mt-1 text-sm font-bold text-blue-500">{item1.analysisData.skinAnalysis.hydration}%</p>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-sm">
              <p className="font-bold text-slate-800">Tipe Kulit</p>
              <p className="text-sm text-slate-600">{item1.analysisData.skinType.type}</p>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-sm">
              <p className="font-bold text-slate-800">Skor Permukaan</p>
              <p className="text-sm text-slate-600">{(item1.analysisData.skinAnalysis.texture ?? 80)}% (Tekstur), {(item1.analysisData.skinAnalysis.pores ?? 85)}% (Pori-pori)</p>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <div className="text-sm font-bold text-slate-400 bg-white p-3 rounded-lg text-center shadow-sm">
              {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item2.timestamp))}
            </div>
            <img src={item2.imageUrl || ''} alt="2" className="w-full aspect-square object-cover rounded-xl shadow-sm" />
            <div className="p-4 bg-white rounded-xl shadow-sm">
              <p className="font-bold text-slate-800 mb-2">Skor Hidrasi</p>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400" style={{ width: `${item2.analysisData.skinAnalysis.hydration}%` }} />
              </div>
              <p className="mt-1 text-sm font-bold text-blue-500">{item2.analysisData.skinAnalysis.hydration}%</p>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-sm">
              <p className="font-bold text-slate-800">Tipe Kulit</p>
              <p className="text-sm text-slate-600">{item2.analysisData.skinType.type}</p>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-sm">
              <p className="font-bold text-slate-800">Skor Permukaan</p>
              <p className="text-sm text-slate-600">{(item2.analysisData.skinAnalysis.texture ?? 80)}% (Tekstur), {(item2.analysisData.skinAnalysis.pores ?? 85)}% (Pori-pori)</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden" data-testid="history-view">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
          <Clock className="w-5 h-5 text-pink-500" />
          {lang.historyTitle || 'Riwayat Analisis'}
        </h2>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setCompareMode(!compareMode);
              setSelectedCompareIds([]);
            }}
            className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors border ${compareMode ? 'bg-pink-50 text-pink-600 border-pink-200' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
          >
            {language === 'id' ? 'Bandingkan' : 'Compare'}
          </button>
          <button 
            onClick={onBack}
            className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors px-3 py-1.5"
          >
            {lang.backToScanner || 'Kembali'}
          </button>
        </div>
      </div>

      <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-sm">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-bold text-slate-600">Filter:</span>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500">Min Hidrasi:</label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={minHydration} 
            onChange={(e) => setMinHydration(Number(e.target.value))}
            className="w-24 accent-pink-500"
          />
          <span className="text-xs font-bold text-slate-700 w-8">{minHydration}%</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500">Tipe:</label>
          <select 
            value={skinTypeFilter} 
            onChange={(e) => setSkinTypeFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white font-semibold text-slate-700"
          >
            {skinTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {compareMode && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">
              {selectedCompareIds.length}/2 dipilih
            </span>
            <button
              onClick={handleStartCompare}
              disabled={selectedCompareIds.length !== 2}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${selectedCompareIds.length === 2 ? 'bg-pink-500 text-white shadow-md' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
            >
              Mulai Bandingkan
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
        {filteredHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
            <Clock className="w-16 h-16 mb-4 opacity-50" />
            <p className="font-bold text-lg text-slate-600">{lang.noHistoryTitle || 'Belum ada riwayat'}</p>
            <p className="text-sm">{lang.noHistoryDesc || 'Riwayat analisis wajah akan muncul di sini.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHistory.map((item, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={item.id}
                className={`bg-white border rounded-xl p-4 flex flex-col gap-3 transition-all cursor-pointer group ${compareMode && selectedCompareIds.includes(item.id) ? 'border-pink-500 ring-2 ring-pink-200' : 'border-slate-200 hover:shadow-md'}`}
                onClick={() => {
                  if (compareMode) {
                    handleToggleCompare(item.id);
                  } else {
                    onSelect(item);
                  }
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                    {new Intl.DateTimeFormat('id-ID', { 
                      day: '2-digit', month: 'short', year: 'numeric', 
                      hour: '2-digit', minute: '2-digit' 
                    }).format(new Date(item.timestamp))}
                  </div>
                  {!compareMode && (
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-pink-100 group-hover:text-pink-500 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  )}
                  {compareMode && (
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${selectedCompareIds.includes(item.id) ? 'bg-pink-500 border-pink-500 text-white' : 'border-slate-300'}`}>
                      {selectedCompareIds.includes(item.id) && <span className="text-[10px] font-bold">✓</span>}
                    </div>
                  )}
                </div>

                <div className="w-full aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-100">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt="History" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ImageIcon className="w-10 h-10" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-sm font-bold text-slate-800">Skor Hidrasi: <span className="text-blue-500">{item.analysisData.skinAnalysis.hydration}%</span></p>
                  <p className="text-xs text-slate-500">Tipe: {item.analysisData.skinType.type}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
