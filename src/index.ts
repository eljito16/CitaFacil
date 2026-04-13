import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./config/database";
import authRoutes from "./routes/authRoutes";
import businessRoutes from "./routes/businessRoutes";
import serviceRoutes from "./routes/serviceRoutes";
import appointmentRoutes from "./routes/appointmentRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/businesses", businessRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/appointments", appointmentRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ message: "CitaPro API funcionando correctamente " });
});

// Servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});

export default app;