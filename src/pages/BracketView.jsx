import { useParams, useNavigate } from 'react-router-dom';
import { useTournament } from '../context/TournamentContext';
import { getCurrentBattle, getTournamentProgress } from '../utils/tournamentUtils';
import { useState } from 'react';
import './BracketView.css';

const BracketView = () => {
    const { tournamentId } = useParams();
    const navigate = useNavigate();
    const { bracket, getShareableUrl } = useTournament();
    const [copied, setCopied] = useState(false);

    if (!bracket) {
        return (
            <div className="bracket-view">
                <div className="container">
                    <div className="error-state">
                        <h2>No Tournament Found</h2>
                        <p>Create a new tournament to get started</p>
                        <button className="btn btn-primary" onClick={() => navigate('/')}>
                            Go Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const currentBattle = getCurrentBattle(bracket);
    const progress = getTournamentProgress(bracket);

    const handleContinueBattle = () => {
        if (currentBattle) {
            navigate(`/battle/${currentBattle.id}`);
        }
    };

    const handleShare = () => {
        const url = getShareableUrl();
        if (url) {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleCreateNew = () => {
        navigate('/');
    };

    const renderMatch = (match, index) => {
        if (!match) return null;

        const isComplete = match.winner !== null;
        const song1Name = match.song1?.title || 'TBD';
        const song2Name = match.song2?.title || 'TBD';
        const isWinner1 = match.winner === match.song1;
        const isWinner2 = match.winner === match.song2;

        return (
            <div
                key={match.id}
                className={`bracket-match ${isComplete ? 'complete' : 'pending'} animate-fadeIn`}
                style={{ animationDelay: `${index * 0.05}s` }}
            >
                <div className={`match-team ${isWinner1 ? 'winner' : isComplete ? 'loser' : ''}`}>
                    <span className="team-name">{song1Name}</span>
                    {isWinner1 && <span className="crown">👑</span>}
                </div>
                <div className={`match-team ${isWinner2 ? 'winner' : isComplete ? 'loser' : ''}`}>
                    <span className="team-name">{song2Name}</span>
                    {isWinner2 && <span className="crown">👑</span>}
                </div>
            </div>
        );
    };

    return (
        <div className="bracket-view">
            <div className="bracket-container">
                <div className="bracket-header animate-fadeIn">
                    <h1>Tournament Bracket</h1>

                    <div className="progress-section">
                        <div className="progress-stats">
                            <span className="stat">
                                <span className="label">Progress:</span>
                                <span className="value">{progress.percentage}%</span>
                            </span>
                            <span className="stat">
                                <span className="label">Battles:</span>
                                <span className="value">{progress.completed} / {progress.total}</span>
                            </span>
                        </div>
                        <div className="progress-bar-bracket">
                            <div className="progress-fill-bracket" style={{ width: `${progress.percentage}%` }} />
                        </div>
                    </div>

                    <div className="header-actions">
                        {currentBattle && (
                            <button className="btn btn-primary animate-glow" onClick={handleContinueBattle}>
                                Continue Battle
                            </button>
                        )}
                        {progress.isComplete && (
                            <div className="champion-announcement animate-scaleIn">
                                <h2>🏆 Champion: {bracket.final[0].winner?.title} 🏆</h2>
                            </div>
                        )}
                        <button className="btn btn-secondary" onClick={handleShare}>
                            {copied ? '✓ Copied!' : 'Share Tournament'}
                        </button>
                        <button className="btn btn-secondary" onClick={handleCreateNew}>
                            Create New
                        </button>
                    </div>
                </div>

                <div className="bracket-rounds">
                    <div className="round">
                        <h3 className="round-title">Round of 32</h3>
                        <div className="matches">
                            {bracket.roundOf32.map((match, i) => renderMatch(match, i))}
                        </div>
                    </div>

                    <div className="round">
                        <h3 className="round-title">Round of 16</h3>
                        <div className="matches">
                            {bracket.roundOf16.map((match, i) => renderMatch(match, i))}
                        </div>
                    </div>

                    <div className="round">
                        <h3 className="round-title">Quarter Finals</h3>
                        <div className="matches">
                            {bracket.quarterFinals.map((match, i) => renderMatch(match, i))}
                        </div>
                    </div>

                    <div className="round">
                        <h3 className="round-title">Semi Finals</h3>
                        <div className="matches">
                            {bracket.semiFinals.map((match, i) => renderMatch(match, i))}
                        </div>
                    </div>

                    <div className="round">
                        <h3 className="round-title">Final</h3>
                        <div className="matches">
                            {bracket.final.map((match, i) => renderMatch(match, i))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BracketView;
