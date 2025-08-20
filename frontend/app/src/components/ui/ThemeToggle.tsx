import React from 'react';
import { LuSun, LuMoon } from 'react-icons/lu';
import { useTheme } from '../../hooks/useTheme';

interface ThemeToggleProps {
  onThemeChange?: (theme: 'light' | 'dark') => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ onThemeChange }) => {
  const { resolvedTheme, toggleTheme } = useTheme();

  const handleToggle = () => {
    toggleTheme();
    onThemeChange?.(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      onClick={handleToggle}
      className="theme-toggle-button"
      title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} theme`}
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} theme`}
    >
      {resolvedTheme === 'dark' ? (
        <LuSun size={14} />
      ) : (
        <LuMoon size={14} />
      )}
    </button>
  );
};

export default ThemeToggle;