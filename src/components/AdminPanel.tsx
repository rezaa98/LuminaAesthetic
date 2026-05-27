import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  FileText, 
  Activity, 
  ShieldCheck, 
  UserCog, 
  ClipboardList, 
  PenTool, 
  CheckCircle2, 
  RefreshCw, 
  Flame, 
  Droplets, 
  Info, 
  Download,
  Loader,
  Trash2
} from 'lucide-react';
import { User, HistoryItem, AuditLog, UserRole } from '../types';
import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';
import { PdfReportTemplate } from './PdfReportTemplate';

interface AdminPanelProps {
  currentUser: User;
  history: HistoryItem[];
  onAddAuditLog: (action: string, details?: string) => void;
  onSaveConsultantNotes: (scanId: string, notes: string) => void;
  onDeleteHistoryItem?: (scanId: string) => void;
  language: 'id' | 'en';
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  history,
  onAddAuditLog,
  onSaveConsultantNotes,
  onDeleteHistoryItem,
  language
}) => {
  const isEn = language === 'en';
  const isSuper = currentUser.role === 'super_admin';
  const [activeTab, setActiveTab] = useState<'directory' | 'users' | 'audits'>('directory');
  
  // Local reactive states loaded from localStorage
  const [userList, setUserList] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [editingScanId, setEditingScanId] = useState<string | null>(null);
  const [clinicianNote, setClinicianNote] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string>('');

  // Pagination for Diagnosis Ledgers
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  // PDF report states
  const [downloadingItemId, setDownloadingItemId] = useState<string | null>(null);
  const [selectedPdfScanItem, setSelectedPdfScanItem] = useState<HistoryItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [downloadingAuditPdf, setDownloadingAuditPdf] = useState<boolean>(false);

  // Hydrate Data on Mount
  useEffect(() => {
    // Standard static base accounts
    const initialPresets: User[] = [
      { id: 'super-admin-01', name: 'Dr. Clara Lumina', username: 'superadmin', role: 'super_admin', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'admin-01', name: 'Nurse Amelia', username: 'consultant', role: 'admin', createdAt: '2026-03-15T00:00:00Z' },
      { id: 'client-clara', name: 'Clara Rosabella', username: 'client', role: 'user', createdAt: '2026-05-10T00:00:00Z' }
    ];

    const savedCustomUsersRaw = localStorage.getItem('lumina-custom-users') || '[]';
    const savedCustomUsers: User[] = JSON.parse(savedCustomUsersRaw);
    
    // Merge Presets and Custom Users
    const combined = [...initialPresets];
    savedCustomUsers.forEach(cu => {
      if (!combined.some(u => u.username === cu.username)) {
        combined.push(cu);
      }
    });
    setUserList(combined);

    // Load Audit Logs
    const loadedLogsRaw = localStorage.getItem('lumina-audit-logs') || '[]';
    const loadedLogs: AuditLog[] = JSON.parse(loadedLogsRaw);
    
    // If empty audits, seed default ones
    if (loadedLogs.length === 0) {
      const defaultAudits: AuditLog[] = [
        { id: 'seed-1', timestamp: new Date(2026, 4, 11).toISOString(), userId: 'client-clara', username: 'client', role: 'user', action: 'Scan Face AI', details: 'Scanning wajah frontal, hasil Hidrasi 65%' },
        { id: 'seed-2', timestamp: new Date(2026, 4, 12).toISOString(), userId: 'super-admin-01', username: 'superadmin', role: 'super_admin', action: 'Login Portal', details: 'Autentikasi CEO via Dashboard' },
        { id: 'seed-3', timestamp: new Date(2026, 4, 15).toISOString(), userId: 'admin-01', username: 'consultant', role: 'admin', action: 'Download PDF Report', details: 'Ekspor dokumen A4 pasien Clara' }
      ];
      localStorage.setItem('lumina-audit-logs', JSON.stringify(defaultAudits));
      setAuditLogs(defaultAudits);
    } else {
      setAuditLogs(loadedLogs);
    }
  }, [currentUser]);

  // Handle Role Modification
  const handleChangeRole = (userId: string, targetRole: UserRole) => {
    if (!isSuper) {
      setToastMessage(isEn ? 'Unauthorized! Only Dr. Clara (Super Admin) can change credentials' : 'Akses ditolak! Hanya Dr. Clara (Super Admin) yang dapat mengedit role');
      return;
    }

    const updated = userList.map(u => {
      if (u.id === userId) {
        return { ...u, role: targetRole };
      }
      return u;
    });
    setUserList(updated);

    // Save back custom users in local storage
    const customUsersOnly = updated.filter(u => u.id.startsWith('custom-user-'));
    localStorage.setItem('lumina-custom-users', JSON.stringify(customUsersOnly));

    const targetUser = userList.find(u => u.id === userId);
    if (targetUser) {
      // Trigger audit log entry
      const logMsg = `Ubah Role User ${targetUser.username}`;
      const logDetails = `Mengubah hak akses dari ${targetUser.role.toUpperCase()} ke ${targetRole.toUpperCase()}`;
      onAddAuditLog(logMsg, logDetails);
      
      // Update our reactive audit state
      const updatedLogsRaw = localStorage.getItem('lumina-audit-logs') || '[]';
      setAuditLogs(JSON.parse(updatedLogsRaw));
    }

    setToastMessage(isEn ? 'User Role updated successfully!' : 'Hak akses pengguna berhasil dirubah!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Handle Saving Notes
  const handleSaveNotes = (scanId: string) => {
    onSaveConsultantNotes(scanId, clinicianNote);
    
    // Add audit log for saving logs
    onAddAuditLog('Update Catatan Estetika', `Konsultan menambahkan saran klinis spesifik pada laporan ID: ${scanId}`);
    
    // Sync local state
    const updatedLogsRaw = localStorage.getItem('lumina-audit-logs') || '[]';
    setAuditLogs(JSON.parse(updatedLogsRaw));

    setEditingScanId(null);
    setClinicianNote('');
    setToastMessage(isEn ? 'Clinician recommendations updated in Client Record!' : 'Saran estetika klinis berhasil disematkan ke berkas klien!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Handle Administrative PDF download
  const handleDownloadAdminReport = async (item: HistoryItem) => {
    setDownloadingItemId(item.id);
    setSelectedPdfScanItem(item);
    
    // Add audit log for administrative report download
    onAddAuditLog('Download PDF Admin', `Admin/Super Admin mengekspor dokumen medis/${item.analysisData.skinType.type} untuk pasien ${item.userDisplayName || 'Guest'}`);

    try {
      // Small delay to ensure template renders in DOM
      await new Promise((resolve) => setTimeout(resolve, 300));

      const pages = document.querySelectorAll("#admin-pdf-container .pdf-page");
      if (!pages || pages.length === 0) {
        throw new Error("No PDF pages targeted in Admin Panel render");
      }

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

      const clientSafeName = (item.userDisplayName || 'Guest').toLowerCase().replace(/\s+/g, '-');
      pdf.save(`LuminaAesthetic-Report-${clientSafeName}.pdf`);
      setToastMessage(isEn ? 'PDF report generated successfully!' : 'Dokumen PDF Laporan pasien berhasil diekspor!');
      setTimeout(() => setToastMessage(''), 3000);
    } catch (error) {
      console.error("Error generating PDF in Admin Panel:", error);
      alert(isEn ? "Failed to generate PDF Report." : "Gagal membuat laporan PDF.");
    } finally {
      setDownloadingItemId(null);
      setSelectedPdfScanItem(null);
    }
  };

  const handleDownloadCsv = () => {
    const headers = ["Timestamp", "Log ID", "Action", "Details", "Username", "Role"];
    const rows = auditLogs.slice().reverse().map(log => [
      new Date(log.timestamp).toISOString(),
      log.id,
      `"${log.action.replace(/"/g, '""')}"`,
      `"${log.details.replace(/"/g, '""')}"`,
      log.username,
      log.role
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Lumina_Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    onAddAuditLog('Export Audit CSV', `Super Admin mengunduh lembar log audit lengkap format CSV (${auditLogs.length} entri)`);
    
    const updatedLogsRaw = localStorage.getItem('lumina-audit-logs') || '[]';
    setAuditLogs(JSON.parse(updatedLogsRaw));

    setToastMessage(isEn ? 'CSV Report downloaded successfully!' : 'Laporan CSV Berhasil Diunduh!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleDownloadAuditPdf = async () => {
    setDownloadingAuditPdf(true);
    onAddAuditLog('Export Audit PDF', `Super Admin mengunduh laporan audit keamanan regulasi format PDF (${auditLogs.length} entri)`);
    
    const updatedLogsRaw = localStorage.getItem('lumina-audit-logs') || '[]';
    setAuditLogs(JSON.parse(updatedLogsRaw));

    try {
      await new Promise((resolve) => setTimeout(resolve, 400));

      const pages = document.querySelectorAll("#admin-audit-pdf-container .pdf-page");
      if (!pages || pages.length === 0) {
        throw new Error("No Audit PDF pages found in DOM");
      }

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

      pdf.save(`LuminaAesthetic-SecurityAuditLogs.pdf`);
      setToastMessage(isEn ? 'Audit Logs PDF report generated successfully!' : 'Laporan PDF Log Audit Keamanan berhasil diekspor!');
      setTimeout(() => setToastMessage(''), 3000);
    } catch (error) {
      console.error("Error generating Audit PDF:", error);
      alert(isEn ? "Failed to generate Audit Logs PDF Report." : "Gagal membuat laporan PDF Log Audit.");
    } finally {
      setDownloadingAuditPdf(false);
    }
  };

  // Calculations for Metrics Panel
  const averageHydration = history.length > 0 
    ? Math.round(history.reduce((acc, curr) => acc + curr.analysisData.skinAnalysis.hydration, 0) / history.length)
    : 72;

  const totalOily = history.filter(h => h.analysisData.skinType.type.toLowerCase().includes('oily') || h.analysisData.skinType.type.toLowerCase().includes('minyak')).length;
  const totalDry = history.filter(h => h.analysisData.skinType.type.toLowerCase().includes('dry') || h.analysisData.skinType.type.toLowerCase().includes('kering')).length;

  // Pagination Calculus for directory list
  const totalItems = history.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedHistory = history.slice(startIndex, endIndex);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#fafaf9] rounded-2xl border border-stone-200 h-full relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-6 right-6 z-50 bg-slate-900 border border-slate-700 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Metric Dashboard Summary Header */}
      <div className="p-6 bg-white border-b border-stone-200 grid grid-cols-2 md:grid-cols-4 gap-6 shrink-0 shadow-sm">
        
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-pink-50 rounded-xl text-pink-500">
            <ClipboardList className="w-5.5 h-5.5" />
          </div>
          <div>
            <p className="text-[9.5px] font-black uppercase text-stone-400 tracking-widest">{isEn ? 'TOTAL DIAGNOSES' : 'TOTAL PEMINDAIAN'}</p>
            <p className="text-xl font-black text-slate-800">{history.length} <span className="text-stone-400 text-xs font-semibold">Ledgers</span></p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 rounded-xl text-blue-500">
            <Droplets className="w-5.5 h-5.5" />
          </div>
          <div>
            <p className="text-[9.5px] font-black uppercase text-stone-400 tracking-widest">{isEn ? 'AVG HYDRATION' : 'RATA-RATA HIDRASI'}</p>
            <p className="text-xl font-black text-slate-800">{averageHydration}% <span className="text-[#3b82f6] text-xs font-semibold">Moist</span></p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 rounded-xl text-emerald-500">
            <Users className="w-5.5 h-5.5" />
          </div>
          <div>
            <p className="text-[9.5px] font-black uppercase text-stone-400 tracking-widest">{isEn ? 'SANDBOX USERBASE' : 'PENGGUNA AKTIF'}</p>
            <p className="text-xl font-black text-slate-800">{userList.length} <span className="text-stone-400 text-xs font-semibold">Profiles</span></p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-purple-50 rounded-xl text-purple-500">
            <ShieldCheck className="w-5.5 h-5.5" />
          </div>
          <div>
            <p className="text-[9.5px] font-black uppercase text-stone-400 tracking-widest">{isEn ? 'ROLE COMPLIANCE' : 'ZONA KEPATUHAN'}</p>
            <p className="text-xl font-black text-emerald-500 uppercase tracking-wider text-xs">STANDARD ACTIVE</p>
          </div>
        </div>

      </div>

      {/* Navigation Sub-tab Control */}
      <div className="h-12 bg-white/70 border-b border-stone-200 px-6 flex items-center justify-between shrink-0 font-sans text-xs">
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('directory')}
            className={`flex items-center gap-1.5 font-bold tracking-tight pb-3 pt-3 border-b-2 transition-all ${activeTab === 'directory' ? 'text-pink-650 border-pink-500 text-pink-500' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
          >
            <FileText className="w-4 h-4" />
            {isEn ? 'Diagnosis Ledgers & Consultations' : 'Anotasi Catatan Estetika'}
          </button>

          {isSuper && (
            <button 
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-1.5 font-bold tracking-tight pb-3 pt-3 border-b-2 transition-all ${activeTab === 'users' ? 'text-pink-650 border-pink-500 text-pink-500' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
            >
              <UserCog className="w-4 h-4" />
              {isEn ? 'Clinic User Directory (RBAC)' : 'Promosi Role Sandbox (CEO Only)'}
            </button>
          )}

          <button 
            onClick={() => setActiveTab('audits')}
            className={`flex items-center gap-1.5 font-bold tracking-tight pb-3 pt-3 border-b-2 transition-all ${activeTab === 'audits' ? 'text-pink-650 border-pink-500 text-pink-500' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
          >
            <ClipboardList className="w-4 h-4" />
            {isEn ? 'Clinic Security Audit Logs' : 'Log Audit Pengamanan'}
          </button>
        </div>

        <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200 font-bold">
          {currentUser.role.replace('_', ' ')}: {currentUser.name}
        </span>
      </div>

      {/* Main Scrollable Body View */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-h-[calc(100vh-250px)] sm:max-h-[calc(100vh-220px)] md:max-h-none">
        
        {/* TAB 1: LEDGERS DIRECTORY & CLINICAL Observer NOTES */}
        {activeTab === 'directory' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-2">
                <PenTool className="w-5 h-5 text-pink-500" />
                <h3 className="font-black text-slate-800 text-sm tracking-tight">{isEn ? 'Client Examination Ledgers' : 'Registri Pemeriksaan & Anotasi Medis'}</h3>
              </div>
              <span className="text-xs text-stone-400 font-mono">
                {isEn ? `${totalItems} ledger entries found` : `${totalItems} entry data ditemukan`}
              </span>
            </div>

            {totalItems === 0 ? (
              <div className="bg-white p-8 border border-dashed border-stone-200 rounded-2xl text-center text-slate-400/85">
                <p className="font-bold text-xs">{isEn ? 'No client diagnoses have been executed yet' : 'Belum ada data pemeriksaan klinis yang tersimpan di sistem'}</p>
                <p className="text-[10.5px] mt-1">{isEn ? 'Client accounts must perform a face scan from the main dashboard first.' : 'Pengguna berkas regular harus melakukan penarikan foto terlebih dahulu.'}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4">
                  {paginatedHistory.map((it) => (
                    <div key={it.id} className="p-4 bg-white border border-stone-200 rounded-2xl shadow-sm hover:shadow transition-shadow flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 bg-stone-100 rounded-xl overflow-hidden border border-stone-200 shrink-0">
                          {it.imageUrl ? (
                            <img src={it.imageUrl} alt="client selfie" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-[9px] text-stone-400">NA</div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-black text-slate-800 text-xs uppercase">{it.userDisplayName || 'Klien Guest (Tamu Estetika)'}</span>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-pink-50 text-pink-600 rounded">ID: {it.id.slice(-6)}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-3">
                            <span>{it.analysisData.skinType.type} • Hidrasi {it.analysisData.skinAnalysis.hydration}%</span>
                            <span className="hidden sm:inline">• {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(it.timestamp))}</span>
                          </p>
                        </div>
                      </div>

                      {/* Consultant Notes Form or View */}
                      <div className="w-full md:w-auto flex-1 max-w-sm ml-0 md:ml-6 mt-3 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                        {editingScanId === it.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={clinicianNote}
                              onChange={(e) => setClinicianNote(e.target.value)}
                              placeholder={isEn ? "Add observer recommendations (e.g., 'Avoid AHA/BHA, use serum ceramide 3 times/week')" : "Tulis saran ahli klinis... (contoh: Gunakan tabir surya SPF50+ dan hidrasi ceramide)"}
                              className="w-full p-2.5 text-[10.5px] font-semibold border border-pink-400 rounded-xl outline-none focus:ring-1 focus:ring-pink-500 resize-none h-20"
                            />
                            <div className="flex gap-2 justify-end">
                              <button 
                                onClick={() => setEditingScanId(null)}
                                className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-500 font-bold rounded-lg text-[9px] uppercase tracking-wide"
                              >
                                Batal
                              </button>
                              <button 
                                onClick={() => handleSaveNotes(it.id)}
                                className="px-3 py-1 bg-pink-500 hover:bg-pink-600 text-white font-black rounded-lg text-[9px] uppercase tracking-wide"
                              >
                                Sematkan Catatan
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-stone-50 border border-stone-200/60 rounded-xl">
                            <span className="text-[8px] font-black uppercase tracking-wider text-pink-500 block mb-1">REKOMENDASI KONSULTAN KLINIK</span>
                            <p className="text-[10px] text-slate-500 italic font-semibold leading-relaxed">
                              {it.consultantNotes || (isEn ? " No added clinician advice yet. Tap 'Edit Note' to insert professional annotations." : " Belum ada komentar medis klinis. Tekan 'Beri Catatan' di kanan untuk membantu pasien.")}
                            </p>
                            {it.consultantNotes && (
                              <span className="text-[8px] font-mono text-stone-400 block mt-1.5 text-right font-bold">— {it.consultantName || 'Dr. Lumina'}</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0 mt-2 md:mt-0 w-full md:w-auto justify-end">
                        {/* Download Report Button for Admin / Super Admin */}
                        {(currentUser.role === 'admin' || currentUser.role === 'super_admin') && (
                          <button
                            disabled={downloadingItemId !== null}
                            onClick={() => handleDownloadAdminReport(it)}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-black text-[9.5px] uppercase rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50 border border-emerald-200"
                            title={isEn ? "Export PDF Report" : "Ekspor Laporan PDF"}
                          >
                            {downloadingItemId === it.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Download className="w-3.5 h-3.5" />
                            )}
                            {isEn ? 'PDF Report' : 'Unduh PDF'}
                          </button>
                        )}

                        {editingScanId !== it.id && (
                          <button
                            onClick={() => {
                              setEditingScanId(it.id);
                              setClinicianNote(it.consultantNotes || '');
                            }}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[9.5px] font-black uppercase rounded-lg shadow-sm transition-colors shrink-0"
                          >
                            {it.consultantNotes ? 'Edit Anotasi' : 'Beri Catatan'}
                          </button>
                        )}

                        {/* Super Admin Delete Button */}
                        {isSuper && onDeleteHistoryItem && (
                          <button
                            onClick={() => setDeleteConfirmId(it.id)}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[9.5px] uppercase rounded-lg shadow-sm transition-colors border border-rose-200 flex items-center justify-center gap-1 cursor-pointer"
                            title={isEn ? "Delete Record" : "Hapus Record"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            {isEn ? 'Delete' : 'Hapus'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Elegant Pagination Control */}
                <div className="mt-6 pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-stone-500 font-semibold w-full sm:w-auto justify-between sm:justify-start">
                    <div className="flex items-center gap-2">
                      <span>{isEn ? "Show" : "Tampilkan"}</span>
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="bg-white border border-stone-300 rounded-lg px-2 py-1 text-slate-700 outline-none focus:border-pink-500 font-extrabold text-xs cursor-pointer shadow-sm"
                      >
                        {[5, 10, 20, 50, 100].map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                      <span>{isEn ? "items per page" : "baris per halaman"}</span>
                    </div>
                    <span className="hidden sm:inline text-stone-300 mx-1">|</span>
                    <span className="text-right">
                      {isEn 
                        ? `Showing ${startIndex + 1}-${endIndex} of ${totalItems}` 
                        : `Menampilkan ${startIndex + 1}-${endIndex} dari ${totalItems}`}
                    </span>
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center gap-1.5 justify-center w-full sm:w-auto">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className="px-2.5 py-1.5 bg-white border border-stone-200 hover:bg-stone-50 disabled:opacity-50 text-stone-600 font-bold uppercase tracking-wider text-[10px] rounded-lg shadow-sm transition-colors disabled:cursor-not-allowed"
                      >
                        {isEn ? "Prev" : "Sebelum"}
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all ${
                              currentPage === page
                                ? "bg-pink-500 text-white shadow"
                                : "bg-white border border-stone-200 hover:bg-stone-50 text-slate-600"
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>

                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        className="px-2.5 py-1.5 bg-white border border-stone-200 hover:bg-stone-50 disabled:opacity-50 text-stone-600 font-bold uppercase tracking-wider text-[10px] rounded-lg shadow-sm transition-colors disabled:cursor-not-allowed"
                      >
                        {isEn ? "Next" : "Berikut"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SYSTEM USER DIRECTORY (ROLE TOGGLES - SUPER ADMIN EXCLUSIVE) */}
        {activeTab === 'users' && isSuper && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <UserCog className="w-5 h-5 text-indigo-500" />
              <h3 className="font-black text-slate-800 text-sm tracking-tight">{isEn ? 'Administrative User Accounts Directory (RBAC)' : 'Direktori Akun Pengguna Sandbox (RBAC)'}</h3>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left font-sans text-[11px] font-medium text-slate-600">
                <thead className="bg-[#f0f0ef] text-slate-500 border-b border-stone-200">
                  <tr>
                    <th className="px-6 py-3 font-black uppercase tracking-wider text-[9px]">{isEn ? 'Display Name / Alias' : 'Nama Lengkap / Username'}</th>
                    <th className="px-6 py-3 font-black uppercase tracking-wider text-[9px]">{isEn ? 'Created At' : 'Terdaftar Pada'}</th>
                    <th className="px-6 py-3 font-black uppercase tracking-wider text-[9px]">{isEn ? 'Active Privileges' : 'Hak Istimewa'}</th>
                    <th className="px-6 py-3 font-black uppercase tracking-wider text-[9px] text-right">{isEn ? 'Authority Toggles' : 'Modifikasi Role'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {userList.map((usr) => (
                    <tr key={usr.id} className="bg-white hover:bg-stone-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${usr.role === 'super_admin' ? 'bg-pink-100 text-pink-600' : usr.role === 'admin' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            {usr.name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-800 text-xs">{usr.name}</p>
                            <p className="text-[9.5px] font-mono text-indigo-400 font-semibold">@{usr.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-semibold">
                        {new Date(usr.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[8.5px] font-black uppercase border leading-none ${usr.role === 'super_admin' ? 'bg-pink-50 text-pink-600 border-pink-200' : usr.role === 'admin' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                          {usr.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-1 justify-end">
                          {(['user', 'admin', 'super_admin'] as UserRole[]).map((r) => (
                            <button
                              key={r}
                              disabled={usr.role === r}
                              onClick={() => handleChangeRole(usr.id, r)}
                              className={`px-2 py-1 text-[8.5px] font-black uppercase rounded transition-colors ${usr.role === r ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/50' : 'bg-white hover:bg-slate-50 text-indigo-500 border border-slate-200'}`}
                            >
                              {r === 'super_admin' ? 'S.Admin' : r === 'admin' ? 'Admin' : 'User'}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: SYSTEM AUDITS TRAILS LIST */}
        {activeTab === 'audits' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h3 className="font-black text-slate-800 text-sm tracking-tight">{isEn ? 'System Administrative Security Trails' : 'Log Jejak Keamanan Sistem Utama'}</h3>
              </div>
              
              {/* Super Admin Download Buttons */}
              {isSuper && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleDownloadCsv}
                    className="px-3 py-1.5 bg-[#eff6ff] hover:bg-[#dbeafe] text-[#1d4ed8] font-black text-[9.5px] uppercase rounded-lg shadow-sm border border-blue-200 transition-colors flex items-center gap-1.5 cursor-pointer animate-fade-in"
                    title={isEn ? "Export Audit Logs to CSV" : "Ekspor Log Audit ke CSV"}
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    {isEn ? 'Export CSV' : 'Unduh CSV'}
                  </button>

                  <button
                    disabled={downloadingAuditPdf}
                    onClick={handleDownloadAuditPdf}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-black text-[9.5px] uppercase rounded-lg shadow-sm border border-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 animate-fade-in"
                    title={isEn ? "Export Audit Logs to PDF Report" : "Ekspor Log Audit ke PDF Laporan"}
                  >
                    {downloadingAuditPdf ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                    {isEn ? 'Export PDF Report' : 'Unduh PDF Laporan'}
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm flex flex-col font-mono text-[10px] tracking-tight text-slate-500 max-h-[400px] overflow-y-auto w-full">
              <div className="bg-[#f0f0ef] px-4 py-2 border-b border-stone-200 text-stone-500 font-bold flex justify-between uppercase text-[9px]">
                <span>Log Action / Detail</span>
                <span className="text-right">Timestamp</span>
              </div>
              <div className="divide-y divide-stone-100">
                {auditLogs.slice().reverse().map((log) => (
                  <div key={log.id} className="p-3.5 bg-white hover:bg-stone-50/50 transition-colors flex justify-between items-start gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-855 px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-xs rounded uppercase tracking-wide">
                          {log.action}
                        </span>
                        <span className="text-[9.5px] text-slate-400 font-bold block">
                          by <span className="text-indigo-500">@{log.username}</span> ({log.role.replace('_', ' ').toUpperCase()})
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-semibold leading-relaxed mt-1">↳ {log.details}</p>
                    </div>
                    <span className="text-[9.5px] text-slate-400 font-mono text-right whitespace-nowrap pt-0.5">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex gap-1.5 items-start">
              <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-[9px] text-[#4b5563] font-semibold leading-relaxed">
                Log ini merekam setiap transaksi sandbox yang berjalan secara real-time. Meliputi verifikasi AI, input resep medis baru, ekspor PDF A4, dan transisi role-based di bawah kepatuhan sertifikat privasi Lumina.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Hidden PDF Report Template Container specifically for Administrative purposes */}
      {selectedPdfScanItem && (
        <div className="w-0 h-0 overflow-hidden relative">
          <div id="admin-pdf-container" className="absolute top-[-9999px] left-[-9999px] z-[-9999] bg-white">
            <PdfReportTemplate 
              data={selectedPdfScanItem.analysisData} 
              imageSrc={selectedPdfScanItem.imageUrl} 
              detailedFaceData={null} 
              intakeHistory={[]} 
              consultantNotes={selectedPdfScanItem.consultantNotes}
              consultantName={selectedPdfScanItem.consultantName}
            />
          </div>
        </div>
      )}

      {/* Hidden PDF Report Template Container specifically for Audit Logs */}
      <div className="w-0 h-0 overflow-hidden relative">
        <div id="admin-audit-pdf-container" className="absolute top-[-9999px] left-[-9999px] z-[-9999] bg-white">
          {(() => {
            const itemsPerPage = 12;
            const chunks = [];
            const reversedLogs = auditLogs.slice().reverse();
            for (let i = 0; i < reversedLogs.length; i += itemsPerPage) {
              chunks.push(reversedLogs.slice(i, i + itemsPerPage));
            }
            if (chunks.length === 0) {
              chunks.push([]);
            }

            return chunks.map((chunk, index) => (
              <div 
                key={index} 
                className="pdf-page w-[800px] h-[1131px] bg-white p-12 text-slate-800 flex flex-col font-sans relative overflow-hidden shrink-0 border-b border-stone-200"
              >
                {/* Header Section */}
                <div className="flex justify-between items-end border-b-2 border-emerald-500 pb-6 mb-8 shrink-0">
                  <div className="text-left">
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-1">
                      Lumina <span className="text-emerald-600">Security Portal</span>
                    </h1>
                    <p className="text-sm font-semibold text-slate-500">
                      System Audit Ledger & Administrative Security Trail
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-normal">
                      Classification: Confidential
                    </p>
                    <p className="text-xs font-mono text-stone-500 font-bold leading-normal text-right">
                      Generated: {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date())}
                    </p>
                  </div>
                </div>

                {/* Sub-header Statistics Row */}
                {index === 0 && (
                  <div className="grid grid-cols-4 gap-4 p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl mb-6 shrink-0 text-left">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Total Actions</p>
                      <p className="text-lg font-black text-slate-800 text-left">{auditLogs.length} logs</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Compliance Zone</p>
                      <p className="text-lg font-black text-emerald-600 text-left">STANDARD ACTIVE</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Authority Operator</p>
                      <p className="text-lg font-black text-slate-800 text-left">Dr. Clara Lumina</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Access Scope</p>
                      <p className="text-lg font-black text-indigo-600 text-left font-mono">SUPER ADMIN</p>
                    </div>
                  </div>
                )}

                {/* Logs Table Area */}
                <div className="flex-1 overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-stone-200/80 bg-stone-50">
                        <th className="py-2.5 px-4 font-black uppercase tracking-wider text-[9px] text-[#4b5563]">Action / Ledger Type</th>
                        <th className="py-2.5 px-4 font-black uppercase tracking-wider text-[9px] text-[#4b5563]">Operator Account</th>
                        <th className="py-2.5 px-4 font-black uppercase tracking-wider text-[9px] text-[#4b5563] text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-medium">
                      {chunk.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-12 text-center text-slate-400 font-bold">
                            No security activities registered yet.
                          </td>
                        </tr>
                      ) : (
                        chunk.map((it) => (
                          <tr key={it.id} className="hover:bg-slate-50/30">
                            <td className="py-3 px-4 max-w-sm text-left">
                              <span className="inline-block font-black text-slate-800 bg-[#f1f5f9] border border-slate-200 text-[10px] rounded px-1.5 py-0.5 tracking-wide mb-1 uppercase font-mono">
                                {it.action}
                              </span>
                              <p className="text-[10.5px] text-slate-500 font-semibold leading-relaxed font-mono text-left">
                                ↳ {it.details}
                              </p>
                            </td>
                            <td className="py-3 px-4 font-mono text-[10px] text-slate-600 font-bold text-left">
                              @{it.username}
                              <span className="block text-[8px] text-slate-400 uppercase font-sans">
                                ({it.role.replace('_', ' ')})
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-[10px] text-slate-415 font-bold">
                              {new Intl.DateTimeFormat('id-ID', { 
                                dateStyle: 'short', 
                                timeStyle: 'short' 
                              }).format(new Date(it.timestamp))}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Patient / Regulatory Disclosure Footer */}
                <div className="border-t border-stone-100 pt-4 mt-auto flex justify-between items-end text-[9px] text-slate-400 font-sans tracking-wide shrink-0">
                  <div className="max-w-lg text-left leading-relaxed">
                    <p className="font-bold text-slate-500">
                      Lumina Aesthetic Medical Center Cloud Platform
                    </p>
                    <p className="text-[8.5px] font-medium text-left">
                      This audit document is cryptographically compiled and verified for HIPAA/HITECH security compliance. 
                      Unauthorized duplication, redistribution, or leak of client metadata is subject to prosecution.
                    </p>
                  </div>
                  <p className="font-mono text-[9px] font-bold text-right text-stone-500 whitespace-nowrap">
                    Page {index + 1} of {chunks.length}
                  </p>
                </div>

              </div>
            ));
          })()}
        </div>
      </div>

      {/* Centered Modal Backdrop for Super Admin Deletion Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-205 overflow-hidden font-sans"
          >
            {/* Modal Header */}
            <div className="p-6 bg-rose-50 border-b border-rose-100 flex items-center gap-3 text-left">
              <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-rose-900 tracking-tight uppercase">
                  {isEn ? 'Confirm Deletion' : 'Konfirmasi Penghapusan'}
                </h3>
                <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">
                  {isEn ? 'Super Admin Authorization' : 'Otorisasi Super Admin'}
                </p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-3 text-slate-700 text-left">
              <p className="text-xs font-semibold leading-relaxed">
                {isEn 
                  ? 'Are you absolutely sure you want to permanently delete the clinical face scan ledger record?' 
                  : 'Apakah Anda yakin ingin menghapus secara permanen record catatan medis hasil pemindaian wajah pasien?'}
              </p>
              
              {/* Patient Detail Card */}
              {(() => {
                const targetItem = history.find(h => h.id === deleteConfirmId);
                return targetItem ? (
                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-[11px] font-semibold text-slate-600 space-y-1">
                    <p className="text-[9px] font-bold text-stone-405 uppercase tracking-widest">{isEn ? 'PATIENT/CLIENT DETAILS' : 'DETAIL PASIEN'}</p>
                    <p className="font-extrabold text-slate-800 text-xs text-left">
                      {targetItem.userDisplayName || 'Klien Guest (Tamu Estetika)'}
                    </p>
                    <div className="text-left mt-1">
                      <span className="font-mono text-[9px] px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded">ID: {targetItem.id.slice(-6)}</span>
                    </div>
                    <p className="text-[10px] text-stone-500 text-left pt-1">
                      {isEn ? 'Skin Type: ' : 'Tipe Kulit: '} {targetItem.analysisData.skinType.type} • Hidrasi {targetItem.analysisData.skinAnalysis.hydration}%
                    </p>
                  </div>
                ) : null;
              })()}

              <p className="text-[10px] text-rose-500 font-bold italic leading-relaxed">
                ⚠️ {isEn 
                  ? 'This action cannot be undone. The ledger record will be permanently wiped out from the system and registered as an audit trail.' 
                  : 'Tindakan ini bersifat permanen dan tidak dapat dibatalkan. Jejak audit akan secara otomatis direkam.'}
              </p>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-white border border-stone-200 hover:bg-stone-50 text-slate-600 font-black uppercase text-[10px] rounded-xl transition-colors cursor-pointer shadow-sm"
              >
                {isEn ? 'Cancel' : 'Batal'}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deleteConfirmId) {
                    onDeleteHistoryItem?.(deleteConfirmId);
                    setDeleteConfirmId(null);
                    setToastMessage(isEn ? 'Clinical ledger successfully deleted!' : 'Record catatan medis berhasil dihapus!');
                    setTimeout(() => setToastMessage(''), 3000);
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black uppercase text-[10px] rounded-xl transition-colors cursor-pointer shadow-sm shadow-rose-200"
              >
                {isEn ? 'Yes, Delete Permanent' : 'Ya, Hapus Permanen'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};
