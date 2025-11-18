import { useState } from 'react';
import { motion } from 'motion/react';
import { Lock } from 'lucide-react';

interface PlayerParlayEntryProps {
  playerName: string;
  videoTitle: string;
  videoThumbnail?: string;
  onSubmit: (prediction: string) => void;
}

export default function PlayerParlayEntry({ 
  playerName, 
  videoTitle, 
  videoThumbnail,
  onSubmit 
}: PlayerParlayEntryProps) {
  const [prediction, setPrediction] = useState('');

  // Flicker effect for title letters (matching host)
  const [flickerLetter, setFlickerLetter] = useState<number | null>(null);
  const [flickerColor, setFlickerColor] = useState<string>('');

  useState(() => {
    const scheduleFlicker = () => {
      const randomDelay = 3000 + Math.random() * 2000;
      setTimeout(() => {
        const randomLetter = Math.floor(Math.random() * 16); // "MAKE YOUR PARLAY"
        const colors = [
          'rgba(255, 0, 102, COLOR_OPACITY)',
          'rgba(153, 51, 255, COLOR_OPACITY)',
          'rgba(0, 102, 255, COLOR_OPACITY)',
          'rgba(0, 204, 255, COLOR_OPACITY)',
          'rgba(0, 255, 136, COLOR_OPACITY)',
          'rgba(255, 0, 153, COLOR_OPACITY)',
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

  const handleLockIn = () => {
    if (prediction.trim()) {
      onSubmit(prediction);
    }
  };

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
      <div className="relative z-10 flex-1 flex flex-col justify-center max-w-md mx-auto w-full px-4">
        {/* Header */}
        <motion.div
          className="text-center mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.65, 0, 0.35, 1] }}
        >
          <h1 
            className="parlay-entry-title mb-3" 
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            <div className="parlay-title-line">
              {'MAKE YOUR'.split('').map((letter, index) => {
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
            </div>
            <div className="parlay-title-line">
              {'PARLAY'.split('').map((letter, index) => {
                const actualIndex = index + 10; // Offset for flicker after "MAKE YOUR "
                const isFlickering = flickerLetter === actualIndex;
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
                    key={actualIndex}
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
                      delay: actualIndex * 0.05,
                      ease: [0.22, 1, 0.36, 1],
                      filter: { duration: 0.6 }
                    }}
                  >
                    {letter}
                  </motion.span>
                );
              })}
            </div>
          </h1>
          <p className="text-sm text-white/60 tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            Predict what will happen in the video
          </p>
        </motion.div>

        {/* Video Thumbnail */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-4"
        >
          <div className="parlay-card">
            <div className="video-thumbnail-container">
              {videoThumbnail ? (
                <img src={videoThumbnail} alt={videoTitle} className="video-thumbnail-image" />
              ) : (
                <div className="video-thumbnail-placeholder">
                  
                </div>
              )}
            </div>
            <h2 className="text-base mt-3 text-center text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              {videoTitle}
            </h2>
          </div>
        </motion.div>

        {/* Prediction Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-4"
        >
          <div className="parlay-card">
            <label className="block text-sm text-white/70 mb-3 uppercase tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Your Prediction
            </label>
            <textarea
              value={prediction}
              onChange={(e) => setPrediction(e.target.value)}
              placeholder="e.g., Someone says 'literally' within the first minute"
              maxLength={200}
              className="parlay-textarea"
              style={{ fontFamily: 'Rubik, sans-serif' }}
              rows={4}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-white/40" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                {prediction.length}/200
              </span>
            </div>
          </div>
        </motion.div>

        {/* Lock In Button */}
        <motion.button
          onClick={handleLockIn}
          disabled={!prediction.trim()}
          className="parlay-action-button"
          style={{ fontFamily: 'Orbitron, sans-serif' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={prediction.trim() ? { scale: 1.03, y: -2 } : {}}
          whileTap={prediction.trim() ? { scale: 0.97 } : {}}
        >
          <Lock className="w-5 h-5 mr-3" />
          LOCK IT IN
        </motion.button>
      </div>

      <style>{`
        /* Title */
        .parlay-entry-title {
          font-size: 40px;
          font-weight: 900;
          color: #ffffff;
          text-shadow: 
            0 0 10px rgba(255, 255, 255, 0.8),
            0 0 20px rgba(0, 255, 255, 0.6),
            0 0 30px rgba(180, 0, 255, 0.5),
            0 0 40px rgba(255, 0, 230, 0.3);
          letter-spacing: 0.15em;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
        }

        .parlay-title-line {
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

        /* Card */
        .parlay-card {
          position: relative;
          padding: 24px;
          background: rgba(8, 8, 8, 0.5);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          transition: all 0.3s ease;
        }

        .parlay-card:hover {
          background: rgba(8, 8, 8, 0.6);
        }

        /* Video Thumbnail */
        .video-thumbnail-container {
          width: 100%;
          aspect-ratio: 16/9;
          border-radius: 12px;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.5);
        }

        .video-thumbnail-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .video-thumbnail-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.3);
        }

        /* Textarea */
        .parlay-textarea {
          width: 100%;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          border-radius: 12px;
          padding: 12px;
          font-size: 0.875rem;
          resize: none;
          transition: all 0.3s ease;
        }

        .parlay-textarea::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .parlay-textarea:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.3);
          background: rgba(0, 0, 0, 0.5);
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
        }

        /* Action Button */
        .parlay-action-button {
          width: 100%;
          height: 64px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 14px;
          color: #e6e6f0;
          font-size: 16px;
          letter-spacing: 0.2em;
          font-weight: 700;
          display: flex;
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

        .parlay-action-button:not(:disabled):hover {
          background: transparent;
          border-color: rgba(255, 255, 255, 0.6);
          color: #FFFFFF;
          animation: action-button-glow 1.5s ease-in-out infinite;
        }

        .parlay-action-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          border-color: rgba(255, 255, 255, 0.2);
        }

        /* Responsive */
        @media (max-width: 640px) {
          .parlay-entry-title {
            font-size: 32px;
          }
        }
      `}</style>
    </div>
  );
}