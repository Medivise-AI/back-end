import pool from '../config/db.js';

export const addPatient = async (req, res) => {
    const { name, dob, gender, contact, medical_history } = req.body;
    const doctor_id = req.doctor.id;
    try {
        const result = await pool.query(
            "INSERT INTO patients (doctor_id, name, dob, gender, contact, medical_history) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
            [doctor_id, name, dob, gender, contact, medical_history]
        );
        res.status(201).json({ patient: result.rows[0] });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getPatients = async (req, res) => {
    const doctor_id = req.doctor.id;
    try {
        const result = await pool.query(
            "SELECT * FROM patients WHERE doctor_id=$1",
            [doctor_id]
        );
        res.json({ patients: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    
};

export const getPatientById = async (req, res) => {
    const doctor_id = req.doctor.id;
    const { id } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM patients WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) return res.status(404).json({ error: "Patient not found" })
        
        res.json( result.rows[0] );
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Internal server error"})
    }
}