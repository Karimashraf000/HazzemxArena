import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ParticlesBackground from './components/ParticlesBackground';
import HomePage from './pages/HomePage';
import TournamentSetup from './pages/TournamentSetup';
import BattleView from './pages/BattleView';
import BracketView from './pages/BracketView';
import { TournamentProvider } from './context/TournamentContext';
import './App.css';

function App() {
  return (
    <TournamentProvider>
      <Router>
        <div className="App">
          <ParticlesBackground />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/setup" element={<TournamentSetup />} />
            <Route path="/battle/:battleId" element={<BattleView />} />
            <Route path="/bracket/:tournamentId" element={<BracketView />} />
          </Routes>
        </div>
      </Router>
    </TournamentProvider>
  );
}

export default App;
