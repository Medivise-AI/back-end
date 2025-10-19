import pool from '../config/db.js';
import fs from 'fs';


// هنا ممكن تضيف أي AI integration لاحقًا
// حالياً نكتفي بحفظ الملف ومساره في قاعدة البيانات


export const addAnalysis = async (req, res) => {
    const { type, notes } = req.body;
    const patient_id = req.params.patient_id;
    const doctor_id = req.doctor.id;

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const file_path = req.file.path;

    try {
        const result = await pool.query(
            `INSERT INTO analyses (patient_id, type, file_path, notes)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [patient_id, type, file_path, notes]
        );
        res.status(201).json({ analysis: result.rows[0] });

    } catch (err) {
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