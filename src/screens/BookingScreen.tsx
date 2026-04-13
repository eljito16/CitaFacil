import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useContext, useEffect, useState } from "react";
import { useRoute, RouteProp } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { api } from "../services/api";
import { HomeStackParamList } from "../navigation/HomeStackNavigator";
import { Calendar } from "react-native-calendars";

type BookingRouteProp = RouteProp<HomeStackParamList, "Booking">;

type ServiceType = {
  id: string;
  name: string;
  price: number;
  duration: number;
};

export default function BookingScreen() {
  const route = useRoute<BookingRouteProp>();
  const { storeName, storeId } = route.params;

  const { user } = useContext(AuthContext);

  const currentYear = new Date().getFullYear();
  const today = new Date().toISOString().split("T")[0];

  const [services, setServices] = useState<ServiceType[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [date, setDate] = useState("");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "transferencia" | null>(null);
  const [reservedHours, setReservedHours] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const availableHours = [
    "09:00", "10:00", "11:00", "12:00",
    "14:00", "15:00", "16:00", "17:00",
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (date) {
      fetchReservedHours();
      setSelectedTime(null);
    }
  }, [date]);

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

  const fetchReservedHours = async () => {
    try {
      const response = await api.get(`/appointments/available/${storeId}/${date}`);
      setReservedHours(response.data.reservedHours || []);
    } catch (error) {
      console.error("Error cargando horas:", error);
    }
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
    if (!selectedService || !date || !selectedTime || !paymentMethod) {
      Alert.alert("Error", "Debes completar todos los campos");
      return;
    }

    try {
      setLoading(true);
      await api.post("/appointments", {
        business_id: storeId,
        service_id: selectedService.id,
        date,
        time: selectedTime,
        payment_method: paymentMethod,
      });

      Alert.alert("Éxito", "Cita reservada correctamente");

      setSelectedService(null);
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
      <Text style={styles.title}>Agendar Cita</Text>
      <Text style={styles.storeText}>📍 {storeName}</Text>

      {/* Servicios */}
      <Text style={styles.sectionTitle}>Selecciona un servicio</Text>
      {loadingServices ? (
        <ActivityIndicator size="small" color="black" />
      ) : (
        services.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={[
              styles.optionButton,
              selectedService?.id === service.id && styles.optionSelected,
            ]}
            onPress={() => setSelectedService(service)}
          >
            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.serviceInfo}>
              ${Number(service.price).toLocaleString()} · {service.duration} min
            </Text>
          </TouchableOpacity>
        ))
      )}

      {/* Calendario */}
      <Text style={styles.sectionTitle}>Selecciona una fecha</Text>
      <Calendar
        onDayPress={handleDayPress}
        minDate={today}
        maxDate={`${currentYear}-12-31`}
        markedDates={
          date
            ? {
                [date]: {
                  selected: true,
                  selectedColor: "black",
                },
              }
            : {}
        }
        theme={{
          todayTextColor: "black",
          selectedDayBackgroundColor: "black",
          arrowColor: "black",
        }}
      />

      {date ? (
        <Text style={styles.selectedDate}>📅 Fecha seleccionada: {date}</Text>
      ) : null}

      {/* Horas */}
      {date ? (
        <>
          <Text style={styles.sectionTitle}>Selecciona una hora</Text>
          <View style={styles.hoursContainer}>
            {availableHours.map((hour) => {
              const isReserved = reservedHours.includes(hour);
              return (
                <TouchableOpacity
                  key={hour}
                  disabled={isReserved}
                  style={[
                    styles.hourButton,
                    selectedTime === hour && styles.hourSelected,
                    isReserved && styles.hourDisabled,
                  ]}
                  onPress={() => setSelectedTime(hour)}
                >
                  <Text style={isReserved ? styles.hourDisabledText : {}}>
                    {hour}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      ) : null}

      {/* Método de pago */}
      <Text style={styles.sectionTitle}>Método de Pago</Text>
      <View style={styles.paymentContainer}>
        <TouchableOpacity
          style={[
            styles.paymentButton,
            paymentMethod === "efectivo" && styles.paymentSelected,
          ]}
          onPress={() => setPaymentMethod("efectivo")}
        >
          <Text>💵 Efectivo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.paymentButton,
            paymentMethod === "transferencia" && styles.paymentSelected,
          ]}
          onPress={() => setPaymentMethod("transferencia")}
        >
          <Text>📲 Transferencia</Text>
        </TouchableOpacity>
      </View>

      {/* Resumen */}
      {selectedService && date && selectedTime && paymentMethod ? (
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Resumen de tu cita</Text>
          <Text>🏪 Negocio: {storeName}</Text>
          <Text>✂️ Servicio: {selectedService.name}</Text>
          <Text>💰 Precio: ${Number(selectedService.price).toLocaleString()}</Text>
          <Text>⏱ Duración: {selectedService.duration} min</Text>
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
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 5 },
  storeText: { fontSize: 16, marginBottom: 20, color: "#555" },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginTop: 20, marginBottom: 10 },
  optionButton: { padding: 12, borderWidth: 1, borderRadius: 8, marginBottom: 8 },
  optionSelected: { backgroundColor: "#ddd", borderColor: "black" },
  serviceName: { fontSize: 16, fontWeight: "bold" },
  serviceInfo: { fontSize: 13, color: "#555", marginTop: 2 },
  selectedDate: { textAlign: "center", marginTop: 10, fontWeight: "bold" },
  hoursContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 5 },
  hourButton: { padding: 10, borderWidth: 1, borderRadius: 8, margin: 5 },
  hourSelected: { backgroundColor: "#ccc", borderColor: "black" },
  hourDisabled: { backgroundColor: "#f0f0f0", opacity: 0.5 },
  hourDisabledText: { color: "#aaa" },
  paymentContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 5 },
  paymentButton: { flex: 1, padding: 15, borderWidth: 1, borderRadius: 8, alignItems: "center", marginHorizontal: 5 },
  paymentSelected: { backgroundColor: "#ddd", borderColor: "black" },
  summary: { backgroundColor: "#f9f9f9", padding: 15, borderRadius: 8, marginTop: 20, borderWidth: 1 },
  summaryTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 8 },
  reserveButton: { backgroundColor: "black", padding: 15, borderRadius: 8, alignItems: "center", marginTop: 25, marginBottom: 40 },
  reserveText: { color: "white", fontWeight: "bold", fontSize: 16 },
});