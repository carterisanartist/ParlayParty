import { motion } from 'motion/react';
import { NeonCard } from '../shared/NeonCard';
import { Lock } from 'lucide-react';

interface PlayerParlayLockedProps {
  playerName: string;
  prediction: string;
}

export default function PlayerParlayLocked({ playerName, prediction }: PlayerParlayLockedProps) {
  return (
    <div className="min-h-screen bg-[#0B0B0B] relative overflow-hidden flex items-center justify-center p-6">
      {/* Import Orbitron font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Background */}
      <div className="absolute inset-0 bg-black" />
      <div className="absolute inset-0 bg-gradient-radial from-[#0A001A] via-black to-black opacity-60" />
      
      {/* Success ambient glow */}
      <div className="absolute w-[500px] h-[500px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-radial from-[#00FF88]/30 via-[#00FF88]/10 to-transparent blur-[120px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-md w-full">
        {/* Success Icon */}
        <motion.div
          className="locked-icon-container"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: 0.2 
          }}
        >
          <motion.div
            className="locked-icon-ring"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
          <Lock className="w-12 h-12 text-white mb-4" style={{ 
            filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.5))' 
          }} />
        </motion.div>

        {/* Locked In Text */}
        <motion.h1
          className="locked-title"
          style={{ fontFamily: 'Orbitron, sans-serif' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          LOCKED IN!
        </motion.h1>

        {/* Parlay Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1, ease: [0.22, 1, 0.36, 1] }}
          className="locked-card-container"
        >
          <div className="locked-card">
            <p className="text-sm text-white/60 mb-3 uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Your Parlay
            </p>
            <p className="text-lg leading-relaxed text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              "{prediction}"
            </p>
          </div>
        </motion.div>

        {/* Waiting Message */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <p className="text-sm text-white/50" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            Waiting for others to submit their parlay...
          </p>
        </motion.div>
      </div>

      <style>{`
        .locked-icon-container {
          position: relative;
          width: 160px;
          height: 160px;
          margin: 0 auto 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .locked-icon-ring {
          position: absolute;
          inset: -10px;
          border-radius: 50%;
          border: 3px solid rgba(0, 255, 136, 0.4);
          box-shadow: 
            0 0 40px rgba(0, 255, 136, 0.6),
            inset 0 0 40px rgba(0, 255, 136, 0.2);
          animation: locked-ring-pulse 2s ease-in-out infinite;
        }

        @keyframes locked-ring-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.7;
          }
        }

        .locked-title {
          font-size: 3rem;
          text-align: center;
          margin-bottom: 2rem;
          color: #00FF88;
          text-shadow: 
            0 0 20px rgba(0, 255, 136, 0.8),
            0 0 40px rgba(0, 255, 136, 0.6),
            0 0 60px rgba(0, 255, 136, 0.4);
          animation: locked-title-glow 2s ease-in-out infinite;
        }

        @keyframes locked-title-glow {
          0%, 100% {
            text-shadow: 
              0 0 20px rgba(0, 255, 136, 0.8),
              0 0 40px rgba(0, 255, 136, 0.6),
              0 0 60px rgba(0, 255, 136, 0.4);
          }
          50% {
            text-shadow: 
              0 0 30px rgba(0, 255, 136, 1),
              0 0 60px rgba(0, 255, 136, 0.8),
              0 0 90px rgba(0, 255, 136, 0.6);
          }
        }

        .locked-card-container {
          text-align: center;
        }

        .locked-card {
          background: rgba(15, 15, 15, 0.6);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          padding: 1.5rem;
        }
      `}</style>
    </div>
  );
}