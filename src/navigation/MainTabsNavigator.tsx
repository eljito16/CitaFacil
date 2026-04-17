import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import HomeStackNavigator from "./HomeStackNavigator";
import AccountScreenCliente from "../screens/AccountScreenCliente";
import AgendaScreenNegocio from "../screens/AgendaScreenNegocio";
import BusinessProfileScreen from "../screens/BusinessProfileScreen";

export type MainTabParamList = {
  Home: undefined;
  Agenda: undefined;
  Account: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabsNavigator() {
  const { user } = useContext(AuthContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Agenda") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "Account") {
            iconName = focused ? "person" : "person-outline";
          } else {
            iconName = "ellipse";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarShowLabel: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Agenda"
        component={AgendaScreenNegocio}
      />
      <Tab.Screen
        name="Account"
        component={user?.role === "negocio" ? BusinessProfileScreen : AccountScreenCliente}
      />
    </Tab.Navigator>
  );
}