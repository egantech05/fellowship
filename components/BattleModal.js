import { useContext, useEffect, useRef, useState } from "react";
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CardContext } from "../context/CardContext";

export default function BattleModal({ visible, onClose, enemyCard }) {
  const { card, addXp } = useContext(CardContext);
  const [battleResult, setBattleResult] = useState(null);
  // show last action (e.g., "You hit for 3", "Enemy missed")
  const [lastAction, setLastAction] = useState("");

  // health state and refs to prevent stale closures
  const [enemyHP, setEnemyHP] = useState(null);
  const [myHP, setMyHP] = useState(null);
  const enemyMaxRef = useRef(0);
  const myMaxRef = useRef(0);
  const enemyHPRef = useRef(0);
  const myHPRef = useRef(0);
  const timeoutRef = useRef(null);
  const turnRef = useRef("player");

  // default fallback HP if not provided
  const DEFAULT_HP = 10;

  useEffect(() => {
    // clear any running timeout when modal closes
    if (!visible) {
      // when the modal is closed, restore both fighters to full HP
      if (enemyMaxRef.current > 0) {
        enemyHPRef.current = enemyMaxRef.current;
        setEnemyHP(enemyMaxRef.current);
      }
      if (myMaxRef.current > 0) {
        myHPRef.current = myMaxRef.current;
        setMyHP(myMaxRef.current);
      }

      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      return;
    }

    // Only start a new battle if there's no current result. This prevents
    // a restart when `card` changes (for example after awarding XP).
    if (visible && enemyCard && card && battleResult === null) {
      const initialEnemyHP = (enemyCard.health ?? DEFAULT_HP) || DEFAULT_HP;
      const initialMyHP = (card.health ?? DEFAULT_HP) || DEFAULT_HP;

      enemyMaxRef.current = initialEnemyHP;
      myMaxRef.current = initialMyHP;

      enemyHPRef.current = initialEnemyHP;
      myHPRef.current = initialMyHP;

      setEnemyHP(initialEnemyHP);
      setMyHP(initialMyHP);
      setBattleResult(null);

  // sequential attacks: player then enemy with delay between each attack

  // Balancing parameters
  const ATTACK_DELAY = 1100; // longer turn delay
      const VARIANCE = 0.1; // ±10% base variance
      const MISS_CHANCE = 0.08; // 8% chance to miss
      const CRIT_CHANCE = 0.07; // 7% chance to crit
      const CRIT_MULT = 1.5;

      const rollDamage = (base, targetDef) => {
        // miss check
        if (Math.random() < MISS_CHANCE) return { damage: 0, type: "miss" };

        // variance
        const varianceFactor = 1 + (Math.random() * 2 - 1) * VARIANCE;
        let raw = base * varianceFactor;

        // critical
        let isCrit = false;
        if (Math.random() < CRIT_CHANCE) {
          raw *= CRIT_MULT;
          isCrit = true;
        }

        const damage = Math.max(Math.round(raw - (targetDef ?? 0)), 0);
        return { damage, type: isCrit ? "crit" : "hit" };
      };

  const doEnemyAttack = () => {
        const base = enemyCard.attack ?? 0;
        const result = rollDamage(base, card.defense ?? 0);
        const newMy = Math.max(myHPRef.current - result.damage, 0);

        myHPRef.current = newMy;
        setMyHP(newMy);
        if (result.type === "miss") setLastAction(`${enemyCard.name} missed!`);
        else if (result.type === "crit") setLastAction(`${enemyCard.name} crits for ${result.damage}!`);
        else setLastAction(`${enemyCard.name} hit for ${result.damage}`);

        if (newMy <= 0) {
          const resultText = `${enemyCard.name} won the battle!`;
          setBattleResult(resultText);
          // ensure no further attacks are scheduled
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
          // award XP for participating (smaller on loss)
          try { addXp(Math.max(1, Math.floor(((enemyCard.attack ?? 0) + (enemyCard.defense ?? 0)) / 2))); } catch (e) {}
          return;
        }

        // schedule player's next attack
        timeoutRef.current = setTimeout(doPlayerAttack, ATTACK_DELAY);
      };

      const doPlayerAttack = () => {
        const base = card.attack ?? 0;
        const result = rollDamage(base, enemyCard.defense ?? 0);
        const newEnemy = Math.max(enemyHPRef.current - result.damage, 0);

        enemyHPRef.current = newEnemy;
        setEnemyHP(newEnemy);
        if (result.type === "miss") setLastAction(`You missed!`);
        else if (result.type === "crit") setLastAction(`Critical! You did ${result.damage}`);
        else setLastAction(`You hit for ${result.damage}`);

        if (newEnemy <= 0) {
          const resultText = `You defeated ${enemyCard.name}!`;
          setBattleResult(resultText);
          // ensure no further attacks are scheduled
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
          // award XP for defeating enemy (larger on victory)
          try { addXp(Math.max(5, Math.floor(((enemyCard.attack ?? 0) + (enemyCard.defense ?? 0)) * 1.5))); } catch (e) {}
          return;
        }

        // schedule enemy's counter-attack
        timeoutRef.current = setTimeout(doEnemyAttack, ATTACK_DELAY);
      };

      setBattleResult(null);
      // start with player attack after a short delay so UI can render
      timeoutRef.current = setTimeout(doPlayerAttack, ATTACK_DELAY);
    }

    // If a result exists, ensure there are no pending timeouts so the fight
    // doesn't continue.
    if (battleResult !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    return () => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    };
  }, [visible, enemyCard, card, battleResult]);

  const hpPercent = (hp, max) => {
    if (max <= 0) return "0%";
    return `${Math.max(0, Math.min(100, Math.round((hp / max) * 100)))}%`;
  };

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

          <View style={styles.xpRow}>
            <Text style={styles.levelText}>Level {card.level ?? 1}</Text>
            <View style={styles.xpBar}>
              <View style={[styles.xpFill, { width: `${Math.round(((card.xp ?? 0) / ((card.level ?? 1) * 100)) * 100)}%` }]} />
            </View>
            <Text style={styles.xpText}>{card.xp ?? 0} / {(card.level ?? 1) * 100}</Text>
          </View>

          {enemyCard && (
            <View style={styles.statsBox}>
              <View style={styles.fighterRow}>
                <Image source={card.banner ? { uri: card.banner } : require("../assets/images/react-logo.png")} style={styles.fighterImage} />
                <Image source={enemyCard.banner ? { uri: enemyCard.banner } : require("../assets/images/react-logo.png")} style={styles.fighterImage} />
              </View>
              <Text style={styles.text}>Your Power: {(card.attack ?? 0) + (card.defense ?? 0)}</Text>

              <View style={styles.hpRow}>
                <Text style={styles.hpLabel}>You</Text>
                <View style={styles.healthBar}>
                  <View
                    style={[
                      styles.healthFill,
                      { width: hpPercent(myHP ?? myMaxRef.current, myMaxRef.current) },
                    ]}
                  />
                </View>
                <Text style={styles.hpText}>{Math.round(myHP ?? myMaxRef.current)} / {myMaxRef.current}</Text>
              </View>

              <Text style={[styles.text, { marginTop: 8 }]}>{enemyCard.name}'s Power: {(enemyCard.attack ?? 0) + (enemyCard.defense ?? 0)}</Text>

              <View style={styles.hpRow}>
                <Text style={styles.hpLabel}>{enemyCard.name}</Text>
                <View style={styles.healthBar}>
                  <View
                    style={[
                      styles.enemyFill,
                      { width: hpPercent(enemyHP ?? enemyMaxRef.current, enemyMaxRef.current) },
                    ]}
                  />
                </View>
                <Text style={styles.hpText}>{Math.round(enemyHP ?? enemyMaxRef.current)} / {enemyMaxRef.current}</Text>
              </View>
              {lastAction ? <Text style={styles.lastAction}>{lastAction}</Text> : null}
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
    padding: 20,
    width: "85%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  statsBox: {
    width: "100%",
    marginBottom: 12,
  },
  text: {
    fontSize: 14,
    textAlign: "center",
    marginVertical: 4,
  },
  resultText: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  closeButton: {
    marginTop: 8,
  },
  closeText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  hpRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  fighterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 8,
  },
  fighterImage: {
    width: 72,
    height: 72,
    borderRadius: 10,
    resizeMode: "cover",
  },
  hpLabel: {
    width: 50,
    fontSize: 13,
  },
  healthBar: {
    flex: 1,
    height: 14,
    backgroundColor: "#eee",
    borderRadius: 8,
    overflow: "hidden",
    marginHorizontal: 8,
  },
  healthFill: {
    height: "100%",
    backgroundColor: "#34C759",
  },
  enemyFill: {
    height: "100%",
    backgroundColor: "#FF3B30",
  },
  hpText: {
    width: 64,
    textAlign: "right",
    fontSize: 12,
  },
  lastAction: {
    marginTop: 8,
    textAlign: "center",
    color: "#444",
    fontSize: 13,
  },
  xpRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  levelText: {
    width: 60,
    fontWeight: "700",
  },
  xpBar: {
    flex: 1,
    height: 10,
    backgroundColor: "#eee",
    borderRadius: 5,
    overflow: "hidden",
    marginHorizontal: 8,
  },
  xpFill: {
    height: "100%",
    backgroundColor: "#FFD700",
  },
  xpText: {
    width: 64,
    textAlign: "right",
    fontSize: 12,
  },
});
