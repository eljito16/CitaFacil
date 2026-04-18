import {
  View, Text, StyleSheet, SectionList,
  ActivityIndicator, TouchableOpacity,
} from "react-native";
import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../hooks/UseAuth";
import { useAppointments } from "../hooks/UseAppointments";
import { colors } from "../styles/colors";
import { typography } from "../styles/typography";

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

type Section = {
  title: string;
  status: string;
  data: Appointment[];
};

const SECTIONS_CONFIG = [
  { title: "🟡 Pendientes",   status: "pendiente"  },
  { title: "🟢 Completadas",  status: "completada" },
  { title: "🔴 Canceladas",   status: "cancelada"  },
];

export default function AgendaScreenNegocio() {
  const { user } = useAuth();
  const { appointments, loading, fetchAppointments, cancelAppointment } =
    useAppointments(user?.role ?? "cliente");

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [fetchAppointments])
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDuration = (minutes?: number): string => {
    if (!minutes) return "";
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  };

  // Construir secciones filtrando por status
  const sections: Section[] = SECTIONS_CONFIG
    .map((s) => ({
      title: s.title,
      status: s.status,
      data: appointments.filter((a) => a.status === s.status),
    }))
    .filter((s) => s.data.length > 0); // ocultar secciones vacías

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando citas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={typography.screenTitle}>
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
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id.toString()}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>{section.title}</Text>
              <Text style={styles.sectionCount}>{section.data.length} cita{section.data.length !== 1 ? "s" : ""}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={styles.card}>

              {/* Servicio */}
              <Text style={styles.serviceName}>{item.service_name}</Text>

              {/* Info según rol */}
              {user?.role === "cliente" ? (
                <Text style={styles.businessName}>🏪 {item.business_name}</Text>
              ) : (
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName}>👤 {item.client_name}</Text>
                  <Text style={styles.clientPhone}>📞 {item.client_phone}</Text>
                </View>
              )}

              {/* Trabajador asignado */}
              {item.worker_name ? (
                <Text style={styles.workerName}>✂️ {item.worker_name}</Text>
              ) : null}

              {/* Fecha y hora */}
              <View style={styles.dateTimeContainer}>
                <Text style={styles.date}>📅 {formatDate(item.date)}</Text>
                <Text style={styles.time}>🕒 {item.time}</Text>
              </View>

              {/* Precio y duración */}
              <View style={styles.priceContainer}>
                <Text style={styles.price}>
                  💰 ${Number(item.price).toLocaleString()}
                </Text>
                <Text style={styles.duration}>⏱ {formatDuration(item.duration)}</Text>
              </View>

              {/* Método de pago */}
              <Text style={styles.payment}>💳 {item.payment_method}</Text>

              {/* Cancelar — solo cliente con cita pendiente */}
              {user?.role === "cliente" && item.status === "pendiente" && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => cancelAppointment(item.id)}
                >
                  <Text style={styles.cancelText}>Cancelar cita</Text>
                </TouchableOpacity>
              )}

            </View>
          )}
          renderSectionFooter={() => <View style={{ height: 8 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: colors.textSecondary },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: colors.textMuted, textAlign: "center" },

  // Sección header
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  sectionHeaderText: { fontSize: 16, fontWeight: "bold", color: colors.textPrimary },
  sectionCount: { fontSize: 13, color: colors.textSecondary },

  // Card
  card: {
    padding: 15,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  serviceName: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  businessName: { fontSize: 15, color: colors.textSecondary, marginBottom: 8 },
  clientInfo: { marginBottom: 8 },
  clientName: { fontSize: 15, fontWeight: "bold" },
  clientPhone: { fontSize: 14, color: colors.textSecondary },
  workerName: { fontSize: 14, color: colors.textPrimary, marginBottom: 8 },
  dateTimeContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  date: { fontSize: 14 },
  time: { fontSize: 14 },
  priceContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  price: { fontSize: 15, fontWeight: "bold" },
  duration: { fontSize: 14, color: colors.textSecondary },
  payment: { fontSize: 14, color: colors.textSecondary, marginBottom: 10 },

  // Botón cancelar — azul
  cancelButton: {
    backgroundColor: "#1a73e8",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
  },
  cancelText: { color: "white", fontWeight: "bold" },
});