import {
  View, Text, StyleSheet, TextInput,
  ScrollView, TouchableOpacity, Alert,
} from "react-native";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/UseAuth";
import { api } from "../services/api";
import { colors } from "../styles/colors";
import { typography } from "../styles/typography";

export default function AccountScreen() {
  const { logout, user } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone]       = useState("");
  const [address, setAddress]   = useState("");

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setPhone(user.phone || "");
      setAddress(user.address || "");
    }
  }, [user]);

  const handleSave = async () => {
    if (!fullName || !phone || !address) {
      Alert.alert("Error", "Debes completar todos los campos obligatorios");
      return;
    }
    try {
      await api.put("/auth/profile", { full_name: fullName, phone, address });
      Alert.alert("Éxito", "Perfil actualizado correctamente");
    } catch (error: any) {
      const message = error.response?.data?.message || "Error al actualizar perfil";
      Alert.alert("Error", message);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Eliminar cuenta",
      "¿Estás seguro? Esta acción eliminará tu cuenta y todas tus citas permanentemente. No se puede deshacer.",
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={typography.screenTitle}>Mi Perfil</Text>

      <Text style={typography.label}>Usuario</Text>
      <Text style={styles.infoText}>{user?.username}</Text>

      <Text style={typography.label}>Rol</Text>
      <Text style={styles.infoText}>{user?.role}</Text>

      <Text style={typography.label}>Nombre Completo *</Text>
      <TextInput
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
        placeholder="Ej: Juan Pérez"
      />

      <Text style={typography.label}>Teléfono *</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="Ej: 3001234567"
        keyboardType="phone-pad"
      />

      <Text style={typography.label}>Dirección *</Text>
      <TextInput
        style={styles.input}
        value={address}
        onChangeText={setAddress}
        placeholder="Ej: Calle 123 #45-67"
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Actualizar Perfil</Text>
      </TouchableOpacity>

      {/* Zona de peligro */}
      <Text style={typography.sectionTitle}>Zona de peligro</Text>

      <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAccount}>
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
  infoText: { fontSize: 16, color: colors.textSecondary },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10 },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 15, borderRadius: 8,
    alignItems: "center", marginTop: 25,
  },
  saveButtonText: { color: colors.white, fontWeight: "bold" },
  dangerButton: {
    backgroundColor: colors.dangerButton,
    padding: 15, borderRadius: 8,
    alignItems: "center", marginTop: 10,
  },
  dangerButtonText: { color: colors.white, fontWeight: "bold" },
  logoutButton: {
    backgroundColor: colors.border,
    padding: 15, borderRadius: 8,
    alignItems: "center", marginTop: 15, marginBottom: 40,
  },
  logoutButtonText: { color: colors.textPrimary, fontWeight: "bold" },
});