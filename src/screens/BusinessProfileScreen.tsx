import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  Button,
  ActivityIndicator,
} from "react-native";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { api } from "../services/api";

type Service = {
  id: string;
  name: string;
  price: number;
  duration: number;
};

type Business = {
  id: string;
  name: string;
  description: string;
  category: string;
  address: string;
  phone: string;
  schedule: string;
  image: string;
};

export default function BusinessProfileScreen() {
  const { logout, user } = useContext(AuthContext);

  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Campos del negocio
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"barberia" | "nails">("barberia");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [schedule, setSchedule] = useState("");
  const [image, setImage] = useState("");

  // Campos nuevo servicio
  const [serviceName, setServiceName] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceDuration, setServiceDuration] = useState("");
  const [addingService, setAddingService] = useState(false);

  useEffect(() => {
    fetchBusiness();
  }, []);

  const fetchBusiness = async () => {
    try {
      setLoading(true);
      const response = await api.get("/businesses");
      const businesses = response.data.businesses;

      const myBusiness = businesses.find(
        (b: any) => b.owner_id === Number(user?.id)
      );

      if (myBusiness) {
        setBusiness(myBusiness);
        setName(myBusiness.name || "");
        setDescription(myBusiness.description || "");
        setCategory(myBusiness.category || "barberia");
        setAddress(myBusiness.address || "");
        setPhone(myBusiness.phone || "");
        setSchedule(myBusiness.schedule || "");
        setImage(myBusiness.image || "");

        fetchServices(myBusiness.id);
      }
    } catch (error) {
      console.error("Error cargando negocio:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async (businessId: string) => {
    try {
      const response = await api.get(`/services/${businessId}`);
      setServices(response.data.services);
    } catch (error) {
      console.error("Error cargando servicios:", error);
    }
  };

  const handleSaveBusiness = async () => {
    if (!name || !category) {
      Alert.alert("Error", "Nombre y categoría son obligatorios");
      return;
    }

    try {
      setSaving(true);

      if (business) {
        await api.put(`/businesses/${business.id}`, {
          name, description, category, address, phone, schedule, image,
        });
        Alert.alert("Éxito", "Negocio actualizado correctamente");
      } else {
        const response = await api.post("/businesses", {
          name, description, category, address, phone, schedule, image,
        });
        setBusiness(response.data.business);
        Alert.alert("Éxito", "Negocio creado correctamente");
      }

      fetchBusiness();

    } catch (error: any) {
      const message = error.response?.data?.message || "Error al guardar negocio";
      Alert.alert("Error", message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddService = async () => {
    if (!serviceName || !servicePrice || !serviceDuration) {
      Alert.alert("Error", "Todos los campos del servicio son obligatorios");
      return;
    }

    if (!business) {
      Alert.alert("Error", "Primero debes crear el negocio");
      return;
    }

    try {
      setAddingService(true);
      await api.post("/services", {
        business_id: business.id,
        name: serviceName,
        price: Number(servicePrice),
        duration: Number(serviceDuration),
      });

      Alert.alert("Éxito", "Servicio agregado correctamente");
      setServiceName("");
      setServicePrice("");
      setServiceDuration("");
      fetchServices(business.id);

    } catch (error: any) {
      const message = error.response?.data?.message || "Error al agregar servicio";
      Alert.alert("Error", message);
    } finally {
      setAddingService(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    Alert.alert(
      "Eliminar servicio",
      "¿Estás seguro que deseas eliminar este servicio?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/services/${serviceId}`);
              Alert.alert("Éxito", "Servicio eliminado correctamente");
              if (business) fetchServices(business.id);
            } catch (error: any) {
              Alert.alert("Error", "No se pudo eliminar el servicio");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="black" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Mi Negocio</Text>

      {/* Info del usuario */}
      <Text style={styles.label}>Usuario</Text>
      <Text style={styles.infoText}>{user?.username}</Text>

      {/* Formulario negocio */}
      <Text style={styles.sectionTitle}>Información del Negocio</Text>

      <Text style={styles.label}>Nombre *</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Ej: Barbería El Maestro"
      />

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Describe tu negocio..."
        multiline
        numberOfLines={3}
      />

      <Text style={styles.label}>Categoría *</Text>
      <View style={styles.categoryContainer}>
        <TouchableOpacity
          style={[
            styles.categoryButton,
            category === "barberia" && styles.categorySelected,
          ]}
          onPress={() => setCategory("barberia")}
        >
          <Text>✂️ Barbería</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.categoryButton,
            category === "nails" && styles.categorySelected,
          ]}
          onPress={() => setCategory("nails")}
        >
          <Text>💅 Uñas</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Dirección</Text>
      <TextInput
        style={styles.input}
        value={address}
        onChangeText={setAddress}
        placeholder="Ej: Calle 123 #45-67"
      />

      <Text style={styles.label}>Teléfono</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="Ej: 3001234567"
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Horario</Text>
      <TextInput
        style={styles.input}
        value={schedule}
        onChangeText={setSchedule}
        placeholder="Ej: Lunes a Sábado 9:00 AM - 7:00 PM"
      />

      <Text style={styles.label}>URL de imagen</Text>
      <TextInput
        style={styles.input}
        value={image}
        onChangeText={setImage}
        placeholder="https://..."
      />

      <TouchableOpacity
        style={[styles.saveButton, saving && { opacity: 0.6 }]}
        onPress={handleSaveBusiness}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {saving ? "Guardando..." : business ? "Actualizar Negocio" : "Crear Negocio"}
        </Text>
      </TouchableOpacity>

      {/* Servicios */}
      {business && (
        <>
          <Text style={styles.sectionTitle}>Mis Servicios</Text>

          {services.length === 0 ? (
            <Text style={styles.emptyText}>No tienes servicios agregados</Text>
          ) : (
            services.map((service) => (
              <View key={service.id} style={styles.serviceCard}>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceDetails}>
                    ${Number(service.price).toLocaleString()} · {service.duration} min
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteService(service.id)}
                >
                  <Text style={styles.deleteText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))
          )}

          {/* Agregar servicio */}
          <Text style={styles.sectionTitle}>Agregar Servicio</Text>

          <Text style={styles.label}>Nombre del servicio</Text>
          <TextInput
            style={styles.input}
            value={serviceName}
            onChangeText={setServiceName}
            placeholder="Ej: Corte clásico"
          />

          <Text style={styles.label}>Precio</Text>
          <TextInput
            style={styles.input}
            value={servicePrice}
            onChangeText={setServicePrice}
            placeholder="Ej: 25000"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Duración (minutos)</Text>
          <TextInput
            style={styles.input}
            value={serviceDuration}
            onChangeText={setServiceDuration}
            placeholder="Ej: 30"
            keyboardType="numeric"
          />

          <TouchableOpacity
            style={[styles.addButton, addingService && { opacity: 0.6 }]}
            onPress={handleAddService}
            disabled={addingService}
          >
            <Text style={styles.addButtonText}>
              {addingService ? "Agregando..." : "+ Agregar Servicio"}
            </Text>
          </TouchableOpacity>
        </>
      )}

      <View style={{ marginTop: 30, marginBottom: 20 }}>
        <Button title="Cerrar sesión" onPress={logout} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: "#555" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginTop: 25, marginBottom: 10 },
  label: { fontWeight: "bold", marginTop: 12, marginBottom: 5 },
  infoText: { fontSize: 16, color: "#555" },
  input: { borderWidth: 1, borderRadius: 8, padding: 10 },
  textArea: { height: 80, textAlignVertical: "top" },
  categoryContainer: { flexDirection: "row", justifyContent: "space-around", marginTop: 5 },
  categoryButton: { padding: 12, borderWidth: 1, borderRadius: 8, width: 130, alignItems: "center" },
  categorySelected: { backgroundColor: "#ddd", borderColor: "black" },
  saveButton: { backgroundColor: "black", padding: 15, borderRadius: 8, alignItems: "center", marginTop: 20 },
  saveButtonText: { color: "white", fontWeight: "bold" },
  emptyText: { color: "#888", fontStyle: "italic", marginBottom: 10 },
  serviceCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, borderWidth: 1, borderRadius: 8, marginBottom: 8 },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 16, fontWeight: "bold" },
  serviceDetails: { fontSize: 13, color: "#555", marginTop: 2 },
  deleteButton: { padding: 8 },
  deleteText: { fontSize: 18 },
  addButton: { backgroundColor: "#333", padding: 15, borderRadius: 8, alignItems: "center", marginTop: 15 },
  addButtonText: { color: "white", fontWeight: "bold" },
});