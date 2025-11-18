import { PlayerAvatar } from './PlayerAvatar';
import { motion } from 'motion/react';

interface ParlayCardProps {
  playerName: string;
  prediction: string;
  locked?: boolean;
  highlighted?: boolean;
  onClick?: () => void;
}

export function ParlayCard({ playerName, prediction, locked = false, highlighted = false, onClick }: ParlayCardProps) {
  return (
    <>
      <motion.div
        className={`parlay-card ${locked ? 'parlay-locked' : ''} ${highlighted ? 'parlay-highlighted' : ''}`}
        onClick={onClick}
        whileHover={onClick ? { scale: 1.02 } : undefined}
        whileTap={onClick ? { scale: 0.98 } : undefined}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-3">
          <PlayerAvatar name={playerName} size="small" />
          <p className="parlay-player-name" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            {playerName}
          </p>
          {locked && (
            <span className="parlay-locked-badge">
              LOCKED
            </span>
          )}
        </div>
        <p className="parlay-prediction" style={{ fontFamily: 'Orbitron, sans-serif' }}>
          {prediction}
        </p>
      </motion.div>

      <style>{`
        .parlay-card {
          background: rgba(15, 15, 15, 0.6);
          backdrop-filter: blur(20px);
          border: 1.5px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1rem;
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
        }

        .parlay-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 12px;
          padding: 1.5px;
          background: linear-gradient(135deg, #FFFFFF 0%, #FFFFFF 100%);
          -webkit-mask: 
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .parlay-card:hover::before {
          opacity: 0.6;
        }

        .parlay-locked {
          /* Green border removed */
        }

        .parlay-locked::before {
          /* Green gradient border removed */
          opacity: 0;
        }

        .parlay-highlighted {
          border-color: rgba(255, 0, 230, 0.6);
          box-shadow: 
            0 0 30px rgba(255, 0, 230, 0.4),
            inset 0 0 20px rgba(255, 0, 230, 0.1);
          transform: scale(1.05);
        }

        .parlay-highlighted::before {
          background: linear-gradient(135deg, #FF00E6 0%, #B400FF 100%);
          opacity: 0.6;
          animation: parlay-highlight-pulse 2s ease-in-out infinite;
        }

        @keyframes parlay-highlight-pulse {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 0.8;
          }
        }

        .parlay-player-name {
          font-size: 0.875rem;
          color: white;
          flex: 1;
        }

        .parlay-locked-badge {
          padding: 2px 8px;
          background: rgba(0, 255, 136, 0.2);
          border: 1px solid rgba(0, 255, 136, 0.5);
          border-radius: 8px;
          font-size: 0.65rem;
          font-family: 'Orbitron', sans-serif;
          color: #00FF88;
          text-shadow: 0 0 10px rgba(0, 255, 136, 0.8);
          letter-spacing: 0.05em;
        }

        .parlay-prediction {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.5;
        }
      `}</style>
    </>
  );
}