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

export async function analyzePDF(filePath) {
  try {

    const dataBuffer = fs.readFileSync(filePath);


    const pdfData = await pdf(dataBuffer);

    const textData = pdfData.text || "";
    if (!textData.trim()) {
      console.warn("PDF contained no text.");
      return "No text extracted from PDF";
    }
    console.log("PDF extracted successfully, sending to Gemini...");

  
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Summarize the key medical results and findings of this analysis in 3-4 sentences:\n${textData}`,
            },
          ],
        },
      ],
    });

    console.log("Gemini response:", response);

    const summary =
      response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No summary returned";
    return summary;
  } catch (error) {
    console.error("Error analyzing PDF:", error);
    return "AI analysis failed or unavailable";
  }
}
