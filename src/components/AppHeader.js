import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme";

export default function AppHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightContent,
}) {
  const insets = useSafeAreaInsets();
  const colors = useTheme();

  const styles = getStyles(colors, insets);

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {showBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButtonPlaceholder} />
        )}

        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={styles.rightContainer}>
          {rightContent ? rightContent : null}
        </View>
      </View>
    </View>
  );
}

const getStyles = (colors, insets) =>
  StyleSheet.create({
    container: {
      paddingTop: Math.max(insets.top, 16),
      paddingBottom: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.cardBackground,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    backButton: {
      paddingRight: 8,
      paddingVertical: 4,
    },
    backButtonPlaceholder: {
      width: 30, // keeps title centered when there's no back button
    },
    titleContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },
    subtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },
    rightContainer: {
      minWidth: 30,
      alignItems: "flex-end",
    },
  });
