import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { MatchSetup } from './pages/MatchSetup';
import { TeamDraw } from './pages/TeamDraw';
import { DrawResult } from './pages/DrawResult';
import { useEffect } from 'react';

function App() {
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K for quick navigation (can be extended)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Could open a command palette here
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/setup" element={<MatchSetup />} />
          <Route path="/draw/:matchId" element={<TeamDraw />} />
          <Route path="/draw/:matchId/result" element={<DrawResult />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}

export default App;
