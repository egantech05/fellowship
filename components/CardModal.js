import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CardModal({ visible, onClose, card }) {
  if (!card) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Image source={{ uri: card.banner }} style={styles.banner} />
          <Text style={styles.name}>{card.name}</Text>
          <Text style={styles.info}>{card.info}</Text>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modal: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  banner: { width: "100%", height: 150, borderRadius: 10, marginBottom: 15 },
  name: { fontSize: 20, fontWeight: "700" },
  info: { fontSize: 14, marginVertical: 10, textAlign: "center" },
  closeBtn: {
    backgroundColor: "#333",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  closeText: { color: "white" },
});
