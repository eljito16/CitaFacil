import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import StoreDetailScreen from "../screens/StoreDetailScreen";
import BookingScreen from "../screens/BookingScreen";
import { StoreType } from "../types/Store";

export type HomeStackParamList = {
  HomeScreen: undefined;
  StoreDetail: { store: StoreType };
  Booking: { storeName: string; storeId: string };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ title: "Tiendas" }}
      />
      <Stack.Screen
        name="StoreDetail"
        component={StoreDetailScreen}
        options={{ title: "Detalle de tienda" }}
      />
      <Stack.Screen
        name="Booking"
        component={BookingScreen}
        options={{ title: "Reservar cita" }}
      />
    </Stack.Navigator>
  );
}