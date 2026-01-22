import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Read API key from environment variable
// For Expo, we'll use Constants.expoConfig.extra or process.env
const getApiKey = () => {
  // Try to get from Constants first (if set in app.config.js)
  if (Constants.expoConfig?.extra?.revenueCatApiKey) {
    return Constants.expoConfig.extra.revenueCatApiKey;
  }
  
  // Fallback to process.env (works with dotenv in Expo)
  const envKey = process.env.REVENUECAT_API_TEST_KEY || process.env.REVENUECAT_API_KEY;
  if (envKey) {
    return envKey;
  }
  
  // If neither works, throw an error
  throw new Error('RevenueCat API key not found. Please set REVENUECAT_API_TEST_KEY in .env file.');
};

// Product identifiers - these must match what you configure in RevenueCat
export const PRODUCT_IDS = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  LIFETIME: 'lifetime',
};

// Entitlement identifier - this must match what you configure in RevenueCat
export const ENTITLEMENT_ID = 'Cadence Studio Pro';

let isInitialized = false;

/**
 * Initialize RevenueCat SDK
 * Call this once when the app starts
 */
export const initializeRevenueCat = async () => {
  if (isInitialized) {
    return;
  }

  try {
    const apiKey = getApiKey();
    await Purchases.configure({ apiKey });
    isInitialized = true;
    console.log('RevenueCat initialized successfully');
  } catch (error) {
    console.error('Error initializing RevenueCat:', error);
    throw error;
  }
};

/**
 * Check if user has active Pro entitlement
 * This is the source of truth for Pro feature access
 */
export const checkProEntitlement = async () => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch (error) {
    console.error('Error checking Pro entitlement:', error);
    // Return false on error to be safe
    return false;
  }
};

/**
 * Get available products for purchase
 */
export const getProducts = async () => {
  try {
    const offerings = await Purchases.getOfferings();
    
    // Get the current offering (RevenueCat's recommended offering)
    const currentOffering = offerings.current;
    
    if (!currentOffering) {
      console.warn('No current offering available');
      return [];
    }

    // Get available packages
    const packages = currentOffering.availablePackages;
    
    // Map packages to a simpler format
    return packages.map((pkg) => ({
      identifier: pkg.identifier,
      product: pkg.product,
      productIdentifier: pkg.product.identifier,
      price: pkg.product.priceString,
      title: pkg.product.title,
      description: pkg.product.description,
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

/**
 * Purchase a product
 */
export const purchaseProduct = async (productIdentifier) => {
  try {
    const offerings = await Purchases.getOfferings();
    const currentOffering = offerings.current;
    
    if (!currentOffering) {
      throw new Error('No offering available');
    }

    // Find the package with the matching product identifier
    const packageToPurchase = currentOffering.availablePackages.find(
      (pkg) => pkg.product.identifier === productIdentifier
    );

    if (!packageToPurchase) {
      throw new Error(`Product ${productIdentifier} not found`);
    }

    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    
    // Check if purchase was successful
    const isPro = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    
    return {
      success: isPro,
      customerInfo,
    };
  } catch (error) {
    console.error('Error purchasing product:', error);
    
    // Handle user cancellation
    if (error.userCancelled) {
      return { success: false, cancelled: true };
    }
    
    throw error;
  }
};

/**
 * Restore previous purchases
 */
export const restorePurchases = async () => {
  try {
    const customerInfo = await Purchases.restorePurchases();
    const isPro = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    
    return {
      success: isPro,
      customerInfo,
    };
  } catch (error) {
    console.error('Error restoring purchases:', error);
    throw error;
  }
};

