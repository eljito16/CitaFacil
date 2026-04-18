import { Router } from "express";
import {  createBusiness,  getBusinesses,  getBusinessById,  updateBusiness, deleteBusiness} from "../controllers/businessController";
import { verifyToken, verifyRole } from "../middlewares/authMiddleware";


const router = Router();

// Rutas públicas
router.get("/", getBusinesses);
router.get("/:id", getBusinessById);
router.delete("/:id", verifyToken, verifyRole("negocio"), deleteBusiness);

// Rutas protegidas solo para negocio
router.post("/", verifyToken, verifyRole("negocio"), createBusiness);
router.put("/:id", verifyToken, verifyRole("negocio"), updateBusiness);

export default router;