import express from 'express';
import { addPatient, getPatients } from '../controllers/patientController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, addPatient);
router.get('/', authMiddleware, getPatients);

export default router;