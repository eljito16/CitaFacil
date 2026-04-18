import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddleware";
import {  register, login, getProfile, updateProfile, deleteAccount} from "../controllers/authController";

const router = Router();

// Rutas públicas
router.post("/register", register);
router.post("/login", login);
router.delete("/account", verifyToken, deleteAccount);

// Rutas protegidas
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);
export default router;