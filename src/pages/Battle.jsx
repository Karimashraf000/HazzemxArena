import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import VSElement from '../components/VSElement';
import NeonButton from '../components/NeonButton';
import { useTournament } from '../hooks/useTournament';
import { getRoundName } from '../utils/bracketLogic';

export default function Battle() {
    const navigate = useNavigate();
    const { tournament, currentMatch, vote, isComplete, roundName, progress } = useTournament();
    const [selectedId, setSelectedId] = useState(null);
    const [isVoting, setIsVoting] = useState(false);
    const [imageLoaded, setImageLoaded] = useState({ p1: false, p2: false });

    // Redirect if no tournament or tournament complete
    useEffect(() => {
        if (!tournament) {
            navigate('/');
        } else if (isComplete) {
            navigate('/victory');
        }
    }, [tournament, isComplete, navigate]);

    if (!tournament || !currentMatch) {
        return null;
    }

    const { participant1, participant2 } = currentMatch;

    const handleVote = async (participantId) => {
        if (isVoting) return;

        setIsVoting(true);
        setSelectedId(participantId);

        // Wait for animation
        await new Promise(resolve => setTimeout(resolve, 1500));

        vote(participantId);

        // Reset state for next match
        setSelectedId(null);
        setIsVoting(false);
        setImageLoaded({ p1: false, p2: false });
    };

    const getCardState = (participantId) => {
        if (!selectedId) return 'idle';
        if (selectedId === participantId) return 'winner';
        return 'loser';
    };

    const cardVariants = {
        idle: {
            scale: 1,
            opacity: 1,
            filter: 'brightness(1)',
        },
        winner: {
            scale: 1.05,
            opacity: 1,
            filter: 'brightness(1.2)',
            transition: { duration: 0.3 },
        },
        loser: {
            scale: 0.9,
            opacity: 0.3,
            filter: 'brightness(0.5) grayscale(1)',
            transition: { duration: 0.5, delay: 0.2 },
        },
    };

    const ParticipantCard = ({ participant, position, onVote, state }) => {
        const isP1 = position === 'left';
        const isWinner = state === 'winner';
        const isLoser = state === 'loser';

        return (
            <motion.div
                className="flex-1 max-w-md"
                variants={cardVariants}
                animate={state}
                initial={{
                    opacity: 0,
                    x: isP1 ? -100 : 100,
                }}
                whileInView={{
                    opacity: 1,
                    x: 0,
                    transition: { type: 'spring', stiffness: 100, damping: 20 },
                }}
            >
                <GlassCard
                    onClick={() => !isVoting && onVote(participant.id)}
                    glowColor={isWinner ? 'cyan' : isLoser ? 'pink' : isP1 ? 'cyan' : 'purple'}
                    hoverScale={isVoting ? 1 : 1.03}
                    className={`
            relative overflow-hidden
            ${isVoting ? 'pointer-events-none' : ''}
          `}
                >
                    {/* Holographic effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent pointer-events-none" />

                    {/* Light bleeding effect for winner */}
                    {isWinner && (
                        <motion.div
                            className="absolute inset-0 pointer-events-none"
                            initial={{ opacity: 0 }}
                            animate={{
                                opacity: [0.3, 0.6, 0.3],
                                boxShadow: [
                                    'inset 0 0 50px rgba(0, 245, 255, 0.3)',
                                    'inset 0 0 100px rgba(0, 245, 255, 0.5)',
                                    'inset 0 0 50px rgba(0, 245, 255, 0.3)',
                                ],
                            }}
                            transition={{ duration: 1, repeat: Infinity }}
                        />
                    )}

                    <div className="p-6">
                        {/* Image container with holographic projector effect */}
                        <div className="relative aspect-square mb-4 rounded-xl overflow-hidden">
                            {/* Loading skeleton */}
                            {!imageLoaded[isP1 ? 'p1' : 'p2'] && (
                                <div className="absolute inset-0 bg-gradient-to-br from-cyber-purple/20 to-cyber-cyan/20 animate-pulse" />
                            )}

                            <img
                                src={participant.image}
                                alt={participant.name}
                                className="w-full h-full object-cover"
                                onLoad={() => setImageLoaded(prev => ({
                                    ...prev,
                                    [isP1 ? 'p1' : 'p2']: true,
                                }))}
                                loading="lazy"
                            />

                            {/* Scan line effect */}
                            <div
                                className="absolute inset-0 pointer-events-none opacity-30"
                                style={{
                                    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.3) 2px, rgba(0, 0, 0, 0.3) 4px)',
                                }}
                            />

                            {/* Corner decorations */}
                            <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-cyber-cyan/50" />
                            <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-cyber-cyan/50" />
                            <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-cyber-cyan/50" />
                            <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-cyber-cyan/50" />
                        </div>

                        {/* Name */}
                        <h3 className="text-xl md:text-2xl font-display font-bold text-center text-white truncate">
                            {participant.name}
                        </h3>

                        {/* Vote indicator */}
                        <motion.div
                            className="mt-4 text-center"
                            initial={{ opacity: 0.5 }}
                            whileHover={{ opacity: 1 }}
                        >
                            <span className="text-sm text-cyber-cyan font-display tracking-wider">
                                CLICK TO VOTE
                            </span>
                        </motion.div>
                    </div>
                </GlassCard>
            </motion.div>
        );
    };

    return (
        <div className="relative z-10 min-h-screen flex flex-col">
            {/* Header */}
            <header className="pt-6 px-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="text-white/50 hover:text-white transition-colors font-display"
                    >
                        ← Back
                    </button>

                    <div className="text-center">
                        <p className="text-sm text-white/50 mb-1">{tournament.category}</p>
                        <h2 className="text-xl font-display font-bold gradient-text">
                            {roundName}
                        </h2>
                    </div>

                    <button
                        onClick={() => navigate('/bracket')}
                        className="text-cyber-cyan hover:text-white transition-colors font-display"
                    >
                        Bracket →
                    </button>
                </div>

                {/* Progress bar */}
                <div className="max-w-2xl mx-auto mt-4">
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-cyber-cyan via-cyber-purple to-cyber-pink"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                    <p className="text-center text-white/40 text-xs mt-2">{progress}% Complete</p>
                </div>
            </header>

            {/* Battle Arena */}
            <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 p-4 lg:p-8">
                {/* Left Participant */}
                <ParticipantCard
                    participant={participant1}
                    position="left"
                    onVote={handleVote}
                    state={getCardState(participant1.id)}
                />

                {/* VS Element */}
                <div className="flex-shrink-0 py-4 lg:py-0">
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.3 }}
                    >
                        <VSElement size="lg" animated={!isVoting} />
                    </motion.div>
                </div>

                {/* Right Participant */}
                <ParticipantCard
                    participant={participant2}
                    position="right"
                    onVote={handleVote}
                    state={getCardState(participant2.id)}
                />
            </main>

            {/* Match Info Footer */}
            <footer className="p-4 text-center">
                <p className="text-white/30 text-sm font-display">
                    Match {currentMatch.matchIndex + 1} of Round {currentMatch.round}
                </p>
            </footer>
        </div>
    );
}
