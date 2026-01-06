import React, { useRef, memo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import styled from 'styled-components';

// --- Styled Components ---

const CardBase = styled(motion.div)`
  background: var(--glass-bg);
  backdrop-filter: blur(${props => props.$staticMode ? '4px' : '16px'});
  -webkit-backdrop-filter: blur(${props => props.$staticMode ? '4px' : '16px'});
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: var(--glass-shadow);
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
  position: relative;
  overflow: hidden;
  transform-style: preserve-3d;
  will-change: transform;

  /* Neon Border Glow */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 24px;
    padding: 2px;
    background: linear-gradient(45deg, transparent, var(--primary-neon), transparent);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0.5;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  &:hover::after {
    opacity: 1;
  }

  &:hover {
    box-shadow: 0 0 30px rgba(0, 243, 255, 0.2);
    border-color: rgba(0, 243, 255, 0.3);
  }
`;

const Glare = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    circle at center,
    rgba(255, 255, 255, 0.2) 0%,
    rgba(255, 255, 255, 0) 50%
  );
  pointer-events: none;
  mix-blend-mode: overlay;
  z-index: 10;
`;

const ButtonBase = styled(motion.button)`
  background: rgba(0, 243, 255, 0.05);
  border: 1px solid var(--primary-neon);
  color: var(--primary-neon);
  padding: 0;
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 1rem;
  line-height: 1.2;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 2px;
  backdrop-filter: blur(4px);
  z-index: 1;
  height: 3.5rem;
  flex-shrink: 0;
  width: 100%;
  padding: 0 1.5rem;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(0, 243, 255, 0.2),
      transparent
    );
    transition: left 0.5s ease;
    z-index: -1;
  }

  &:hover::before {
    left: 100%;
  }

  &:hover {
    background: rgba(0, 243, 255, 0.1);
    box-shadow: 0 0 20px var(--primary-neon), inset 0 0 10px rgba(0, 243, 255, 0.2);
    text-shadow: 0 0 8px var(--primary-neon);
  }
`;

// --- Components ---

export const GlassCard = memo(({ children, className, staticMode = false, ...props }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { damping: 30, stiffness: 200 });
  const mouseYSpring = useSpring(y, { damping: 30, stiffness: 200 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  // Glare moves opposite to tilt
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);
  const glareOpacity = useTransform(mouseXSpring, [-0.5, 0, 0.5], [0, 1, 0]); // Fade in/out based on angle? No, let's keep it simple.

  // Better glare opacity logic: visible when tilted
  const glareOpacityDynamic = useTransform(
    [mouseXSpring, mouseYSpring],
    ([latestX, latestY]) => {
      const distance = Math.sqrt(latestX * latestX + latestY * latestY);
      return distance * 1.5; // Intensity increases with tilt
    }
  );

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
        transformPerspective: 1000,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className={className}
      {...props}
    >
      {!staticMode && (
        <Glare
          style={{
            x: glareX,
            y: glareY,
            opacity: glareOpacityDynamic,
            translateX: '-50%',
            translateY: '-50%'
          }}
        />
      )}
      <div style={{
        transform: staticMode ? "none" : "translateZ(30px)",
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 2
      }}>
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
        boxShadow: `0 0 10px ${colors[variant]}40`
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
