import React, { useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme";

export default function Toast({ message, visible, onHide }) {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide();
      });
    }
  }, [visible, onHide]);

  if (!visible) return null;

  const styles = getStyles(colors);

  return (
    <Animated.View
      style={[styles.container, { top: insets.top - 20, opacity }]}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: {
      position: "absolute",
      alignSelf: "center",
      backgroundColor: colors.cardBackground,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      zIndex: 10000, // Higher z-index to ensure it's above everything
      width: 150, // Fixed width for consistent centering
    },
    text: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "500",
      textAlign: "center",
    },
  });
}
