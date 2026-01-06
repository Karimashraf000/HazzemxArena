import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import styled from 'styled-components';

const CursorWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;

  @media (max-width: 768px) {
    display: none;
  }
`;

const CursorDot = styled(motion.div)`
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--primary-neon);
  border-radius: 50%;
  box-shadow: 0 0 10px var(--primary-neon), 0 0 20px var(--primary-neon);
`;

const CursorRing = styled(motion.div)`
  position: absolute;
  width: 40px;
  height: 40px;
  border: 2px solid var(--primary-neon);
  border-radius: 50%;
  box-shadow: 0 0 15px rgba(0, 243, 255, 0.3);
`;

const CustomCursor = () => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 25, stiffness: 250 };
    const ringX = useSpring(mouseX, springConfig);
    const ringY = useSpring(mouseY, springConfig);

    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        const handleMouseOver = (e) => {
            const target = e.target;
            if (
                target.tagName === 'BUTTON' ||
                target.tagName === 'A' ||
                target.closest('.glass-card') ||
                target.closest('.song-battle-card')
            ) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, [mouseX, mouseY]);

    return (
        <CursorWrapper>
            <CursorDot
                style={{
                    x: mouseX,
                    y: mouseY,
                    translateX: '-50%',
                    translateY: '-50%',
                }}
                animate={{
                    scale: isHovering ? 1.5 : 1,
                }}
            />
            <CursorRing
                style={{
                    x: ringX,
                    y: ringY,
                    translateX: '-50%',
                    translateY: '-50%',
                }}
                animate={{
                    scale: isHovering ? 1.8 : 1,
                    borderColor: isHovering ? 'var(--secondary-neon)' : 'var(--primary-neon)',
                    borderWidth: isHovering ? '3px' : '2px',
                }}
            />
        </CursorWrapper>
    );
};

export default CustomCursor;
