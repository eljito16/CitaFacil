import { Request, Response } from "express";
import pool from "../config/database";

// Crear negocio
export const createBusiness = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, category, address, phone, schedule, image } = req.body;
    const ownerId = (req as any).user.id;

    if (!name || !category) {
      res.status(400).json({ message: "Nombre y categoría son obligatorios" });
      return;
    }

    const newBusiness = await pool.query(
      `INSERT INTO businesses (owner_id, name, description, category, address, phone, schedule, image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [ownerId, name, description, category, address, phone, schedule, image]
    );

    res.status(201).json({
      message: "Negocio creado correctamente",
      business: newBusiness.rows[0],
    });

  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor", error });
  }
};

// Obtener todos los negocios
export const getBusinesses = async (req: Request, res: Response): Promise<void> => {
  try {
    const businesses = await pool.query(
      `SELECT * FROM businesses ORDER BY created_at DESC`
    );

    res.status(200).json({ businesses: businesses.rows });

  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor", error });
  }
};

// Obtener negocio por ID
export const getBusinessById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const business = await pool.query(
      `SELECT * FROM businesses WHERE id = $1`,
      [id]
    );

    if (business.rows.length === 0) {
      res.status(404).json({ message: "Negocio no encontrado" });
      return;
    }

    // Obtener servicios del negocio
    const services = await pool.query(
      `SELECT * FROM services WHERE business_id = $1`,
      [id]
    );

    res.status(200).json({
      business: business.rows[0],
      services: services.rows,
    });

  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor", error });
  }
};

// Actualizar negocio
export const updateBusiness = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, category, address, phone, schedule, image } = req.body;
    const ownerId = (req as any).user.id;

    const businessExists = await pool.query(
      `SELECT id FROM businesses WHERE id = $1 AND owner_id = $2`,
      [id, ownerId]
    );

    if (businessExists.rows.length === 0) {
      res.status(404).json({ message: "Negocio no encontrado o no tienes permisos" });
      return;
    }

    const updatedBusiness = await pool.query(
      `UPDATE businesses SET name=$1, description=$2, category=$3, address=$4, phone=$5, schedule=$6, image=$7
       WHERE id=$8 RETURNING *`,
      [name, description, category, address, phone, schedule, image, id]
    );

    res.status(200).json({
      message: "Negocio actualizado correctamente",
      business: updatedBusiness.rows[0],
    });

  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor", error });
  }
};