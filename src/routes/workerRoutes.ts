import { Router } from "express";
import {
  addWorker,
  getWorkersByBusiness,
  deleteWorker,
  getAvailableWorkers,
} from "../controllers/WorkerControllers";
import { verifyToken, verifyRole } from "../middlewares/authMiddleware";

const router = Router();

// Obtener trabajadores de un negocio (público, lo necesita BookingScreen)
router.get("/:business_id", getWorkersByBusiness);

// Obtener trabajadores disponibles por negocio, fecha y hora (público)
router.get("/available/:business_id/:date/:time", getAvailableWorkers);

// Agregar trabajador (solo negocio autenticado)
router.post("/", verifyToken, verifyRole("negocio"), addWorker);

// Eliminar trabajador (solo negocio autenticado)
router.delete("/:id", verifyToken, verifyRole("negocio"), deleteWorker);

export default router;