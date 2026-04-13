import {  View,  Text,  Button,  StyleSheet,  TextInput,  ScrollView,  TouchableOpacity,  Alert,} from "react-native";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { api } from "../services/api";

export default function AccountScreen() {
  const { logout, user } = useContext(AuthContext);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

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
      await api.put("/auth/profile", {
        full_name: fullName,
        phone,
        address,
      });

      Alert.alert("Éxito", "Perfil actualizado correctamente");

    } catch (error: any) {
      const message = error.response?.data?.message || "Error al actualizar perfil";
      Alert.alert("Error", message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Mi Perfil</Text>

      <Text style={styles.label}>Usuario</Text>
      <Text style={styles.username}>{user?.username}</Text>

      <Text style={styles.label}>Rol</Text>
      <Text style={styles.username}>{user?.role}</Text>

      <Text style={styles.label}>Nombre Completo *</Text>
      <TextInput
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
        placeholder="Ej: Juan Pérez"
      />

      <Text style={styles.label}>Teléfono *</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="Ej: 3001234567"
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Dirección *</Text>
      <TextInput
        style={styles.input}
        value={address}
        onChangeText={setAddress}
        placeholder="Ej: Calle 123 #45-67"
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Actualizar Perfil</Text>
      </TouchableOpacity>

      <View style={{ marginTop: 30 }}>
        <Button title="Cerrar sesión" onPress={logout} />
      </View>
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
    marginBottom: 20,
  },
  label: {
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 5,
  },
  username: {
    fontSize: 16,
    color: "#555",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  saveButton: {
    backgroundColor: "black",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 25,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});