/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    primary: '#D4A017',
    background: '#FFF8F0',
    card: '#FFFFFF',
    text: '#3E2723',
    textSecondary: '#6D4C41',
    accent: '#2E7D32',
    error: '#D32F2F',
    border: '#E8E0D8',
    tint: '#D4A017',
    tabIconDefault: '#A1887F',
    tabIconSelected: '#D4A017',
    inputBorder: '#D7CCC8',
    inputBackground: '#FFF8F0',
    successText: '#2E7D32',
    errorText: '#D32F2F',
    icon: '#6D4C41',
    progressTrack: '#EFEBE9',
    progressFill: '#D4A017',
    sectionHeader: '#FFF3E0',
    white: '#FFFFFF',
  },
  dark: {
    primary: '#F0C040',
    background: '#1A1A1A',
    card: '#2C2C2C',
    text: '#F5F5F5',
    textSecondary: '#BCAAA4',
    accent: '#66BB6A',
    error: '#EF5350',
    border: '#424242',
    tint: '#F0C040',
    tabIconDefault: '#9E9E9E',
    tabIconSelected: '#F0C040',
    inputBorder: '#616161',
    inputBackground: '#2C2C2C',
    successText: '#66BB6A',
    errorText: '#EF5350',
    icon: '#BCAAA4',
    progressTrack: '#424242',
    progressFill: '#F0C040',
    sectionHeader: '#3E2723',
    white: '#FFFFFF',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
