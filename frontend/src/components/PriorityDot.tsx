import React from "react";
import { View, StyleSheet } from "react-native";

import { Priority } from "@/src/types";
import { PRIORITY_COLOR } from "@/src/theme/colors";

export function PriorityDot({ priority, size = 8 }: { priority: Priority; size?: number }) {
  if (priority === "low") return null;
  return (
    <View
      style={[
        styles.dot,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: PRIORITY_COLOR[priority] },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  dot: {},
});
