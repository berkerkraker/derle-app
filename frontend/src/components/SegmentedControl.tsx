import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

import { useTheme } from "@/src/theme/ThemeContext";

export interface SegOption {
  label: string;
  value: string;
}

interface Props {
  options: SegOption[];
  value: string;
  onChange: (value: string) => void;
  testIDPrefix?: string;
}

export function SegmentedControl({ options, value, onChange, testIDPrefix }: Props) {
  const { colors } = useTheme();
  return (
    <View style={[styles.wrap, { backgroundColor: colors.input }]}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            testID={testIDPrefix ? `${testIDPrefix}-${opt.value}` : undefined}
            onPress={() => onChange(opt.value)}
            style={[
              styles.option,
              active && {
                backgroundColor: colors.card,
                boxShadow:
                  colors.scheme === "light"
                    ? "0px 2px 6px rgba(0,0,0,0.12)"
                    : "0px 2px 6px rgba(0,0,0,0.4)",
                elevation: 2,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: active ? colors.text : colors.textSecondary, fontWeight: active ? "700" : "500" },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  option: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 15,
  },
});
