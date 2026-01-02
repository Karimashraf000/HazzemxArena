import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { TournamentProvider } from './context/TournamentContext';
import { AnimatePresence, motion } from 'framer-motion';
import './App.css';
import CustomCursor from './components/CustomCursor';

// Lazy load heavy components
const Background3D = lazy(() => import('./components/Background3D'));
const Home = lazy(() => import('./pages/Home'));
const TournamentSetup = lazy(() => import('./pages/TournamentSetup'));
const BracketView = lazy(() => import('./pages/BracketView'));
const BattleView = lazy(() => import('./pages/BattleView'));

const LoadingFallback = () => (
  <div className="app-loading-fallback">
    <div className="spinner"></div>
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <Suspense fallback={<LoadingFallback />}>
              <Home />
            </Suspense>
          </motion.div>
        } />
        <Route path="/custom" element={
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <Suspense fallback={<LoadingFallback />}>
              <TournamentSetup />
            </Suspense>
          </motion.div>
        } />
        <Route path="/bracket/:tournamentId" element={
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.3 }}>
            <Suspense fallback={<LoadingFallback />}>
              <BracketView />
            </Suspense>
          </motion.div>
        } />
        <Route path="/battle/:battleId" element={
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <Suspense fallback={<LoadingFallback />}>
              <BattleView />
            </Suspense>
          </motion.div>
        } />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <TournamentProvider>
        <CustomCursor />
        <div className="app-container neon-bg-fallback">
          <Suspense fallback={null}>
            <Background3D />
          </Suspense>
          <AnimatedRoutes />
        </div>
      </TournamentProvider>
    </Router>
  );
}



export default App;


