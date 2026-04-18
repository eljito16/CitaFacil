import {
  View, Text, StyleSheet, TextInput, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/UseAuth";
import { useBusiness } from "../hooks/UseBusiness";
import { api } from "../services/api";
import { colors } from "../styles/colors";
import { typography } from "../styles/typography";

// ── Categorías disponibles ──
type CategoryType = "barberia" | "nails" | "maquillaje" | "masajes" | "peluqueria";

const CATEGORIES: { value: CategoryType; label: string }[] = [
  { value: "barberia",   label: "✂️ Barbería"   },
  { value: "nails",      label: "💅 Uñas"        },
  { value: "maquillaje", label: "💄 Maquillaje"  },
  { value: "masajes",    label: "💆 Masajes"     },
  { value: "peluqueria", label: "💇 Peluquería"  },
];

// ── Horas disponibles para horario ──
const HOURS = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00",
];

// ── Opciones de duración ──
const DURATION_OPTIONS = [
  { label: "15 min",    value: 15  },
  { label: "30 min",    value: 30  },
  { label: "45 min",    value: 45  },
  { label: "1 hora",    value: 60  },
  { label: "1h 30min",  value: 90  },
  { label: "2 horas",   value: 120 },
  { label: "2h 30min",  value: 150 },
  { label: "3 horas",   value: 180 },
];

export default function BusinessProfileScreen() {
  const { user, logout } = useAuth();
  const {
    business, services, workers,
    loading, saving,
    fetchBusiness, addService, deleteService, addWorker, deleteWorker, saveBusiness,
  } = useBusiness(user?.id);

  // Campos del negocio
  const [name, setName]               = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory]       = useState<CategoryType>("barberia");
  const [address, setAddress]         = useState("");
  const [phone, setPhone]             = useState("");
  const [image, setImage]             = useState("");

  // Horario: hora inicio y hora fin
  const [scheduleStart, setScheduleStart] = useState("09:00");
  const [scheduleEnd, setScheduleEnd]     = useState("18:00");

  // Campos nuevo servicio
  const [serviceName,     setServiceName]     = useState("");
  const [servicePrice,    setServicePrice]    = useState("");
  const [serviceDuration, setServiceDuration] = useState<number>(30);
  const [addingService,   setAddingService]   = useState(false);

  // Campos nuevo trabajador
  const [workerName,      setWorkerName]      = useState("");
  const [workerSpecialty, setWorkerSpecialty] = useState("");
  const [workerPhone,     setWorkerPhone]     = useState("");
  const [addingWorker,    setAddingWorker]    = useState(false);

  useEffect(() => {
    fetchBusiness();
  }, []);

  // Sincronizar campos cuando carga el negocio
  useEffect(() => {
    if (business) {
      setName(business.name || "");
      setDescription(business.description || "");
      setCategory((business.category as CategoryType) || "barberia");
      setAddress(business.address || "");
      setPhone(business.phone || "");
      setImage(business.image || "");
       setCategory((business.category.toLowerCase() as CategoryType) || "barberia");

      // Parsear horario guardado "09:00-18:00"
      if (business.schedule && business.schedule.includes("-")) {
        const [start, end] = business.schedule.split("-");
        setScheduleStart(start.trim());
        setScheduleEnd(end.trim());
      }
    }
  }, [business]);

  const handleSaveBusiness = () => {
    // Guardar horario como "09:00-18:00"
    const schedule = `${scheduleStart}-${scheduleEnd}`;
    saveBusiness({ name, description,  category: category.toLowerCase() as CategoryType, address, phone, schedule, image });
  };

  const handleAddService = async () => {
    if (!serviceName || !servicePrice) {
      Alert.alert("Error", "Nombre y precio son obligatorios");
      return;
    }
    if (!business) return;
    setAddingService(true);
    await addService(business.id, serviceName, Number(servicePrice), serviceDuration);
    setServiceName("");
    setServicePrice("");
    setServiceDuration(30);
    setAddingService(false);
  };

  const handleAddWorker = async () => {
    if (!workerName || !business) return;
    setAddingWorker(true);
    await addWorker(business.id, workerName, workerSpecialty, workerPhone);
    setWorkerName("");
    setWorkerSpecialty("");
    setWorkerPhone("");
    setAddingWorker(false);
  };

  const handleDeleteBusiness = () => {
    Alert.alert(
      "Eliminar negocio",
      "¿Estás seguro? Esta acción eliminará el negocio, servicios, trabajadores y citas. No se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/businesses/${business?.id}`);
              Alert.alert("Éxito", "Negocio eliminado correctamente");
              fetchBusiness();
            } catch (error: any) {
              Alert.alert("Error", error.response?.data?.message || "No se pudo eliminar el negocio");
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Eliminar cuenta",
      "¿Estás seguro? Esta acción eliminará tu cuenta y todos tus datos permanentemente. No se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, eliminar cuenta",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete("/auth/account");
              logout();
            } catch (error: any) {
              Alert.alert("Error", error.response?.data?.message || "No se pudo eliminar la cuenta");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={typography.screenTitle}>Mi Negocio</Text>

      <Text style={typography.label}>Usuario</Text>
      <Text style={styles.infoText}>{user?.username}</Text>

      {/* ── INFORMACIÓN DEL NEGOCIO ── */}
      <Text style={typography.sectionTitle}>Información del Negocio</Text>

      <Text style={typography.label}>Nombre *</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Ej: Barbería El Maestro"
      />

      <Text style={typography.label}>Descripción</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Describe tu negocio..."
        multiline
        numberOfLines={3}
      />

      {/* ── CATEGORÍAS ── */}
      <Text style={typography.label}>Categoría *</Text>
      <View style={styles.categoryContainer}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.value}
            style={[styles.categoryButton, category === cat.value && styles.categorySelected]}
            onPress={() => setCategory(cat.value)}
          >
            <Text style={styles.categoryText}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={typography.label}>Dirección</Text>
      <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Ej: Calle 123 #45-67" />

      <Text style={typography.label}>Teléfono</Text>
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Ej: 3001234567" keyboardType="phone-pad" />

      {/* ── HORARIO ── */}
      <Text style={typography.label}>Horario de atención</Text>
      <View style={styles.scheduleContainer}>
        <View style={styles.scheduleColumn}>
          <Text style={styles.scheduleLabel}>Apertura</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.hoursRow}>
              {HOURS.map((h) => (
                <TouchableOpacity
                  key={h}
                  style={[styles.hourChip, scheduleStart === h && styles.hourChipSelected]}
                  onPress={() => setScheduleStart(h)}
                >
                  <Text style={scheduleStart === h ? styles.hourChipTextSelected : styles.hourChipText}>
                    {h}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.scheduleColumn}>
          <Text style={styles.scheduleLabel}>Cierre</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.hoursRow}>
              {HOURS.map((h) => (
                <TouchableOpacity
                  key={h}
                  style={[styles.hourChip, scheduleEnd === h && styles.hourChipSelected]}
                  onPress={() => setScheduleEnd(h)}
                >
                  <Text style={scheduleEnd === h ? styles.hourChipTextSelected : styles.hourChipText}>
                    {h}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
      <Text style={styles.schedulePreview}>
        🕒 Horario seleccionado: {scheduleStart} - {scheduleEnd}
      </Text>

      <Text style={typography.label}>URL de imagen</Text>
      <TextInput style={styles.input} value={image} onChangeText={setImage} placeholder="https://..." />

      <TouchableOpacity
        style={[styles.saveButton, saving && { opacity: 0.6 }]}
        onPress={handleSaveBusiness}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {saving ? "Guardando..." : business ? "Actualizar Negocio" : "Crear Negocio"}
        </Text>
      </TouchableOpacity>

      {business && (
        <>
          {/* ── SERVICIOS ── */}
          <Text style={typography.sectionTitle}>Mis Servicios</Text>

          {services.length === 0 ? (
            <Text style={styles.emptyText}>No tienes servicios agregados</Text>
          ) : (
            services.map((service) => (
              <View key={service.id} style={styles.card}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{service.name}</Text>
                  <Text style={styles.cardDetails}>
                    ${Number(service.price).toLocaleString()} · {
                      service.duration >= 60
                        ? `${Math.floor(service.duration / 60)}h${service.duration % 60 > 0 ? ` ${service.duration % 60}min` : ""}`
                        : `${service.duration} min`
                    }
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteService(service.id, business.id)}
                >
                  <Text style={styles.deleteText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))
          )}

          {/* ── AGREGAR SERVICIO ── */}
          <Text style={typography.sectionTitle}>Agregar Servicio</Text>

          <Text style={typography.label}>Nombre del servicio</Text>
          <TextInput style={styles.input} value={serviceName} onChangeText={setServiceName} placeholder="Ej: Corte clásico" />

          <Text style={typography.label}>Precio</Text>
          <TextInput style={styles.input} value={servicePrice} onChangeText={setServicePrice} placeholder="Ej: 25000" keyboardType="numeric" />

          <Text style={typography.label}>Duración</Text>
          <View style={styles.durationContainer}>
            {DURATION_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.durationChip, serviceDuration === opt.value && styles.durationChipSelected]}
                onPress={() => setServiceDuration(opt.value)}
              >
                <Text style={serviceDuration === opt.value ? styles.durationChipTextSelected : styles.durationChipText}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.addButton, addingService && { opacity: 0.6 }]}
            onPress={handleAddService}
            disabled={addingService}
          >
            <Text style={styles.addButtonText}>
              {addingService ? "Agregando..." : "+ Agregar Servicio"}
            </Text>
          </TouchableOpacity>

          {/* ── TRABAJADORES ── */}
          <Text style={typography.sectionTitle}>Mis Trabajadores</Text>

          {workers.length === 0 ? (
            <Text style={styles.emptyText}>No tienes trabajadores agregados</Text>
          ) : (
            workers.map((worker) => (
              <View key={worker.id} style={styles.card}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>✂️ {worker.name}</Text>
                  {worker.specialty ? (
                    <Text style={styles.cardDetails}>🛠 {worker.specialty}</Text>
                  ) : null}
                  {worker.phone ? (
                    <Text style={styles.cardDetails}>📞 {worker.phone}</Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteWorker(worker.id, business.id)}
                >
                  <Text style={styles.deleteText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))
          )}

          {/* ── AGREGAR TRABAJADOR ── */}
          <Text style={typography.sectionTitle}>Agregar Trabajador</Text>

          <Text style={typography.label}>Nombre *</Text>
          <TextInput style={styles.input} value={workerName} onChangeText={setWorkerName} placeholder="Ej: Carlos Gómez" />

          {/* Especialidad = selección de servicios existentes */}
          <Text style={typography.label}>Especialidad (servicios que realiza)</Text>
          {services.length === 0 ? (
            <Text style={styles.emptyText}>Agrega servicios primero para asignar especialidad</Text>
          ) : (
            <View style={styles.specialtyContainer}>
              {services.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  style={[
                    styles.specialtyChip,
                    workerSpecialty === service.name && styles.specialtyChipSelected,
                  ]}
                  onPress={() =>
                    setWorkerSpecialty(
                      workerSpecialty === service.name ? "" : service.name
                    )
                  }
                >
                  <Text style={workerSpecialty === service.name ? styles.specialtyChipTextSelected : styles.specialtyChipText}>
                    {service.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={typography.label}>Teléfono</Text>
          <TextInput style={styles.input} value={workerPhone} onChangeText={setWorkerPhone} placeholder="Ej: 3001234567" keyboardType="phone-pad" />

          <TouchableOpacity
            style={[styles.addButton, addingWorker && { opacity: 0.6 }]}
            onPress={handleAddWorker}
            disabled={addingWorker}
          >
            <Text style={styles.addButtonText}>
              {addingWorker ? "Agregando..." : "+ Agregar Trabajador"}
            </Text>
          </TouchableOpacity>

          {/* ── ELIMINAR NEGOCIO ── */}
          <Text style={typography.sectionTitle}>Zona de peligro</Text>

          <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteBusiness}>
            <Text style={styles.dangerButtonText}>🗑️ Eliminar negocio</Text>
          </TouchableOpacity>
        </>
      )}

      {/* ── ELIMINAR CUENTA ── */}
      <TouchableOpacity style={[styles.dangerButton, { marginTop: 15 }]} onPress={handleDeleteAccount}>
        <Text style={styles.dangerButtonText}>❌ Eliminar cuenta</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: colors.textSecondary },
  infoText: { fontSize: 16, color: colors.textSecondary },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10 },
  textArea: { height: 80, textAlignVertical: "top" },

  // Categorías
  categoryContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 5 },
  categoryButton: { padding: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 8, alignItems: "center" },
  categorySelected: { backgroundColor: colors.selected, borderColor: colors.primary },
  categoryText: { fontSize: 13 },

  // Horario
  scheduleContainer: { gap: 12, marginTop: 5 },
  scheduleColumn: { gap: 6 },
  scheduleLabel: { fontWeight: "bold", color: colors.textSecondary, fontSize: 13 },
  hoursRow: { flexDirection: "row", gap: 6 },
  hourChip: { paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: colors.border, borderRadius: 20 },
  hourChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  hourChipText: { fontSize: 13, color: colors.textPrimary },
  hourChipTextSelected: { fontSize: 13, color: colors.white, fontWeight: "bold" },
  schedulePreview: { marginTop: 10, fontWeight: "bold", color: colors.textSecondary },

  // Duración
  durationContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 5 },
  durationChip: { paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: colors.border, borderRadius: 20 },
  durationChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  durationChipText: { fontSize: 13, color: colors.textPrimary },
  durationChipTextSelected: { fontSize: 13, color: colors.white, fontWeight: "bold" },

  // Especialidad trabajador
  specialtyContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 5 },
  specialtyChip: { paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: colors.border, borderRadius: 20 },
  specialtyChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  specialtyChipText: { fontSize: 13, color: colors.textPrimary },
  specialtyChipTextSelected: { fontSize: 13, color: colors.white, fontWeight: "bold" },

  // Cards
  emptyText: { color: colors.textMuted, fontStyle: "italic", marginBottom: 10 },
  card: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 8, marginBottom: 8 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: "bold" },
  cardDetails: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  deleteButton: { padding: 8 },
  deleteText: { fontSize: 18 },

  // Botones
  saveButton: { backgroundColor: colors.primary, padding: 15, borderRadius: 8, alignItems: "center", marginTop: 20 },
  saveButtonText: { color: colors.white, fontWeight: "bold" },
  addButton: { backgroundColor: colors.primaryLight, padding: 15, borderRadius: 8, alignItems: "center", marginTop: 15 },
  addButtonText: { color: colors.white, fontWeight: "bold" },
  dangerButton: { backgroundColor: colors.dangerButton, padding: 15, borderRadius: 8, alignItems: "center", marginTop: 10 },
  dangerButtonText: { color: colors.white, fontWeight: "bold" },
  logoutButton: { backgroundColor: colors.border, padding: 15, borderRadius: 8, alignItems: "center", marginTop: 15, marginBottom: 40 },
  logoutButtonText: { color: colors.textPrimary, fontWeight: "bold" },
});