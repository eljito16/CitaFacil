import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { useRoute, RouteProp } from "@react-navigation/native";
import { useAuth } from "../hooks/UseAuth";
import { api } from "../services/api";
import { HomeStackParamList } from "../navigation/HomeStackNavigator";
import { Calendar } from "react-native-calendars";
import { colors } from "../styles/colors";
import { typography } from "../styles/typography";

type BookingRouteProp = RouteProp<HomeStackParamList, "Booking">;

type ServiceType = {
  id: string;
  name: string;
  price: number;
  duration: number;
};

type WorkerType = {
  id: string;
  name: string;
  specialty: string;
  phone: string;
};

type ReservedSlot = {
  time: string;
  worker_id: string;
};

// Genera array de horas entre start y end (formato "HH:00")
const generateHours = (start: string, end: string): string[] => {
  const hours: string[] = [];
  const startHour = parseInt(start.split(":")[0]);
  const endHour   = parseInt(end.split(":")[0]);

  for (let h = startHour; h < endHour; h++) {
    hours.push(`${String(h).padStart(2, "0")}:00`);
  }
  return hours;
};

export default function BookingScreen() {
  const route = useRoute<BookingRouteProp>();
  const { storeName, storeId } = route.params;

  const { user } = useAuth();

  const currentYear = new Date().getFullYear();
  const today = new Date().toISOString().split("T")[0];

  const [services, setServices]             = useState<ServiceType[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);

  const [workers, setWorkers]               = useState<WorkerType[]>([]);
  const [loadingWorkers, setLoadingWorkers]   = useState(true);
  const [selectedWorker, setSelectedWorker]   = useState<WorkerType | null>(null);

  const [date, setDate]                     = useState("");
  const [selectedTime, setSelectedTime]     = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod]   = useState<"efectivo" | "transferencia" | null>(null);
  const [reservedSlots, setReservedSlots]   = useState<ReservedSlot[]>([]);
  const [loading, setLoading]               = useState(false);

  // Horario dinámico del negocio
  const [availableHours, setAvailableHours] = useState<string[]>([]);

  useEffect(() => {
    fetchServices();
    fetchWorkers();
    fetchBusinessSchedule();
  }, []);

  useEffect(() => {
    if (date) {
      fetchReservedSlots();
      setSelectedTime(null);
    }
  }, [date]);

  useEffect(() => {
    setSelectedTime(null);
  }, [selectedWorker]);

  const fetchBusinessSchedule = async () => {
    try {
      const response = await api.get(`/businesses/${storeId}`);
      const schedule: string = response.data.business.schedule;

      // Parsear "09:00-18:00"
      if (schedule && schedule.includes("-")) {
        const [start, end] = schedule.split("-");
        setAvailableHours(generateHours(start.trim(), end.trim()));
      } else {
        // Fallback si el negocio aún no tiene horario configurado
        setAvailableHours([
          "09:00", "10:00", "11:00", "12:00",
          "14:00", "15:00", "16:00", "17:00",
        ]);
      }
    } catch (error) {
      console.error("Error cargando horario:", error);
      // Fallback en caso de error
      setAvailableHours([
        "09:00", "10:00", "11:00", "12:00",
        "14:00", "15:00", "16:00", "17:00",
      ]);
    }
  };

  const fetchServices = async () => {
    try {
      setLoadingServices(true);
      const response = await api.get(`/services/${storeId}`);
      setServices(response.data.services);
    } catch (error) {
      console.error("Error cargando servicios:", error);
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchWorkers = async () => {
    try {
      setLoadingWorkers(true);
      const response = await api.get(`/workers/${storeId}`);
      setWorkers(response.data.workers);
    } catch (error) {
      console.error("Error cargando trabajadores:", error);
    } finally {
      setLoadingWorkers(false);
    }
  };

  const fetchReservedSlots = async () => {
    try {
      const response = await api.get(`/appointments/available/${storeId}/${date}`);
      setReservedSlots(response.data.reservedSlots || []);
    } catch (error) {
      console.error("Error cargando horas:", error);
    }
  };

  const isHourBlocked = (hour: string): boolean => {
    if (!selectedWorker) return false;
    return reservedSlots.some(
      (slot) => slot.time === hour && slot.worker_id === selectedWorker.id
    );
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  };

  const handleDayPress = (day: any) => {
    const selectedYear = new Date(day.dateString).getFullYear();
    if (selectedYear !== currentYear) {
      Alert.alert("Error", `Solo puedes reservar citas en el año ${currentYear}`);
      return;
    }
    setDate(day.dateString);
  };

  const handleReserve = async () => {
    if (!selectedService || !selectedWorker || !date || !selectedTime || !paymentMethod) {
      Alert.alert("Error", "Debes completar todos los campos");
      return;
    }

    try {
      setLoading(true);
      await api.post("/appointments", {
        business_id: storeId,
        service_id: selectedService.id,
        worker_id: selectedWorker.id,
        date,
        time: selectedTime,
        payment_method: paymentMethod,
      });

      Alert.alert("Éxito", "Cita reservada correctamente");
      setSelectedService(null);
      setSelectedWorker(null);
      setDate("");
      setSelectedTime(null);
      setPaymentMethod(null);

    } catch (error: any) {
      const message = error.response?.data?.message || "Error al reservar cita";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={typography.screenTitle}>Agendar Cita</Text>
      <Text style={styles.storeText}>📍 {storeName}</Text>

      {/* ── SERVICIOS ── */}
      <Text style={typography.sectionTitle}>Selecciona un servicio</Text>
      {loadingServices ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        services.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={[styles.optionButton, selectedService?.id === service.id && styles.optionSelected]}
            onPress={() => setSelectedService(service)}
          >
            <Text style={styles.optionTitle}>{service.name}</Text>
            <Text style={styles.optionSubtitle}>
              ${Number(service.price).toLocaleString()} · {formatDuration(service.duration)}
            </Text>
          </TouchableOpacity>
        ))
      )}

      {/* ── TRABAJADORES ── */}
      <Text style={typography.sectionTitle}>Selecciona un trabajador</Text>
      {loadingWorkers ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : workers.length === 0 ? (
        <Text style={styles.emptyText}>No hay trabajadores disponibles</Text>
      ) : (
        workers.map((worker) => (
          <TouchableOpacity
            key={worker.id}
            style={[styles.optionButton, selectedWorker?.id === worker.id && styles.optionSelected]}
            onPress={() => setSelectedWorker(worker)}
          >
            <Text style={styles.optionTitle}>✂️ {worker.name}</Text>
            {worker.specialty ? (
              <Text style={styles.optionSubtitle}>🛠 {worker.specialty}</Text>
            ) : null}
          </TouchableOpacity>
        ))
      )}

      {/* ── CALENDARIO ── */}
      <Text style={typography.sectionTitle}>Selecciona una fecha</Text>
      <Calendar
        onDayPress={handleDayPress}
        minDate={today}
        maxDate={`${currentYear}-12-31`}
        markedDates={
          date ? { [date]: { selected: true, selectedColor: colors.primary } } : {}
        }
        theme={{
          todayTextColor: colors.primary,
          selectedDayBackgroundColor: colors.primary,
          arrowColor: colors.primary,
        }}
      />

      {date ? (
        <Text style={styles.selectedDate}>📅 Fecha seleccionada: {date}</Text>
      ) : null}

      {/* ── HORAS DINÁMICAS ── */}
      {date && selectedWorker ? (
        <>
          <Text style={typography.sectionTitle}>Selecciona una hora</Text>

          {availableHours.length === 0 ? (
            <Text style={styles.emptyText}>
              ⚠️ Este negocio aún no tiene horario configurado
            </Text>
          ) : (
            <View style={styles.hoursContainer}>
              {availableHours.map((hour) => {
                const isBlocked = isHourBlocked(hour);
                return (
                  <TouchableOpacity
                    key={hour}
                    disabled={isBlocked}
                    style={[
                      styles.hourButton,
                      selectedTime === hour && styles.hourSelected,
                      isBlocked && styles.hourDisabled,
                    ]}
                    onPress={() => setSelectedTime(hour)}
                  >
                    <Text style={[
                      styles.hourText,
                      selectedTime === hour && styles.hourTextSelected,
                      isBlocked && styles.hourTextDisabled,
                    ]}>
                      {hour}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </>
      ) : date && !selectedWorker ? (
        <Text style={styles.emptyText}>
          ⚠️ Selecciona un trabajador para ver las horas disponibles
        </Text>
      ) : null}

      {/* ── MÉTODO DE PAGO ── */}
      <Text style={typography.sectionTitle}>Método de Pago</Text>
      <View style={styles.paymentContainer}>
        <TouchableOpacity
          style={[styles.paymentButton, paymentMethod === "efectivo" && styles.paymentSelected]}
          onPress={() => setPaymentMethod("efectivo")}
        >
          <Text style={paymentMethod === "efectivo" ? styles.paymentTextSelected : {}}>
            💵 Efectivo
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.paymentButton, paymentMethod === "transferencia" && styles.paymentSelected]}
          onPress={() => setPaymentMethod("transferencia")}
        >
          <Text style={paymentMethod === "transferencia" ? styles.paymentTextSelected : {}}>
            📲 Transferencia
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── RESUMEN ── */}
      {selectedService && selectedWorker && date && selectedTime && paymentMethod ? (
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Resumen de tu cita</Text>
          <Text>🏪 Negocio: {storeName}</Text>
          <Text>✂️ Servicio: {selectedService.name}</Text>
          <Text>👤 Trabajador: {selectedWorker.name}</Text>
          <Text>💰 Precio: ${Number(selectedService.price).toLocaleString()}</Text>
          <Text>⏱ Duración: {formatDuration(selectedService.duration)}</Text>
          <Text>📅 Fecha: {date}</Text>
          <Text>🕒 Hora: {selectedTime}</Text>
          <Text>💳 Pago: {paymentMethod}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.reserveButton, loading && { opacity: 0.6 }]}
        onPress={handleReserve}
        disabled={loading}
      >
        <Text style={styles.reserveText}>
          {loading ? "Reservando..." : "Confirmar Cita"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  storeText: { fontSize: 16, marginBottom: 20, color: colors.textSecondary },
  optionButton: {
    padding: 12, borderWidth: 1, borderColor: colors.border,
    borderRadius: 8, marginBottom: 8,
  },
  optionSelected: { backgroundColor: colors.selected, borderColor: colors.primary },
  optionTitle: { fontSize: 16, fontWeight: "bold" },
  optionSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  emptyText: { fontSize: 14, color: colors.textMuted, fontStyle: "italic", marginBottom: 8 },
  selectedDate: { textAlign: "center", marginTop: 10, fontWeight: "bold" },
  hoursContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 5 },
  hourButton: {
    padding: 10, borderWidth: 1, borderColor: colors.border,
    borderRadius: 8, margin: 5, minWidth: 65, alignItems: "center",
  },
  hourSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  hourDisabled: { backgroundColor: colors.disabled, opacity: 0.5 },
  hourText: { fontSize: 13, color: colors.textPrimary },
  hourTextSelected: { color: colors.white, fontWeight: "bold" },
  hourTextDisabled: { color: colors.disabledText },
  paymentContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 5 },
  paymentButton: {
    flex: 1, padding: 15, borderWidth: 1, borderColor: colors.border,
    borderRadius: 8, alignItems: "center", marginHorizontal: 5,
  },
  paymentSelected: { backgroundColor: colors.selected, borderColor: colors.primary },
  paymentTextSelected: { fontWeight: "bold" },
  summary: {
    backgroundColor: colors.surface, padding: 15,
    borderRadius: 8, marginTop: 20, borderWidth: 1, borderColor: colors.border,
  },
  summaryTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 8 },
  reserveButton: {
    backgroundColor: colors.primary, padding: 15, borderRadius: 8,
    alignItems: "center", marginTop: 25, marginBottom: 40,
  },
  reserveText: { color: colors.white, fontWeight: "bold", fontSize: 16 },
});