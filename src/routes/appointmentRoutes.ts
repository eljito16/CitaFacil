import { Router } from "express";
import {
  createAppointment,
  getClientAppointments,
  getBusinessAppointments,
  cancelAppointment,
} from "../controllers/appointmentController";
import { verifyToken, verifyRole } from "../middlewares/authMiddleware";

const router = Router();

// Rutas protegidas para cliente
router.post("/", verifyToken, verifyRole("cliente"), createAppointment);
router.get("/client", verifyToken, verifyRole("cliente"), getClientAppointments);
router.put("/cancel/:id", verifyToken, verifyRole("cliente"), cancelAppointment);

// Rutas protegidas para negocio
router.get("/business", verifyToken, verifyRole("negocio"), getBusinessAppointments);

export default router;