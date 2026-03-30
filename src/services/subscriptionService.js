import Purchases from "react-native-purchases";
import { Platform } from "react-native";
import Constants from "expo-constants";

// Read RevenueCat API key from Expo config / public env vars
const getApiKey = () => {
  const iosKey =
    Constants.expoConfig?.extra?.revenueCatApiKeyIOS ||
    process.env.EXPO_PUBLIC_REVENUECAT_API_IOS_KEY;

  const androidKey =
    Constants.expoConfig?.extra?.revenueCatApiKeyAndroid ||
    process.env.EXPO_PUBLIC_REVENUECAT_API_ANDROID_KEY;

  if (Platform.OS === "ios" && iosKey) return iosKey;
  if (Platform.OS === "android" && androidKey) return androidKey;

  throw new Error(`RevenueCat API key not found for ${Platform.OS}`);
};

// These should match your RevenueCat setup
export const PRODUCT_IDS = {
  MONTHLY: "monthly",
  YEARLY: "yearly",
  LIFETIME: "pro_lifetime",
};

export const ENTITLEMENT_ID = "pro";

let isInitialized = false;

export const initializeRevenueCat = async () => {
  if (isInitialized) return;

  const apiKey = getApiKey();

  console.log("RC init starting", {
    platform: Platform.OS,
    hasApiKey: !!apiKey,
  });

  await Purchases.configure({ apiKey });

  isInitialized = true;

  console.log("RC init finished", {
    entitlement: ENTITLEMENT_ID,
    productIds: Object.values(PRODUCT_IDS),
  });
};

export const checkProEntitlement = async () => {
  try {
    await initializeRevenueCat();

    const customerInfo = await Purchases.getCustomerInfo();
    const isPro =
      customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;

    console.log("Pro entitlement check:", isPro);
    return isPro;
  } catch (error) {
    console.error("Error checking Pro entitlement:", error);
    return false;
  }
};

export const getProducts = async () => {
  try {
    await initializeRevenueCat();

    const offerings = await Purchases.getOfferings();
    const currentOffering = offerings.current;

    if (!currentOffering) {
      console.warn("No current offering available in RevenueCat");
      return [];
    }

    const packages = currentOffering.availablePackages;
    console.log(`Found ${packages.length} packages`);

    return packages.map((pkg) => ({
      identifier: pkg.identifier,
      product: pkg.product,
      productIdentifier: pkg.product.identifier,
      price: pkg.product.priceString,
      title: pkg.product.title,
      description: pkg.product.description,
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

export const purchaseProduct = async (productIdentifier) => {
  try {
    await initializeRevenueCat();

    const offerings = await Purchases.getOfferings();
    const currentOffering = offerings.current;

    if (!currentOffering) {
      throw new Error("No offering available");
    }

    const packageToPurchase = currentOffering.availablePackages.find(
      (pkg) =>
        pkg.product.identifier === productIdentifier ||
        pkg.identifier === productIdentifier,
    );

    if (!packageToPurchase) {
      const debugPackages = currentOffering.availablePackages.map((pkg) => ({
        packageId: pkg.identifier,
        productId: pkg.product.identifier,
      }));

      throw new Error(
        `Product "${productIdentifier}" not found.\n\nAvailable packages:\n` +
          JSON.stringify(debugPackages, null, 2),
      );
    }

    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);

    const isPro =
      customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;

    return {
      success: isPro,
      customerInfo,
    };
  } catch (error) {
    console.error("Error purchasing product:", error);

    if (error.userCancelled) {
      return { success: false, cancelled: true };
    }

    throw error;
  }
};

export const restorePurchases = async () => {
  try {
    await initializeRevenueCat();

    const customerInfo = await Purchases.restorePurchases();
    const isPro =
      customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;

    return {
      success: isPro,
      customerInfo,
    };
  } catch (error) {
    console.error("Error restoring purchases:", error);
    throw error;
  }
};

export const addProEntitlementListener = async (callback) => {
  await initializeRevenueCat();

  const listener = (customerInfo) => {
    const isPro =
      customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;

    callback(isPro);
  };

  Purchases.addCustomerInfoUpdateListener(listener);

  return () => {
    if (typeof Purchases.removeCustomerInfoUpdateListener === "function") {
      Purchases.removeCustomerInfoUpdateListener(listener);
    }
  };
};
