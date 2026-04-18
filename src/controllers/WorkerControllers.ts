import { Request, Response } from "express";
import pool from "../config/database";

// Agregar trabajador
export const addWorker = async (req: Request, res: Response): Promise<void> => {
  try {
    const { business_id, name, specialty, phone } = req.body;
    const ownerId = (req as any).user.id;

    if (!business_id || !name) {
      res.status(400).json({ message: "business_id y nombre son obligatorios" });
      return;
    }

    const businessExists = await pool.query(
      `SELECT id FROM businesses WHERE id = $1 AND owner_id = $2`,
      [business_id, ownerId]
    );

    if (businessExists.rows.length === 0) {
      res.status(404).json({ message: "Negocio no encontrado o no tienes permisos" });
      return;
    }

    const newWorker = await pool.query(
      `INSERT INTO workers (business_id, name, specialty, phone)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [business_id, name, specialty, phone]
    );

    res.status(201).json({
      message: "Trabajador agregado correctamente",
      worker: newWorker.rows[0],
    });

  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor", error });
  }
};

// Obtener trabajadores de un negocio
export const getWorkersByBusiness = async (req: Request, res: Response): Promise<void> => {
  try {
    const { business_id } = req.params;

    const workers = await pool.query(
      `SELECT * FROM workers WHERE business_id = $1 ORDER BY name ASC`,
      [business_id]
    );

    res.status(200).json({ workers: workers.rows });

  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor", error });
  }
};

// Eliminar trabajador
export const deleteWorker = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const ownerId = (req as any).user.id;

    const workerExists = await pool.query(
      `SELECT w.id FROM workers w
       INNER JOIN businesses b ON w.business_id = b.id
       WHERE w.id = $1 AND b.owner_id = $2`,
      [id, ownerId]
    );

    if (workerExists.rows.length === 0) {
      res.status(404).json({ message: "Trabajador no encontrado o no tienes permisos" });
      return;
    }

    await pool.query(`DELETE FROM workers WHERE id = $1`, [id]);

    res.status(200).json({ message: "Trabajador eliminado correctamente" });

  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor", error });
  }
};

// Obtener trabajadores disponibles por negocio, fecha y hora
export const getAvailableWorkers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { business_id, date, time } = req.params;

    const allWorkers = await pool.query(
      `SELECT * FROM workers WHERE business_id = $1`,
      [business_id]
    );

    const busyWorkers = await pool.query(
      `SELECT worker_id FROM appointments
       WHERE business_id = $1 AND date = $2 AND time = $3 AND status != 'cancelada'`,
      [business_id, date, time]
    );

    const busyWorkerIds = busyWorkers.rows.map((r: any) => r.worker_id);

    const availableWorkers = allWorkers.rows.filter(
      (w: any) => !busyWorkerIds.includes(w.id)
    );

    res.status(200).json({ workers: availableWorkers });

  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor", error });
  }
};