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
    texture?: number;
    pores?: number;
  };
  skinType: {
    type: string;
    description: string;
  };
  facialMapping: {
    zone: string;
    condition: string;
    status: string;
    description: string;
    recommendations: string[];
    colorHint: 'pink' | 'blue' | 'emerald';
  }[];
  faceFeatures: {
    shape: string;
    eyes: string;
    jawline: string;
    summary: string;
  };
  spectacles: {
    recommendedFrames: string[];
  };
  hairstyles: {
    recommendedStyles: string[];
  };
  colorAnalysis: {
    dominantColors: string[];
    summary: string;
    detailedAnalysis: {
      colorName: string;
      colorHex: string;
      compatibility: string;
      score: number;
      description: string;
    }[];
    accessories?: {
      name: string;
      desc: string;
      emoji?: string;
    }[];
  };
  personalizedCarePlan: {
    title: string;
    description: string;
  }[];
}
