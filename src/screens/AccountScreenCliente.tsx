import {  View,  Text,  Button,  StyleSheet,  TextInput,  ScrollView,  TouchableOpacity,  Alert,} from "react-native";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { UserContext } from "../context/UserContext";

export default function AccountScreen() {
  const { logout } = useContext(AuthContext);

  const userContext = useContext(UserContext);
  if (!userContext) {
    throw new Error("AccountScreen must be used inside UserProvider");
  }

  const { user, saveUser, updateUser } = userContext;

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [photo, setPhoto] = useState("");

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setPhone(user.phone);
      setAddress(user.address);
      setPhoto(user.photo);
    }
  }, [user]);

  const handleSave = () => {
    if (!fullName || !phone || !address) {
      Alert.alert("Error", "Debes completar todos los campos obligatorios");
      return;
    }

    if (!user) {
      saveUser({
        id: Date.now().toString(),
        fullName,
        phone,
        address,
        photo,
      });
      Alert.alert("Éxito", "Perfil creado correctamente");
    } else {
      updateUser({
        fullName,
        phone,
        address,
        photo,
      });
      Alert.alert("Éxito", "Perfil actualizado correctamente");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Mi Perfil</Text>

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

      <Text style={styles.label}>Foto (URL opcional)</Text>
      <TextInput
        style={styles.input}
        value={photo}
        onChangeText={setPhoto}
        placeholder="https://..."
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>
          {user ? "Actualizar Perfil" : "Guardar Perfil"}
        </Text>
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