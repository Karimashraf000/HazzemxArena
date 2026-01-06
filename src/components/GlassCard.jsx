import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function GlassCard({
    children,
    className = '',
    onClick,
    glowColor = 'cyan', // 'cyan' | 'purple' | 'pink'
    tiltEnabled = true,
    hoverScale = 1.02,
}) {
    const cardRef = useRef(null);
    const [tiltStyle, setTiltStyle] = useState({ rotateX: 0, rotateY: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const glowColors = {
        cyan: {
            border: 'rgba(0, 245, 255, 0.4)',
            shadow: '0 0 40px rgba(0, 245, 255, 0.3), 0 0 80px rgba(0, 245, 255, 0.15)',
            inner: 'rgba(0, 245, 255, 0.1)',
        },
        purple: {
            border: 'rgba(184, 41, 255, 0.4)',
            shadow: '0 0 40px rgba(184, 41, 255, 0.3), 0 0 80px rgba(184, 41, 255, 0.15)',
            inner: 'rgba(184, 41, 255, 0.1)',
        },
        pink: {
            border: 'rgba(255, 45, 146, 0.4)',
            shadow: '0 0 40px rgba(255, 45, 146, 0.3), 0 0 80px rgba(255, 45, 146, 0.15)',
            inner: 'rgba(255, 45, 146, 0.1)',
        },
    };

    const currentGlow = glowColors[glowColor];

    const handleMouseMove = (e) => {
        if (!tiltEnabled || !cardRef.current) return;

        const card = cardRef.current;
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;

        // Calculate rotation (max 15 degrees)
        const rotateY = (mouseX / (rect.width / 2)) * 15;
        const rotateX = -(mouseY / (rect.height / 2)) * 15;

        setTiltStyle({ rotateX, rotateY });
    };

    const handleMouseLeave = () => {
        setTiltStyle({ rotateX: 0, rotateY: 0 });
        setIsHovered(false);
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    return (
        <motion.div
            ref={cardRef}
            className={`
        relative rounded-2xl overflow-hidden cursor-pointer
        backdrop-blur-xl
        transition-colors duration-300
        ${className}
      `}
            style={{
                background: isHovered
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${isHovered ? currentGlow.border : 'rgba(255, 255, 255, 0.1)'}`,
                boxShadow: isHovered
                    ? `${currentGlow.shadow}, inset 0 0 30px ${currentGlow.inner}`
                    : '0 8px 32px rgba(0, 0, 0, 0.3)',
                transformStyle: 'preserve-3d',
                perspective: '1000px',
            }}
            animate={{
                rotateX: tiltStyle.rotateX,
                rotateY: tiltStyle.rotateY,
                scale: isHovered ? hoverScale : 1,
                z: isHovered ? 50 : 0,
            }}
            transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
            onClick={onClick}
            whileTap={{ scale: 0.98 }}
        >
            {/* Gradient border overlay */}
            <div
                className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 transition-opacity duration-300"
                style={{
                    opacity: isHovered ? 0.6 : 0,
                    background: 'linear-gradient(135deg, rgba(0, 245, 255, 0.2), transparent, rgba(184, 41, 255, 0.2))',
                }}
            />

            {/* Shine effect */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.1) 45%, rgba(255, 255, 255, 0.05) 50%, transparent 55%)',
                }}
                animate={{
                    x: isHovered ? ['0%', '200%'] : '0%',
                }}
                transition={{
                    duration: 0.8,
                    ease: 'easeInOut',
                }}
            />

            {/* Content */}
            <div className="relative z-10" style={{ transform: 'translateZ(20px)' }}>
                {children}
            </div>
        </motion.div>
    );
}
