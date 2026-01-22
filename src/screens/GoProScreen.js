import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme";
import AppHeader from "../components/AppHeader";
import { getProducts, purchaseProduct, restorePurchases, PRODUCT_IDS } from "../services/subscriptionService";
import { useProEntitlement } from "../hooks/useProEntitlement";

export default function GoProScreen({ navigation }) {
  const colors = useTheme();
  const { isPro } = useProEntitlement();
  const styles = getStyles(colors);
  
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const availableProducts = await getProducts();
      setProducts(availableProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert("Error", "Failed to load products. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (productType) => {
    if (purchasing) return;

    let productIdentifier;
    switch (productType) {
      case "monthly":
        productIdentifier = PRODUCT_IDS.MONTHLY;
        break;
      case "yearly":
        productIdentifier = PRODUCT_IDS.YEARLY;
        break;
      case "lifetime":
        productIdentifier = PRODUCT_IDS.LIFETIME;
        break;
      default:
        Alert.alert("Error", "Invalid product type");
        return;
    }

    setPurchasing(true);
    try {
      const result = await purchaseProduct(productIdentifier);
      
      if (result.cancelled) {
        // User cancelled, no action needed
        return;
      }
      
      if (result.success) {
        Alert.alert(
          "Success!",
          "Thank you for upgrading to Timer Pro!",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert("Error", "Purchase was not successful. Please try again.");
      }
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert(
        "Purchase Failed",
        error.message || "An error occurred during purchase. Please try again."
      );
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      const result = await restorePurchases();
      
      if (result.success) {
        Alert.alert(
          "Success",
          "Your purchases have been restored!",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert(
          "No Purchases Found",
          "We couldn't find any previous purchases to restore."
        );
      }
    } catch (error) {
      console.error('Restore error:', error);
      Alert.alert(
        "Restore Failed",
        "An error occurred while restoring purchases. Please try again."
      );
    }
  };

  const getProductPrice = (productType) => {
    const product = products.find((p) => {
      if (productType === "monthly") return p.productIdentifier === PRODUCT_IDS.MONTHLY;
      if (productType === "yearly") return p.productIdentifier === PRODUCT_IDS.YEARLY;
      if (productType === "lifetime") return p.productIdentifier === PRODUCT_IDS.LIFETIME;
      return false;
    });
    return product ? product.price : null;
  };

  const proFeatures = [
    "Unlimited sessions",
    "Unlimited activities",
    "Custom categories",
    "Full history retention",
    "Export sessions",
    "All future Pro features",
  ];

  const freeFeatures = [
    "Up to 5 sessions",
    "Up to 20 activities",
    "Built-in categories only",
    "30 days history",
    "Import sessions",
  ];

  return (
    <View style={styles.container}>
      <AppHeader
        title="Timer Pro"
        showBack={true}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.proBadge}>
            <Ionicons name="star" size={32} color={colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Unlock Timer Pro</Text>
          <Text style={styles.heroSubtitle}>
            Get unlimited sessions, activities, custom categories, and more
          </Text>
          {isPro && (
            <View style={styles.proActiveBadge}>
              <Text style={styles.proActiveText}>✓ Pro Active</Text>
            </View>
          )}
        </View>

        {/* Comparison Table */}
        <View style={styles.comparisonSection}>
          <Text style={styles.sectionTitle}>Free vs Pro</Text>

          <View style={styles.comparisonTable}>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>Sessions</Text>
              <Text style={styles.comparisonFree}>5 max</Text>
              <Text style={styles.comparisonPro}>Unlimited</Text>
            </View>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>Activities</Text>
              <Text style={styles.comparisonFree}>20 max</Text>
              <Text style={styles.comparisonPro}>Unlimited</Text>
            </View>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>Categories</Text>
              <Text style={styles.comparisonFree}>Built-in only</Text>
              <Text style={styles.comparisonPro}>Custom + Built-in</Text>
            </View>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>History</Text>
              <Text style={styles.comparisonFree}>30 days</Text>
              <Text style={styles.comparisonPro}>Unlimited</Text>
            </View>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>Export</Text>
              <Text style={styles.comparisonFree}>❌</Text>
              <Text style={styles.comparisonPro}>✅</Text>
            </View>
          </View>
        </View>

        {/* Features List */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Pro Features</Text>
          {proFeatures.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={colors.primary}
              />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* Pricing Options */}
        <View style={styles.pricingSection}>
          <Text style={styles.sectionTitle}>Choose Your Plan</Text>

          {isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 20 }} />
          ) : (
            <>
              <TouchableOpacity
                style={[styles.pricingOption, styles.pricingOptionRecommended]}
                onPress={() => handlePurchase("yearly")}
                disabled={purchasing || isPro}
              >
                <View style={styles.pricingHeader}>
                  <Text style={styles.pricingTitle}>Yearly</Text>
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>Recommended</Text>
                  </View>
                </View>
                <Text style={styles.pricingPrice}>
                  {getProductPrice("yearly") || "$24.99"}
                </Text>
                <Text style={styles.pricingPeriod}>per year</Text>
                <Text style={styles.pricingSavings}>Save 16% vs monthly</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.pricingOption}
                onPress={() => handlePurchase("monthly")}
                disabled={purchasing || isPro}
              >
                <View style={styles.pricingHeader}>
                  <Text style={styles.pricingTitle}>Monthly</Text>
                </View>
                <Text style={styles.pricingPrice}>
                  {getProductPrice("monthly") || "$2.99"}
                </Text>
                <Text style={styles.pricingPeriod}>per month</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.pricingOption}
                onPress={() => handlePurchase("lifetime")}
                disabled={purchasing || isPro}
              >
                <View style={styles.pricingHeader}>
                  <Text style={styles.pricingTitle}>Lifetime</Text>
                </View>
                <Text style={styles.pricingPrice}>
                  {getProductPrice("lifetime") || "$54.99"}
                </Text>
                <Text style={styles.pricingPeriod}>one-time purchase</Text>
                <Text style={styles.pricingSavings}>
                  All current & future features
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Restore Purchases */}
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestorePurchases}
        >
          <Text style={styles.restoreButtonText}>Restore Purchases</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 40,
    },
    heroSection: {
      alignItems: "center",
      marginBottom: 32,
    },
    proBadge: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.purpleLight,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    heroTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 8,
      textAlign: "center",
    },
    heroSubtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center",
      paddingHorizontal: 20,
    },
    comparisonSection: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 16,
    },
    comparisonTable: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    comparisonRow: {
      flexDirection: "row",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    comparisonLabel: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      fontWeight: "500",
    },
    comparisonFree: {
      flex: 1,
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center",
    },
    comparisonPro: {
      flex: 1,
      fontSize: 16,
      color: colors.primary,
      fontWeight: "600",
      textAlign: "center",
    },
    featuresSection: {
      marginBottom: 32,
    },
    featureItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
      paddingLeft: 4,
    },
    featureText: {
      fontSize: 16,
      color: colors.text,
      marginLeft: 12,
    },
    pricingSection: {
      marginBottom: 24,
    },
    pricingOption: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 20,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: colors.border,
    },
    pricingOptionRecommended: {
      borderColor: colors.primary,
      backgroundColor: colors.purpleLight,
    },
    pricingHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    pricingTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
    },
    recommendedBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    recommendedText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.textLight,
    },
    pricingPrice: {
      fontSize: 32,
      fontWeight: "bold",
      color: colors.primary,
      marginBottom: 4,
    },
    pricingPeriod: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    pricingSavings: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: "500",
      marginTop: 4,
    },
    restoreButton: {
      paddingVertical: 16,
      alignItems: "center",
    },
    restoreButtonText: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: "500",
    },
    proActiveBadge: {
      marginTop: 12,
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: colors.primary,
      borderRadius: 20,
    },
    proActiveText: {
      color: colors.textLight,
      fontSize: 14,
      fontWeight: "600",
    },
  });
