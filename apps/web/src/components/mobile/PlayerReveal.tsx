import { motion, AnimatePresence } from 'motion/react';
import { PlayerAvatar } from '../shared/PlayerAvatar';
import { useEffect, useState } from 'react';

interface Parlay {
  id: string;
  playerName: string;
  prediction: string;
}

interface PlayerRevealProps {
  currentPlayerName: string;
  currentPlayerParlay: string;
  allParlays: Parlay[];
  onRevealComplete: () => void;
}

export default function PlayerReveal({ 
  currentPlayerName, 
  currentPlayerParlay, 
  allParlays,
  onRevealComplete 
}: PlayerRevealProps) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onRevealComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onRevealComplete]);

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col p-6" style={{ background: "#000000" }}>
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
      <div className="relative z-10 flex-1 flex flex-col max-w-md mx-auto w-full">
        {/* Header with Countdown */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="countdown-number"
            key={countdown}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {countdown}
          </motion.div>
          <h1 className="reveal-title" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            THE PARLAYS
          </h1>
        </motion.div>

        {/* Your Parlay - Highlighted */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="section-label" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            YOUR PARLAY
          </p>
          <div className="parlay-card parlay-card-highlighted">
            <div className="parlay-header">
              <PlayerAvatar name={currentPlayerName} size="small" />
              <span className="parlay-name" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                {currentPlayerName}
              </span>
            </div>
            <p className="parlay-text" style={{ fontFamily: 'Rubik, sans-serif' }}>
              {currentPlayerParlay}
            </p>
          </div>
        </motion.div>

        {/* All Parlays List */}
        <motion.div
          className="flex-1 overflow-y-auto custom-scrollbar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <p className="section-label" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            ALL PARLAYS
          </p>
          <div className="space-y-3">
            {allParlays.map((parlay, index) => (
              <motion.div
                key={parlay.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="parlay-card">
                  <div className="parlay-header">
                    <PlayerAvatar name={parlay.playerName} size="small" />
                    <span className="parlay-name" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                      {parlay.playerName}
                    </span>
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

      <style>{`
        /* Countdown Number */
        .countdown-number {
          margin: 0 auto 1.5rem;
          font-family: 'Orbitron', sans-serif;
          font-size: 4rem;
          font-weight: 900;
          color: white;
          text-shadow: 
            0 0 20px rgba(255, 255, 255, 0.8),
            0 0 40px rgba(255, 255, 255, 0.6),
            0 0 60px rgba(255, 255, 255, 0.4);
          animation: countdown-glow 1s ease-in-out;
        }

        @keyframes countdown-glow {
          0% {
            text-shadow: 
              0 0 20px rgba(255, 255, 255, 0.8),
              0 0 40px rgba(255, 255, 255, 0.6),
              0 0 60px rgba(255, 255, 255, 0.4);
          }
          50% {
            text-shadow: 
              0 0 30px rgba(255, 255, 255, 1),
              0 0 60px rgba(255, 255, 255, 0.8),
              0 0 90px rgba(255, 255, 255, 0.6);
          }
          100% {
            text-shadow: 
              0 0 20px rgba(255, 255, 255, 0.8),
              0 0 40px rgba(255, 255, 255, 0.6),
              0 0 60px rgba(255, 255, 255, 0.4);
          }
        }

        /* Title */
        .reveal-title {
          font-size: 2rem;
          font-weight: 900;
          color: #ffffff;
          text-shadow: 
            0 0 15px rgba(255, 255, 255, 0.8),
            0 0 30px rgba(0, 255, 255, 0.6);
          letter-spacing: 0.15em;
        }

        /* Section Label */
        .section-label {
          font-size: 0.75rem;
          letter-spacing: 0.2em;
          color: rgba(255, 255, 255, 0.7);
          text-align: left;
          margin-bottom: 0.75rem;
          text-transform: uppercase;
        }

        /* Parlay Card */
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

        .parlay-card-highlighted {
          background: rgba(11, 11, 20, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 
            0 0 20px rgba(255, 255, 255, 0.1),
            inset 0 0 15px rgba(255, 255, 255, 0.05);
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

        .parlay-text {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.5;
        }

        /* Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(63, 208, 255, 0.3);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(63, 208, 255, 0.5);
        }
      `}</style>
    </div>
  );
}