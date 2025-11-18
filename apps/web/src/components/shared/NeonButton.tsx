import { motion } from 'motion/react';
import { ReactNode } from 'react';

type ButtonVariant = 'cyan' | 'magenta' | 'violet' | 'danger';

interface NeonButtonProps {
  variant?: ButtonVariant;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}

export function NeonButton({ 
  variant = 'cyan', 
  children, 
  onClick, 
  disabled = false,
  className = '',
  fullWidth = false
}: NeonButtonProps) {
  const variantStyles = {
    cyan: 'neon-button-cyan',
    magenta: 'neon-button-magenta',
    violet: 'neon-button-violet',
    danger: 'neon-button-danger'
  };

  return (
    <>
      <motion.button
        onClick={onClick}
        disabled={disabled}
        className={`${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
        style={{ fontFamily: 'Orbitron, sans-serif' }}
        whileHover={!disabled ? { scale: 1.02 } : undefined}
        whileTap={!disabled ? { scale: 0.98 } : undefined}
      >
        {children}
      </motion.button>

      <style>{`
        /* Cyan Neon Button */
        .neon-button-cyan {
          background: linear-gradient(180deg, #191919 0%, #111111 100%);
          border: 1.5px solid rgba(0, 255, 255, 0.3);
          color: white;
          box-shadow: 
            0 0 30px rgba(0, 255, 255, 0.3),
            0 0 40px rgba(255, 0, 230, 0.2);
          transition: all 0.3s ease;
          font-family: 'Orbitron', sans-serif;
          position: relative;
          padding: 0.75rem 2rem;
          border-radius: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
        }

        .neon-button-cyan::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 0.5rem;
          background: linear-gradient(135deg, #00FFFF 0%, #B400FF 50%, #FF00E6 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
          filter: blur(25px);
        }

        .neon-button-cyan:hover:not(:disabled)::before {
          opacity: 0.6;
          filter: blur(45px);
        }

        .neon-button-cyan:hover:not(:disabled) {
          border-color: rgba(0, 255, 255, 0.6);
          box-shadow: 
            0 0 40px rgba(0, 255, 255, 0.5),
            0 0 60px rgba(255, 0, 230, 0.4),
            inset 0 0 20px rgba(0, 255, 255, 0.1);
          filter: brightness(1.2);
          transform: translateY(-2px);
        }

        .neon-button-cyan:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* Magenta Neon Button */
        .neon-button-magenta {
          background: rgba(255, 0, 230, 0.08);
          border: 1.5px solid rgba(255, 0, 230, 0.3);
          color: white;
          box-shadow: 0 0 25px rgba(255, 0, 230, 0.2);
          transition: all 0.3s ease;
          font-family: 'Orbitron', sans-serif;
          position: relative;
          padding: 0.75rem 2rem;
          border-radius: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
        }

        .neon-button-magenta::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 0.5rem;
          background: linear-gradient(135deg, #FF00E6 0%, #B400FF 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
          filter: blur(20px);
        }

        .neon-button-magenta:hover:not(:disabled)::before {
          opacity: 0.5;
          filter: blur(40px);
        }

        .neon-button-magenta:hover:not(:disabled) {
          background: rgba(255, 0, 230, 0.15);
          border-color: rgba(255, 0, 230, 0.6);
          box-shadow: 0 0 35px rgba(255, 0, 230, 0.4);
          filter: brightness(1.2);
        }

        .neon-button-magenta:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* Violet Neon Button */
        .neon-button-violet {
          background: rgba(180, 0, 255, 0.08);
          border: 1.5px solid rgba(180, 0, 255, 0.3);
          color: white;
          box-shadow: 0 0 25px rgba(180, 0, 255, 0.2);
          transition: all 0.3s ease;
          font-family: 'Orbitron', sans-serif;
          position: relative;
          padding: 0.75rem 2rem;
          border-radius: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
        }

        .neon-button-violet::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 0.5rem;
          background: linear-gradient(135deg, #B400FF 0%, #FF00E6 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
          filter: blur(20px);
        }

        .neon-button-violet:hover:not(:disabled)::before {
          opacity: 0.5;
          filter: blur(40px);
        }

        .neon-button-violet:hover:not(:disabled) {
          background: rgba(180, 0, 255, 0.15);
          border-color: rgba(180, 0, 255, 0.6);
          box-shadow: 0 0 35px rgba(180, 0, 255, 0.4);
          filter: brightness(1.2);
        }

        .neon-button-violet:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* Danger Neon Button */
        .neon-button-danger {
          background: rgba(255, 0, 0, 0.08);
          border: 1.5px solid rgba(255, 0, 0, 0.3);
          color: #FF4444;
          box-shadow: 0 0 25px rgba(255, 0, 0, 0.2);
          transition: all 0.3s ease;
          font-family: 'Orbitron', sans-serif;
          position: relative;
          padding: 0.75rem 2rem;
          border-radius: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
        }

        .neon-button-danger::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 0.5rem;
          background: radial-gradient(circle, #FF0000 0%, #AA0000 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
          filter: blur(20px);
        }

        .neon-button-danger:hover:not(:disabled)::before {
          opacity: 0.5;
          filter: blur(40px);
        }

        .neon-button-danger:hover:not(:disabled) {
          background: rgba(255, 0, 0, 0.15);
          border-color: rgba(255, 0, 0, 0.6);
          box-shadow: 0 0 35px rgba(255, 0, 0, 0.4);
          filter: brightness(1.2);
        }

        .neon-button-danger:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
}
