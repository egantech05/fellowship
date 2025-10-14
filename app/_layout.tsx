import { Stack } from "expo-router";
import { CardProvider } from "../context/CardContext";


export default function Layout() {
  return (
    <CardProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: "Home" }} />
        <Stack.Screen name="profile" options={{ title: "Profile" }} />
      </Stack>
    </CardProvider>
  );
}

