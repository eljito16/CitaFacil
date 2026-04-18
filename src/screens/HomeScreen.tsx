import {
  View, Text, StyleSheet, TextInput, FlatList,
  TouchableOpacity, Image, ActivityIndicator, ScrollView,
} from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../hooks/UseAuth";
import { api } from "../services/api";
import { colors } from "../styles/colors";
import { typography } from "../styles/typography";

type CategoryFilter = "all" | "barberia" | "nails" | "maquillaje" | "masajes" | "peluqueria";

const FILTERS: { value: CategoryFilter; label: string }[] = [
  { value: "all",        label: "🔍 Todos"      },
  { value: "barberia",   label: "✂️ Barbería"   },
  { value: "nails",      label: "💅 Uñas"        },
  { value: "maquillaje", label: "💄 Maquillaje"  },
  { value: "masajes",    label: "💆 Masajes"     },
  { value: "peluqueria", label: "💇 Peluquería"  },
];

type StoreType = {
  id: string;
  name: string;
  category: string;
  description: string;
  address: string;
  phone: string;
  rating: number;
  image: string;
  schedule: string;
};

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [stores, setStores]   = useState<StoreType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState<CategoryFilter>("all");

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
    const matchesSearch = store.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || store.category === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={styles.container}>
      {user?.role === "cliente" ? (
        <>
          {/* Buscador */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              placeholder="Buscar tienda..."
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
          </View>

          {/* Filtros — scroll horizontal para las 6 opciones */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterContainer}
          >
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f.value}
                onPress={() => setFilter(f.value)}
                style={[styles.filterButton, filter === f.value && styles.filterSelected]}
              >
                <Text style={[
                  styles.filterText,
                  filter === f.value && styles.filterTextSelected,
                ]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Lista */}
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 30 }} />
          ) : filteredStores.length === 0 ? (
            <Text style={styles.emptyText}>No hay tiendas disponibles</Text>
          ) : (
            <FlatList
              data={filteredStores}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => navigation.navigate("StoreDetail", { store: item })}
                >
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.image} />
                  ) : null}
                  <Text style={typography.cardTitle}>{item.name}</Text>
                  <Text style={styles.categoryBadge}>
                    {FILTERS.find(f => f.value === item.category)?.label ?? item.category}
                  </Text>
                  <Text>⭐ {item.rating || "Sin calificación"}</Text>
                  <Text style={{ color: colors.textSecondary }}>{item.address}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </>
      ) : (
        <>
          <Text style={typography.sectionTitle}>Mi Negocio</Text>
          <View style={styles.card}>
            <Text style={typography.cardTitle}>
              {user?.businessName || "Nombre del negocio"}
            </Text>
            <Text style={{ color: colors.textSecondary }}>
              {user?.description || "Descripción del negocio"}
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  searchInput: { marginLeft: 10, flex: 1 },
  filterScroll: { maxHeight: 50, marginBottom: 12 },
  filterContainer: { flexDirection: "row", gap: 8, paddingRight: 10 },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
  },
  filterSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 13, color: colors.textPrimary },
  filterTextSelected: { color: colors.white, fontWeight: "bold" },
  card: { padding: 15, borderWidth: 1, borderColor: colors.border, borderRadius: 8, marginBottom: 10 },
  image: { width: "100%", height: 150, borderRadius: 8, marginBottom: 10 },
  categoryBadge: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  emptyText: { textAlign: "center", marginTop: 30, fontSize: 16, color: colors.textMuted },
});