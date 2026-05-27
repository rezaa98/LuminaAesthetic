import { AnalysisResult } from './types';

// Process image using real Gemini API
export const processImageWithAI = async (imageFile: File | null, language: string = 'id'): Promise<AnalysisResult> => {
  if (!imageFile) {
    throw new Error("No image file provided");
  }

  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("language", language);

  const response = await fetch("/api/analyze", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Non-JSON Error Response received:", text);
      throw new Error("Server returned non-JSON error response. Please check if your GEMINI_API_KEY is configured.");
    }
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to analyze image: ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text();
    console.error("Non-JSON Success Response received:", text);
    throw new Error("Server returned non-JSON response in success path. Please try again.");
  }

  const data = await response.json();
  return data as AnalysisResult;
};
