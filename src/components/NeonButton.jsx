import { motion } from 'framer-motion';

export default function NeonButton({
    children,
    onClick,
    variant = 'primary', // 'primary' | 'secondary' | 'danger'
    size = 'md', // 'sm' | 'md' | 'lg'
    disabled = false,
    className = '',
    icon,
}) {
    const variants = {
        primary: {
            bg: 'linear-gradient(135deg, #00f5ff 0%, #0066ff 50%, #b829ff 100%)',
            hover: 'linear-gradient(135deg, #00f5ff 0%, #b829ff 100%)',
            glow: '0 0 30px rgba(0, 245, 255, 0.5), 0 0 60px rgba(0, 245, 255, 0.3)',
            text: 'white',
        },
        secondary: {
            bg: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            hover: 'linear-gradient(135deg, rgba(0, 245, 255, 0.2) 0%, rgba(184, 41, 255, 0.2) 100%)',
            glow: '0 0 20px rgba(255, 255, 255, 0.2)',
            text: 'white',
            border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        danger: {
            bg: 'linear-gradient(135deg, #ff2d92 0%, #ff0055 100%)',
            hover: 'linear-gradient(135deg, #ff0055 0%, #ff2d92 100%)',
            glow: '0 0 30px rgba(255, 45, 146, 0.5), 0 0 60px rgba(255, 45, 146, 0.3)',
            text: 'white',
        },
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    const currentVariant = variants[variant];
    const currentSize = sizes[size];

    return (
        <motion.button
            className={`
        relative font-display font-semibold rounded-xl
        overflow-hidden
        ${currentSize}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
            style={{
                background: currentVariant.bg,
                color: currentVariant.text,
                border: currentVariant.border || 'none',
            }}
            onClick={disabled ? undefined : onClick}
            whileHover={disabled ? {} : {
                scale: 1.05,
                boxShadow: currentVariant.glow,
            }}
            whileTap={disabled ? {} : { scale: 0.95 }}
            transition={{
                type: 'spring',
                stiffness: 400,
                damping: 20,
            }}
        >
            {/* Reflection effect */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, transparent 50%)',
                }}
            />

            {/* Energy flow animation */}
            <motion.div
                className="absolute inset-0 opacity-0"
                style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                }}
                whileHover={{
                    opacity: 1,
                    x: ['-100%', '200%'],
                    transition: {
                        x: {
                            duration: 0.8,
                            repeat: Infinity,
                            repeatDelay: 0.5,
                        },
                    },
                }}
            />

            {/* Content */}
            <span className="relative z-10 flex items-center justify-center gap-2">
                {icon && <span className="text-xl">{icon}</span>}
                {children}
            </span>

            {/* Bottom glow line */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 h-[2px]"
                style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)',
                }}
                initial={{ scaleX: 0, opacity: 0 }}
                whileHover={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
            />
        </motion.button>
    );
}
