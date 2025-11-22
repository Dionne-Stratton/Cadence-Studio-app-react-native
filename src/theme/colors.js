/**
 * Color palette for the app
 * Centralized color definitions for consistent theming
 * 
 * This file exports the current theme colors based on the selected theme mode.
 * Use useTheme() hook in components to get theme-aware colors.
 */

import { lightColors, darkColors } from './themes';

// Default export for backward compatibility (light theme)
export const colors = lightColors;

// Re-export theme definitions
export { lightColors, darkColors };

export default colors;

