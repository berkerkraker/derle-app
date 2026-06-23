import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

const platformOK = Platform.OS !== "web";
let userEnabled = true;

/** Toggle haptics globally (persisted preference, set from Settings). */
export function setHapticsEnabled(v: boolean) {
  userEnabled = v;
}

const on = () => platformOK && userEnabled;

export const haptics = {
  light() {
    if (on()) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },
  medium() {
    if (on()) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  },
  selection() {
    if (on()) Haptics.selectionAsync().catch(() => {});
  },
  success() {
    if (on())
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },
  warning() {
    if (on())
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  },
};
