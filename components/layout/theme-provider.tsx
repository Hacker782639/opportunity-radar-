"use client";

import * as React from "react";

type ThemeMode = "light" | "dark" | "system";
type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  themeMode: ThemeMode;
  resolvedTheme: Theme;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
};

const THEME_CHANGE_EVENT = "opportunity-radar-theme-change";
const ThemeContext = React.createContext<ThemeContextType | null>(null);

function getThemeModeSnapshot(): ThemeMode {
  const saved = localStorage.getItem("opportunity-radar-theme");

  if (saved === "dark" || saved === "light" || saved === "system") {
    return saved;
  }

  return "system";
}

function getResolvedThemeSnapshot(): Theme {
  const mode = getThemeModeSnapshot();

  if (mode === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  return mode;
}

function subscribeToTheme(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  mediaQuery.addEventListener("change", onStoreChange);

  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
    mediaQuery.removeEventListener("change", onStoreChange);
  };
}

function getServerThemeSnapshot(): Theme {
  return "light";
}

function getServerThemeModeSnapshot(): ThemeMode {
  return "system";
}

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const themeMode = React.useSyncExternalStore(
    subscribeToTheme,
    getThemeModeSnapshot,
    getServerThemeModeSnapshot,
  );

  const resolvedTheme = React.useSyncExternalStore(
    subscribeToTheme,
    getResolvedThemeSnapshot,
    getServerThemeSnapshot,
  );

  React.useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      resolvedTheme === "dark",
    );
  }, [resolvedTheme]);

  const setTheme = (nextTheme: ThemeMode) => {
    localStorage.setItem("opportunity-radar-theme", nextTheme);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: resolvedTheme,
        themeMode,
        resolvedTheme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}
