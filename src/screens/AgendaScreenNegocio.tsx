import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
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
};

export default function AgendaScreenNegocio() {
  const { user } = useContext(AuthContext);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const endpoint =
        user?.role === "cliente"
          ? "/appointments/client"
          : "/appointments/business";

      const response = await api.get(endpoint);
      setAppointments(response.data.appointments);
    } catch (error) {
      console.error("Error cargando citas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
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
              fetchAppointments();
            } catch (error: any) {
              const message =
                error.response?.data?.message || "Error al cancelar cita";
              Alert.alert("Error", message);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendiente":
        return "#FFA500";
      case "cancelada":
        return "#FF0000";
      case "completada":
        return "#008000";
      default:
        return "#000";
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="black" />
        <Text style={styles.loadingText}>Cargando citas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {user?.role === "cliente" ? "Mis Citas" : "Citas del Negocio"}
      </Text>

      {appointments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {user?.role === "cliente"
              ? "No tienes citas reservadas aún"
              : "No tienes citas recibidas aún"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>

              {/* Status */}
              <View style={styles.statusContainer}>
                <Text
                  style={[
                    styles.status,
                    { color: getStatusColor(item.status) },
                  ]}
                >
                  ● {item.status.toUpperCase()}
                </Text>
              </View>

              {/* Info del servicio */}
              <Text style={styles.serviceName}>{item.service_name}</Text>

              {/* Info según rol */}
              {user?.role === "cliente" ? (
                <Text style={styles.businessName}>
                  🏪 {item.business_name}
                </Text>
              ) : (
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName}>
                    👤 {item.client_name}
                  </Text>
                  <Text style={styles.clientPhone}>
                    📞 {item.client_phone}
                  </Text>
                </View>
              )}

              {/* Fecha y hora */}
              <View style={styles.dateTimeContainer}>
                <Text style={styles.date}>
                  📅 {formatDate(item.date)}
                </Text>
                <Text style={styles.time}>
                  🕒 {item.time}
                </Text>
              </View>

              {/* Precio y duración */}
              <View style={styles.priceContainer}>
                <Text style={styles.price}>
                  💰 ${Number(item.price).toLocaleString()}
                </Text>
                <Text style={styles.duration}>
                  ⏱ {item.duration} min
                </Text>
              </View>

              {/* Método de pago */}
              <Text style={styles.payment}>
                💳 {item.payment_method}
              </Text>

              {/* Botón cancelar solo para cliente y citas pendientes */}
              {user?.role === "cliente" && item.status === "pendiente" && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => handleCancel(item.id)}
                >
                  <Text style={styles.cancelText}>Cancelar cita</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#555",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
  card: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statusContainer: {
    marginBottom: 8,
  },
  status: {
    fontSize: 12,
    fontWeight: "bold",
  },
  serviceName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  businessName: {
    fontSize: 15,
    color: "#555",
    marginBottom: 8,
  },
  clientInfo: {
    marginBottom: 8,
  },
  clientName: {
    fontSize: 15,
    fontWeight: "bold",
  },
  clientPhone: {
    fontSize: 14,
    color: "#555",
  },
  dateTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
  },
  time: {
    fontSize: 14,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  price: {
    fontSize: 15,
    fontWeight: "bold",
  },
  duration: {
    fontSize: 14,
    color: "#555",
  },
  payment: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: "#ff4444",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
  },
  cancelText: {
    color: "white",
    fontWeight: "bold",
  },
});