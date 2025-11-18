import { motion } from 'motion/react';
import { useState } from 'react';
import { PlayerAvatar } from '../shared/PlayerAvatar';
import { Lock, Clock, X } from 'lucide-react';
import { ParlayButton } from '../shared/ParlayButton';

interface Player {
  id: string;
  name: string;
  locked: boolean;
  timeRemaining?: number;
}

interface HostParlayEntryProps {
  players: Player[];
  onForceStart: () => void;
  onRemovePlayer?: (playerId: string) => void;
}

export default function HostParlayEntry({ players, onForceStart, onRemovePlayer }: HostParlayEntryProps) {
  const lockedCount = players.filter(p => p.locked).length;
  const totalCount = players.length;
  const progress = (lockedCount / totalCount) * 100;
  const allLocked = lockedCount === totalCount;

  // Flicker effect for PARLAY ENTRY letters
  const [flickerLetter, setFlickerLetter] = useState<number | null>(null);
  const [flickerColor, setFlickerColor] = useState<string>('');

  useState(() => {
    const scheduleFlicker = () => {
      const randomDelay = 3000 + Math.random() * 2000; // Flicker every 3-5 seconds
      setTimeout(() => {
        const randomLetter = Math.floor(Math.random() * 12); // 12 letters in "PARLAY ENTRY"
        // Pick a random neon color from the palette
        const colors = [
          'rgba(255, 0, 102, COLOR_OPACITY)', // Pink
          'rgba(153, 51, 255, COLOR_OPACITY)', // Purple
          'rgba(0, 102, 255, COLOR_OPACITY)', // Blue
          'rgba(0, 204, 255, COLOR_OPACITY)', // Cyan
          'rgba(0, 255, 136, COLOR_OPACITY)', // Green
          'rgba(255, 0, 153, COLOR_OPACITY)', // Magenta
        ];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        setFlickerLetter(randomLetter);
        setFlickerColor(randomColor);
        setTimeout(() => {
          setFlickerLetter(null);
          setFlickerColor('');
        }, 400);
        scheduleFlicker();
      }, randomDelay);
    };

    const initialTimer = setTimeout(scheduleFlicker, 8000);
    return () => clearTimeout(initialTimer);
  });

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-8" style={{ background: "#000000" }}>
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

      {/* Content */}
      <div className="relative z-10 flex flex-col max-w-[1600px] mx-auto w-full">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 
            className="parlay-entry-title mb-4" 
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            {'PARLAY ENTRY'.split('').map((letter, index) => {
              const isFlickering = flickerLetter === index;
              const flickerStyle = isFlickering && flickerColor ? {
                textShadow: `
                  0 0 3px rgba(255, 255, 255, 1),
                  0 0 8px rgba(255, 255, 255, 0.9),
                  0 0 12px ${flickerColor.replace('COLOR_OPACITY', '0.9')},
                  0 0 20px ${flickerColor.replace('COLOR_OPACITY', '0.7')},
                  0 0 30px ${flickerColor.replace('COLOR_OPACITY', '0.5')},
                  0 0 45px ${flickerColor.replace('COLOR_OPACITY', '0.4')},
                  0 0 60px ${flickerColor.replace('COLOR_OPACITY', '0.3')},
                  0 0 80px ${flickerColor.replace('COLOR_OPACITY', '0.2')}
                `,
                filter: `
                  drop-shadow(0 0 15px ${flickerColor.replace('COLOR_OPACITY', '0.8')})
                  drop-shadow(0 0 30px ${flickerColor.replace('COLOR_OPACITY', '0.5')})
                `,
              } : {};

              return (
                <motion.span
                  key={index}
                  className="neon-letter"
                  style={flickerStyle}
                  initial={{ 
                    opacity: 0, 
                    y: -20,
                    filter: 'blur(10px)' 
                  }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    filter: 'blur(0px)'
                  }}
                  transition={{
                    duration: 0.8,
                    delay: index * 0.05,
                    ease: [0.22, 1, 0.36, 1],
                    filter: { duration: 0.6 }
                  }}
                >
                  {letter === ' ' ? '\u00A0' : letter}
                </motion.span>
              );
            })}
          </h1>
          <p className="text-xl text-white/60 tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            Submit your predictions...
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          className="mb-12 max-w-2xl mx-auto w-full"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="progress-container">
            <div className="progress-label" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              {lockedCount} / {totalCount} Players Locked In
            </div>
            <div className="progress-track">
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${progress}%`,
                }}
                transition={{ 
                  duration: 0.8, 
                  ease: 'easeOut'
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Player Grid */}
        <motion.div
          className="grid grid-cols-4 gap-6 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {players.map((player, index) => (
            <motion.div
              key={player.id}
              className={`parlay-player-card ${player.locked ? 'parlay-player-locked' : 'parlay-player-pending'}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
            >
              {onRemovePlayer && (
                <button
                  onClick={() => onRemovePlayer(player.id)}
                  className="parlay-remove-player-button"
                  aria-label={`Remove ${player.name}`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="flex flex-col items-center justify-center h-full">
                <PlayerAvatar name={player.name} size="large" className="mb-4" />
                <h3 className="text-lg text-white mb-3 tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  {player.name}
                </h3>
                
                {player.locked ? (
                  <div className="parlay-locked-badge">
                    <Lock className="w-4 h-4 mr-2" />
                    LOCKED IN
                  </div>
                ) : (
                  <div className="parlay-pending-badge">
                    <Clock className="w-4 h-4 mr-2 animate-spin-slow" />
                    WAITING...
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Action Button */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {allLocked ? (
            <motion.button
              onClick={onForceStart}
              className="parlay-action-button"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              CONTINUE TO REVEAL →
            </motion.button>
          ) : (
            <motion.button
              onClick={onForceStart}
              className="parlay-action-button parlay-force-button"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              FORCE START
            </motion.button>
          )}
        </motion.div>
      </div>

      <style>{`
        /* Title */
        .parlay-entry-title {
          font-size: 64px;
          font-weight: 900;
          color: #ffffff;
          text-shadow: 
            0 0 10px rgba(255, 255, 255, 0.8),
            0 0 20px rgba(0, 255, 255, 0.6),
            0 0 30px rgba(180, 0, 255, 0.5),
            0 0 40px rgba(255, 0, 230, 0.3);
          letter-spacing: 0.15em;
          display: flex;
          justify-content: center;
        }

        /* Neon letter animation */
        @keyframes rainbow-flow {
          0% {
            text-shadow: 
              0 0 3px rgba(255, 255, 255, 1),
              0 0 8px rgba(255, 255, 255, 0.9),
              0 0 12px rgba(255, 0, 102, 0.9),
              0 0 20px rgba(255, 0, 102, 0.7),
              0 0 30px rgba(255, 0, 102, 0.5),
              0 0 45px rgba(255, 0, 102, 0.4),
              0 0 60px rgba(255, 0, 102, 0.3),
              0 0 80px rgba(255, 0, 102, 0.2);
            filter: 
              drop-shadow(0 0 15px rgba(255, 0, 102, 0.8))
              drop-shadow(0 0 30px rgba(255, 0, 102, 0.5));
          }
          16.66% {
            text-shadow: 
              0 0 3px rgba(255, 255, 255, 1),
              0 0 8px rgba(255, 255, 255, 0.9),
              0 0 12px rgba(153, 51, 255, 0.9),
              0 0 20px rgba(153, 51, 255, 0.7),
              0 0 30px rgba(153, 51, 255, 0.5),
              0 0 45px rgba(153, 51, 255, 0.4),
              0 0 60px rgba(153, 51, 255, 0.3),
              0 0 80px rgba(153, 51, 255, 0.2);
            filter: 
              drop-shadow(0 0 15px rgba(153, 51, 255, 0.8))
              drop-shadow(0 0 30px rgba(153, 51, 255, 0.5));
          }
          33.33% {
            text-shadow: 
              0 0 3px rgba(255, 255, 255, 1),
              0 0 8px rgba(255, 255, 255, 0.9),
              0 0 12px rgba(0, 102, 255, 0.9),
              0 0 20px rgba(0, 102, 255, 0.7),
              0 0 30px rgba(0, 102, 255, 0.5),
              0 0 45px rgba(0, 102, 255, 0.4),
              0 0 60px rgba(0, 102, 255, 0.3),
              0 0 80px rgba(0, 102, 255, 0.2);
            filter: 
              drop-shadow(0 0 15px rgba(0, 102, 255, 0.8))
              drop-shadow(0 0 30px rgba(0, 102, 255, 0.5));
          }
          50% {
            text-shadow: 
              0 0 3px rgba(255, 255, 255, 1),
              0 0 8px rgba(255, 255, 255, 0.9),
              0 0 12px rgba(0, 204, 255, 0.9),
              0 0 20px rgba(0, 204, 255, 0.7),
              0 0 30px rgba(0, 204, 255, 0.5),
              0 0 45px rgba(0, 204, 255, 0.4),
              0 0 60px rgba(0, 204, 255, 0.3),
              0 0 80px rgba(0, 204, 255, 0.2);
            filter: 
              drop-shadow(0 0 15px rgba(0, 204, 255, 0.8))
              drop-shadow(0 0 30px rgba(0, 204, 255, 0.5));
          }
          66.66% {
            text-shadow: 
              0 0 3px rgba(255, 255, 255, 1),
              0 0 8px rgba(255, 255, 255, 0.9),
              0 0 12px rgba(0, 255, 136, 0.9),
              0 0 20px rgba(0, 255, 136, 0.7),
              0 0 30px rgba(0, 255, 136, 0.5),
              0 0 45px rgba(0, 255, 136, 0.4),
              0 0 60px rgba(0, 255, 136, 0.3),
              0 0 80px rgba(0, 255, 136, 0.2);
            filter: 
              drop-shadow(0 0 15px rgba(0, 255, 136, 0.8))
              drop-shadow(0 0 30px rgba(0, 255, 136, 0.5));
          }
          83.33% {
            text-shadow: 
              0 0 3px rgba(255, 255, 255, 1),
              0 0 8px rgba(255, 255, 255, 0.9),
              0 0 12px rgba(255, 0, 153, 0.9),
              0 0 20px rgba(255, 0, 153, 0.7),
              0 0 30px rgba(255, 0, 153, 0.5),
              0 0 45px rgba(255, 0, 153, 0.4),
              0 0 60px rgba(255, 0, 153, 0.3),
              0 0 80px rgba(255, 0, 153, 0.2);
            filter: 
              drop-shadow(0 0 15px rgba(255, 0, 153, 0.8))
              drop-shadow(0 0 30px rgba(255, 0, 153, 0.5));
          }
          100% {
            text-shadow: 
              0 0 3px rgba(255, 255, 255, 1),
              0 0 8px rgba(255, 255, 255, 0.9),
              0 0 12px rgba(255, 0, 102, 0.9),
              0 0 20px rgba(255, 0, 102, 0.7),
              0 0 30px rgba(255, 0, 102, 0.5),
              0 0 45px rgba(255, 0, 102, 0.4),
              0 0 60px rgba(255, 0, 102, 0.3),
              0 0 80px rgba(255, 0, 102, 0.2);
            filter: 
              drop-shadow(0 0 15px rgba(255, 0, 102, 0.8))
              drop-shadow(0 0 30px rgba(255, 0, 102, 0.5));
          }
        }

        .neon-letter {
          display: inline-block;
          position: relative;
          color: #ffffff;
          animation: rainbow-flow 5s linear infinite;
        }

        /* Progress Bar */
        .progress-container {
          width: 100%;
        }

        .progress-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
          letter-spacing: 0.05em;
        }

        .progress-track {
          width: 100%;
          height: 8px;
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          overflow: hidden;
          position: relative;
        }

        .progress-fill {
          height: 100%;
          background: #FFFFFF;
          border-radius: 8px;
          box-shadow: 
            0 0 20px rgba(255, 255, 255, 0.8),
            0 0 30px rgba(255, 255, 255, 0.5),
            inset 0 0 10px rgba(255, 255, 255, 0.3);
          position: relative;
          animation: progress-shimmer 2s ease-in-out infinite;
        }

        @keyframes progress-shimmer {
          0%, 100% {
            filter: brightness(1);
            box-shadow: 
              0 0 20px rgba(255, 255, 255, 0.8),
              0 0 30px rgba(255, 255, 255, 0.5),
              inset 0 0 10px rgba(255, 255, 255, 0.3);
          }
          50% {
            filter: brightness(1.4);
            box-shadow: 
              0 0 30px rgba(255, 255, 255, 1),
              0 0 50px rgba(255, 255, 255, 0.8),
              inset 0 0 15px rgba(255, 255, 255, 0.5);
          }
        }

        /* Player Card */
        .parlay-player-card {
          position: relative;
          padding: 32px 24px;
          background: rgba(8, 8, 8, 0.5);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          transition: all 0.3s ease;
          min-height: 240px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .parlay-player-card:hover {
          background: rgba(8, 8, 8, 0.6);
        }

        .parlay-player-locked {
        }

        .parlay-player-pending {
        }

        /* Status Badges */
        .parlay-locked-badge {
          display: inline-flex;
          align-items: center;
          padding: 8px 16px;
          background: rgba(0, 255, 136, 0.1);
          border: 1px solid rgba(0, 255, 136, 0.5);
          border-radius: 12px;
          font-family: 'Orbitron', sans-serif;
          font-size: 12px;
          color: #00FF88;
          text-shadow: 0 0 10px rgba(0, 255, 136, 0.8);
          letter-spacing: 0.1em;
          box-shadow: 0 0 15px rgba(0, 255, 136, 0.4), 0 0 25px rgba(0, 255, 136, 0.2);
        }

        .parlay-pending-badge {
          display: inline-flex;
          align-items: center;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          font-family: 'Orbitron', sans-serif;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
          letter-spacing: 0.1em;
        }

        /* Remove Player Button */
        .parlay-remove-player-button {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 51, 51, 0.1);
          border: 1px solid rgba(255, 51, 51, 0.4);
          border-radius: 8px;
          color: #FF3333;
          cursor: pointer;
          transition: all 0.2s ease;
          opacity: 0;
          z-index: 10;
        }

        .parlay-player-card:hover .parlay-remove-player-button {
          opacity: 1;
        }

        .parlay-remove-player-button:hover {
          background: rgba(255, 51, 51, 0.2);
          border-color: rgba(255, 51, 51, 0.8);
          color: #FF6666;
          box-shadow: 0 0 15px rgba(255, 51, 51, 0.4);
          transform: scale(1.05);
        }

        .parlay-remove-player-button:active {
          transform: scale(0.95);
        }

        /* Action Button */
        .parlay-action-button {
          min-width: 380px;
          height: 64px;
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
          text-transform: uppercase;
        }

        @keyframes action-button-glow {
          0%, 100% { 
            border-color: rgba(255, 255, 255, 0.5);
            box-shadow: 
              0 0 15px rgba(255, 255, 255, 0.4),
              0 0 30px rgba(0, 255, 255, 0.3),
              0 0 45px rgba(180, 0, 255, 0.2),
              inset 0 0 20px rgba(255, 255, 255, 0.05);
          }
          50% { 
            border-color: rgba(255, 255, 255, 0.8);
            box-shadow: 
              0 0 25px rgba(255, 255, 255, 0.6),
              0 0 40px rgba(0, 255, 255, 0.5),
              0 0 60px rgba(180, 0, 255, 0.4),
              inset 0 0 30px rgba(255, 255, 255, 0.1);
          }
        }

        .parlay-action-button:hover {
          background: transparent;
          border-color: rgba(255, 255, 255, 0.6);
          color: #FFFFFF;
          animation: action-button-glow 1.5s ease-in-out infinite;
        }

        .parlay-force-button {
          border-color: rgba(255, 51, 51, 0.3);
          color: #FF3333;
        }

        @keyframes force-button-glow {
          0%, 100% { 
            border-color: rgba(255, 51, 51, 0.5);
            box-shadow: 
              0 0 15px rgba(255, 51, 51, 0.4),
              0 0 30px rgba(255, 0, 0, 0.3),
              inset 0 0 20px rgba(255, 51, 51, 0.05);
          }
          50% { 
            border-color: rgba(255, 51, 51, 0.8);
            box-shadow: 
              0 0 25px rgba(255, 51, 51, 0.6),
              0 0 40px rgba(255, 0, 0, 0.5),
              inset 0 0 30px rgba(255, 51, 51, 0.1);
          }
        }

        .parlay-force-button:hover {
          border-color: rgba(255, 51, 51, 0.6);
          color: #FF6666;
          animation: force-button-glow 1.5s ease-in-out infinite;
        }

        /* Spinning animation */
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .parlay-entry-title {
            font-size: 48px;
          }
        }

        @media (max-width: 768px) {
          .parlay-entry-title {
            font-size: 36px;
          }
        }
      `}</style>
    </div>
  );
}