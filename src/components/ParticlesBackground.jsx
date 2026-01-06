import { useEffect, useRef, memo } from 'react';
import './ParticlesBackground.css';

const ParticlesBackground = memo(() => {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Create particles - Reduced count for performance
        const particleCount = 20;
        const particles = [];

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            // Random size between 2px and 5px
            const size = Math.random() * 3 + 2;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;

            // Random position
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;

            // Random animation duration
            const duration = Math.random() * 15 + 15; // Slower, smoother animation
            particle.style.animationDuration = `${duration}s`;

            // Random delay
            const delay = Math.random() * 5;
            particle.style.animationDelay = `${delay}s`;

            container.appendChild(particle);
            particles.push(particle);
        }

        // Cleanup
        return () => {
            particles.forEach(p => p.remove());
        };
    }, []);

    return <div ref={containerRef} className="particles-container" />;
});

export default ParticlesBackground;
