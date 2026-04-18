import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { api } from "../services/api";

type Service = {
  id: string;
  name: string;
  price: number;
  duration: number;
};

type Worker = {
  id: string;
  name: string;
  specialty: string;
  phone: string;
};

type Business = {
  id: string;
  name: string;
  description: string;
  category: string;
  address: string;
  phone: string;
  schedule: string;
  image: string;
  owner_id: number;
};

export function useBusiness(userId?: string) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchBusiness = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/businesses");
      const myBusiness = response.data.businesses.find(
        (b: any) => b.owner_id === Number(userId)
      );
      if (myBusiness) {
        setBusiness(myBusiness);
        fetchServices(myBusiness.id);
        fetchWorkers(myBusiness.id);
      }
    } catch (error) {
      console.error("Error cargando negocio:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchServices = useCallback(async (businessId: string) => {
    try {
      const response = await api.get(`/services/${businessId}`);
      setServices(response.data.services);
    } catch (error) {
      console.error("Error cargando servicios:", error);
    }
  }, []);

  const fetchWorkers = useCallback(async (businessId: string) => {
    try {
      const response = await api.get(`/workers/${businessId}`);
      setWorkers(response.data.workers);
    } catch (error) {
      console.error("Error cargando trabajadores:", error);
    }
  }, []);

  const saveBusiness = useCallback(async (data: Partial<Business>) => {
    if (!data.name || !data.category) {
      Alert.alert("Error", "Nombre y categoría son obligatorios");
      return;
    }
    try {
      setSaving(true);
      if (business) {
        await api.put(`/businesses/${business.id}`, data);
        Alert.alert("Éxito", "Negocio actualizado correctamente");
      } else {
        const response = await api.post("/businesses", data);
        setBusiness(response.data.business);
        Alert.alert("Éxito", "Negocio creado correctamente");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Error al guardar negocio";
      Alert.alert("Error", message);
    } finally {
      setSaving(false);
    }
  }, [business]);

  const addService = useCallback(async (
    businessId: string,
    name: string,
    price: number,
    duration: number
  ) => {
    try {
      await api.post("/services", { business_id: businessId, name, price, duration });
      Alert.alert("Éxito", "Servicio agregado correctamente");
      fetchServices(businessId);
    } catch (error: any) {
      const message = error.response?.data?.message || "Error al agregar servicio";
      Alert.alert("Error", message);
    }
  }, [fetchServices]);

  const deleteService = useCallback(async (serviceId: string, businessId: string) => {
    Alert.alert(
      "Eliminar servicio",
      "¿Estás seguro que deseas eliminar este servicio?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/services/${serviceId}`);
              Alert.alert("Éxito", "Servicio eliminado correctamente");
              fetchServices(businessId);
            } catch {
              Alert.alert("Error", "No se pudo eliminar el servicio");
            }
          },
        },
      ]
    );
  }, [fetchServices]);

  const addWorker = useCallback(async (
    businessId: string,
    name: string,
    specialty: string,
    phone: string
  ) => {
    if (!name) {
      Alert.alert("Error", "El nombre del trabajador es obligatorio");
      return;
    }
    try {
      await api.post("/workers", { business_id: businessId, name, specialty, phone });
      Alert.alert("Éxito", "Trabajador agregado correctamente");
      fetchWorkers(businessId);
    } catch (error: any) {
      const message = error.response?.data?.message || "Error al agregar trabajador";
      Alert.alert("Error", message);
    }
  }, [fetchWorkers]);

  const deleteWorker = useCallback(async (workerId: string, businessId: string) => {
    Alert.alert(
      "Eliminar trabajador",
      "¿Estás seguro que deseas eliminar este trabajador?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/workers/${workerId}`);
              Alert.alert("Éxito", "Trabajador eliminado correctamente");
              fetchWorkers(businessId);
            } catch {
              Alert.alert("Error", "No se pudo eliminar el trabajador");
            }
          },
        },
      ]
    );
  }, [fetchWorkers]);

  return {
    business, services, workers,
    loading, saving,
    fetchBusiness, fetchServices, fetchWorkers,
    saveBusiness, addService, deleteService, addWorker, deleteWorker,
  };
}