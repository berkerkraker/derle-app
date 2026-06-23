import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/src/theme/ThemeContext";

interface ToastContextValue {
  show: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ show: () => {} });
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-16)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (msg: string) => {
      setMessage(msg);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
      ]).start();
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: -16, duration: 200, useNativeDriver: true }),
        ]).start(() => setMessage(null));
      }, 2200);
    },
    [opacity, translateY],
  );

  const bg = colors.scheme === "light" ? "#0B0B0B" : "#F4F4F5";
  const fg = colors.scheme === "light" ? "#FFFFFF" : "#0B0B0B";

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {message !== null && (
        <Animated.View
          pointerEvents="none"
          style={[styles.wrap, { top: insets.top + 10, opacity, transform: [{ translateY }] }]}
        >
          <View style={[styles.toast, { backgroundColor: bg }]}>
            <Text style={[styles.text, { color: fg }]} numberOfLines={2} testID="toast-message">
              {message}
            </Text>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 16,
    right: 16,
    alignItems: "center",
    zIndex: 9999,
    elevation: 24,
  },
  toast: {
    maxWidth: "100%",
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 14,
    boxShadow: "0px 4px 12px rgba(0,0,0,0.2)",
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
