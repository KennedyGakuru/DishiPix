import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

// Define theme colors based on your Tailwind config
export const colors = {
  primary: {
    DEFAULT: '#FF6B00',
    light: '#FFA24D',
    dark: '#E05A00',
  },
  background: {
    light: '#F9FAFB',
    DEFAULT: '#FFFFFF',
    dark: '#1A1A1A',
  },
  text: {
    DEFAULT: '#111827',
    muted: '#6B7280',
    light: '#E5E7EB',
  },
  surface: {
    light: '#FFFFFF',
    dark: '#2C2C2C',
  },
  success: '#22C55E',
  warning: '#FACC15',
  error: '#EF4444',
  rating: '#F59E0B',
};

// Theme interface
export interface Theme {
  isDark: boolean;
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    background: string;
    backgroundAlt: string;
    surface: string;
    text: string;
    textMuted: string;
    success: string;
    warning: string;
    error: string;
    rating: string;
  };
}

// Light theme
const lightTheme: Theme = {
  isDark: false,
  colors: {
    primary: colors.primary.DEFAULT,
    primaryLight: colors.primary.light,
    primaryDark: colors.primary.dark,
    background: colors.background.DEFAULT,
    backgroundAlt: colors.background.light,
    surface: colors.surface.light,
    text: colors.text.DEFAULT,
    textMuted: colors.text.muted,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    rating: colors.rating,
  },
};

// Dark theme
const darkTheme: Theme = {
  isDark: true,
  colors: {
    primary: colors.primary.DEFAULT,
    primaryLight: colors.primary.light,
    primaryDark: colors.primary.dark,
    background: colors.background.dark,
    backgroundAlt: colors.surface.dark,
    surface: colors.surface.dark,
    text: colors.text.light,
    textMuted: colors.text.muted,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    rating: colors.rating,
  },
};

// Theme context interface
interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  themeMode: 'light' | 'dark' | 'system';
}

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider props
interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: 'light' | 'dark' | 'system';
}

// Theme provider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  initialTheme = 'system' 
}) => {
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>(initialTheme);
  const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  // Listen to system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme);
    });

    return () => subscription?.remove();
  }, []);

  // Determine current theme
  const getCurrentTheme = (): Theme => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark' ? darkTheme : lightTheme;
    }
    return themeMode === 'dark' ? darkTheme : lightTheme;
  };

  const theme = getCurrentTheme();
  const isDark = theme.isDark;

  const toggleTheme = () => {
    setThemeMode(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setThemeMode(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    isDark,
    toggleTheme,
    setTheme,
    themeMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Utility hook for getting theme-aware styles
export const useThemedStyles = () => {
  const { theme, isDark } = useTheme();
  
  return {
    // Common style combinations
    container: {
      backgroundColor: theme.colors.background,
    },
    card: {
      backgroundColor: theme.colors.surface,
    },
    text: {
      color: theme.colors.text,
    },
    textMuted: {
      color: theme.colors.textMuted,
    },
    primary: {
      backgroundColor: theme.colors.primary,
    },
    primaryText: {
      color: theme.colors.primary,
    },
    // Dynamic styles based on theme
    shadow: isDark ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    border: {
      borderColor: isDark ? '#374151' : '#E5E7EB',
    },
  };
};

export default ThemeContext;