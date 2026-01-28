// Try to load .env if dotenv is available, otherwise rely on Expo's built-in .env support
try {
  require('dotenv').config();
} catch (e) {
  // dotenv not installed, Expo will handle .env automatically
}

module.exports = {
  expo: {
    name: "timer-app-react-native",
    slug: "timer-app-react-native",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.timerapp.reactnative",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      package: "com.timerapp.reactnative",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      eas: {
        projectId: "a2ee7232-df82-4ed5-8766-e74ac562bd77"
      },
      // Expose RevenueCat API key from .env (prefer Android key when set, otherwise use main key)
      revenueCatApiKey:
        process.env.REVENUECAT_API_ANDROID_KEY ||
        process.env.REVENUECAT_API_KEY,
    }
  }
};

