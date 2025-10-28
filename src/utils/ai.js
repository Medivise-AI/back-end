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

export async function analyzePDF(filePath, patientHistory) {
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
              text: `
You are a medical analysis assistant.
Consider the patient's medical history below when interpreting the lab results.

Patient history:
${patientHistory}

Lab results:
${textData}

Summarize the key findings in 3-4 sentences, highlighting any abnormalities or results that may relate to the patient's medical history.
If possible, suggest potential next medical steps or tests.
`,
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
