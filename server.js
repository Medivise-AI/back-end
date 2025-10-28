import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import doctorRoutes from "./src/routes/doctorRoutes.js";
import patientRoutes from "./src/routes/patientRoutes.js";
import analysisRoutes from "./src/routes/analysisRoutes.js";



dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/analyses", analysisRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
