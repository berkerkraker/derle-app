import React from "react";
import { Pressable, View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "@/src/theme/ThemeContext";

interface Props {
  checked: boolean;
  onToggle: () => void;
  testID?: string;
}

export function Checkbox({ checked, onToggle, testID }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      testID={testID}
      hitSlop={10}
      onPress={onToggle}
      style={[
        styles.box,
        checked
          ? { backgroundColor: colors.brand, borderColor: colors.brand }
          : { borderColor: colors.textMuted },
      ]}
    >
      {checked ? (
        <Feather name="check" size={15} color={colors.scheme === "light" ? "#FFFFFF" : "#052E16"} />
      ) : (
        <View />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
