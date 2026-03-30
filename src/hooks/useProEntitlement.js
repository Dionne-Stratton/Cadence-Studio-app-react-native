import { useState, useEffect } from "react";
import {
  checkProEntitlement,
  addProEntitlementListener,
} from "../services/subscriptionService";

/**
 * Hook to check Pro entitlement status
 * This is the single source of truth for Pro feature access
 *
 * Replaces the old settings.isProUser check with real subscription entitlement
 *
 * @returns {Object} { isPro: boolean, isLoading: boolean }
 */
export const useProEntitlement = () => {
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let removeListener = null;

    const checkEntitlement = async () => {
      setIsLoading(true);
      try {
        const hasPro = await checkProEntitlement();
        if (isMounted) {
          setIsPro(hasPro);
        }
      } catch (error) {
        console.error("Error checking Pro entitlement:", error);
        if (isMounted) {
          setIsPro(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const init = async () => {
      await checkEntitlement();

      removeListener = await addProEntitlementListener((nextIsPro) => {
        if (isMounted) {
          setIsPro(nextIsPro);
          setIsLoading(false);
        }
      });
    };

    init();

    // Set up periodic check for subscription updates (every 30 seconds)
    // This ensures the UI updates if subscription status changes
    const checkInterval = setInterval(checkEntitlement, 30000);

    return () => {
      isMounted = false;
      clearInterval(checkInterval);
      if (removeListener) {
        removeListener();
      }
    };
  }, []);

  return { isPro, isLoading };
};
