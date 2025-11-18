import { motion } from 'motion/react';
import { useState } from 'react';
import { Zap } from 'lucide-react';
import { PlayerAvatar } from '../shared/PlayerAvatar';

interface Parlay {
  id: string;
  playerName: string;
  prediction: string;
  completed?: boolean;
}

interface PlayerVideoPhaseProps {
  playerName: string;
  parlays: Parlay[];
  onCallEvent: () => void;
}

export default function PlayerVideoPhase({ playerName, parlays, onCallEvent }: PlayerVideoPhaseProps) {
  const [buttonPressed, setButtonPressed] = useState(false);

  const handlePress = () => {
    setButtonPressed(true);
    onCallEvent();
    setTimeout(() => setButtonPressed(false), 300);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col justify-center" style={{ background: "#000000" }}>
      {/* Import Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Rubik:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Radial gradient centered behind content */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 1200px 800px at 50% 20%, #0A001A 0%, #000000 60%)",
          zIndex: 1,
        }}
      />

      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          opacity: 0.02,
          zIndex: 3,
        }}
      />

      {/* Parlays List - Moved down and centered for mobile */}
      <div className="relative z-10 flex items-center justify-center pt-16 pb-6 px-4">
        <div className="w-full max-w-md overflow-y-auto parlay-list-scrollbar mx-auto" style={{ maxHeight: '35vh' }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="section-title" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              ACTIVE PARLAYS
            </h2>
            <div className="space-y-2">
              {parlays.map((parlay, index) => (
                <motion.div
                  key={parlay.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className={parlay.completed ? 'opacity-50' : ''}
                >
                  <div className="parlay-card">
                    <div className="parlay-header">
                      <PlayerAvatar name={parlay.playerName} size="small" />
                      <span className="parlay-name" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                        {parlay.playerName}
                      </span>
                      {parlay.completed && (
                        <span className="parlay-complete-badge">✓</span>
                      )}
                    </div>
                    <p className="parlay-text" style={{ fontFamily: 'Rubik, sans-serif' }}>
                      {parlay.prediction}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Giant "IT HAPPENED!" Button - Center */}
      <div className="relative z-10 flex items-center justify-center flex-1 px-6">
        <motion.button
          className={`happened-button ${buttonPressed ? 'happened-button-active' : ''}`}
          onClick={handlePress}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <motion.div
            className="happened-button-ring"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          <div className="happened-button-content">
            <Zap className="w-12 h-12 mb-2" />
            <h2 className="happened-button-text" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              IT HAPPENED!
            </h2>
            <p className="happened-button-subtitle" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Tap to call your parlay
            </p>
          </div>
        </motion.button>
      </div>

      <style>{`
        /* Section Title */
        .section-title {
          font-size: 0.75rem;
          letter-spacing: 0.2em;
          color: #FFFFFF;
          text-align: center;
          margin-bottom: 1rem;
          text-shadow: 0 0 15px rgba(63, 208, 255, 0.6);
        }

        /* Parlay List Styles */
        .parlay-list-scrollbar::-webkit-scrollbar {
          width: 4px;
        }

        .parlay-list-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 3px;
        }

        .parlay-list-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(63, 208, 255, 0.3);
          border-radius: 3px;
        }

        .parlay-list-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(63, 208, 255, 0.5);
        }

        .parlay-card {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 0.75rem;
          background: rgba(11, 11, 20, 0.4);
          backdrop-filter: blur(15px);
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .parlay-card:hover {
          background: rgba(11, 11, 20, 0.5);
        }

        .parlay-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
          min-width: 0;
        }

        .parlay-name {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.9);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
          min-width: 0;
        }

        .parlay-complete-badge {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(0, 255, 136, 0.15);
          border: 1px solid rgba(0, 255, 136, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          color: #00FF88;
          flex-shrink: 0;
          text-shadow: 0 0 10px rgba(0, 255, 136, 0.8);
          box-shadow: 0 0 15px rgba(0, 255, 136, 0.3);
        }

        .parlay-text {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.5;
        }

        /* Giant Happened Button */
        .happened-button {
          position: relative;
          width: 220px;
          height: 220px;
          border-radius: 50%;
          background: transparent;
          border: 3px solid rgba(255, 255, 255, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 
            0 0 40px rgba(255, 255, 255, 0.3),
            0 0 80px rgba(0, 255, 255, 0.2),
            inset 0 0 30px rgba(255, 255, 255, 0.05);
        }

        .happened-button::before {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.1), transparent);
          opacity: 0.5;
          filter: blur(20px);
          animation: happened-glow-pulse 2s ease-in-out infinite;
        }

        @keyframes happened-glow-pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05);
          }
        }

        .happened-button-ring {
          position: absolute;
          inset: -20px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.2);
          pointer-events: none;
        }

        .happened-button-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          color: white;
        }

        .happened-button-text {
          font-size: 1.375rem;
          margin: 0;
          text-shadow: 
            0 0 15px rgba(255, 255, 255, 0.8),
            0 0 30px rgba(0, 255, 255, 0.6);
          letter-spacing: 0.05em;
        }

        .happened-button-subtitle {
          font-size: 0.75rem;
          margin: 0;
          margin-top: 0.25rem;
          opacity: 0.7;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        }

        .happened-button-active {
          transform: scale(0.95);
          border-color: rgba(255, 255, 255, 0.6);
          box-shadow: 
            0 0 60px rgba(255, 255, 255, 0.5),
            0 0 120px rgba(0, 255, 255, 0.4),
            inset 0 0 40px rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}