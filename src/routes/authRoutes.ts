import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddleware";
import { register, login, getProfile, updateProfile } from "../controllers/authController";

const router = Router();

// Rutas públicas
router.post("/register", register);
router.post("/login", login);

// Rutas protegidas
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);
export default router;