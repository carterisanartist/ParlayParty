import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { ParlayCard } from '../shared/ParlayCard';

interface Parlay {
  id: string;
  playerName: string;
  prediction: string;
}

interface PlayerParlayPickerModalProps {
  isOpen: boolean;
  parlays: Parlay[];
  onSelect: (parlayId: string) => void;
  onClose: () => void;
}

export default function PlayerParlayPickerModal({ 
  isOpen, 
  parlays, 
  onSelect, 
  onClose 
}: PlayerParlayPickerModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            className="modal-container"
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="min-h-screen bg-[#0B0B0B] relative overflow-hidden flex flex-col items-center justify-center py-8">
              {/* Import Orbitron font */}
              <link rel="preconnect" href="https://fonts.googleapis.com" />
              <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
              <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

              {/* Background */}
              <div className="absolute inset-0 bg-black" />
              <div className="absolute inset-0 bg-gradient-radial from-[#0A001A] via-black to-black opacity-60" />
              
              {/* Ambient flares */}
              <div className="absolute w-[400px] h-[400px] top-[10%] left-[-20%] bg-gradient-radial from-[#FF00E6]/25 via-[#FF00E6]/10 to-transparent blur-[80px] pointer-events-none" />
              <div className="absolute w-[400px] h-[400px] bottom-[20%] right-[-20%] bg-gradient-radial from-[#00FFFF]/25 via-[#00FFFF]/10 to-transparent blur-[80px] pointer-events-none" />

              {/* Content - Centered */}
              <div className="relative z-10 flex flex-col items-center max-w-lg w-full px-6">
                {/* Header */}
                <div className="flex items-center justify-center mb-8 relative w-full">
                  <h1 className="text-3xl neon-text-glow text-center" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    SELECT PARLAY
                  </h1>
                  <button
                    onClick={onClose}
                    className="close-button absolute right-0 -top-12"
                    aria-label="Close"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <p className="text-base text-white/70 mb-8 text-center" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  Which parlay happened?
                </p>

                {/* Parlay List - Centered and Scrollable */}
                <div className="w-full max-h-[50vh] overflow-y-auto custom-scrollbar space-y-4 px-2">
                  {parlays.map((parlay, index) => (
                    <motion.div
                      key={parlay.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      onClick={() => onSelect(parlay.id)}
                    >
                      <ParlayCard
                        playerName={parlay.playerName}
                        prediction={parlay.prediction}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const styles = `
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    z-index: 50;
  }

  .modal-container {
    position: fixed;
    inset: 0;
    z-index: 51;
  }

  .neon-text-glow {
    color: #ffffff;
    text-shadow: 
      0 0 10px rgba(255, 0, 230, 0.8),
      0 0 20px rgba(255, 0, 230, 0.6),
      0 0 30px rgba(0, 255, 255, 0.4);
  }

  .close-button {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 0, 0, 0.1);
    border: 1.5px solid rgba(255, 0, 0, 0.3);
    color: #FF4444;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .close-button:hover {
    background: rgba(255, 0, 0, 0.2);
    border-color: rgba(255, 0, 0, 0.6);
    box-shadow: 0 0 20px rgba(255, 0, 0, 0.4);
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 3px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 0, 230, 0.3);
    border-radius: 3px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 0, 230, 0.5);
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);
}