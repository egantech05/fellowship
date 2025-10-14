import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";
import { CardContext } from "../context/CardContext";

export default function BattleModal({ visible, onClose, enemyCard }) {
  const { card } = useContext(CardContext);
  const [battleResult, setBattleResult] = useState(null);

  // Simple battle logic — can get more complex later
  useEffect(() => {
    if (visible && enemyCard) {
      const myPower = (card.attack ?? 0) + (card.defense ?? 0);
      const enemyPower = (enemyCard.attack ?? 0) + (enemyCard.defense ?? 0);
      const outcome = Math.random() + myPower / (myPower + enemyPower);

      const result =
        outcome > 0.5 ? `You defeated ${enemyCard.name}!` : `${enemyCard.name} won the battle!`;

      setBattleResult(result);
    } else {
      setBattleResult(null);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>⚔️ Battle Results ⚔️</Text>

          {enemyCard && (
            <View style={styles.statsBox}>
              <Text style={styles.text}>
                Your Power: {card.attack + card.defense}
              </Text>
              <Text style={styles.text}>
                {enemyCard.name}'s Power: {(enemyCard.attack ?? 0) + (enemyCard.defense ?? 0)}
              </Text>
            </View>
          )}

          {battleResult ? (
            <Text
              style={[
                styles.resultText,
                {
                  color: battleResult.includes("defeated") ? "#34C759" : "#FF3B30",
                },
              ]}
            >
              {battleResult}
            </Text>
          ) : (
            <Text style={styles.text}>Preparing battle...</Text>
          )}

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
  modal: {
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
    marginBottom: 10,
  },
  statsBox: {
    width: "100%",
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 4,
  },
  resultText: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 15,
  },
  closeButton: {
    marginTop: 8,
  },
  closeText: {
    color: "#007AFF",
    fontWeight: "600",
  },
});
