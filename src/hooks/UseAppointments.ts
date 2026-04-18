import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { api } from "../services/api";

type Appointment = {
  id: string;
  date: string;
  time: string;
  status: string;
  payment_method: string;
  business_name?: string;
  service_name?: string;
  price?: number;
  duration?: number;
  client_name?: string;
  client_phone?: string;
  worker_name?: string;
};

export function useAppointments(role: "cliente" | "negocio") {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint =
        role === "cliente" ? "/appointments/client" : "/appointments/business";
      const response = await api.get(endpoint);
      setAppointments(response.data.appointments);
    } catch (error) {
      console.error("Error cargando citas:", error);
    } finally {
      setLoading(false);
    }
  }, [role]);

  const cancelAppointment = useCallback(async (id: string, onSuccess?: () => void) => {
    Alert.alert(
      "Cancelar cita",
      "¿Estás seguro que deseas cancelar esta cita?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              await api.put(`/appointments/cancel/${id}`);
              Alert.alert("Éxito", "Cita cancelada correctamente");
              onSuccess ? onSuccess() : fetchAppointments();
            } catch (error: any) {
              const message =
                error.response?.data?.message || "Error al cancelar cita";
              Alert.alert("Error", message);
            }
          },
        },
      ]
    );
  }, [fetchAppointments]);

  return { appointments, loading, fetchAppointments, cancelAppointment };
}