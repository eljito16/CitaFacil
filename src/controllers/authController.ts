import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/database";

// Registro de usuario
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, role, full_name, phone, address } = req.body;

    if (!username || !password || !role) {
      res.status(400).json({ message: "Username, password y role son obligatorios" });
      return;
    }

    if (!["cliente", "negocio"].includes(role)) {
      res.status(400).json({ message: "El role debe ser cliente o negocio" });
      return;
    }

    const userExists = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );

    if (userExists.rows.length > 0) {
      res.status(400).json({ message: "El usuario ya existe" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      `INSERT INTO users (username, password, role, full_name, phone, address)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, username, role, full_name, phone, address`,
      [username, hashedPassword, role, full_name, phone, address]
    );

    const token = jwt.sign(
      { id: newUser.rows[0].id, role: newUser.rows[0].role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Usuario creado correctamente",
      user: newUser.rows[0],
      token,
    });

  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor", error });
  }
};

// Login de usuario
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ message: "Username y password son obligatorios" });
      return;
    }

    const userResult = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (userResult.rows.length === 0) {
      res.status(401).json({ message: "Credenciales incorrectas" });
      return;
    }

    const user = userResult.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      res.status(401).json({ message: "Credenciales incorrectas" });
      return;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login exitoso",
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        full_name: user.full_name,
        phone: user.phone,
        address: user.address,
      },
      token,
    });

  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor", error });
  }
};

// Obtener perfil
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const userResult = await pool.query(
      "SELECT id, username, role, full_name, phone, address, created_at FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }

    res.status(200).json({ user: userResult.rows[0] });

  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor", error });
  }
};

// Actualizar perfil
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { full_name, phone, address } = req.body;

    const updatedUser = await pool.query(
      `UPDATE users SET full_name=$1, phone=$2, address=$3
       WHERE id=$4
       RETURNING id, username, role, full_name, phone, address`,
      [full_name, phone, address, userId]
    );

    res.status(200).json({
      message: "Perfil actualizado correctamente",
      user: updatedUser.rows[0],
    });

  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor", error });
  }
};

// Eliminar cuenta
export const deleteAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const role = (req as any).user.role;

    // Si es negocio, eliminar todo lo relacionado primero
    if (role === "negocio") {
      // Obtener el negocio del usuario
      const businessResult = await pool.query(
        `SELECT id FROM businesses WHERE owner_id = $1`,
        [userId]
      );

      if (businessResult.rows.length > 0) {
        const businessId = businessResult.rows[0].id;

        // Eliminar en cascada
        await pool.query(`DELETE FROM appointments WHERE business_id = $1`, [businessId]);
        await pool.query(`DELETE FROM workers WHERE business_id = $1`, [businessId]);
        await pool.query(`DELETE FROM services WHERE business_id = $1`, [businessId]);
        await pool.query(`DELETE FROM businesses WHERE id = $1`, [businessId]);
      }
    }

    // Si es cliente, eliminar sus citas
    if (role === "cliente") {
      await pool.query(`DELETE FROM appointments WHERE client_id = $1`, [userId]);
    }

    // Eliminar el usuario
    await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);

    res.status(200).json({ message: "Cuenta eliminada correctamente" });

  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor", error });
  }
};