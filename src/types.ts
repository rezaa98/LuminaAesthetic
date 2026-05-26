export type AppState = 'upload' | 'analyzing' | 'results';

export interface AnalysisResult {
  skinAnalysis: {
    hydration: number;
    rednessLevels: string;
    notes: string;
  };
  skinType: {
    type: string;
    description: string;
  };
  faceFeatures: {
    shape: string;
    eyes: string;
    jawline: string;
  };
  spectacles: {
    recommendedFrames: string[];
  };
  hairstyles: {
    recommendedStyles: string[];
  };
}
