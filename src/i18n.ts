export type Language = 'id' | 'en';

export const translations = {
  id: {
    // App.tsx
    headerTitle: "Lumina",
    headerSubtitle: "Aesthetic",
    navAnalysis: "Analisis",
    navAppointments: "Janji Temu",
    navHistory: "Riwayat",
    
    // UploadView.tsx
    uploadTitle: "Aesthetic AI Scanner",
    uploadSubtitle: "Unggah foto wajah Anda yang menghadap ke depan dengan pencahayaan alami untuk mendapatkan analisis kulit komprehensif, diagnosis fitur wajah, dan rekomendasi perawatan yang dipersonalisasi.",
    dragDropText: "Seret & lepas foto Anda di sini",
    orText: "atau",
    browseText: "Pilih file",
    requirementsTarget: "Foto jelas",
    requirementsTarget2: "Tidak buram",
    errorMessage: "Format tidak didukung. Harap unggah PNG atau JPG.",

    // DashboardView.tsx
    downloadReport: "Unduh Laporan",
    generating: "Membuat...",
    skinDiagnosis: "Diagnosis Kulit",
    skinType: "Tipe Kulit",
    hydrationLevel: "Tingkat Hidrasi",
    faceGeometry: "Geometri Wajah",
    faceShape: "Bentuk Wajah",
    jawline: "Rahang",
    eyes: "Mata",
    seeDetailedMapping: "Lihat Analisis Detail",
    recommendations: "Rekomendasi",
    hairstyles: "Gaya Rambut",
    hairstyleRecs: "Rekom. Rambut",
    glassesFrame: "Bentuk Wajah & Visual",
    colorAnalysis: "Analisis Warna",
    facialZones: "Zona Wajah & Saran",
    carePlan: "Rencana Perawatan Personal",
    treatmentInfo: "INFO",
    treatmentTreat: "RAWAT",
    treatmentStable: "STABIL",
    carePlanAction: "Saran Perawatan",
    
    // FaceFeatureModal.tsx
    detailedAnalysis: "Analisis Geometri Detail",
    fetchingData: "Sedang mengambil data diagnosis mendalam...",
    virtualTryOn: "Coba Virtual",
    mathGlassesFit: "Kecocokan Geometri Kacamata",
    optimalHairGeo: "Geometri Rambut Optimal",
    detectedShape: "Bentuk Terdeteksi",
    faceShapeGuide: "Panduan Bentuk Wajah",
    faceShapeGuideSub: "Berdasarkan analisis geometri AI Anda",

    // HistoryView.tsx
    historyTitle: "Riwayat Anda",
    backToScanner: "Kembali ke Scanner",
    noHistoryTitle: "Belum ada riwayat",
    noHistoryDesc: "Unggah foto pertama Anda untuk melihat riwayat analisis di sini.",
    scanResult: "Hasil Pindai",
  },
  en: {
    // App.tsx
    headerTitle: "Lumina",
    headerSubtitle: "Aesthetic",
    navAnalysis: "Analysis",
    navAppointments: "Appointments",
    navHistory: "History",
    
    // UploadView.tsx
    uploadTitle: "Aesthetic AI Scanner",
    uploadSubtitle: "Upload a front-facing photo with natural lighting to get comprehensive skin analysis, facial feature diagnosis, and personalized care recommendations.",
    dragDropText: "Drag & drop your photo here",
    orText: "or",
    browseText: "Browse files",
    requirementsTarget: "Clear photo",
    requirementsTarget2: "Not blurry",
    errorMessage: "Format not supported. Please upload PNG or JPG.",

    // DashboardView.tsx
    downloadReport: "Download Report",
    generating: "Generating...",
    skinDiagnosis: "Skin Diagnosis",
    skinType: "Skin Type",
    hydrationLevel: "Hydration Level",
    faceGeometry: "Face Geometry",
    faceShape: "Face Shape",
    jawline: "Jawline",
    eyes: "Eyes",
    seeDetailedMapping: "View Detailed Mapping",
    recommendations: "Recommendations",
    hairstyles: "Hairstyles",
    hairstyleRecs: "Hairstyle Recs",
    glassesFrame: "Face Shape & Style",
    colorAnalysis: "Color Analysis",
    facialZones: "Facial Zones & Advice",
    carePlan: "Personalized Care Plan",
    treatmentInfo: "INFO",
    treatmentTreat: "TREAT",
    treatmentStable: "STABLE",
    carePlanAction: "Care Suggestion",

    // FaceFeatureModal.tsx
    detailedAnalysis: "Detailed Geometry Analysis",
    fetchingData: "Fetching deep diagnostic data...",
    virtualTryOn: "Virtual Try-On",
    mathGlassesFit: "Mathematical Glasses Fit",
    optimalHairGeo: "Optimal Hair Geometry",
    detectedShape: "Detected Shape",
    faceShapeGuide: "Face Shape Guide",
    faceShapeGuideSub: "Based on your AI geometry analysis",

    // HistoryView.tsx
    historyTitle: "Your History",
    backToScanner: "Back to Scanner",
    noHistoryTitle: "No history yet",
    noHistoryDesc: "Upload your first photo to see analysis history here.",
    scanResult: "Scan Result",
  }
};
