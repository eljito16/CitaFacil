import { Request, Response } from "express";
import pool from "../config/database";

// Agregar servicio a un negocio
export const addService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { business_id, name, price, duration } = req.body;
    const ownerId = (req as any).user.id;

    if (!business_id || !name || !price || !duration) {
      res.status(400).json({ message: "Todos los campos son obligatorios" });
      return;
    }

    // Verificar que el negocio pertenece al usuario
    const businessExists = await pool.query(
      `SELECT id FROM businesses WHERE id = $1 AND owner_id = $2`,
      [business_id, ownerId]
    );

    if (businessExists.rows.length === 0) {
      res.status(404).json({ message: "Negocio no encontrado o no tienes permisos" });
      return;
    }

    const newService = await pool.query(
      `INSERT INTO services (business_id, name, price, duration)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [business_id, name, price, duration]
    );

    res.status(201).json({
      message: "Servicio creado correctamente",
      service: newService.rows[0],
    });

  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor", error });
  }
};

// Obtener servicios de un negocio
export const getServicesByBusiness = async (req: Request, res: Response): Promise<void> => {
  try {
    const { business_id } = req.params;

    const services = await pool.query(
      `SELECT * FROM services WHERE business_id = $1`,
      [business_id]
    );

    res.status(200).json({ services: services.rows });

  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor", error });
  }
};

// Eliminar servicio
export const deleteService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const ownerId = (req as any).user.id;

    // Verificar que el servicio pertenece al negocio del usuario
    const serviceExists = await pool.query(
      `SELECT s.id FROM services s
       INNER JOIN businesses b ON s.business_id = b.id
       WHERE s.id = $1 AND b.owner_id = $2`,
      [id, ownerId]
    );

    if (serviceExists.rows.length === 0) {
      res.status(404).json({ message: "Servicio no encontrado o no tienes permisos" });
      return;
    }

    await pool.query(`DELETE FROM services WHERE id = $1`, [id]);

    res.status(200).json({ message: "Servicio eliminado correctamente" });

  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor", error });
  }
};