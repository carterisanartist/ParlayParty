import { ReactNode } from 'react';
import { motion } from 'motion/react';

interface NeonCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'magenta' | 'cyan' | 'violet' | 'multi';
}

export function NeonCard({ children, className = '', glowColor = 'multi' }: NeonCardProps) {
  const glowVariants = {
    magenta: 'neon-card-magenta',
    cyan: 'neon-card-cyan',
    violet: 'neon-card-violet',
    multi: 'neon-card-multi'
  };

  return (
    <>
      <motion.div
        className={`neon-card ${glowVariants[glowColor]} ${className}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>

      <style>{`
        /* Base Neon Card */
        .neon-card {
          background: rgba(15, 15, 15, 0.6);
          backdrop-filter: blur(20px);
          border: 1.5px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          position: relative;
          padding: 1.5rem;
        }

        /* Multi-color gradient glow */
        .neon-card-multi {
          box-shadow: 
            0 0 25px rgba(255, 0, 230, 0.15),
            0 0 25px rgba(0, 255, 255, 0.15),
            inset 0 0 30px rgba(0, 0, 0, 0.5);
        }

        .neon-card-multi::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 16px;
          padding: 1.5px;
          background: linear-gradient(
            135deg,
            #FF00E6 0%,
            #B400FF 50%,
            #00FFFF 100%
          );
          -webkit-mask: 
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0.3;
          animation: border-glow-pulse 3s ease-in-out infinite;
          pointer-events: none;
        }

        /* Magenta glow */
        .neon-card-magenta {
          box-shadow: 
            0 0 30px rgba(255, 0, 230, 0.25),
            inset 0 0 30px rgba(0, 0, 0, 0.5);
        }

        .neon-card-magenta::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 16px;
          padding: 1.5px;
          background: linear-gradient(135deg, #FF00E6 0%, #B400FF 100%);
          -webkit-mask: 
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0.4;
          animation: border-glow-pulse 3s ease-in-out infinite;
          pointer-events: none;
        }

        /* Cyan glow */
        .neon-card-cyan {
          box-shadow: 
            0 0 30px rgba(0, 255, 255, 0.25),
            inset 0 0 30px rgba(0, 0, 0, 0.5);
        }

        .neon-card-cyan::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 16px;
          padding: 1.5px;
          background: linear-gradient(135deg, #00FFFF 0%, #B400FF 100%);
          -webkit-mask: 
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0.4;
          animation: border-glow-pulse 3s ease-in-out infinite;
          pointer-events: none;
        }

        /* Violet glow */
        .neon-card-violet {
          box-shadow: 
            0 0 30px rgba(180, 0, 255, 0.25),
            inset 0 0 30px rgba(0, 0, 0, 0.5);
        }

        .neon-card-violet::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 16px;
          padding: 1.5px;
          background: linear-gradient(135deg, #B400FF 0%, #FF00E6 100%);
          -webkit-mask: 
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0.4;
          animation: border-glow-pulse 3s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes border-glow-pulse {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </>
  );
}
