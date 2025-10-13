import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function CreateCardScreen() {
  const router = useRouter();

  // Fields for your custom card
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [attack, setAttack] = useState("");
  const [defense, setDefense] = useState("");

  // Load saved card if it exists
  useEffect(() => {
    const loadCard = async () => {
      const saved = await AsyncStorage.getItem("myCard");
      if (saved) {
        const data = JSON.parse(saved);
        setName(data.name || "");
        setDescription(data.description || "");
        setAttack(String(data.attack || ""));
        setDefense(String(data.defense || ""));
      }
    };
    loadCard();
  }, []);

  const saveCard = async () => {
    if (!name || !attack || !defense) {
      Alert.alert("Missing fields", "Please fill out name, attack, and defense.");
      return;
    }

    const cardData = {
      name,
      description,
      attack: parseInt(attack),
      defense: parseInt(defense),
    };

    await AsyncStorage.setItem("myCard", JSON.stringify(cardData));
    Alert.alert("Saved!", "Your card has been created.");
    router.back(); // go back to previous screen
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Create Your Card</Text>

      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />

      <TextInput
        placeholder="Attack"
        keyboardType="numeric"
        value={attack}
        onChangeText={setAttack}
        style={styles.input}
      />

      <TextInput
        placeholder="Defense"
        keyboardType="numeric"
        value={defense}
        onChangeText={setDefense}
        style={styles.input}
      />

      <TouchableOpacity style={styles.saveButton} onPress={saveCard}>
        <Text style={styles.saveText}>Save Card</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 15,
    alignItems: "center",
  },
  cancelText: {
    color: "#007AFF",
    fontWeight: "600",
  },
});
