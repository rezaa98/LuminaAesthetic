import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Gemini Client
  const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Helper for resilient API calls
  async function generateContentWithRetry(params: any, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await ai.models.generateContent(params);
      } catch (error: any) {
        const isTransient = error.status === 503 || error.message?.includes('503') || error.message?.includes('UNAVAILABLE') || error.message?.includes('high demand') || error.status === 429;
        if (isTransient && attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000;
          console.warn(`Model API transient error (attempt ${attempt}/${retries}). Retrying in ${delay / 1000}s...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }
  }

  app.use(express.json({ limit: "50mb" }));

  // API routes FIRST
  app.post("/api/analyze", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const base64Data = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype;

      const response = await generateContentWithRetry({
        model: "gemini-2.5-flash",
        contents: [
          {
            text: "Analyze the skin condition and facial features of the person in this image. Provide a JSON response with:\n- skinAnalysis: hydration percentage (numeric 30 to 90), rednessLevels (Tinggi, Sedang, Rendah), notes about their condition focusing on hydration and redness\n- skinType: type (Oily, Dry, Normal, or Combination), description based on facial mapping\n- faceFeatures: shape (e.g., Oval, Round, Square), eyes (e.g., Almond, Monolid), jawline (e.g., Sharp, Soft curve)\n- spectacles: recommendedFrames (array of strings, e.g. Cat-Eye, Round)\n- hairstyles: recommendedStyles (array of strings)\nFollow the response schema exactly."
          },
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              skinAnalysis: {
                type: Type.OBJECT,
                properties: {
                  hydration: { type: Type.INTEGER },
                  rednessLevels: { type: Type.STRING },
                  notes: { type: Type.STRING }
                },
                required: ["hydration", "rednessLevels", "notes"]
              },
              skinType: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["type", "description"]
              },
              faceFeatures: {
                type: Type.OBJECT,
                properties: {
                  shape: { type: Type.STRING },
                  eyes: { type: Type.STRING },
                  jawline: { type: Type.STRING }
                },
                required: ["shape", "eyes", "jawline"]
              },
              spectacles: {
                type: Type.OBJECT,
                properties: {
                  recommendedFrames: { 
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["recommendedFrames"]
              },
              hairstyles: {
                type: Type.OBJECT,
                properties: {
                  recommendedStyles: { 
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["recommendedStyles"]
              }
            },
            required: ["skinAnalysis", "skinType", "faceFeatures", "spectacles", "hairstyles"]
          }
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("No response string from model");
      }
      
      const parsedData = JSON.parse(text);
      res.json(parsedData);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message || "Failed to analyze image" });
    }
  });

  app.post("/api/analyze-features", express.json({ limit: "50mb" }), async (req, res) => {
    try {
      const { imageBase64 } = req.body;
      if (!imageBase64) {
         return res.status(400).json({ error: "No image provided" });
      }

      // Remove the prefix (e.g. data:image/jpeg;base64,)
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

      const response = await generateContentWithRetry({
        model: "gemini-2.5-flash",
        contents: [
          {
            text: "Analyze the facial features of the person in this image in extreme detail. Do not use generic labels like 'Normal' or 'Average'. Be very specific.\nDetect the following features: face shape, eyes, eyebrows, nose, cheeks, and lips.\nFor each feature, provide a brief, descriptive label (e.g., 'Soft Oval', 'Almond Eyes', 'Arched Eyebrows') and 2-3 short bullet points explaining the specific, observable characteristics of that feature in the image.\nAlso, calculate an overall 'Symmetry Score' (0-100) and provide a short 'symmetryDescription'.\nFollow the JSON schema exactly."
          },
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              symmetryScore: { type: Type.NUMBER, description: "Overall symmetry score from 0 to 100" },
              symmetryDescription: { type: Type.STRING, description: "Brief description of facial symmetry" },
              features: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: "One of: shape, eyes, eyebrows, nose, cheeks, lips" },
                    name: { type: Type.STRING, description: "Capitalized feature name, e.g., Face Shape, Eyes" },
                    label: { type: Type.STRING, description: "Descriptive label, e.g. Soft Oval, Almond Eyes" },
                    points: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    }
                  },
                  required: ["id", "name", "label", "points"]
                }
              }
            },
            required: ["features"]
          }
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("No response string from model");
      }
      
      const parsedData = JSON.parse(text);
      res.json(parsedData);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message || "Failed to analyze features" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
