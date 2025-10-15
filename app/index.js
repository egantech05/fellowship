
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  PermissionsAndroid,
  Platform,
  StyleSheet, Text, TouchableOpacity, View
} from "react-native";
import CardModal from "../components/CardModal";
import { supabase } from "../src/lib/supabase";


import {
  APP_TAG,
  CHAR_UUID_APP_TAG,
  CHAR_UUID_USER_UUID,
  fromBase64Utf8,
  SERVICE_UUID,
  toBase64Utf8
} from "../src/ble/constants";


// ✅ Dynamic require for native-only modules
let BleManager, blePeripheral, Application;
if (Platform.OS !== "web") {
  BleManager = require("react-native-ble-plx").BleManager;
  //blePeripheral = require("react-native-ble-peripheral");
  Application = require("expo-application");
}

const manager = Platform.OS !== "web" && BleManager ? new BleManager() : null;


export default function Home() {
  const router = useRouter();

  // existing UI
  const [showModal, setShowModal] = useState(false);
  const [card] = useState({
    name: "Aelinor the Bold",
    info: "Wanderer from the Northern Shores",
    banner: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=60",
  });

  // my local install UUID (per-device). If you want per-user, save your userId instead.
  const [myUuid, setMyUuid] = useState('');

  // nearby verified peers (map by deviceId)
  const peersRef = useRef(new Map()); // id -> { id, userUuid, displayName, avatarUrl, rssi, lastSeen }
  const [peers, setPeers] = useState([]);

  // avoid overlapping connections
  const connecting = useRef(new Set());
  useEffect(() => {
    if (Platform.OS !== "web") {
      (async () => {
        // Try to reuse stored ID
        let uuid = await SecureStore.getItemAsync("install_uuid");
        if (!uuid) {
          // Generate deterministic hash from device + app info
          const seed = `${Device.modelId ?? "unknown"}-${Application.applicationId}`;
          uuid = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, seed);
          await SecureStore.setItemAsync("install_uuid", uuid);
        }
        setMyUuid(uuid);
      })();
    } else {
      setMyUuid("web-preview-" + Math.random().toString(36).substring(2, 10));
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web" && myUuid) {
      registerSelf(myUuid);
    }
  }, [myUuid]);

  // ---- Android runtime perms
  async function ensureAndroidPerms() {
    if (Platform.OS !== "android") return;
    const wants = [
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ];
    for (const p of wants) {
      const has = await PermissionsAndroid.check(p);
      if (!has) await PermissionsAndroid.request(p);
    }
  }

  // ---- iOS advertising so others can see us
  async function startIOSPeripheral() {
    if (Platform.OS !== "ios") return;

    await bleStart();
    await addService(SERVICE_UUID, true);

    await addCharacteristic(SERVICE_UUID, CHAR_UUID_APP_TAG, 0x02, 0x01);
    await setCharacteristic(SERVICE_UUID, CHAR_UUID_APP_TAG, toBase64Utf8(APP_TAG));

    await addCharacteristic(SERVICE_UUID, CHAR_UUID_USER_UUID, 0x0A, 0x03);
    await setCharacteristic(SERVICE_UUID, CHAR_UUID_USER_UUID, toBase64Utf8(myUuid));

    const mgr = global.BlePeripheralManager;
    await mgr.startAdvertising({ localName: "Fellowship-iPhone", serviceUuids: [SERVICE_UUID] });

    mgr.onWriteRequest = async (req) => {
      if (req.characteristicUUID === CHAR_UUID_USER_UUID) {
        await setCharacteristic(SERVICE_UUID, CHAR_UUID_USER_UUID, req.value);
      }
    };
  }

  // ---- Supabase fetch by user UUID (adjust table/columns to your schema)
  async function fetchProfile(userUuid) {
    // Example table: profiles(id uuid PK, display_name text, avatar_url text)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .eq('id', userUuid)
      .maybeSingle();
    if (error) { console.warn('Supabase error:', error.message); return null; }
    return data;
  }
// ---- Register this device in Supabase for testing
async function registerSelf(userUuid) {
  if (!userUuid) return;
  const displayName =
    Platform.OS === "ios" ? "Egan iPhone" : "Egan Android";
  const avatarUrl = `https://i.pravatar.cc/150?u=${userUuid}`;

  const { error } = await supabase
    .from("profiles")
    .upsert(
      { id: userUuid, display_name: displayName, avatar_url: avatarUrl },
      { onConflict: "id" }
    );

  if (error) console.log("registerSelf error:", error.message);
  else console.log("Device registered in Supabase:", displayName);
}


  // ---- connect to a device and verify it’s OUR app; then exchange UUIDs and fetch profile
  async function verifyAndLoadPeer(device, rssi) {
    const id = device.id;
    if (connecting.current.has(id)) return;
    connecting.current.add(id);

    try {
      const dev = await manager.connectToDevice(id, { timeout: 6000 });
      await dev.discoverAllServicesAndCharacteristics();

      // 1) verify app tag
      const appTagChar = await dev.readCharacteristicForService(SERVICE_UUID, CHAR_UUID_APP_TAG);
      const tag = appTagChar?.value ? fromBase64Utf8(appTagChar.value) : '';
      if (tag !== APP_TAG) { await dev.cancelConnection(); return; }

      // 2) read their UUID
      const theirUuidChar = await dev.readCharacteristicForService(SERVICE_UUID, CHAR_UUID_USER_UUID);
      const theirUuid = theirUuidChar?.value ? fromBase64Utf8(theirUuidChar.value) : null;
      if (!theirUuid) { await dev.cancelConnection(); return; }

      // 3) write our UUID so they can see us too
      await dev.writeCharacteristicWithResponseForService(
        SERVICE_UUID, CHAR_UUID_USER_UUID, toBase64Utf8(myUuid)
      );

      // 4) fetch profile from Supabase
      const profile = await fetchProfile(theirUuid);
      const displayName = profile?.display_name || 'Fellowship user';
      const avatarUrl = profile?.avatar_url || null;

      // 5) cache/update list
      const now = Date.now();
      peersRef.current.set(id, {
        id,
        userUuid: theirUuid,
        displayName,
        avatarUrl,
        rssi: typeof rssi === 'number' ? rssi : null,
        lastSeen: now
      });
      setPeers([...peersRef.current.values()].sort((a,b) => (b.rssi ?? -999) - (a.rssi ?? -999)));

      await dev.cancelConnection();
    } catch (e) {
      // ignore transient errors
    } finally {
      connecting.current.delete(id);
    }
  }

  // ---- scanning loop (filters by our service UUID)
  async function startScan() {
    if (Platform.OS === "android") await ensureAndroidPerms();
    manager.stopDeviceScan();

    manager.startDeviceScan([SERVICE_UUID], { allowDuplicates: true }, (error, device) => {
      if (error) return;

      if (device) {
        const rssi = device.rssi;
        // opportunistically verify & load; connection is short-lived
        verifyAndLoadPeer(device, rssi);
      }
    });
  }

  // ---- purge stale peers (15s)
  useEffect(() => {
    const t = setInterval(() => {
      const now = Date.now();
      let changed = false;
      for (const [k, v] of peersRef.current.entries()) {
        if (now - v.lastSeen > 15000) { peersRef.current.delete(k); changed = true; }
      }
      if (changed) setPeers([...peersRef.current.values()]);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  // ---- mount/unmount: start iOS advertising + start scan
  useEffect(() => {
    let closed = false;
    (async () => {

      try {
              if (Platform.OS === "ios" && myUuid) await startIOSPeripheral();
              if (manager) await startScan();
            } catch (e) {
              console.log("BLE init error:", e);
            }

    })();

    return () => {
      if (closed) return;
      closed = true;
      try { manager.stopDeviceScan(); } catch {}
      try { manager.destroy(); } catch {}
      if (Platform.OS === 'ios') { try { bleStop(); } catch {} }
    };
    // re-run if myUuid changes (first run)
  }, [myUuid]);

  

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
          <Text style={styles.title}>Fellowship</Text>
          <TouchableOpacity
            onPress={() => router.push("/profile")}
            style={styles.profileBtn}
          >
        <Image
            source={{ uri: "https://cdn-icons-png.flaticon.com/512/847/847969.png" }}
            style={{ width: 32, height: 32 }}
          />
        </TouchableOpacity>
</View>

      {/* Your existing card */}
      <TouchableOpacity style={styles.cardNotice} onPress={() => setShowModal(true)}>
        <Text style={styles.noticeText}>Somebody left you a card!</Text>
        <Image source={{ uri: card.banner }} style={styles.banner} />
      </TouchableOpacity>

      {/* Verified Nearby Users (same-app only) */}
      <View style={{ marginTop: 24, alignSelf: "stretch" }}>
        <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>Nearby users</Text>
        {peers.length === 0 ? (
          <Text style={{ color: "#666" }}>Scanning… keep this screen open.</Text>
        ) : (
          <FlatList
            data={peers}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <View style={styles.peerRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  {item.avatarUrl ? (
                    <Image source={{ uri: item.avatarUrl }} style={{ width: 36, height: 36, borderRadius: 18 }} />
                  ) : (
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#ddd' }} />
                  )}
                  <View>
                    <Text style={{ fontWeight: '600' }}>{item.displayName}</Text>
                    <Text style={{ color: '#666', fontSize: 12 }}>{item.userUuid}</Text>
                  </View>
                </View>
                <Text style={{ color: '#666', fontSize: 12 }}>{item.rssi ? `RSSI ${item.rssi}` : ''}</Text>
              </View>
            )}
            style={{ maxHeight: 260 }}
          />
        )}
      </View>

      <CardModal visible={showModal} onClose={() => setShowModal(false)} card={card} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa", paddingTop: 60, paddingHorizontal: 20 },
  header: {
    position: "absolute", top: 40, right: 20, left: 20,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  title: { fontSize: 24, fontWeight: "700" },
  profileBtn: { padding: 8 },
  cardNotice: { marginTop: 120, alignItems: "center" },
  noticeText: { fontSize: 18, marginBottom: 10 },
  banner: { width: 280, height: 160, borderRadius: 12 },
  peerRow: {
    paddingVertical: 10, borderBottomWidth: 1, borderColor: "#eee",
    flexDirection: "row", justifyContent: "space-between", alignItems: "center"
  },
});
