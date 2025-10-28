import pool from '../config/db.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


export const registerDoctor = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        const result = await pool.query(
            'INSERT INTO doctors (name, email, password) VALUES ($1, $2, $3) RETURNING *',
            [name, email, hashedPassword]
        );
        res.status(201).json({ doctor: result.rows[0] });
    } catch (err) {
        res.status(400).json({ error: err.message });
        
    }
};

export const loginDoctor = async (req, res) => {
    const { email, password } = req.body;
    try {
    
            const result = await pool.query("SELECT * FROM doctors WHERE email = $1", [email]);

        if (result.rows.length === 0) return res.status(404).json({ error: "Doctor not found" });

        const doctor = result.rows[0];
        const isMatch = await bcrypt.compare(password, doctor.password);

        if (!isMatch) return res.status(400).json({ error: "Invalid Password" });

        const token = jwt.sign({ id: doctor.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, doctor: { id: doctor.id, name: doctor.name, email: doctor.email } });
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
  
    
};





export const getDoctors = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, email FROM doctors'
        );
        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });

    }
};

export const getDoctorById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("SELECT id, name, email FROM doctors WHERE id = $1"
            , [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Doctor not found"})
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};