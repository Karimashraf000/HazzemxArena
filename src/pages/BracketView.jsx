import { useParams, useNavigate } from 'react-router-dom';
import { useTournament } from '../context/TournamentContext';
import { getCurrentBattle, getTournamentProgress } from '../utils/tournamentUtils';
import { useState } from 'react';
import { GlassCard, NeonButton, AnimatedText } from '../components/UIComponents';
import { motion } from 'framer-motion';
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
                    <GlassCard className="error-state">
                        <h2>No Tournament Found</h2>
                        <p>Create a new tournament to get started</p>
                        <NeonButton variant="primary" onClick={() => navigate('/')}>
                            Go Home
                        </NeonButton>
                    </GlassCard>
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
        const song1Name = match.song1?.name || match.song1?.title || 'TBD';
        const song2Name = match.song2?.name || match.song2?.title || 'TBD';
        const isWinner1 = match.winner === match.song1;
        const isWinner2 = match.winner === match.song2;

        return (
            <motion.div
                key={match.id}
                className={`bracket-match ${isComplete ? 'complete' : 'pending'}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
            >
                <div className={`match-team ${isWinner1 ? 'winner' : isComplete ? 'loser' : ''}`}>
                    <span className="team-name">{song1Name}</span>
                    {isWinner1 && <span className="crown">👑</span>}
                </div>
                <div className={`match-team ${isWinner2 ? 'winner' : isComplete ? 'loser' : ''}`}>
                    <span className="team-name">{song2Name}</span>
                    {isWinner2 && <span className="crown">👑</span>}
                </div>
            </motion.div>
        );
    };

    return (
        <div className="bracket-view">
            <div className="bracket-container">
                <div className="bracket-header">
                    <AnimatedText text="Tournament Bracket" className="page-title" />

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
                            <motion.div
                                className="progress-fill-bracket"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress.percentage}%` }}
                                transition={{ duration: 1 }}
                            />
                        </div>
                    </div>

                    <div className="header-actions">
                        {currentBattle && (
                            <NeonButton variant="primary" onClick={handleContinueBattle} className="animate-pulse">
                                Continue Battle
                            </NeonButton>
                        )}
                        {progress.isComplete && (
                            <motion.div
                                className="champion-announcement"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring' }}
                            >
                                <h2>🏆 Champion: {bracket.final[0].winner?.name || bracket.final[0].winner?.title} 🏆</h2>
                            </motion.div>
                        )}
                        <NeonButton variant="secondary" onClick={handleShare}>
                            {copied ? '✓ Copied!' : 'Share Tournament'}
                        </NeonButton>
                        <NeonButton variant="secondary" onClick={handleCreateNew}>
                            Create New
                        </NeonButton>
                    </div>
                </div>

                <motion.div
                    className="bracket-rounds"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: {
                            transition: {
                                staggerChildren: 0.2
                            }
                        }
                    }}
                >
                    {bracket.rounds ? (
                        bracket.rounds.map((roundMatches, i) => (
                            <motion.div
                                key={`round-${i}`}
                                className="round"
                                variants={{
                                    hidden: { opacity: 0, x: -20 },
                                    visible: { opacity: 1, x: 0 }
                                }}
                            >
                                <h3 className="round-title">{roundMatches[0].round}</h3>
                                <div className="matches">
                                    {roundMatches.map((match, j) => renderMatch(match, j))}
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        // Fallback for old bracket structure if any
                        <>
                            {bracket.roundOf32 && (
                                <div className="round">
                                    <h3 className="round-title">Round of 32</h3>
                                    <div className="matches">
                                        {bracket.roundOf32.map((match, i) => renderMatch(match, i))}
                                    </div>
                                </div>
                            )}
                            {bracket.roundOf16 && (
                                <div className="round">
                                    <h3 className="round-title">Round of 16</h3>
                                    <div className="matches">
                                        {bracket.roundOf16.map((match, i) => renderMatch(match, i))}
                                    </div>
                                </div>
                            )}
                            {bracket.quarterFinals && (
                                <div className="round">
                                    <h3 className="round-title">Quarter Finals</h3>
                                    <div className="matches">
                                        {bracket.quarterFinals.map((match, i) => renderMatch(match, i))}
                                    </div>
                                </div>
                            )}
                            {bracket.semiFinals && (
                                <div className="round">
                                    <h3 className="round-title">Semi Finals</h3>
                                    <div className="matches">
                                        {bracket.semiFinals.map((match, i) => renderMatch(match, i))}
                                    </div>
                                </div>
                            )}
                            {bracket.final && (
                                <div className="round">
                                    <h3 className="round-title">Final</h3>
                                    <div className="matches">
                                        {bracket.final.map((match, i) => renderMatch(match, i))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default BracketView;
