import { useTheme } from "../context/ThemeContext";
import { FaDesktop, FaMoon } from "react-icons/fa";

const THEME_META = {
  marota: {
    icon: FaDesktop,
    label: "System mode",
    nextTheme: "dark",
  },
  dark: {
    icon: FaMoon,
    label: "Dark mode",
    nextTheme: "marota",
  },
};

export default function ThemeSwitcher({ compact = false }) {
  const { theme, setTheme } = useTheme();
  const currentTheme = theme === "dark" ? "dark" : "marota";
  const currentThemeMeta = THEME_META[currentTheme];
  const nextThemeMeta = THEME_META[currentThemeMeta.nextTheme];
  const Icon = currentThemeMeta.icon;

  return (
    <div
      className={`theme-switcher ${compact ? "theme-switcher--compact" : ""}`}
      role="group"
      aria-label="Theme selection"
    >
      <div className="theme-switcher__control">
        <button
          type="button"
          aria-label={`Current: ${currentThemeMeta.label}. Switch to ${nextThemeMeta.label}.`}
          onClick={() => setTheme(currentThemeMeta.nextTheme)}
          className="theme-switcher__btn"
          data-theme-option={currentTheme}
          data-active="true"
        >
          <Icon aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
