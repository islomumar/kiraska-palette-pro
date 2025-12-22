import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { predefinedThemes, getThemeById, DEFAULT_THEME_ID, Theme, ThemeColors } from '@/data/themes';

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => Promise<void>;
  themes: Theme[];
  isLoading: boolean;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const applyThemeColors = (colors: ThemeColors) => {
  const root = document.documentElement;
  
  root.style.setProperty('--primary', colors.primary);
  root.style.setProperty('--primary-foreground', colors.primaryForeground);
  root.style.setProperty('--secondary', colors.secondary);
  root.style.setProperty('--secondary-foreground', colors.secondaryForeground);
  root.style.setProperty('--accent', colors.accent);
  root.style.setProperty('--accent-foreground', colors.accentForeground);
  root.style.setProperty('--background', colors.background);
  root.style.setProperty('--foreground', colors.foreground);
  root.style.setProperty('--card', colors.card);
  root.style.setProperty('--card-foreground', colors.cardForeground);
  root.style.setProperty('--popover', colors.popover);
  root.style.setProperty('--popover-foreground', colors.popoverForeground);
  root.style.setProperty('--muted', colors.muted);
  root.style.setProperty('--muted-foreground', colors.mutedForeground);
  root.style.setProperty('--border', colors.border);
  root.style.setProperty('--input', colors.input);
  root.style.setProperty('--ring', colors.ring);
  root.style.setProperty('--destructive', colors.destructive);
  root.style.setProperty('--destructive-foreground', colors.destructiveForeground);
  
  // Custom status colors
  root.style.setProperty('--success', colors.success);
  root.style.setProperty('--success-foreground', colors.successForeground);
  root.style.setProperty('--warning', colors.warning);
  root.style.setProperty('--warning-foreground', colors.warningForeground);
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(getThemeById(DEFAULT_THEME_ID)!);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Apply theme colors when theme or dark mode changes
  useEffect(() => {
    const colors = isDarkMode ? currentTheme.colors.dark : currentTheme.colors.light;
    applyThemeColors(colors);
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [currentTheme, isDarkMode]);

  // Load theme from database on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'theme_id')
          .maybeSingle();

        if (!error && data?.value) {
          const theme = getThemeById(data.value);
          if (theme) {
            setCurrentTheme(theme);
          }
        }
      } catch (err) {
        console.error('Error loading theme:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  const setTheme = useCallback(async (themeId: string) => {
    const theme = getThemeById(themeId);
    if (!theme) return;

    setCurrentTheme(theme);

    // Save to database
    try {
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', 'theme_id')
        .maybeSingle();

      if (existing) {
        await supabase
          .from('site_settings')
          .update({ value: themeId, updated_at: new Date().toISOString() })
          .eq('key', 'theme_id');
      } else {
        await supabase
          .from('site_settings')
          .insert({ key: 'theme_id', value: themeId });
      }
    } catch (err) {
      console.error('Error saving theme:', err);
    }
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setTheme,
        themes: predefinedThemes,
        isLoading,
        isDarkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
