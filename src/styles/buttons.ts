import { StyleSheet } from "react-native";
import { colors } from "./colors";

export const buttons = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  primaryText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },
  secondary: {
    backgroundColor: colors.primaryLight,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },
  secondaryText: {
    color: colors.white,
    fontWeight: "bold",
  },
  danger: {
    backgroundColor: colors.dangerButton,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
  },
  dangerText: {
    color: colors.white,
    fontWeight: "bold",
  },
  option: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
    borderColor: colors.border,
  },
  optionSelected: {
    backgroundColor: colors.selected,
    borderColor: colors.primary,
  },
});