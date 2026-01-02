import React, { useRef, useState, useEffect, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';
import * as random from 'maath/random/dist/maath-random.esm';
import { useTournament } from '../context/TournamentContext';
import { motion, AnimatePresence } from 'framer-motion';

function Stars({ count = 2000, ...props }) {
    const ref = useRef();
    const [sphere] = useState(() => random.inSphere(new Float32Array(count * 3), { radius: 1.5 }));

    useFrame((state, delta) => {
        const { mouse } = state;
        ref.current.rotation.x -= delta / 20;
        ref.current.rotation.y -= delta / 25;

        // Mouse reactivity (subtle)
        ref.current.rotation.x += (mouse.y * 0.05 - ref.current.rotation.x) * 0.02;
        ref.current.rotation.y += (mouse.x * 0.05 - ref.current.rotation.y) * 0.02;
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
                <PointMaterial
                    transparent
                    color="#00f3ff"
                    size={0.002}
                    sizeAttenuation={true}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </Points>
        </group>
    );
}

function MouseSpotlight() {
    const light = useRef();
    useFrame((state) => {
        light.current.position.x = state.mouse.x * 2;
        light.current.position.y = state.mouse.y * 2;
    });
    return <pointLight ref={light} intensity={1.5} color="#bc13fe" distance={3} />;
}

function FloatingShapes() {
    const groupRef = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        const { mouse } = state;

        if (groupRef.current) {
            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, mouse.y * 0.1, 0.05);
            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouse.x * 0.1, 0.05);
            groupRef.current.position.y = Math.sin(t / 2) * 0.05;
        }
    });

    return (
        <group ref={groupRef}>
            <Float speed={1} rotationIntensity={0.5} floatIntensity={1}>
                <mesh position={[1.5, 0.5, -1]}>
                    <dodecahedronGeometry args={[0.2, 0]} />
                    <meshStandardMaterial color="#bc13fe" wireframe emissive="#bc13fe" emissiveIntensity={0.3} />
                </mesh>
            </Float>
            <Float speed={1} rotationIntensity={1} floatIntensity={1}>
                <mesh position={[-1.5, -0.5, -1]}>
                    <octahedronGeometry args={[0.2, 0]} />
                    <meshStandardMaterial color="#00f3ff" wireframe emissive="#00f3ff" emissiveIntensity={0.3} />
                </mesh>
            </Float>
        </group>
    );
}

const Background3D = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [shouldRender, setShouldRender] = useState(false);
    const { isTransitioning } = useTournament();

    // Basic performance check
    const [isLowPower] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.navigator.hardwareConcurrency < 4 || /Mobi|Android/i.test(window.navigator.userAgent);
    });

    useEffect(() => {
        // Reduced delay for better UX while still helping FCP
        const timer = setTimeout(() => setShouldRender(true), 500);

        const handleVisibilityChange = () => {
            setIsVisible(!document.hidden);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            clearTimeout(timer);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    // If not visible, don't render anything to save resources
    if (!isVisible) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
            {/* CSS Fallback is always present but fades out when 3D is ready */}
            <div className="neon-bg-fallback" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }} />

            <AnimatePresence>
                {shouldRender && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        style={{ width: '100%', height: '100%' }}
                    >
                        <Canvas
                            camera={{ position: [0, 0, 1] }}
                            dpr={[1, isLowPower ? 1 : 1.2]}
                            gl={{
                                antialias: false,
                                powerPreference: "high-performance",
                                alpha: false,
                                stencil: false,
                                depth: false
                            }}
                            frameloop={isVisible && !isTransitioning ? "always" : "demand"}
                            performance={{ min: 0.5 }}
                        >
                            <ambientLight intensity={0.1} />
                            <pointLight position={[5, 5, 5]} intensity={0.5} color="#00f3ff" />
                            <MouseSpotlight />
                            <Stars count={isLowPower ? 500 : 1200} />
                            {!isLowPower && <FloatingShapes />}
                        </Canvas>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default memo(Background3D);
