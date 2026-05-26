import { AnalysisResult } from './types';

// Mock function to simulate AI processing logic.
// In a real application, this would send the image to a backend service.
export const processImageWithAI = async (imageFile: File | null): Promise<AnalysisResult> => {
  return new Promise((resolve) => {
    // Simulasi delay proses AI (2.5 detik)
    setTimeout(() => {
      // Mengembalikan data mock / hardcoded
      resolve({
        skinAnalysis: {
          hydration: 40,
          rednessLevels: "Sedang",
          notes: "Tingkat hidrasi 40%, ada indikasi kemerahan di area T-Zone. Disarankan memperbanyak asupan air dan menggunakan moisturizer berbahan dasar ceramide."
        },
        skinType: {
          type: "Oily",
          description: "Cenderung berminyak di area dahi, hidung, dan dagu."
        },
        faceFeatures: {
          shape: "Oval",
          eyes: "Almond",
          jawline: "Lembut melengkung"
        },
        spectacles: {
          recommendedFrames: ["Cat-Eye", "Round (Bulat)"]
        },
        hairstyles: {
          recommendedStyles: ["Layered Bob", "Curtain Bangs dengan rambut panjang"]
        }
      });
    }, 2500);
  });
};
