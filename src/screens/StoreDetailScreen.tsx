import {
  View, Text, StyleSheet, Image, TouchableOpacity,
  ScrollView, ActivityIndicator,
} from "react-native";
import { RouteProp, useRoute, useNavigation, NavigationProp } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { StoreType } from "../types/Store";
import { api } from "../services/api";
import { HomeStackParamList } from "../navigation/HomeStackNavigator";
import { colors } from "../styles/colors";
import { typography } from "../styles/typography";

type RouteParams = RouteProp<HomeStackParamList, "StoreDetail">;

type ServiceType = {
  id: string;
  name: string;
  price: number;
  duration: number;
};

export default function StoreDetailScreen() {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<NavigationProp<HomeStackParamList>>();
  const { store } = route.params;

  const [services, setServices] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/services/${store.id}`);
      setServices(response.data.services);
    } catch (error) {
      console.error("Error cargando servicios:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = () => {
    navigation.navigate("Booking", { storeName: store.name, storeId: store.id });
  };

  return (
    <ScrollView style={styles.container}>
      {store.image ? (
        <Image source={{ uri: store.image }} style={styles.image} />
      ) : null}

      <Text style={styles.title}>{store.name}</Text>
      <Text style={styles.rating}>⭐ {store.rating || "Sin calificación"}</Text>
      <Text style={styles.description}>{store.description}</Text>

      {/* Información */}
      <View style={styles.section}>
        <Text style={typography.sectionTitle}>Información</Text>
        <Text>📍 {store.address}</Text>
        <Text>📞 {store.phone}</Text>
        <Text>🕒 {store.schedule}</Text>
      </View>

      {/* Servicios */}
      <View style={styles.section}>
        <Text style={typography.sectionTitle}>Servicios</Text>
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : services.length === 0 ? (
          <Text style={styles.emptyText}>No hay servicios disponibles</Text>
        ) : (
          services.map((service) => (
            <View key={service.id} style={styles.serviceCard}>
              <Text style={{ fontSize: 16 }}>{service.name}</Text>
              <View>
                <Text style={styles.servicePrice}>
                  ${Number(service.price).toLocaleString()}
                </Text>
                <Text style={styles.serviceDuration}>⏱ {service.duration} min</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleReserve}>
        <Text style={styles.buttonText}>Reservar cita</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  image: { width: "100%", height: 220 },
  title: { fontSize: 22, fontWeight: "bold", margin: 15 },
  rating: { marginHorizontal: 15, marginBottom: 10, fontSize: 16 },
  description: { marginHorizontal: 15, marginBottom: 15, color: colors.textSecondary },
  section: { marginHorizontal: 15, marginBottom: 20 },
  serviceCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  servicePrice: { fontWeight: "bold", textAlign: "right" },
  serviceDuration: { fontSize: 12, color: colors.textMuted, textAlign: "right" },
  emptyText: { color: colors.textMuted, fontStyle: "italic" },
  button: {
    backgroundColor: colors.primary,
    margin: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: colors.white, fontWeight: "bold" },
});