import { StyleSheet } from "react-native";
import { colors } from "./colors";

export const typography = StyleSheet.create({
  screenTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 25,
    marginBottom: 10,
  },
  label: {
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 5,
  },
  bodyLarge: {
    fontSize: 16,
  },
  bodyMedium: {
    fontSize: 15,
  },
  bodySmall: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  muted: {
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: "italic",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
});