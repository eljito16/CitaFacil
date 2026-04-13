import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useState, useContext, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { api } from "../services/api";

type ServiceType = {
  id: string;
  name: string;
  price: number;
  duration: number;
};

type StoreType = {
  id: string;
  name: string;
  category: "barberia" | "nails";
  description: string;
  address: string;
  phone: string;
  rating: number;
  image: string;
  schedule: string;
  services: ServiceType[];
};

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useContext(AuthContext);

  const [stores, setStores] = useState<StoreType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "barberia" | "nails">("all");

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await api.get("/businesses");
      setStores(response.data.businesses);
    } catch (error) {
      console.error("Error cargando tiendas:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStores = stores.filter((store) => {
    const matchesSearch = store.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesFilter = filter === "all" || store.category === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={styles.container}>
      {user?.role === "cliente" ? (
        <>
          {/* Buscador */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} />
            <TextInput
              placeholder="Buscar tienda..."
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
          </View>

          {/* Filtros */}
          <View style={styles.filterContainer}>
            <TouchableOpacity
              onPress={() => setFilter("barberia")}
              style={[
                styles.filterButton,
                filter === "barberia" && styles.filterSelected,
              ]}
            >
              <Text>Barbería</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFilter("nails")}
              style={[
                styles.filterButton,
                filter === "nails" && styles.filterSelected,
              ]}
            >
              <Text>Uñas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFilter("all")}
              style={[
                styles.filterButton,
                filter === "all" && styles.filterSelected,
              ]}
            >
              <Text>Todos</Text>
            </TouchableOpacity>
          </View>

          {/* Loading */}
          {loading ? (
            <ActivityIndicator size="large" color="black" style={{ marginTop: 30 }} />
          ) : filteredStores.length === 0 ? (
            <Text style={styles.emptyText}>No hay tiendas disponibles</Text>
          ) : (
            /* Lista */
            <FlatList
              data={filteredStores}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.card}
                  onPress={() =>
                    navigation.navigate("StoreDetail", { store: item })
                  }
                >
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.image} />
                  ) : null}
                  <Text style={styles.title}>{item.name}</Text>
                  <Text>⭐ {item.rating}</Text>
                  <Text>{item.address}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </>
      ) : (
        <>
          {/* Vista Negocio */}
          <Text style={styles.sectionTitle}>Mi Negocio</Text>

          <View style={styles.card}>
            <Text style={styles.title}>
              {user?.businessName || "Nombre del negocio"}
            </Text>
            <Text>
              {user?.description || "Descripción del negocio"}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Servicios</Text>

          <View style={styles.card}>
            <Text>• Corte clásico</Text>
            <Text>• Corte moderno</Text>
            <Text>• Barba</Text>
          </View>
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  searchInput: {
    marginLeft: 10,
    flex: 1,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  filterButton: {
    padding: 8,
    borderWidth: 1,
    borderRadius: 5,
  },
  filterSelected: {
    backgroundColor: "#ddd",
  },
  card: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 10,
  },
  image: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
    color: "#888",
  },
});