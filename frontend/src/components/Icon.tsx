import React from "react";
import { Feather, Ionicons } from "@expo/vector-icons";

import { IconFamily } from "@/src/constants/categories";

interface Props {
  family: IconFamily;
  name: string;
  size?: number;
  color: string;
}

export function Icon({ family, name, size = 20, color }: Props) {
  if (family === "ionicons") {
    return <Ionicons name={name as any} size={size} color={color} />;
  }
  return <Feather name={name as any} size={size} color={color} />;
}
