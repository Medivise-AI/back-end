import fs from "fs";
import pdf from "pdf-extraction";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

console.log(
  "🔑 GEMINI_API_KEY:",
  process.env.GEMINI_API_KEY ? "Loaded" : "Missing"
);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function extractPDFText(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const pdfData = await pdf(dataBuffer);
  return pdfData.text || "";
}

// دالة retry مع عدد محاولات افتراضي 3
export async function analyzePDF(filePath, patientHistory, retries = 3) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdf(dataBuffer);
    const textData = pdfData.text || "";

    if (!textData.trim()) {
      console.warn("PDF contained no text.");
      throw new Error("No text extracted from PDF");
    }

    console.log("PDF extracted successfully, sending to Gemini...");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
You are a medical analysis assistant.

Please consider the patient's medical history below when interpreting the lab results.

Patient History:
${patientHistory}

Lab Results:
${textData}

Instructions:
- Summarize the key findings in 1-2 sentences.
- Highlight any abnormalities or results that may relate to the patient's medical history.
- If relevant, suggest potential next medical steps or additional tests.
- Present the summary in a clear, organized format using bullet points if possible.
- dont say "Here's a summary of the patient's lab results" or similar phrases.
- summary should be short and concise.
`,
            },
          ],
        },
      ],
    });

    const summary = response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!summary || summary === "No summary returned") {
      throw new Error("AI analysis failed or unavailable");
    }

    return summary; // فقط النتائج الصحيحة ترجع
  } catch (error) {
    // لو الخطأ 503 والنموذج مشغول، نعيد المحاولة
    if (error?.status === 503 && retries > 0) {
      console.log("AI model overloaded, retrying...");
      await new Promise((res) => setTimeout(res, 2000)); // انتظار ثانيتين قبل المحاولة
      return analyzePDF(filePath, patientHistory, retries - 1);
    }

    console.error("Error analyzing PDF:", error);
    throw error; // يرسل الخطأ للـ frontend بدون تخزين أي نص فاشل
  }
}
