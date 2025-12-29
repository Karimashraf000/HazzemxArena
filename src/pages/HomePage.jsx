import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTournament } from '../context/TournamentContext';
import './HomePage.css';

const HomePage = () => {
    const navigate = useNavigate();
    const { resetTournament, tournamentId } = useTournament();

    // Redirect to bracket if tournament is loaded from URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('t') && tournamentId) {
            navigate(`/bracket/${tournamentId}`);
        }
    }, [tournamentId, navigate]);

    const handleCreateTournament = () => {
        resetTournament();
        navigate('/setup');
    };

    return (
        <div className="home-page">
            <div className="container">
                <div className="home-content animate-fadeIn">
                    <div className="logo animate-scaleIn delay-200">
                        <svg viewBox="0 0 100 100" className="logo-icon">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="url(#gradient1)" strokeWidth="3" />
                            <path d="M 30 50 L 70 30 L 70 70 Z" fill="url(#gradient2)" />
                            <defs>
                                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#7C3AED" />
                                    <stop offset="100%" stopColor="#EC4899" />
                                </linearGradient>
                                <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#8B5CF6" />
                                    <stop offset="100%" stopColor="#F472B6" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    <h1 className="title animate-fadeIn delay-300">
                        Song Battle
                    </h1>

                    <p className="subtitle animate-fadeIn delay-400">
                        Create epic music tournaments and let the best song win
                    </p>

                    <div className="features animate-fadeIn delay-500">
                        <div className="feature card card-glow">
                            <div className="feature-icon">🎵</div>
                            <h3>32 Songs</h3>
                            <p>Add your favorite tracks from YouTube or Spotify</p>
                        </div>

                        <div className="feature card card-glow delay-100">
                            <div className="feature-icon">🏆</div>
                            <h3>Tournament Style</h3>
                            <p>Bracket-based elimination rounds to crown the champion</p>
                        </div>

                        <div className="feature card card-glow delay-200">
                            <div className="feature-icon">🔗</div>
                            <h3>Share & Vote</h3>
                            <p>Get a shareable link and let others vote in real-time</p>
                        </div>
                    </div>

                    <div className="cta-buttons animate-fadeIn delay-600">
                        <button
                            className="btn btn-primary btn-large animate-glow"
                            onClick={handleCreateTournament}
                        >
                            Create Tournament
                        </button>
                    </div>

                    <div className="scroll-indicator animate-float delay-700">
                        <span>↓</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
