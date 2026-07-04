import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/src/theme/ThemeContext";

export interface ToastAction {
  label: string;
  onPress: () => void;
}

interface ToastContextValue {
  show: (message: string, action?: ToastAction) => void;
}

const ToastContext = createContext<ToastContextValue>({ show: () => {} });
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState<string | null>(null);
  const [action, setAction] = useState<ToastAction | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-16)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -16, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setMessage(null);
      setAction(null);
    });
  }, [opacity, translateY]);

  const show = useCallback(
    (msg: string, act?: ToastAction) => {
      setMessage(msg);
      setAction(act ?? null);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
      ]).start();
      if (timer.current) clearTimeout(timer.current);
      // Aksiyonlu toast'a (ör. "Geri al") basacak vakit bırak.
      timer.current = setTimeout(hide, act ? 4500 : 2200);
    },
    [opacity, translateY, hide],
  );

  const onActionPress = () => {
    if (timer.current) clearTimeout(timer.current);
    action?.onPress();
    hide();
  };

  const bg = colors.scheme === "light" ? "#0B0B0B" : "#F4F4F5";
  const fg = colors.scheme === "light" ? "#FFFFFF" : "#0B0B0B";
  const accent = colors.scheme === "light" ? "#5EEAD4" : "#0F766E";

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {message !== null && (
        <Animated.View
          pointerEvents="box-none"
          style={[styles.wrap, { top: insets.top + 10, opacity, transform: [{ translateY }] }]}
        >
          <View style={[styles.toast, { backgroundColor: bg }]}>
            <Text
              style={[styles.text, { color: fg }]}
              numberOfLines={2}
              testID="toast-message"
            >
              {message}
            </Text>
            {action && (
              <Pressable
                onPress={onActionPress}
                hitSlop={10}
                testID="toast-action"
                style={styles.actionBtn}
              >
                <Text style={[styles.actionText, { color: accent }]}>
                  {action.label}
                </Text>
              </Pressable>
            )}
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
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "100%",
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 14,
    gap: 12,
    boxShadow: "0px 4px 12px rgba(0,0,0,0.2)",
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    flexShrink: 1,
  },
  actionBtn: {
    paddingVertical: 2,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
});
