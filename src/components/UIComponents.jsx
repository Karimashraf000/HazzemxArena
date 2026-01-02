import React, { useRef, memo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import styled from 'styled-components';

// Styled Components for base styles
const CardBase = styled(motion.div)`
  background: var(--glass-bg);
  backdrop-filter: blur(${props => props.$staticMode ? '4px' : '12px'});
  -webkit-backdrop-filter: blur(${props => props.$staticMode ? '4px' : '12px'});
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: var(--glass-shadow);
  transition: border-color 0.3s ease, box-shadow 0.3s ease, backdrop-filter 0.3s ease;
  position: relative;
  overflow: hidden;
  transform-style: preserve-3d;
  will-change: transform, opacity;

  /* Scanner Effect - Disabled in staticMode */
  &::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      to bottom,
      transparent,
      rgba(0, 243, 255, 0.05),
      transparent
    );
    transform: rotate(45deg);
    animation: ${props => props.$staticMode ? 'none' : 'scan 4s linear infinite'};
    pointer-events: none;
    display: ${props => props.$staticMode ? 'none' : 'block'};
  }

  /* Shimmer Effect - Disabled in staticMode */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.05),
      transparent
    );
    transform: translateX(-100%);
    transition: transform 0.6s ease;
    display: ${props => props.$staticMode ? 'none' : 'block'};
  }

  &:hover::before {
    transform: ${props => props.$staticMode ? 'translateX(-100%)' : 'translateX(100%)'};
  }

  &:hover {
    border-color: var(--primary-neon);
    box-shadow: 0 0 40px rgba(0, 243, 255, 0.3);
  }

  @keyframes scan {
    0% { transform: rotate(45deg) translateY(-100%); }
    100% { transform: rotate(45deg) translateY(100%); }
  }
`;


const ButtonBase = styled(motion.button)`
  background: transparent;
  border: 1px solid var(--primary-neon);
  color: var(--primary-neon);
  padding: 1rem 2rem;
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 1.1rem;
  border-radius: 12px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--transition-fast);
  text-transform: uppercase;
  letter-spacing: 1px;
  z-index: 1;
  will-change: transform, opacity;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--primary-neon);
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 0.3s cubic-bezier(0.19, 1, 0.22, 1);
    z-index: -1;
  }

  &:hover::before {
    transform: scaleX(1);
    transform-origin: left;
  }

  &:hover {
    color: var(--bg-void);
    box-shadow: 0 0 20px var(--primary-neon);
    border-color: var(--primary-neon);
  }
`;

export const GlassCard = memo(({ children, className, staticMode = false, ...props }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { damping: 25, stiffness: 200 });
    const mouseYSpring = useSpring(y, { damping: 25, stiffness: 200 });

    // Reduced tilt intensity in staticMode
    const tiltRange = staticMode ? ["2deg", "-2deg"] : ["10deg", "-10deg"];
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], tiltRange);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], tiltRange.reverse());

    const handleMouseMove = (e) => {
        if (staticMode) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <CardBase
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            $staticMode={staticMode}
            style={{
                rotateX: staticMode ? 0 : rotateX,
                rotateY: staticMode ? 0 : rotateY,
                minHeight: '200px'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={className}
            {...props}
        >
            <div style={{ transform: staticMode ? "none" : "translateZ(50px)", height: '100%', display: 'flex', flexDirection: 'column' }}>
                {children}
            </div>
        </CardBase>
    );
});



export const NeonButton = memo(({ children, onClick, variant = 'primary', ...props }) => {
    const colors = {
        primary: 'var(--primary-neon)',
        secondary: 'var(--secondary-neon)',
        accent: 'var(--accent-hot-pink)',
    };

    return (
        <ButtonBase
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            style={{
                borderColor: colors[variant],
                color: colors[variant],
                '--hover-bg': colors[variant]
            }}
            {...props}
        >
            {children}
        </ButtonBase>
    );
});

export const AnimatedText = memo(({ text, className }) => {
    const letters = Array.from(text);

    const container = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: 0.03, delayChildren: 0.04 * i },
        }),
    };

    const child = {
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
        hidden: {
            opacity: 0,
            y: 20,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
    };

    return (
        <motion.div
            style={{ overflow: "hidden", display: "flex", flexWrap: "wrap" }}
            variants={container}
            initial="hidden"
            animate="visible"
            className={className}
        >
            {letters.map((letter, index) => (
                <motion.span variants={child} key={index}>
                    {letter === " " ? "\u00A0" : letter}
                </motion.span>
            ))}
        </motion.div>
    );
});


