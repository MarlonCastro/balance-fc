import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first
    const stored = localStorage.getItem('dark-mode');
    if (stored !== null) {
      return stored === 'true';
    }
    // Default to light mode
    return false;
  });

  // Initialize on mount - ensure light mode by default
  useEffect(() => {
    const root = document.documentElement;
    const stored = localStorage.getItem('dark-mode');
    
    if (stored === null) {
      // No preference stored, default to light
      root.classList.remove('dark');
      localStorage.setItem('dark-mode', 'false');
      setIsDark(false);
    } else {
      // Apply stored preference
      if (stored === 'true') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, []);

  // Update when isDark changes
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('dark-mode', 'true');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('dark-mode', 'false');
    }
  }, [isDark]);

  const toggle = () => {
    setIsDark((prev) => !prev);
  };

  return { isDark, toggle, setIsDark };
}
