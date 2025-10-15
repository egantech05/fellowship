import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useEffect, useState } from "react";

export const CardContext = createContext();

export const CardProvider = ({ children }) => {
  const [card, setCard] = useState({
    name: "",
    bio: "",
    attack: 0,
    defense: 0,
    photo: null,
    xp: 0,
    level: 1,
  });

  // Load card from storage on startup
  useEffect(() => {
    const loadCard = async () => {
      const saved = await AsyncStorage.getItem("myCard");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // merge with defaults so older saves without xp/level still work
          setCard((prev) => ({
            name: parsed.name ?? prev.name,
            bio: parsed.bio ?? prev.bio,
            attack: parsed.attack ?? prev.attack,
            defense: parsed.defense ?? prev.defense,
            photo: parsed.photo ?? prev.photo,
            xp: parsed.xp ?? prev.xp ?? 0,
            level: parsed.level ?? prev.level ?? 1,
          }));
        } catch (e) {
          // fallback: set raw
          setCard(JSON.parse(saved));
        }
      }
    };
    loadCard();
  }, []);

  // Save automatically whenever card changes
  useEffect(() => {
    AsyncStorage.setItem("myCard", JSON.stringify(card));
  }, [card]);

  const addXp = (amount) => {
    if (!amount || amount <= 0) return;
    setCard((prev) => {
      const prevXp = prev.xp ?? 0;
      const prevLevel = prev.level ?? 1;
      let newXp = prevXp + amount;
      let newLevel = prevLevel;
      let newAttack = prev.attack ?? 0;
      let newDefense = prev.defense ?? 0;

      // Level up threshold: 100 * current level
      while (newXp >= newLevel * 100) {
        newXp -= newLevel * 100;
        newLevel += 1;
        // award small stat increases on level up
        newAttack += 1;
        newDefense += 1;
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        attack: newAttack,
        defense: newDefense,
      };
    });
  };

  return (
    <CardContext.Provider value={{ card, setCard, addXp }}>
      {children}
    </CardContext.Provider>
  );
};
