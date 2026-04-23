import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useAuth } from "../hooks/UseAuth";
import { colors } from "../styles/colors";
import { typography } from "../styles/typography";

export default function RegisterScreen() {
  const { register } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"cliente" | "negocio">("cliente");

  const handleRegister = () => {
    if (!username || !password) {
      alert("Completa todos los campos");
      return;
    }
    register(username, password, role);
  };

  return (
    <View style={styles.container}>
      <Text style={[typography.screenTitle, styles.centered]}>Crear Cuenta</Text>

      <TextInput
        placeholder="Usuario"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        placeholder="Contraseña"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <Text style={typography.label}>Selecciona tu rol:</Text>

      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[styles.roleButton, role === "cliente" && styles.selectedRole]}
          onPress={() => setRole("cliente")}
        >
          <Text>Cliente</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleButton, role === "negocio" && styles.selectedRole]}
          onPress={() => setRole("negocio")}
        >
          <Text>Negocio</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  centered: { textAlign: "center", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  roleContainer: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  roleButton: { padding: 10, borderWidth: 1, borderRadius: 8, width: 100, alignItems: "center" },
  selectedRole: { backgroundColor: colors.selected },
  button: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: colors.white, fontWeight: "bold" },
});

function alert(arg0: string) {
  throw new Error("Function not implemented.");
}
