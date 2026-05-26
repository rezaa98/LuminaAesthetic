export type AppState = 'upload' | 'analyzing' | 'results' | 'history';

export interface HistoryItem {
  id: string;
  timestamp: Date;
  imageUrl: string | null;
  analysisData: AnalysisResult;
}

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
