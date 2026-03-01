import { useTheme } from "../context/ThemeContext";
import { FaPalette, FaMoon } from "react-icons/fa";

const THEME_META = {
  marota: {
    icon: FaPalette,
    label: "Marota theme",
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
      <button
        type="button"
        aria-label={`Current: ${currentThemeMeta.label}. Switch to ${nextThemeMeta.label}.`}
        title={`Switch to ${nextThemeMeta.label}`}
        onClick={() => setTheme(currentThemeMeta.nextTheme)}
        className="theme-switcher__btn"
        data-theme-option={currentTheme}
        data-active="true"
      >
        <Icon aria-hidden="true" />
      </button>
    </div>
  );
}
