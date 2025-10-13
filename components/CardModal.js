import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";

export default function CardModal({ visible, onClose, card }) {
  if (!card) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>{card.name}</Text>
          <Text style={styles.subtitle}>{card.message}</Text>
          

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.addButton} onPress={() => alert("Added to Fellowship!")}>
              <Text style={styles.buttonText}>Add to Fellowship</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.battleButton} onPress={() => alert("Battle sequence coming soon!")}>
              <Text style={styles.buttonText}>Battle</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
    color: "#222",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: "#555",
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 15,
  },
  addButton: {
    flex: 1,
    backgroundColor: "#34C759",
    padding: 10,
    borderRadius: 10,
    marginRight: 8,
    alignItems: "center",
  },
  battleButton: {
    flex: 1,
    backgroundColor: "#FF3B30",
    padding: 10,
    borderRadius: 10,
    marginLeft: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  closeButton: {
    marginTop: 8,
  },
  closeText: {
    color: "#007AFF",
    fontWeight: "600",
  },
});
