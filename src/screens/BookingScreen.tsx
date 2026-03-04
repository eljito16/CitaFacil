import {  View,  Text,  StyleSheet,  TextInput,  TouchableOpacity,  ScrollView,  Alert,} from "react-native";
import { useContext, useEffect, useState } from "react";
import { useRoute, RouteProp } from "@react-navigation/native";
import { AppointmentContext } from "../context/AppointmentContext";
import { UserContext } from "../context/UserContext";

type RootStackParamList = {
  Booking: { storeName: string };
};

type BookingRouteProp = RouteProp<RootStackParamList, "Booking">;

export default function BookingScreen() {
  const route = useRoute<BookingRouteProp>();
  const { storeName } = route.params;

  const appointmentContext = useContext(AppointmentContext);
  const userContext = useContext(UserContext);

  if (!appointmentContext) {
    throw new Error("BookingScreen must be used inside AppointmentProvider");
  }

  if (!userContext) {
    throw new Error("BookingScreen must be used inside UserProvider");
  }

  const { addAppointment } = appointmentContext;
  const { user } = userContext;

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [service, setService] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<"efectivo" | "transferencia" | "">("");

  useEffect(() => {
    if (user) {
      Alert.alert(
        "Autocompletar datos",
        "¿Quieres llenar automáticamente tus datos personales?",
        [
          { text: "No", style: "cancel" },
          {
            text: "Sí",
            onPress: () => {
              setFullName(user.fullName);
              setPhone(user.phone);
              setAddress(user.address);
            },
          },
        ]
      );
    }
  }, []);

  const handleReserve = () => {
    if (
      !fullName ||
      !phone ||
      !address ||
      !date ||
      !time ||
      !service ||
      !paymentMethod
    ) {
      Alert.alert("Error", "Debes completar todos los campos");
      return;
    }

    const newAppointment = {
      id: Date.now().toString(),
      userId: user?.id || "guest",
      fullName,
      phone,
      address,
      service,
      date,
      time,
      paymentMethod,
      store: storeName,
    };

    addAppointment(newAppointment);

    Alert.alert("Éxito", "Cita reservada correctamente");

    setDate("");
    setTime("");
    setService("");
    setPaymentMethod("");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Agendar Cita</Text>

      <Text style={styles.storeText}>Tienda: {storeName}</Text>

      <Text style={styles.label}>Nombre Completo</Text>
      <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />

      <Text style={styles.label}>Teléfono</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Dirección</Text>
      <TextInput style={styles.input} value={address} onChangeText={setAddress} />

      <Text style={styles.label}>Servicio</Text>
      <TextInput
        style={styles.input}
        value={service}
        onChangeText={setService}
        placeholder="Ej: Corte de Cabello"
      />

      <Text style={styles.label}>Fecha</Text>
      <TextInput
        style={styles.input}
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
      />

      <Text style={styles.label}>Hora</Text>
      <TextInput
        style={styles.input}
        value={time}
        onChangeText={setTime}
        placeholder="Ej: 3:00 PM"
      />

      <Text style={styles.label}>Método de Pago</Text>

      <View style={styles.paymentContainer}>
        <TouchableOpacity
          style={[
            styles.paymentButton,
            paymentMethod === "efectivo" && styles.paymentSelected,
          ]}
          onPress={() => setPaymentMethod("efectivo")}
        >
          <Text>Efectivo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.paymentButton,
            paymentMethod === "transferencia" && styles.paymentSelected,
          ]}
          onPress={() => setPaymentMethod("transferencia")}
        >
          <Text>Transferencia</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.reserveButton} onPress={handleReserve}>
        <Text style={styles.reserveText}>Reservar Cita</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  storeText: {
    fontSize: 16,
    marginBottom: 15,
  },
  label: {
    marginTop: 15,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
  },
  paymentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  paymentButton: {
    flex: 1,
    padding: 15,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  paymentSelected: {
    backgroundColor: "#ddd",
  },
  reserveButton: {
    backgroundColor: "black",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 25,
  },
  reserveText: {
    color: "white",
    fontWeight: "bold",
  },
});