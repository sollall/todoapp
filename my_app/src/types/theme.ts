export type Theme = 'minimal' | 'modern' | 'dark';

export interface ThemeConfig {
  name: string;
  colors: {
    primary: string;
    primaryHover: string;
    background: string;
    surface: string;
    border: string;
    text: string;
    textSecondary: string;
    success: string;
    successLight: string;
    warning: string;
    warningLight: string;
    accent: string;
    hover: string;
  };
}

export const themes: Record<Theme, ThemeConfig> = {
  minimal: {
    name: 'シンプル&ミニマル',
    colors: {
      primary: '#2563eb',
      primaryHover: '#1d4ed8',
      background: '#ffffff',
      surface: '#f9fafb',
      border: '#e5e7eb',
      text: '#111827',
      textSecondary: '#6b7280',
      success: '#10b981',
      successLight: '#d1fae5',
      warning: '#f59e0b',
      warningLight: '#fef3c7',
      accent: '#8b5cf6',
      hover: 'rgba(59, 130, 246, 0.05)',
    },
  },
  modern: {
    name: 'モダン&カラフル',
    colors: {
      primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      primaryHover: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
      background: '#f8f9fe',
      surface: '#ffffff',
      border: '#e0e7ff',
      text: '#1e293b',
      textSecondary: '#64748b',
      success: '#22c55e',
      successLight: '#dcfce7',
      warning: '#f97316',
      warningLight: '#ffedd5',
      accent: '#ec4899',
      hover: 'rgba(102, 126, 234, 0.1)',
    },
  },
  dark: {
    name: 'ダーク&エレガント',
    colors: {
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      background: '#0f172a',
      surface: '#1e293b',
      border: '#334155',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      success: '#10b981',
      successLight: '#064e3b',
      warning: '#f59e0b',
      warningLight: '#78350f',
      accent: '#a855f7',
      hover: 'rgba(59, 130, 246, 0.15)',
    },
  },
};
