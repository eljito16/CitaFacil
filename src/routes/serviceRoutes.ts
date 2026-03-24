import { Router } from "express";
import {
  addService,
  getServicesByBusiness,
  deleteService,
} from "../controllers/serviceController";
import { verifyToken, verifyRole } from "../middlewares/authMiddleware";

const router = Router();

// Rutas públicas
router.get("/:business_id", getServicesByBusiness);

// Rutas protegidas solo para negocio
router.post("/", verifyToken, verifyRole("negocio"), addService);
router.delete("/:id", verifyToken, verifyRole("negocio"), deleteService);

export default router;