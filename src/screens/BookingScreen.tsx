import { View, Text, StyleSheet, Button } from "react-native";
import { useContext } from "react";
import { AppointmentContext } from "../context/AppointmentContext";

export default function BookingScreen() {
  const context = useContext(AppointmentContext);

  if (!context) {
    throw new Error("BookingScreen must be used inside AppointmentProvider");
  }

  const { addAppointment } = context;

  const handleReserve = () => {
    const newAppointment = {
      id: Date.now().toString(),
      service: "Corte de Cabello",
      date: "2026-03-02",
      time: "3:00 PM",
      store: "Barbería Elite",
    };

    addAppointment(newAppointment);
  };

  return (
    <View style={styles.container}>
      <Text>Confirmar reserva</Text>
      <Button title="Reservar Cita" onPress={handleReserve} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});