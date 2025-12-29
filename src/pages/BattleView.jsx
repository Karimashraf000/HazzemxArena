import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTournament } from '../context/TournamentContext';
import { getNextBattle } from '../utils/tournamentUtils';
import './BattleView.css';

const BattleView = () => {
    const { battleId } = useParams();
    const navigate = useNavigate();
    const { bracket, recordVote, tournamentId } = useTournament();
    const [battle, setBattle] = useState(null);
    const [voted, setVoted] = useState(false);
    const [winner, setWinner] = useState(null);
    const [confetti, setConfetti] = useState(false);

    useEffect(() => {
        if (!bracket) {
            navigate('/');
            return;
        }

        const currentBattle = bracket.allMatches.find(m => m.id === battleId);
        if (!currentBattle) {
            navigate(`/bracket/${tournamentId}`);
            return;
        }

        setBattle(currentBattle);
    }, [battleId, bracket, navigate, tournamentId]);

    const handleVote = (winningSong) => {
        setVoted(true);
        setWinner(winningSong);
        setConfetti(true);

        // Record the vote
        setTimeout(() => {
            recordVote(battleId, winningSong);

            // Navigate to next battle or bracket
            setTimeout(() => {
                const nextBattle = getNextBattle(bracket, battleId);
                if (nextBattle) {
                    navigate(`/battle/${nextBattle.id}`);
                    setVoted(false);
                    setWinner(null);
                    setConfetti(false);
                } else {
                    navigate(`/bracket/${tournamentId}`);
                }
            }, 2000);
        }, 1000);
    };

    if (!battle || !battle.song1 || !battle.song2) {
        return (
            <div className="battle-view">
                <div className="container">
                    <div className="loading">Loading battle...</div>
                </div>
            </div>
        );
    }

    const totalBattles = {
        1: 16,
        2: 8,
        3: 4,
        4: 2,
        5: 1
    }[battle.roundNumber] || 1;

    return (
        <div className="battle-view">
            {confetti && <div className="confetti-container" />}

            <div className="container">
                <div className="battle-header animate-fadeIn">
                    <h2>{battle.round}</h2>
                    <p className="battle-number">Battle {battle.matchNumber} / {totalBattles}</p>
                    <button
                        className="btn btn-secondary view-bracket-btn"
                        onClick={() => navigate(`/bracket/${tournamentId}`)}
                    >
                        View Bracket
                    </button>
                </div>

                <div className="battle-arena">
                    <div className={`song-battle-card animate-slideInLeft ${voted && winner === battle.song1 ? 'winner' : voted ? 'loser' : ''}`}>
                        <div className="card card-glow">
                            <div className="song-embed-container">
                                <iframe
                                    src={battle.song1.embedUrl}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="song-embed"
                                />
                            </div>

                            <div className="song-details">
                                <h3>{battle.song1.title}</h3>
                                <p className="platform-badge">{battle.song1.platform}</p>
                            </div>

                            {!voted && (
                                <button
                                    className="btn btn-vote"
                                    onClick={() => handleVote(battle.song1)}
                                >
                                    Vote for This Song 🗳️
                                </button>
                            )}

                            {voted && winner === battle.song1 && (
                                <div className="winner-badge animate-scaleIn">
                                    👑 WINNER!
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="vs-divider animate-scaleIn delay-200">
                        <div className="vs-text">VS</div>
                    </div>

                    <div className={`song-battle-card animate-slideInRight ${voted && winner === battle.song2 ? 'winner' : voted ? 'loser' : ''}`}>
                        <div className="card card-glow">
                            <div className="song-embed-container">
                                <iframe
                                    src={battle.song2.embedUrl}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="song-embed"
                                />
                            </div>

                            <div className="song-details">
                                <h3>{battle.song2.title}</h3>
                                <p className="platform-badge">{battle.song2.platform}</p>
                            </div>

                            {!voted && (
                                <button
                                    className="btn btn-vote"
                                    onClick={() => handleVote(battle.song2)}
                                >
                                    Vote for This Song 🗳️
                                </button>
                            )}

                            {voted && winner === battle.song2 && (
                                <div className="winner-badge animate-scaleIn">
                                    👑 WINNER!
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {voted && (
                    <div className="next-battle-message animate-fadeIn">
                        <p>Advancing to next battle...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BattleView;
