import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TournamentProvider } from './context/TournamentContext';
import ParticlesBackground from './components/ParticlesBackground';
import Home from './pages/Home';
import TournamentSetup from './pages/TournamentSetup';
import BracketView from './pages/BracketView';
import BattleView from './pages/BattleView';
import './App.css';

function App() {
  return (
    <Router>
      <TournamentProvider>
        <div className="app-container">
          <ParticlesBackground />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/custom" element={<TournamentSetup />} />
            <Route path="/bracket/:tournamentId" element={<BracketView />} />
            <Route path="/battle/:battleId" element={<BattleView />} />
          </Routes>
        </div>
      </TournamentProvider>
    </Router>
  );
}

export default App;
