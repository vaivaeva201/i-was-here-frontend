import { Link, Redirect } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  const isLoggedIn = true;

  if (isLoggedIn) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <Link href="/sign-in">login</Link>
    </View>
  );
}