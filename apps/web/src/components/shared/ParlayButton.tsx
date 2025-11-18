import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface ParlayButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  style?: React.CSSProperties;
}

export function ParlayButton({
  children,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  fullWidth = false,
  style = {},
}: ParlayButtonProps) {
  return (
    <>
      <motion.button
        onClick={onClick}
        disabled={disabled}
        type={type}
        className={`parlay-button ${fullWidth ? 'parlay-button-full-width' : ''} ${className}`}
        style={style}
        whileHover={!disabled ? { scale: 1.03, y: -2 } : {}}
        whileTap={!disabled ? { scale: 0.97 } : {}}
      >
        {children}
      </motion.button>

      <style>{`
        .parlay-button {
          min-width: 180px;
          height: 58px;
          padding: 0 2rem;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 14px;
          color: #e6e6f0;
          font-size: 16px;
          letter-spacing: 0.2em;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease-in-out;
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }

        .parlay-button-full-width {
          width: 100%;
        }

        @keyframes parlay-button-glow {
          0%, 100% { 
            border-color: rgba(255, 255, 255, 0.5);
            box-shadow: 
              0 0 15px rgba(255, 255, 255, 0.4),
              0 0 30px rgba(255, 0, 230, 0.3),
              0 0 45px rgba(0, 255, 255, 0.2),
              inset 0 0 20px rgba(255, 255, 255, 0.05);
          }
          50% { 
            border-color: rgba(255, 255, 255, 0.8);
            box-shadow: 
              0 0 25px rgba(255, 255, 255, 0.6),
              0 0 40px rgba(255, 0, 230, 0.5),
              0 0 60px rgba(0, 255, 255, 0.4),
              inset 0 0 30px rgba(255, 255, 255, 0.1);
          }
        }

        .parlay-button:not(:disabled):hover {
          background: transparent;
          border-color: rgba(255, 255, 255, 0.6);
          color: #FFFFFF;
          animation: parlay-button-glow 1.5s ease-in-out infinite;
        }

        .parlay-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          border-color: rgba(255, 255, 255, 0.2);
        }

        /* Accessibility - reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .parlay-button:not(:disabled):hover {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}
