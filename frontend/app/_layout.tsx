import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { LogBox } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { EditSheetProvider } from "@/src/context/EditSheetContext";
import { WelcomeOverlay } from "@/src/components/WelcomeOverlay";
import { storage } from "@/src/utils/storage";
import { setHapticsEnabled } from "@/src/lib/haptics";
import { StatusBar } from "expo-status-bar";

import { useIconFonts } from "@/src/hooks/use-icon-fonts";
import { ThemeProvider, useTheme } from "@/src/theme/ThemeContext";
import { I18nProvider } from "@/src/i18n/I18nContext";
import { AuthProvider } from "@/src/context/AuthContext";
import { NotesProvider } from "@/src/context/NotesContext";
import { ToastProvider } from "@/src/components/Toast";

LogBox.ignoreAllLogs(true);

// Keep the native splash visible from cold start until icon fonts register.
SplashScreen.preventAutoHideAsync();

function ThemedNavigator() {
  const { colors, scheme } = useTheme();
  return (
    <>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" options={{ presentation: "modal" }} />
        <Stack.Screen name="legal" options={{ presentation: "modal" }} />
        <Stack.Screen name="delete-account" options={{ presentation: "modal" }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [loaded, error] = useIconFonts();

  useEffect(() => {
    storage.getItem("derle.haptics", "1").then((v) => setHapticsEnabled(v !== "0"));
  }, []);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <SafeAreaProvider>
          <ThemeProvider>
            <I18nProvider>
              <AuthProvider>
                <NotesProvider>
                  <ToastProvider>
                    <EditSheetProvider>
                      <ThemedNavigator />
                      <WelcomeOverlay />
                    </EditSheetProvider>
                  </ToastProvider>
                </NotesProvider>
              </AuthProvider>
            </I18nProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
