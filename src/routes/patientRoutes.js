import express from 'express';
import {
  addPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} from "../controllers/patientController.js";
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, addPatient);
router.get('/', authMiddleware, getPatients);
router.get("/:id", authMiddleware, getPatientById);
router.patch("/:id", authMiddleware, updatePatient);
router.delete("/:id", authMiddleware, deletePatient);

export default router;