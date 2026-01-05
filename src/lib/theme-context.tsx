import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";

type Theme = "dark" | "light" | "system";
type ResolvedTheme = "dark" | "light";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: ResolvedTheme;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  resolvedTheme: "dark",
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

// Constants
const THEME_CLASSES = ["light", "dark"] as const;
const MEDIA_QUERY = "(prefers-color-scheme: dark)";

/**
 * Utility function để get system theme preference
 * @returns "dark" | "light"
 */
const getSystemTheme = (): ResolvedTheme => {
  return window.matchMedia(MEDIA_QUERY).matches ? "dark" : "light";
};

/**
 * Utility function để apply theme class vào DOM
 * @param theme - Theme cần apply
 */
const applyThemeToDOM = (theme: ResolvedTheme): void => {
  const root = window.document.documentElement;
  root.classList.remove(...THEME_CLASSES);
  root.classList.add(theme);
};

/**
 * Theme Provider Component
 * Quản lý theme state và sync với localStorage và system preference
 */
export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "memory-safe-guard-theme",
  ...props
}: ThemeProviderProps) {
  // Initialize theme từ localStorage hoặc defaultTheme
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem(storageKey) as Theme;
      return stored && ["dark", "light", "system"].includes(stored) ? stored : defaultTheme;
    } catch {
      // Fallback nếu localStorage không available (SSR, private browsing)
      return defaultTheme;
    }
  });

  // Resolve theme dựa trên system preference
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    if (theme === "system") {
      return getSystemTheme();
    }
    return theme;
  });

  // Memoized setTheme function với error handling
  const setTheme = useCallback((newTheme: Theme) => {
    try {
      localStorage.setItem(storageKey, newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.warn("Failed to save theme to localStorage:", error);
      // Vẫn update state ngay cả khi localStorage fail
      setThemeState(newTheme);
    }
  }, [storageKey]);

  // Effect để resolve và apply theme
  useEffect(() => {
    const resolveAndApplyTheme = () => {
      const newResolvedTheme = theme === "system" ? getSystemTheme() : theme;
      setResolvedTheme(newResolvedTheme);
      applyThemeToDOM(newResolvedTheme);
    };

    resolveAndApplyTheme();
  }, [theme]);

  // Effect để listen system theme changes
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia(MEDIA_QUERY);
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const newSystemTheme = e.matches ? "dark" : "light";
      setResolvedTheme(newSystemTheme);
      applyThemeToDOM(newSystemTheme);
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, [theme]);

  // Memoized context value để tránh unnecessary re-renders
  const contextValue = useMemo(() => ({
    theme,
    setTheme,
    resolvedTheme,
  }), [theme, setTheme, resolvedTheme]);

  return (
    <ThemeProviderContext.Provider {...props} value={contextValue}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

/**
 * Hook để sử dụng theme context
 * @returns Theme state và functions
 */
export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};