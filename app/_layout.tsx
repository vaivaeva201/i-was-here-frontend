import Safescreen from "@/compononts/SafeScreen";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Safescreen>
      <Stack screenOptions={{ headerShown: false }} />
    </Safescreen>
  );
}
