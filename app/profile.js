import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { CardContext } from "../context/CardContext";

export default function MyCardScreen() {
    const router = useRouter();
    const { card, setCard } = useContext(CardContext);
    const [name, setName] = useState(card.name || "");
    const [bio, setBio] = useState(card.bio || "");
    const [attack, setAttack] = useState(String(card.attack || ""));
    const [defense, setDefense] = useState(String(card.defense || ""));
    const [photo, setPhoto] = useState(card.photo || null);


    // Load saved card data
    useEffect(() => {
        // Whenever the global card changes, sync it into local text inputs
        setName(card.name || "");
        setBio(card.bio || "");
        setAttack(String(card.attack || ""));
        setDefense(String(card.defense || ""));
        setPhoto(card.photo || null);
    }, [card]);

    // Select an image
    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert("Permission required", "We need access to your gallery.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
        });

        if (!result.canceled) {
            setPhoto(result.assets[0].uri);
        }
    };

    // Save card data
    const saveCard = async () => {
        if (!name || !attack || !defense) {
            Alert.alert("Missing info", "Please fill in name, attack, and defense.");
            return;
        }

        const card = {
            name,
            bio,
            attack: parseInt(attack),
            defense: parseInt(defense),
            photo,
        };
        setCard(card);
        Alert.alert("Saved!", "Your card has been updated.");
        router.back();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>My Card</Text>

            {/* Name */}
            <TextInput
                placeholder="Your Name"
                value={name}
                onChangeText={setName}
                style={styles.input}
            />

            {/* Profile Photo */}
            <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
                {photo ? (
                    <Image source={{ uri: photo }} style={styles.image} />
                ) : (
                    <Text style={styles.imagePlaceholder}>Tap to upload photo</Text>
                )}
            </TouchableOpacity>

            {/* Attack and Defense */}
            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Text style={styles.label}>Attack</Text>
                    <TextInput
                        value={attack}
                        onChangeText={setAttack}
                        keyboardType="numeric"
                        style={styles.statInput}
                    />
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.label}>Defense</Text>
                    <TextInput
                        value={defense}
                        onChangeText={setDefense}
                        keyboardType="numeric"
                        style={styles.statInput}
                    />
                </View>
            </View>

            {/* Bio */}
            <Text style={styles.label}>Bio</Text>
            <TextInput
                placeholder="Tell others something about you..."
                value={bio}
                onChangeText={setBio}
                multiline
                style={[styles.input, { height: 100 }]}
            />

            {/* Buttons */}
            <TouchableOpacity style={styles.saveButton} onPress={saveCard}>
                <Text style={styles.saveText}>Save Card</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fafafa",
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    header: {
        fontSize: 26,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        backgroundColor: "#fff",
        marginBottom: 15,
    },
    imageContainer: {
        alignItems: "center",
        marginVertical: 15,
    },
    image: {
        width: 140,
        height: 140,
        borderRadius: 70,
    },
    imagePlaceholder: {
        color: "#999",
        fontSize: 16,
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15,
    },
    statBox: {
        flex: 1,
        alignItems: "center",
    },
    label: {
        fontWeight: "600",
        marginBottom: 5,
    },
    statInput: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        padding: 8,
        width: "80%",
        textAlign: "center",
        backgroundColor: "#fff",
    },
    saveButton: {
        backgroundColor: "#007AFF",
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 10,
    },
    saveText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
    cancelButton: {
        marginTop: 10,
        alignItems: "center",
    },
    cancelText: {
        color: "#007AFF",
        fontWeight: "600",
    },
});
