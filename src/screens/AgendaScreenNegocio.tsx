import { View, Text, StyleSheet, FlatList } from "react-native";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { AppointmentContext } from "../context/AppointmentContext";

export default function AgendaScreen() {
  const { user } = useContext(AuthContext);

  const appointmentContext = useContext(AppointmentContext);

  if (!appointmentContext) {
    throw new Error("AgendaScreen must be used inside AppointmentProvider");
  }

  const { appointments } = appointmentContext;

  return (
    <View style={styles.container}>
      {user?.role === "cliente" ? (
        <>
          <Text style={styles.title}>Mis Citas</Text>

          <FlatList
            data={appointments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.bold}>
                  Servicio: {item.service}
                </Text>
                <Text>Fecha: {item.date}</Text>
                <Text>Hora: {item.time}</Text>
                <Text>Negocio: {item.store}</Text>
              </View>
            )}
          />
        </>
      ) : (
        <>
          <Text style={styles.title}>Citas del Negocio</Text>

          <FlatList
            data={appointments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.bold}>
                  Servicio: {item.service}
                </Text>
                <Text>Fecha: {item.date}</Text>
                <Text>Hora: {item.time}</Text>
                <Text>Negocio: {item.store}</Text>
              </View>
            )}
          />
        </>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },
  card: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
  bold: {
    fontWeight: "bold",
  },
});