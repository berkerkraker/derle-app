import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

import { useTheme } from "@/src/theme/ThemeContext";
import { useI18n } from "@/src/i18n/I18nContext";

const TAB_META: Record<
  string,
  { icon: keyof typeof Ionicons.glyphMap; iconOutline: keyof typeof Ionicons.glyphMap; labelKey: string }
> = {
  index: { icon: "flash", iconOutline: "flash-outline", labelKey: "tab.capture" },
  organize: { icon: "albums", iconOutline: "albums-outline", labelKey: "tab.organize" },
};

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        {
          paddingBottom: insets.bottom + 8,
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
        },
      ]}
    >
      {state.routes
        .filter((r) => TAB_META[r.name])
        .map((route) => {
          const idx = state.routes.findIndex((r) => r.key === route.key);
          const focused = state.index === idx;
          const meta = TAB_META[route.name];
          const color = focused ? colors.tabActive : colors.tabInactive;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.tab}
              testID={`tab-${route.name}`}
            >
              <Ionicons name={focused ? meta.icon : meta.iconOutline} size={24} color={color} />
              <Text style={[styles.label, { color, fontWeight: focused ? "700" : "500" }]}>
                {t(meta.labelKey)}
              </Text>
            </Pressable>
          );
        })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="organize" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.2,
  },
});
