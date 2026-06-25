import React from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "@/src/theme/ThemeContext";

interface Props {
  checked: boolean;
  onToggle: () => void;
  testID?: string;
}

export function Checkbox({ checked, onToggle, testID }: Props) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleToggle = () => {
    // Brief spring bounce for a satisfying feel
    scale.value = withSequence(
      withSpring(0.78, { duration: 80 }),
      withSpring(1.12, { duration: 100 }),
      withSpring(1, { duration: 120, damping: 14 }),
    );
    onToggle();
  };

  return (
    <Animated.View style={animStyle}>
      <Pressable
        testID={testID}
        hitSlop={10}
        onPress={handleToggle}
        style={[
          styles.box,
          checked
            ? { backgroundColor: colors.brand, borderColor: colors.brand }
            : { borderColor: colors.textMuted },
        ]}
      >
        {checked ? (
          <Feather
            name="check"
            size={14}
            color={colors.scheme === "light" ? "#FFFFFF" : "#052E16"}
          />
        ) : null}
      </Pressable>
    </Animated.View>
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
