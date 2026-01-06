/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                neon: {
                    blue: '#00f3ff',
                    purple: '#bc13fe',
                    pink: '#ff00ff',
                    green: '#0aff0a',
                },
                glass: {
                    bg: 'rgba(10, 10, 20, 0.6)',
                    border: 'rgba(255, 255, 255, 0.1)',
                    highlight: 'rgba(255, 255, 255, 0.05)',
                },
                void: '#050510',
            },
            fontFamily: {
                cyber: ['"Orbitron"', 'sans-serif'],
                body: ['"Inter"', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'cyber-grid': 'linear-gradient(rgba(0, 243, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.1) 1px, transparent 1px)',
            },
            animation: {
                'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 5px #00f3ff, 0 0 10px #00f3ff' },
                    '100%': { boxShadow: '0 0 20px #00f3ff, 0 0 30px #00f3ff' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
}
