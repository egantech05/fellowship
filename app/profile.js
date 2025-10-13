import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

export default function Profile() {
  const [name, setName] = useState("Your Name");
  const [info, setInfo] = useState("Tell others something about you...");

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Info</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={info}
        onChangeText={setInfo}
        multiline
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { fontWeight: "600", marginTop: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
  },
});
