import { motion, AnimatePresence } from 'motion/react';
import { Check, X } from 'lucide-react';
import { NeonButton } from '../shared/NeonButton';

interface PlayerVerificationModalProps {
  isOpen: boolean;
  callerName: string;
  prediction: string;
  onVote: (vote: boolean) => void;
}

export default function PlayerVerificationModal({ 
  isOpen, 
  callerName, 
  prediction, 
  onVote 
}: PlayerVerificationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="verify-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal Content */}
          <motion.div
            className="verify-modal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="verify-content">
              {/* Import Orbitron font */}
              <link rel="preconnect" href="https://fonts.googleapis.com" />
              <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
              <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

              {/* Question Mark Icon */}
              <motion.div
                className="verify-icon"
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                <span className="verify-icon-text">?</span>
              </motion.div>

              {/* Title */}
              <h2 className="verify-title" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                VERIFY THIS PARLAY
              </h2>

              {/* Player Info */}
              <div className="verify-info-card">
                <p className="verify-label" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  {callerName} says...
                </p>
                <p className="verify-prediction" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  "{prediction}"
                </p>
              </div>

              {/* Vote Question */}
              <p className="verify-question" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                Did this actually happen?
              </p>

              {/* Vote Buttons */}
              <div className="verify-buttons">
                <motion.button
                  className="verify-button verify-button-false"
                  onClick={() => onVote(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-8 h-8 mb-2" />
                  <span className="verify-button-text" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    FALSE
                  </span>
                </motion.button>

                <motion.button
                  className="verify-button verify-button-true"
                  onClick={() => onVote(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Check className="w-8 h-8 mb-2" />
                  <span className="verify-button-text" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    TRUE
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          <style>{`
            .verify-backdrop {
              position: fixed;
              inset: 0;
              background: rgba(0, 0, 0, 0.9);
              backdrop-filter: blur(15px);
              z-index: 50;
            }

            .verify-modal {
              position: fixed;
              inset: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 2rem;
              z-index: 51;
            }

            .verify-content {
              background: rgba(15, 15, 15, 0.95);
              backdrop-filter: blur(20px);
              border: 2px solid rgba(255, 255, 255, 0.1);
              border-radius: 24px;
              padding: 2rem;
              max-width: 400px;
              width: 100%;
              position: relative;
              box-shadow: 
                0 0 60px rgba(255, 0, 230, 0.3),
                0 0 120px rgba(0, 255, 255, 0.2),
                inset 0 0 40px rgba(0, 0, 0, 0.5);
            }

            .verify-content::before {
              content: '';
              position: absolute;
              inset: 0;
              border-radius: 24px;
              padding: 2px;
              background: linear-gradient(135deg, #FF00E6 0%, #B400FF 50%, #00FFFF 100%);
              -webkit-mask: 
                linear-gradient(#fff 0 0) content-box, 
                linear-gradient(#fff 0 0);
              -webkit-mask-composite: xor;
              mask-composite: exclude;
              opacity: 0.5;
              animation: verify-border-pulse 2s ease-in-out infinite;
              pointer-events: none;
            }

            @keyframes verify-border-pulse {
              0%, 100% {
                opacity: 0.5;
              }
              50% {
                opacity: 0.8;
              }
            }

            .verify-icon {
              width: 80px;
              height: 80px;
              margin: 0 auto 1.5rem;
              border-radius: 50%;
              background: linear-gradient(135deg, #B400FF, #FF00E6);
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 
                0 0 40px rgba(180, 0, 255, 0.6),
                0 0 80px rgba(255, 0, 230, 0.4);
            }

            .verify-icon-text {
              font-family: 'Orbitron', sans-serif;
              font-size: 3rem;
              color: white;
              font-weight: bold;
            }

            .verify-title {
              font-size: 1.5rem;
              text-align: center;
              margin-bottom: 1.5rem;
              color: white;
              text-shadow: 
                0 0 10px rgba(255, 0, 230, 0.6),
                0 0 20px rgba(255, 0, 230, 0.4);
            }

            .verify-info-card {
              background: rgba(0, 0, 0, 0.4);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 12px;
              padding: 1rem;
              margin-bottom: 1.5rem;
            }

            .verify-label {
              font-size: 0.875rem;
              color: #00FFFF;
              text-shadow: 0 0 10px rgba(0, 255, 255, 0.6);
              margin-bottom: 0.5rem;
              text-align: center;
            }

            .verify-prediction {
              font-size: 1rem;
              color: white;
              line-height: 1.5;
              text-align: center;
            }

            .verify-question {
              font-size: 1rem;
              color: rgba(255, 255, 255, 0.8);
              text-align: center;
              margin-bottom: 1.5rem;
            }

            .verify-buttons {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 1rem;
            }

            .verify-button {
              aspect-ratio: 1;
              border-radius: 16px;
              border: 2px solid;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: all 0.3s ease;
              position: relative;
            }

            .verify-button-false {
              background: rgba(255, 0, 0, 0.1);
              border-color: rgba(255, 0, 0, 0.3);
              color: #FF4444;
              box-shadow: 0 0 20px rgba(255, 0, 0, 0.2);
            }

            .verify-button-false:hover {
              background: rgba(255, 0, 0, 0.2);
              border-color: rgba(255, 0, 0, 0.6);
              box-shadow: 0 0 40px rgba(255, 0, 0, 0.4);
            }

            .verify-button-true {
              background: rgba(0, 255, 136, 0.1);
              border-color: rgba(0, 255, 136, 0.3);
              color: #00FF88;
              box-shadow: 0 0 20px rgba(0, 255, 136, 0.2);
            }

            .verify-button-true:hover {
              background: rgba(0, 255, 136, 0.2);
              border-color: rgba(0, 255, 136, 0.6);
              box-shadow: 0 0 40px rgba(0, 255, 136, 0.4);
            }

            .verify-button-text {
              font-size: 1.25rem;
              letter-spacing: 0.1em;
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
}
