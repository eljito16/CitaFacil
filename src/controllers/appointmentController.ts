import { Request, Response } from "express";
import pool from "../config/database";

// Crear cita
export const createAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { business_id, service_id, date, time, payment_method } = req.body;
    const clientId = (req as any).user.id;

    if (!business_id || !service_id || !date || !time || !payment_method) {
      res.status(400).json({ message: "Todos los campos son obligatorios" });
      return;
    }

    // Verificar que no haya cita en esa fecha y hora
    const appointmentExists = await pool.query(
      `SELECT id FROM appointments 
       WHERE business_id = $1 AND date = $2 AND time = $3`,
      [business_id, date, time]
    );

    if (appointmentExists.rows.length > 0) {
      res.status(400).json({ message: "Ya existe una cita en esa fecha y hora" });
      return;
    }

    const newAppointment = await pool.query(
      `INSERT INTO appointments (client_id, business_id, service_id, date, time, payment_method)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [clientId, business_id, service_id, date, time, payment_method]
    );

    res.status(201).json({
      message: "Cita creada correctamente",
      appointment: newAppointment.rows[0],
    });

  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor", error });
  }
};

// Obtener horas reservadas por negocio y fecha
export const getReservedHours = async (req: Request, res: Response): Promise<void> => {
  try {
    const { business_id, date } = req.params;

    const result = await pool.query(
      `SELECT time FROM appointments 
       WHERE business_id = $1 AND date = $2 AND status != 'cancelada'`,
      [business_id, date]
    );

    const reservedHours = result.rows.map((row) =>
      row.time.substring(0, 5)
    );

    res.status(200).json({ reservedHours });

  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor", error });
  }
};

// Obtener citas del cliente
export const getClientAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const clientId = (req as any).user.id;

    const appointments = await pool.query(
      `SELECT a.*, b.name as business_name, s.name as service_name, s.price, s.duration
       FROM appointments a
       INNER JOIN businesses b ON a.business_id = b.id
       INNER JOIN services s ON a.service_id = s.id
       WHERE a.client_id = $1
       ORDER BY a.date DESC`,
      [clientId]
    );

    res.status(200).json({ appointments: appointments.rows });

  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor", error });
  }
};

// Obtener citas del negocio
export const getBusinessAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const ownerId = (req as any).user.id;

    const appointments = await pool.query(
      `SELECT a.*, u.full_name as client_name, u.phone as client_phone,
       s.name as service_name, s.price, s.duration
       FROM appointments a
       INNER JOIN businesses b ON a.business_id = b.id
       INNER JOIN users u ON a.client_id = u.id
       INNER JOIN services s ON a.service_id = s.id
       WHERE b.owner_id = $1
       ORDER BY a.date DESC`,
      [ownerId]
    );

    res.status(200).json({ appointments: appointments.rows });

  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor", error });
  }
};

// Cancelar cita
export const cancelAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const appointmentExists = await pool.query(
      `SELECT id FROM appointments WHERE id = $1 AND client_id = $2`,
      [id, userId]
    );

    if (appointmentExists.rows.length === 0) {
      res.status(404).json({ message: "Cita no encontrada o no tienes permisos" });
      return;
    }

    await pool.query(
      `UPDATE appointments SET status = 'cancelada' WHERE id = $1`,
      [id]
    );

    res.status(200).json({ message: "Cita cancelada correctamente" });

  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor", error });
  }
};