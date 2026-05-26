import { AnalysisResult } from './types';

// Process image using real Gemini API
export const processImageWithAI = async (imageFile: File | null): Promise<AnalysisResult> => {
  if (!imageFile) {
    throw new Error("No image file provided");
  }

  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await fetch("/api/analyze", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to analyze image: ${response.statusText}`);
  }

  const data = await response.json();
  return data as AnalysisResult;
};
