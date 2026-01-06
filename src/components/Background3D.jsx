import React, { useRef, useState, useEffect, memo, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Float, Grid, Stars, Torus, Ring } from '@react-three/drei';
import * as THREE from 'three';
import * as random from 'maath/random/dist/maath-random.esm';
import { useTournament } from '../context/TournamentContext';
import { motion, AnimatePresence } from 'framer-motion';

// --- Sub-components ---

function CyberGrid() {
    const gridRef = useRef();

    useFrame((state) => {
        if (gridRef.current) {
            // Very subtle movement for "alive" feel, but cheap
            gridRef.current.position.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
        }
    });

    return (
        <group position={[0, -1, 0]} rotation={[Math.PI / 2.5, 0, 0]} ref={gridRef}>
            <Grid
                renderOrder={-1}
                position={[0, 0, 0]}
                infiniteGrid
                cellSize={0.6}
                sectionSize={3}
                fadeDistance={25}
                sectionColor="#bc13fe"
                cellColor="#00f3ff"
            />
        </group>
    );
}

function EnergyMotes({ count = 300 }) { // Reduced to 300 for balance
    const ref = useRef();
    const [sphere] = useState(() => random.inSphere(new Float32Array(count * 3), { radius: 12 }));

    useFrame((state, delta) => {
        ref.current.rotation.x -= delta / 25;
        ref.current.rotation.y -= delta / 35;
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
                <PointMaterial
                    transparent
                    color="#00f3ff"
                    size={0.04}
                    sizeAttenuation={true}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </Points>
        </group>
    );
}

function FloatingCyberShapes() {
    return (
        <group>
            {/* Icosahedron - Purple */}
            <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                <mesh position={[4, 2, -5]}>
                    <icosahedronGeometry args={[0.6, 0]} />
                    <meshStandardMaterial color="#bc13fe" wireframe emissive="#bc13fe" emissiveIntensity={0.8} />
                </mesh>
            </Float>

            {/* Torus - Cyan */}
            <Float speed={1.5} rotationIntensity={2} floatIntensity={1}>
                <mesh position={[-4, 0, -4]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[0.8, 0.05, 16, 100]} />
                    <meshStandardMaterial color="#00f3ff" wireframe emissive="#00f3ff" emissiveIntensity={0.8} />
                </mesh>
            </Float>

            {/* Ring - Pink Accent */}
            <Float speed={3} rotationIntensity={1.5} floatIntensity={2}>
                <mesh position={[0, 3, -6]}>
                    <ringGeometry args={[0.8, 0.85, 32]} />
                    <meshBasicMaterial color="#ff0080" side={THREE.DoubleSide} transparent opacity={0.6} />
                </mesh>
            </Float>
        </group>
    );
}

function InteractiveLights() {
    const lightRef = useRef();

    useFrame(({ mouse }) => {
        if (lightRef.current) {
            lightRef.current.position.x = THREE.MathUtils.lerp(lightRef.current.position.x, mouse.x * 12, 0.1);
            lightRef.current.position.y = THREE.MathUtils.lerp(lightRef.current.position.y, mouse.y * 12, 0.1);
        }
    });

    return (
        <>
            <ambientLight intensity={0.3} />
            <pointLight ref={lightRef} position={[0, 0, 5]} intensity={2} color="#bc13fe" distance={15} />
            <pointLight position={[-5, 5, -5]} intensity={1} color="#00f3ff" />
            <spotLight position={[0, 10, 0]} intensity={0.5} angle={0.3} penumbra={1} color="#ffffff" />
        </>
    );
}

// --- Main Component ---

const Background3D = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [shouldRender, setShouldRender] = useState(false);
    const { isTransitioning } = useTournament();

    const isLowPower = useMemo(() => {
        if (typeof window === 'undefined') return false;
        return window.navigator.hardwareConcurrency < 4 || /Mobi|Android/i.test(window.navigator.userAgent);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setShouldRender(true), 100);

        const handleVisibilityChange = () => {
            setIsVisible(!document.hidden);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            clearTimeout(timer);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    if (!isVisible) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
            <div className="neon-bg-fallback" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }} />

            <AnimatePresence>
                {shouldRender && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.5 }}
                        style={{ width: '100%', height: '100%' }}
                    >
                        <Canvas
                            camera={{ position: [0, 0, 5], fov: 60 }}
                            dpr={[1, 1]} // STRICTLY CAP DPR at 1.0 for performance
                            gl={{
                                antialias: false,
                                powerPreference: "high-performance",
                                alpha: true,
                                stencil: false,
                                depth: false
                            }}
                            frameloop="always" // Restored continuous animation
                        >
                            <fog attach="fog" args={['#030308', 5, 30]} />

                            {/* Balanced Stars count */}
                            <Stars radius={100} depth={50} count={800} factor={4} saturation={0} fade speed={1} />

                            <InteractiveLights />
                            <CyberGrid />
                            <EnergyMotes count={isLowPower ? 100 : 300} />
                            {!isLowPower && <FloatingCyberShapes />}
                        </Canvas>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default memo(Background3D);
