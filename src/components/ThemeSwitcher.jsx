import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { FaDesktop, FaMoon } from "react-icons/fa";

const THEME_META = {
  marota: {
    icon: FaDesktop,
    label: "System theme",
    nextTheme: "dark",
  },
  dark: {
    icon: FaMoon,
    label: "Dark theme",
    nextTheme: "marota",
  },
};

export default function ThemeSwitcher({ compact = false }) {
  const { theme, setTheme } = useTheme();
  const [showHint, setShowHint] = useState(false);
  const currentTheme = theme === "dark" ? "dark" : "marota";
  const currentThemeMeta = THEME_META[currentTheme];
  const nextThemeMeta = THEME_META[currentThemeMeta.nextTheme];
  const Icon = currentThemeMeta.icon;
  const helperText = `Now: ${currentThemeMeta.label}. Click to switch to ${nextThemeMeta.label}.`;

  useEffect(() => {
    if (!showHint) return;

    const timer = window.setTimeout(() => {
      setShowHint(false);
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [showHint]);

  const handleThemeToggle = () => {
    setTheme(currentThemeMeta.nextTheme);
    setShowHint(true);
  };

  return (
    <div
      className={`theme-switcher ${compact ? "theme-switcher--compact" : ""}`}
      role="group"
      aria-label="Theme selection"
    >
      <div className={`theme-switcher__control ${showHint ? "is-hint-visible" : ""}`}>
        <button
          type="button"
          aria-label={`Current: ${currentThemeMeta.label}. Switch to ${nextThemeMeta.label}.`}
          title={`Theme: ${currentThemeMeta.label}. Click to switch to ${nextThemeMeta.label}.`}
          onClick={handleThemeToggle}
          className="theme-switcher__btn"
          data-theme-option={currentTheme}
          data-active="true"
        >
          <Icon aria-hidden="true" />
        </button>
        <span className="theme-switcher__tooltip" role="status" aria-live="polite">
          {helperText}
        </span>
      </div>
    </div>
  );
}
