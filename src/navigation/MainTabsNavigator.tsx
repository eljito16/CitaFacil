import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeStackNavigator from "./HomeStackNavigator";
import AccountScreen from "../screens/AccountScreenCliente";
import AgendaScreen from "../screens/AgendaScreenNegocio";

export type MainTabParamList = {
  Home: undefined;
  Agenda: undefined;
  Account: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabsNavigator() {
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
        component={AgendaScreen}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
      />
    </Tab.Navigator>
  );
}