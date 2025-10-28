import express from "express";
import multer from "multer";
import {
  addAnalysis,
  getAnalyses,
  getAllAnalyses,
  deleteAnalysis,
} from "../controllers/analysisController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// إعداد multer لتخزين الملفات
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // مجلد التخزين
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

router.post("/:patientId", authMiddleware, upload.single("file"), addAnalysis);
router.get("/:patientId", authMiddleware, getAnalyses);
router.get("/", authMiddleware, getAllAnalyses);
router.delete("/:id", authMiddleware, deleteAnalysis);
export default router;
