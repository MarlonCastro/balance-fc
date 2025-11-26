import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Ensure light mode by default
if (!localStorage.getItem('dark-mode')) {
  document.documentElement.classList.remove('dark');
  localStorage.setItem('dark-mode', 'false');
} else {
  const isDark = localStorage.getItem('dark-mode') === 'true';
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
