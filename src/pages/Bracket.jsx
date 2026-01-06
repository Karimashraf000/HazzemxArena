import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import NeonButton from '../components/NeonButton';
import { useTournament } from '../hooks/useTournament';
import { getRoundName } from '../utils/bracketLogic';

export default function Bracket() {
    const navigate = useNavigate();
    const { tournament, getAllMatches, isComplete, currentMatch } = useTournament();

    if (!tournament) {
        navigate('/');
        return null;
    }

    const rounds = getAllMatches();

    const MatchCard = ({ match, roundIndex }) => {
        const isCurrentMatch = currentMatch?.id === match.id;
        const isCompleted = match.completed;
        const isUpcoming = !isCompleted && match.participant1 && match.participant2;

        return (
            <motion.div
                className={`
          relative rounded-lg p-3 min-w-[160px]
          ${isCurrentMatch ? 'ring-2 ring-cyber-cyan shadow-neon-cyan' : ''}
          ${isCompleted ? 'bg-white/5' : isUpcoming ? 'bg-white/10' : 'bg-white/3'}
          transition-all duration-300
        `}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: roundIndex * 0.1 }}
                whileHover={{ scale: 1.02 }}
            >
                {/* Participant 1 */}
                <div
                    className={`
            flex items-center gap-2 p-2 rounded mb-1
            ${match.winner === match.participant1?.id ? 'bg-cyber-cyan/20' : ''}
            ${match.completed && match.winner !== match.participant1?.id ? 'opacity-40' : ''}
          `}
                >
                    {match.participant1 ? (
                        <>
                            <img
                                src={match.participant1.image}
                                alt={match.participant1.name}
                                className="w-8 h-8 rounded object-cover"
                            />
                            <span className="text-sm text-white truncate flex-1">
                                {match.participant1.name}
                            </span>
                            {match.winner === match.participant1.id && (
                                <span className="text-cyber-cyan text-xs">✓</span>
                            )}
                        </>
                    ) : (
                        <span className="text-white/30 text-sm">TBD</span>
                    )}
                </div>

                {/* VS Divider */}
                <div className="text-center text-xs text-white/30 font-display">VS</div>

                {/* Participant 2 */}
                <div
                    className={`
            flex items-center gap-2 p-2 rounded mt-1
            ${match.winner === match.participant2?.id ? 'bg-cyber-purple/20' : ''}
            ${match.completed && match.winner !== match.participant2?.id ? 'opacity-40' : ''}
          `}
                >
                    {match.participant2 ? (
                        <>
                            <img
                                src={match.participant2.image}
                                alt={match.participant2.name}
                                className="w-8 h-8 rounded object-cover"
                            />
                            <span className="text-sm text-white truncate flex-1">
                                {match.participant2.name}
                            </span>
                            {match.winner === match.participant2.id && (
                                <span className="text-cyber-purple text-xs">✓</span>
                            )}
                        </>
                    ) : (
                        <span className="text-white/30 text-sm">TBD</span>
                    )}
                </div>

                {/* Current match indicator */}
                {isCurrentMatch && (
                    <motion.div
                        className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyber-cyan"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    />
                )}
            </motion.div>
        );
    };

    const RoundColumn = ({ matches, roundIndex, totalRounds }) => {
        const roundName = getRoundName(roundIndex + 1, totalRounds);

        return (
            <div className="flex flex-col items-center gap-4">
                {/* Round Header */}
                <motion.h3
                    className="font-display text-sm text-cyber-cyan whitespace-nowrap"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: roundIndex * 0.15 }}
                >
                    {roundName}
                </motion.h3>

                {/* Matches */}
                <div
                    className="flex flex-col gap-8"
                    style={{
                        // Increase spacing as rounds progress to align with bracket lines
                        marginTop: roundIndex > 0 ? `${Math.pow(2, roundIndex) * 20}px` : 0,
                    }}
                >
                    {matches.map((match) => (
                        <div
                            key={match.id}
                            style={{
                                marginBottom: roundIndex > 0 ? `${Math.pow(2, roundIndex) * 40}px` : 0,
                            }}
                        >
                            <MatchCard match={match} roundIndex={roundIndex} />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Energy line connector component
    const BracketConnector = ({ fromY, toY, x }) => (
        <svg
            className="absolute pointer-events-none"
            style={{
                left: x,
                top: Math.min(fromY, toY),
                width: 40,
                height: Math.abs(toY - fromY) + 20,
            }}
        >
            <defs>
                <linearGradient id="energy-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00f5ff" stopOpacity="0.5" />
                    <stop offset="50%" stopColor="#b829ff" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#00f5ff" stopOpacity="0.5" />
                </linearGradient>
            </defs>
            <motion.path
                d={`M 0 ${fromY < toY ? 10 : Math.abs(toY - fromY) + 10} 
            L 20 ${fromY < toY ? 10 : Math.abs(toY - fromY) + 10} 
            L 20 ${(Math.abs(toY - fromY) + 20) / 2} 
            L 40 ${(Math.abs(toY - fromY) + 20) / 2}`}
                fill="none"
                stroke="url(#energy-gradient)"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
            />
        </svg>
    );

    return (
        <div className="relative z-10 min-h-screen">
            {/* Header */}
            <header className="pt-6 px-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-white/50 hover:text-white transition-colors font-display"
                    >
                        ← Back
                    </button>

                    <h1 className="text-2xl font-display font-bold gradient-text">
                        Tournament Bracket
                    </h1>

                    <div className="w-20" /> {/* Spacer for centering */}
                </div>
            </header>

            {/* Bracket View */}
            <main className="p-4 lg:p-8 overflow-x-auto">
                <div className="flex gap-12 justify-center min-w-max px-4">
                    {rounds.map((roundMatches, roundIndex) => (
                        <RoundColumn
                            key={roundIndex}
                            matches={roundMatches}
                            roundIndex={roundIndex}
                            totalRounds={tournament.totalRounds}
                        />
                    ))}
                </div>
            </main>

            {/* Action Buttons */}
            <footer className="p-6 flex justify-center gap-4">
                {!isComplete ? (
                    <NeonButton onClick={() => navigate('/battle')}>
                        Continue Battle
                    </NeonButton>
                ) : (
                    <NeonButton onClick={() => navigate('/victory')}>
                        View Champion
                    </NeonButton>
                )}
            </footer>
        </div>
    );
}
