import pool from '../config/db.js';
import { analyzePDF, extractPDFText } from "../utils/ai.js"; 
import fs from 'fs';



export const addAnalysis = async (req, res) => {
  try {
    const { type, notes } = req.body;
    const patient_id = req.params.patientId;

    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const file_path = req.file.path;

    let ai_summary = "";
    let text_data = "";
    let patient_history = "";

    try {
      try {
      patient_history = await pool.query(
        "SELECT medical_history FROM patients WHERE id=$1",
        [patient_id]
      );
      patient_history = patient_history.rows[0]?.medical_history || "";
    } catch (historyErr) {
      console.error("Failed to fetch patient history:", historyErr);
    }

      text_data = await extractPDFText(file_path);

      ai_summary = await analyzePDF(file_path, patient_history);
    } catch (aiErr) {
      console.error("AI analysis failed:", aiErr);
      ai_summary = "AI analysis failed or unavailable";
    }

    const result = await pool.query(
      `INSERT INTO analyses (patient_id, type, file_path, text_data, ai_summary, notes, date)
       VALUES ($1,$2,$3,$4,$5,$6,CURRENT_DATE) RETURNING *`,
      [patient_id, type, file_path, text_data, ai_summary, notes]
    );

    res.json({
      message: "Analysis uploaded successfully",
      analysis: result.rows[0],
    });
  } catch (err) {
    console.error("Error in addAnalysis:", err);
    res.status(500).json({ error: err.message });
  }
};




export const getAnalyses = async (req, res) => {
  const patient_id = req.params.patientId;

  try {
    const result = await pool.query(
      "SELECT * FROM analyses WHERE patient_id=$1",
      [patient_id]
    );
    res.json({ analyses: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteAnalysis = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM analyses WHERE id=$1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Analysis not found" });
    }
    // Optionally, delete the associated file from storage
    const filePath = result.rows[0].file_path;
    fs.unlink(filePath, (err) => {
      if (err) console.error("Failed to delete file:", err);
    });
    res.json({ message: "Analysis deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllAnalyses = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM analyses"
    );
    res.json({ analyses: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
