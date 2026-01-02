import { useTheme } from '../contexts/ThemeContext';
import type { Theme } from '../types/theme';
import { themes } from '../types/theme';

export function ThemeSwitcher() {
  const { theme, themeConfig, setTheme } = useTheme();

  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        padding: '12px',
        backgroundColor: themeConfig.colors.surface,
        borderRadius: '8px',
        border: `1px solid ${themeConfig.colors.border}`,
      }}
    >
      {(Object.keys(themes) as Theme[]).map((themeName) => (
        <button
          key={themeName}
          onClick={() => setTheme(themeName)}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: theme === themeName ? `2px solid ${themeConfig.colors.primary}` : `1px solid ${themeConfig.colors.border}`,
            background: theme === themeName ? themeConfig.colors.primary : themeConfig.colors.background,
            color: theme === themeName ? '#ffffff' : themeConfig.colors.text,
            fontSize: '14px',
            fontWeight: theme === themeName ? '600' : '400',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {themes[themeName].name}
        </button>
      ))}
    </div>
  );
}
