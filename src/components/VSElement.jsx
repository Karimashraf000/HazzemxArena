import { motion } from 'framer-motion';

export default function VSElement({ size = 'lg', animated = true }) {
    const sizes = {
        sm: { text: 'text-3xl', container: 'w-20 h-20' },
        md: { text: 'text-5xl', container: 'w-28 h-28' },
        lg: { text: 'text-7xl', container: 'w-40 h-40' },
        xl: { text: 'text-9xl', container: 'w-56 h-56' },
    };

    const currentSize = sizes[size];

    const glitchVariants = {
        animate: {
            x: [0, -2, 2, -2, 0],
            filter: [
                'hue-rotate(0deg)',
                'hue-rotate(10deg)',
                'hue-rotate(-10deg)',
                'hue-rotate(5deg)',
                'hue-rotate(0deg)',
            ],
        },
    };

    const pulseVariants = {
        animate: {
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8],
        },
    };

    const lightningVariants = {
        animate: {
            pathLength: [0, 1, 0],
            opacity: [0, 1, 0],
        },
    };

    return (
        <div className={`relative ${currentSize.container} flex items-center justify-center`}>
            {/* Outer energy ring */}
            <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                    background: 'conic-gradient(from 0deg, #00f5ff, #b829ff, #ff2d92, #00f5ff)',
                    filter: 'blur(8px)',
                }}
                animate={animated ? {
                    rotate: 360,
                    scale: [1, 1.1, 1],
                } : {}}
                transition={{
                    rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                }}
            />

            {/* Middle glow layer */}
            <motion.div
                className="absolute inset-2 rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(184, 41, 255, 0.4) 0%, transparent 70%)',
                }}
                animate={animated ? pulseVariants.animate : {}}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            {/* Inner dark circle */}
            <div
                className="absolute inset-4 rounded-full"
                style={{
                    background: 'radial-gradient(circle, #1a1025 0%, #0a0a0f 100%)',
                    boxShadow: 'inset 0 0 30px rgba(0, 0, 0, 0.8)',
                }}
            />

            {/* Lightning effects */}
            {animated && (
                <>
                    <motion.svg
                        className="absolute inset-0 w-full h-full"
                        viewBox="0 0 100 100"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                    >
                        <motion.path
                            d="M50 10 L55 35 L70 40 L50 55 L55 75 L40 50 L25 55 L50 10"
                            fill="none"
                            stroke="url(#lightning-gradient)"
                            strokeWidth="1"
                            animate={animated ? lightningVariants.animate : {}}
                            transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 2.5 }}
                        />
                        <defs>
                            <linearGradient id="lightning-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#00f5ff" />
                                <stop offset="100%" stopColor="#b829ff" />
                            </linearGradient>
                        </defs>
                    </motion.svg>
                </>
            )}

            {/* VS Text */}
            <motion.div
                className={`relative z-10 font-display font-black ${currentSize.text}`}
                style={{
                    background: 'linear-gradient(135deg, #00f5ff 0%, #b829ff 50%, #ff2d92 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow: '0 0 30px rgba(0, 245, 255, 0.5)',
                    filter: 'drop-shadow(0 0 10px rgba(184, 41, 255, 0.8))',
                }}
                animate={animated ? glitchVariants.animate : {}}
                transition={{
                    duration: 0.3,
                    repeat: Infinity,
                    repeatDelay: 3,
                }}
            >
                VS
            </motion.div>

            {/* Particle explosion effect */}
            {animated && Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full"
                    style={{
                        background: i % 2 === 0 ? '#00f5ff' : '#b829ff',
                        boxShadow: `0 0 6px ${i % 2 === 0 ? '#00f5ff' : '#b829ff'}`,
                    }}
                    initial={{
                        x: 0,
                        y: 0,
                        opacity: 0,
                    }}
                    animate={{
                        x: Math.cos((i * Math.PI) / 4) * 80,
                        y: Math.sin((i * Math.PI) / 4) * 80,
                        opacity: [0, 1, 0],
                        scale: [0.5, 1.5, 0.5],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: 'easeOut',
                    }}
                />
            ))}
        </div>
    );
}
