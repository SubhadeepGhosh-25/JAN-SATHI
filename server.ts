import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiInstance: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required in secrets");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function callGeminiWithRetryAndFallback<T>(
  apiCall: (modelName: string) => Promise<T>,
  primaryModel: string = "gemini-3.5-flash",
  fallbackModel: string = "gemini-flash-latest"
): Promise<T> {
  const modelsToTry = [primaryModel, fallbackModel, "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    let delay = 1000; // Start with 1 second delay
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`[Gemini API] Attempting call with model "${model}" (attempt ${attempt}/${maxAttempts})...`);
        return await apiCall(model);
      } catch (err: any) {
        lastError = err;
        const errStr = String(err.message || err).toLowerCase();
        
        const isTransientError =
          errStr.includes("429") ||
          errStr.includes("quota") ||
          errStr.includes("rate limit") ||
          errStr.includes("resource_exhausted") ||
          errStr.includes("503") ||
          errStr.includes("unavailable") ||
          errStr.includes("high demand") ||
          errStr.includes("too many requests") ||
          err.status === "RESOURCE_EXHAUSTED" ||
          err.status === "UNAVAILABLE" ||
          err.status === 429 ||
          err.status === 503 ||
          err.code === 429 ||
          err.code === 503;

        if (isTransientError) {
          console.warn(
            `[Gemini API] Transient error (429/503) for model "${model}" on attempt ${attempt}/${maxAttempts}: ${err.message || err}. Retrying in ${delay}ms...`
          );
          const jitter = Math.random() * 300;
          await sleep(delay + jitter);
          delay *= 1.5; // Backoff
        } else {
          // Non-transient error (e.g. invalid request parameters) - stop retrying this model
          console.error(`[Gemini API] Non-transient error for model "${model}":`, err);
          break;
        }
      }
    }
    console.warn(`[Gemini API] Model "${model}" failed all attempts. Trying next model...`);
  }

  const errorDetail = lastError?.message || String(lastError);
  throw new Error(`Gemini API services are temporarily busy or limited. Please try again. Detailed error: ${errorDetail}`);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ extended: true, limit: "20mb" }));

  // API Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // POST /api/chat - Gemini Chat Assistant
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const ai = getGenAI();

      const systemInstruction = `You are "JanSathi AI", a compassionate, highly knowledgeable, and friendly government scheme discovery assistant for Indian citizens.
Your goals:
1. Explain eligibility criteria, benefits, and timelines of government schemes in simple, clear, and encouraging language.
2. List exact documents required and outline clear step-by-step application procedures.
3. Be highly supportive and write in simple English, or regional languages (Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, etc.) if the user asks.
4. CRITICAL: Always end your response with a clear, polite disclaimer in bold: "Disclaimer: Please verify details and eligibility criteria with official government sources before making application decisions."
5. Do not provide binding legal or medical advice.
6. Use bullet points, bold keywords, and clean headings to structure your answers for maximum readability.`;

      const responseText = await callGeminiWithRetryAndFallback(async (modelName) => {
        const chat = ai.chats.create({
          model: modelName,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
          history: history || [],
        });
        const response = await chat.sendMessage({ message });
        return response.text;
      });

      res.json({ text: responseText });
    } catch (err: any) {
      console.error("Chat API Error:", err);
      res.status(500).json({ error: err.message || "AI processing failed" });
    }
  });

  // POST /api/ocr - Document OCR via Multimodal Gemini
  app.post("/api/ocr", async (req, res) => {
    try {
      const { base64Data, mimeType, docType } = req.body;
      if (!base64Data || !mimeType) {
        return res.status(400).json({ error: "base64Data and mimeType are required" });
      }

      const ai = getGenAI();

      const imagePart = {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      };

      const prompt = `Perform OCR extraction on this Indian document (${docType || "Aadhaar / PAN / Certificate"}).
Carefully extract:
1. Document Type (e.g., Aadhaar Card, PAN Card, Income Certificate, Caste Certificate)
2. Document ID Number
3. Name of Holder
4. Date of Birth or birth year
5. Gender
6. State of residence (if available)
7. Any specific fields (e.g. Annual Income amount in rupees for Income Certificate, Caste name/category for Caste Certificate, etc.)

Return a clean, valid structured JSON object. Extract the details accurately.`;

      const responseText = await callGeminiWithRetryAndFallback(async (modelName) => {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [imagePart, prompt],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                documentType: { type: Type.STRING, description: "Type of the document, e.g., Aadhaar Card" },
                documentId: { type: Type.STRING, description: "Document ID or card number" },
                holderName: { type: Type.STRING, description: "Name of the certificate/card holder" },
                dob: { type: Type.STRING, description: "Date of Birth or Birth Year" },
                gender: { type: Type.STRING, description: "Gender of the holder" },
                state: { type: Type.STRING, description: "State / Address if present" },
                additionalInfo: { type: Type.STRING, description: "Special detail like Income amount (e.g. 1,50,000 INR), Caste Category (e.g. OBC), or other metadata" }
              },
              required: ["documentType", "documentId", "holderName"]
            },
          },
        });
        return response.text;
      });

      res.json(JSON.parse(responseText || "{}"));
    } catch (err: any) {
      console.error("OCR API Error:", err);
      res.status(500).json({ error: err.message || "Document analysis failed" });
    }
  });

  // Serve static files / Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
