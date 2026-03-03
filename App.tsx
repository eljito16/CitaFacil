import { AppointmentProvider } from "./src/context/AppointmentContext";
import { AuthProvider } from "./src/context/AuthContext";
import Navigation from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <AuthProvider>
      <AppointmentProvider>
        <Navigation />
      </AppointmentProvider>
    </AuthProvider>
  );
}