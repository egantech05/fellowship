import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const CardContext = createContext();

export const CardProvider = ({ children }) => {
  const [card, setCard] = useState({
    name: "",
    bio: "",
    attack: 0,
    defense: 0,
    photo: null,
  });

  // Load card from storage on startup
  useEffect(() => {
    const loadCard = async () => {
      const saved = await AsyncStorage.getItem("myCard");
      if (saved) {
        setCard(JSON.parse(saved));
      }
    };
    loadCard();
  }, []);

  // Save automatically whenever card changes
  useEffect(() => {
    AsyncStorage.setItem("myCard", JSON.stringify(card));
  }, [card]);

  return (
    <CardContext.Provider value={{ card, setCard }}>
      {children}
    </CardContext.Provider>
  );
};
