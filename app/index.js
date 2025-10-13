import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CardModal from "../components/CardModal";

export default function Home() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const [card] = useState({
    name: "Aelinor the Bold",
    info: "Wanderer from the Northern Shores",
    banner:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=60",
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Fellowship</Text>
        <TouchableOpacity onPress={() => router.push("/profile")} style={styles.profileBtn}>
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/847/847969.png",
            }}
            style={{ width: 32, height: 32 }}
          />
        </TouchableOpacity>
      </View>

      {/* Notification */}
      <TouchableOpacity style={styles.cardNotice} onPress={() => setShowModal(true)}>
        <Text style={styles.noticeText}>Somebody left you a card!</Text>
        <Image source={{ uri: card.banner }} style={styles.banner} />
      </TouchableOpacity>

      {/* Modal */}
      <CardModal visible={showModal} onClose={() => setShowModal(false)} card={card} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa", paddingTop: 60 },
  header: {
    position: "absolute",
    top: 40,
    right: 20,
    left: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 24, fontWeight: "700" },
  profileBtn: { padding: 8 },
  cardNotice: {
    marginTop: 120,
    alignItems: "center",
  },
  noticeText: { fontSize: 18, marginBottom: 10 },
  banner: { width: 280, height: 160, borderRadius: 12 },
});
