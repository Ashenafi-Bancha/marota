import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext();

const STORAGE_KEY = "marota-theme";
const THEMES = ["marota", "dark", "bright"];

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = window.localStorage.getItem(STORAGE_KEY);
    return THEMES.includes(savedTheme) ? savedTheme : "marota";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      themes: THEMES,
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
