import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, memo, startTransition } from 'react';
import { useTournament } from '../context/TournamentContext';
import { getNextBattle } from '../utils/tournamentUtils';
import { GlassCard, NeonButton, AnimatedText } from '../components/UIComponents';
import { motion, AnimatePresence } from 'framer-motion';
import './BattleView.css';

const CompetitorCard = memo(({ song, isWinner, isLoser, voted, onVote, side, delay }) => {
    const [loadIframe, setLoadIframe] = useState(false);
    const [iframeReady, setIframeReady] = useState(false);

    useEffect(() => {
        // Delay iframe loading even further to ensure smooth entrance
        const timer = setTimeout(() => setLoadIframe(true), 1500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <motion.div
            className={`song-battle-card ${side} ${isWinner ? 'winner' : isLoser ? 'loser' : ''}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut", delay }}
        >
            <GlassCard
                className="battle-card-content"
                staticMode={voted}
            >
                <div
                    className="song-embed-container"
                    onMouseEnter={() => !loadIframe && setLoadIframe(true)}
                >
                    {/* Thumbnail is always present behind the iframe */}
                    <div className="thumbnail-layer">
                        <img
                            src={song.image}
                            alt={song.name}
                            className="competitor-image"
                            loading="eager" // Prioritize competitor images
                            decoding="async"
                        />
                        {!iframeReady && song.embedUrl && (
                            <div className="loading-overlay">
                                <div className="loading-pulse" />
                            </div>
                        )}
                    </div>

                    {song.embedUrl && loadIframe && (
                        <iframe
                            src={song.embedUrl}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className={`song-embed ${iframeReady ? 'ready' : ''}`}
                            onLoad={() => setIframeReady(true)}
                            loading="lazy" // Lazy load the iframe itself
                        />
                    )}

                    {!loadIframe && song.embedUrl && (
                        <div className="play-overlay">▶</div>
                    )}
                </div>

                <div className="song-details">
                    <h3>{song.name || song.title}</h3>
                </div>

                {!voted && (
                    <NeonButton
                        variant="primary"
                        className="btn-vote"
                        onClick={() => onVote(song)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {side === 'left' ? 'VOTE FOR THIS 👈' : '👉 VOTE FOR THIS'}
                    </NeonButton>
                )}

                {isWinner && (
                    <motion.div
                        className="winner-badge"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3, ease: "backOut" }}
                    >
                        👑 CHAMPION 👑
                    </motion.div>
                )}
            </GlassCard>
        </motion.div>
    );
});

const BattleView = () => {
    const { battleId } = useParams();
    const navigate = useNavigate();
    const { bracket, recordVote, tournamentId, setIsTransitioning } = useTournament();
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
        setIsTransitioning(false);
    }, [battleId, bracket, navigate, tournamentId, setIsTransitioning]);

    const handleVote = (winningSong) => {
        if (voted) return;

        setIsTransitioning(true);
        setVoted(true);
        setWinner(winningSong);
        setConfetti(true);

        startTransition(() => {
            recordVote(battleId, winningSong);
        });

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
        }, 1200);
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
                <div className="battle-header">
                    <AnimatedText text={battle.round} className="round-title" />
                    <p className="battle-number">Battle {battle.matchNumber} / {totalBattles}</p>
                    <NeonButton
                        variant="secondary"
                        className="view-bracket-btn"
                        onClick={() => navigate(`/bracket/${tournamentId}`)}
                    >
                        View Bracket
                    </NeonButton>
                </div>

                <div className="battle-arena">
                    <CompetitorCard
                        song={battle.song1}
                        side="left"
                        voted={voted}
                        isWinner={voted && winner === battle.song1}
                        isLoser={voted && winner !== battle.song1}
                        onVote={handleVote}
                        delay={0.1}
                    />

                    <motion.div
                        className="vs-divider"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <div className="vs-text">VS</div>
                    </motion.div>

                    <CompetitorCard
                        song={battle.song2}
                        side="right"
                        voted={voted}
                        isWinner={voted && winner === battle.song2}
                        isLoser={voted && winner !== battle.song2}
                        onVote={handleVote}
                        delay={0.2}
                    />
                </div>

                <AnimatePresence>
                    {voted && (
                        <motion.div
                            className="next-battle-message"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <p>Advancing to next battle...</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default BattleView;
