import { AppointmentProvider } from "./src/context/AppointmentContext";
import { AuthProvider } from "./src/context/AuthContext";
import { UserProvider } from "./src/context/UserContext";
import Navigation from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <AppointmentProvider>
          <Navigation />
        </AppointmentProvider>
      </UserProvider>
    </AuthProvider>
  );
}