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

  // Helper for resilient API calls with model fallback and retries
  async function generateContentWithFallback(preferredModel: string, params: any) {
    const models = [
      preferredModel,
      "gemini-3.5-flash",
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
      "gemini-1.5-pro",
      "gemini-1.5-flash"
    ];
    
    const uniqueModels = Array.from(new Set(models.filter(Boolean)));
    let lastError = null;

    for (const modelToTry of uniqueModels) {
      const maxAttempts = 3;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          console.info(`Attempting generation with model: ${modelToTry} (Attempt ${attempt}/${maxAttempts})`);
          return await ai.models.generateContent({
            ...params,
            model: modelToTry
          });
        } catch (error: any) {
          lastError = error;
          const status = error?.status;
          const isTransient = status === 503 || error.message?.includes('503') || error.message?.includes('UNAVAILABLE') || error.message?.includes('high demand');
          const isRateLimit = status === 429 || error.message?.includes('429');
          const isQuotaExceeded = error.message?.includes('Quota exceeded');
          const isNotFound = status === 404 || error.message?.includes('not found') || error.message?.includes('not supported') || error.message?.includes('invalid model');

          if ((isTransient || isRateLimit) && !isQuotaExceeded) {
            const delay = Math.pow(2, attempt) * 1000;
            console.warn(`Model ${modelToTry} busy/rate-limited (${status}). Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue; // retry same model
          } else if (isQuotaExceeded || isNotFound) {
            console.warn(`Model ${modelToTry} unusable (${isQuotaExceeded ? 'Quota Exceeded' : 'Not Found'}). Falling back to next model...`);
            break; // move to next model
          } else {
            console.error(`Model ${modelToTry} encountered fatal error:`, error);
            break; // move to next model on other errors too just in case
          }
        }
      }
    }

    throw lastError || new Error("All fallback models failed.");
  }

  app.use(express.json({ limit: "50mb" }));

  // API routes FIRST
  app.post("/api/check-glasses", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const base64Data = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype;
      const preferredModel = req.body.preferredModel || "gemini-3.5-flash";

      const response = await generateContentWithFallback(preferredModel, {
        contents: [
          {
            text: `Analyze this face image. Is the person wearing ANY type of glasses, spectacles, eyewear, or sunglasses on their face right now? Respond only with a highly accurate boolean value. True if wearing glasses, false if not. Note: Do not confuse hair, shadows, or facial features with glasses.`
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
              hasGlasses: { type: Type.BOOLEAN, description: "True if the person is wearing glasses/eyewear, false otherwise." }
            },
            required: ["hasGlasses"]
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
      console.error("Error from /api/check-glasses", e);
      res.status(500).json({ error: e.message || "Failed to check glasses" });
    }
  });

  app.post("/api/analyze", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const language = req.body.language || 'id';
      const langStr = language === 'en' ? 'in English' : 'in Indonesian';
      const preferredModel = req.body.preferredModel || 'gemini-3.5-flash';

      const base64Data = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype;

      const response = await generateContentWithFallback(preferredModel, {
        contents: [
          {
            text: `Analyze the skin condition, gender appearance/presentation, and facial features of the person in this image. Provide a JSON response ${langStr} with:\n- skinAnalysis: hydration percentage (numeric 30 to 90), rednessLevels (Tinggi, Sedang, Rendah for ID or High, Medium, Low for EN), notes about their condition focusing on hydration and redness\n- skinType: type (Oily, Dry, Normal, or Combination), description based on facial mapping\n- facialMapping: Array of 3 zones (T-Zone, U-Zone, Chin). For each, provide \`zone\` (string, e.g. 'T-Zone'), \`condition\` (string), \`status\` (string, e.g. 'INFO', 'RAWAT', 'STABIL' for ID or 'INFO', 'TREAT', 'STABLE' for EN), \`description\` (string, reasoning based on visual analysis), \`recommendations\` (Array of short strings, actionable advice), and \`colorHint\` (must be strictly one of: 'pink', 'blue', 'emerald').\n- faceFeatures: shape (e.g., Oval, Round, Square), eyes (e.g., Almond, Monolid), jawline (e.g., Sharp, Soft curve), summary (a brief insightful styling summary ${langStr} about their face shape and flexible styles)\n- spectacles: recommendedFrames (array of strings, e.g. Cat-Eye, Round)\n- hairstyles: recommendedStyles (array of strings)\n- colorAnalysis: dominantColors (array of string for 3 best clothing colors), summary (${langStr} about which colors best suit them), detailedAnalysis (an array of objects containing colorName, colorHex (like #FF0000), compatibility ('High', 'Medium', 'Low' or ID equivalent), score (1-100), description (${langStr} explanation why this color suits them)), and accessories (an array of exactly 4 objects containing \`name\` (string, accessory name in ${langStr}), \`desc\` (string, explanation in ${langStr} matching their style, gender presentation, or season), and \`emoji\` (string, single appropriate accessory emoji like '🕶️', '⌚', '💍', '🧣', '👜', '🧢', '✨')). Ensure to tailor these 4 accessory options beautifully to the detected gender, presentation, or preferences (e.g., if presenting female, suggest chic earrings, headcovers/hijab options, delicate bags, ribbons, or scarves; if presenting male, suggest masculine metal watches, solid frames, baseball caps, ties, or silver rings; if gender-neutral or modern, provide an elegant mix of unisex premium styling accessories).\n- personalizedCarePlan: an array of objects containing a short action-oriented \`title\` and a 1-sentence \`description\` suggesting a tailored step or habit to improve aesthetic goals based on the analysis.\nFollow the response schema exactly.`
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
              facialMapping: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    zone: { type: Type.STRING },
                    condition: { type: Type.STRING },
                    status: { type: Type.STRING },
                    description: { type: Type.STRING },
                    recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
                    colorHint: { type: Type.STRING, enum: ['pink', 'blue', 'emerald'] }
                  },
                  required: ["zone", "condition", "status", "description", "recommendations", "colorHint"]
                }
              },
              faceFeatures: {
                type: Type.OBJECT,
                properties: {
                  shape: { type: Type.STRING },
                  eyes: { type: Type.STRING },
                  jawline: { type: Type.STRING },
                  summary: { type: Type.STRING }
                },
                required: ["shape", "eyes", "jawline", "summary"]
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
              },
              colorAnalysis: {
                type: Type.OBJECT,
                properties: {
                  dominantColors: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  summary: { type: Type.STRING },
                  detailedAnalysis: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        colorName: { type: Type.STRING },
                        colorHex: { type: Type.STRING },
                        compatibility: { type: Type.STRING },
                        score: { type: Type.INTEGER },
                        description: { type: Type.STRING }
                      },
                      required: ["colorName", "colorHex", "compatibility", "score", "description"]
                    }
                  },
                  accessories: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        desc: { type: Type.STRING },
                        emoji: { type: Type.STRING }
                      },
                      required: ["name", "desc", "emoji"]
                    }
                  }
                },
                required: ["dominantColors", "summary", "detailedAnalysis", "accessories"]
              },
              personalizedCarePlan: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING }
                  },
                  required: ["title", "description"]
                }
              }
            },
            required: ["skinAnalysis", "skinType", "facialMapping", "faceFeatures", "spectacles", "hairstyles", "colorAnalysis", "personalizedCarePlan"]
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

  app.post("/api/analyze-features", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const language = req.body.language || 'id';
      const preferredModel = req.body.preferredModel || 'gemini-3.5-flash';
      const langStr = language === 'en' ? 'in English' : 'in Indonesian';

      const base64Data = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype;

      const response = await generateContentWithFallback(preferredModel, {
        contents: [
          {
            text: `Analyze the facial features of the person in this image in extreme detail. Do not use generic labels like 'Normal' or 'Average'. Be very specific.\nDetect the following features: face shape, eyes, eyebrows, nose, cheeks, and lips.\nFor each feature, provide a brief, descriptive label ${langStr} (e.g., 'Soft Oval', 'Almond Eyes', 'Arched Eyebrows') and 2-3 short bullet points ${langStr} explaining the specific, observable characteristics of that feature in the image.\nAlso, calculate an overall 'Symmetry Score' (0-100) and provide a short 'symmetryDescription' ${langStr}.\nAlso provide a 'faceBox' specifying a bounding box to tightly crop the face. For each feature, provide a 'coordinate' (x, y coordinate mapping the center), and an 'areaPolygon' (array of 4 to 8 {x, y} coordinate objects) that traces the outer boundary of the feature on the image. CRITICAL: All spatial coordinates (x,y, width, height) MUST be returned on a 0 to 1000 spatial scaled grid (where 1000 is the full image width/height).\nFollow the JSON schema exactly.`
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
              faceBox: {
                type: Type.OBJECT,
                description: "Bounding box of the detected face, used to zoom in on the face image",
                properties: {
                  top: { type: Type.NUMBER, description: "Top offset percentage (0-100)" },
                  left: { type: Type.NUMBER, description: "Left offset percentage (0-100)" },
                  width: { type: Type.NUMBER, description: "Width percentage (0-100)" },
                  height: { type: Type.NUMBER, description: "Height percentage (0-100)" }
                },
                required: ["top", "left", "width", "height"]
              },
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
                    },
                    coordinate: {
                      type: Type.OBJECT,
                      description: "The centered coordinate of this feature in percentages (0-100)",
                      properties: {
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER }
                      },
                      required: ["x", "y"]
                    },
                    areaPolygon: {
                      type: Type.ARRAY,
                      description: "Array of coordinates forming the boundary polygon of this feature",
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          x: { type: Type.NUMBER },
                          y: { type: Type.NUMBER }
                        },
                        required: ["x", "y"]
                      }
                    }
                  },
                  required: ["id", "name", "label", "points", "coordinate", "areaPolygon"]
                }
              }
            },
            required: ["faceBox", "symmetryScore", "symmetryDescription", "features"]
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
