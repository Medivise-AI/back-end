import express from "express";
import {
  registerDoctor,
  loginDoctor,
  getDoctors,
  getDoctorById
} from "../controllers/doctorController.js";

const router = express.Router();

router.post("/register", registerDoctor);
router.post('/login', loginDoctor);
router.get("/", getDoctors);
router.get("/:id", getDoctorById);

export default router;