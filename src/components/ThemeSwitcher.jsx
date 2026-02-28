import { useTheme } from "../context/ThemeContext";
import { FaPalette, FaMoon, FaSun } from "react-icons/fa";

const THEME_OPTIONS = [
  { value: "marota", label: "Marota Theme", icon: FaPalette },
  { value: "dark", label: "Dark Theme", icon: FaMoon },
  { value: "bright", label: "Bright Theme", icon: FaSun },
];

export default function ThemeSwitcher({ compact = false }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={`theme-switcher ${compact ? "theme-switcher--compact" : ""}`}
      role="group"
      aria-label="Theme selection"
    >
      {THEME_OPTIONS.map((option) => {
        const Icon = option.icon;
        const isActive = theme === option.value;

        return (
          <button
            key={option.value}
            type="button"
            aria-label={option.label}
            title={option.label}
            aria-pressed={isActive}
            onClick={() => setTheme(option.value)}
            className="theme-switcher__btn"
            data-theme-option={option.value}
            data-active={isActive ? "true" : "false"}
          >
            <Icon aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
