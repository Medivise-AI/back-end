import { error } from 'console';
import pool from '../config/db.js';
import bcrypt from "bcrypt";


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
        const result = pool.query(
            'SELECT * FROM doctors WHERE email=$1', [email]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: "Doctor not found" });

        const doctor = result.rows[0];
        const isMatch = await bcrypt.compare(password, doctor.password);

        if (!isMatch) return res.status(400).json({ error: "Invalid Password" });

        const token = jwt.sign({ id: doctor.id }, process.env.JWT_SECRET, { expiresIn: 'id' });
        res.json({ token, doctor: { id: doctor.id, name: doctor.name, email: doctor.email } });
    } catch (err) {
        res.status(500).json({error: err.message})
    }
  
    
}