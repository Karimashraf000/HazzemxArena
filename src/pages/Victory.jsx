import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';
import GlassCard from '../components/GlassCard';
import NeonButton from '../components/NeonButton';
import { useTournament } from '../hooks/useTournament';

export default function Victory() {
    const navigate = useNavigate();
    const { tournament, champion, resetTournament } = useTournament();
    const resultsRef = useRef(null);
    const hasConfettiFired = useRef(false);

    // Redirect if no champion
    useEffect(() => {
        if (!tournament || !champion) {
            navigate('/');
        }
    }, [tournament, champion, navigate]);

    // Fire confetti on mount
    useEffect(() => {
        if (champion && !hasConfettiFired.current) {
            hasConfettiFired.current = true;

            const duration = 4000;
            const end = Date.now() + duration;

            const colors = ['#00f5ff', '#b829ff', '#ff2d92', '#ffd700'];

            const frame = () => {
                confetti({
                    particleCount: 4,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors,
                });
                confetti({
                    particleCount: 4,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors,
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };

            frame();

            // Big burst
            setTimeout(() => {
                confetti({
                    particleCount: 150,
                    spread: 100,
                    origin: { y: 0.6 },
                    colors,
                });
            }, 500);
        }
    }, [champion]);

    const handleDownloadResults = async () => {
        if (!resultsRef.current) return;

        try {
            const canvas = await html2canvas(resultsRef.current, {
                backgroundColor: '#0a0a0f',
                scale: 2,
            });

            const link = document.createElement('a');
            link.download = `versus-arena-${tournament?.category?.toLowerCase().replace(/\s+/g, '-')}-champion.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Failed to download results:', error);
        }
    };

    const handleRestart = () => {
        resetTournament();
        navigate('/');
    };

    if (!champion) return null;

    return (
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
            {/* Decorative background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-cyan/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                />
                <motion.div
                    className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyber-purple/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.5, 0.3, 0.5],
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                />
            </div>

            {/* Main Content */}
            <motion.div
                ref={resultsRef}
                className="text-center max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                {/* Crown Icon */}
                <motion.div
                    className="text-8xl mb-6"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                        type: 'spring',
                        stiffness: 100,
                        damping: 10,
                        delay: 0.3,
                    }}
                >
                    👑
                </motion.div>

                {/* Title */}
                <motion.h1
                    className="font-display text-4xl md:text-6xl font-black mb-2"
                    style={{
                        background: 'linear-gradient(135deg, #ffd700 0%, #ffaa00 50%, #ffd700 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.5))',
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    CHAMPION
                </motion.h1>

                <motion.p
                    className="text-white/60 text-lg mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                >
                    {tournament?.category}
                </motion.p>

                {/* Champion Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9, type: 'spring' }}
                    className="mb-8"
                >
                    <GlassCard glowColor="cyan" className="mx-auto max-w-sm">
                        <div className="p-6">
                            {/* Champion Image */}
                            <div className="relative aspect-square rounded-xl overflow-hidden mb-4">
                                {/* Golden border effect */}
                                <div
                                    className="absolute inset-0 rounded-xl"
                                    style={{
                                        background: 'linear-gradient(135deg, #ffd700, #ffaa00, #ffd700)',
                                        padding: '3px',
                                    }}
                                >
                                    <div className="w-full h-full bg-cyber-dark rounded-lg" />
                                </div>

                                <img
                                    src={champion.image}
                                    alt={champion.name}
                                    className="absolute inset-[3px] w-[calc(100%-6px)] h-[calc(100%-6px)] object-cover rounded-lg"
                                />

                                {/* Victory glow overlay */}
                                <motion.div
                                    className="absolute inset-0 pointer-events-none rounded-xl"
                                    style={{
                                        background: 'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%)',
                                    }}
                                    animate={{
                                        opacity: [0.5, 0.8, 0.5],
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                            </div>

                            {/* Champion Name */}
                            <h2
                                className="font-display text-2xl md:text-3xl font-bold"
                                style={{
                                    background: 'linear-gradient(90deg, #00f5ff, #b829ff)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}
                            >
                                {champion.name}
                            </h2>
                        </div>
                    </GlassCard>
                </motion.div>

                {/* Stats */}
                <motion.div
                    className="flex justify-center gap-8 mb-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                >
                    <div className="text-center">
                        <p className="text-3xl font-display font-bold text-cyber-cyan">
                            {tournament?.totalRounds}
                        </p>
                        <p className="text-white/50 text-sm">Rounds Won</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-display font-bold text-cyber-purple">
                            {Math.pow(2, tournament?.totalRounds || 0)}
                        </p>
                        <p className="text-white/50 text-sm">Participants</p>
                    </div>
                </motion.div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
                className="flex flex-wrap justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
            >
                <NeonButton onClick={handleDownloadResults} variant="secondary">
                    📥 Download Results
                </NeonButton>
                <NeonButton onClick={handleRestart}>
                    🔄 New Tournament
                </NeonButton>
            </motion.div>

            {/* Signature */}
            <motion.p
                className="absolute bottom-4 text-white/20 text-sm font-display"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
            >
                VERSUS ARENA
            </motion.p>
        </div>
    );
}
