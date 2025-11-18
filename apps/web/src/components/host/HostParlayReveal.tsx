import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { ParlayCard } from '../shared/ParlayCard';

interface Parlay {
  id: string;
  playerName: string;
  prediction: string;
}

interface HostParlayRevealProps {
  parlays: Parlay[];
  onRevealComplete: () => void;
}

export default function HostParlayReveal({ parlays, onRevealComplete }: HostParlayRevealProps) {
  const [countdown, setCountdown] = useState(5);

  // Flicker effect for THE PARLAYS letters
  const [flickerLetter, setFlickerLetter] = useState<number | null>(null);
  const [flickerColor, setFlickerColor] = useState<string>('');

  useEffect(() => {
    const scheduleFlicker = () => {
      const randomDelay = 3000 + Math.random() * 2000; // Flicker every 3-5 seconds
      setTimeout(() => {
        const randomLetter = Math.floor(Math.random() * 11); // 11 letters in "THE PARLAYS"
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

  // Countdown timer
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
    <div className="min-h-screen bg-[#0B0B0B] relative overflow-hidden flex items-center justify-center p-8">
      {/* Import Orbitron font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050007] to-[#000000]" />
      
      {/* Dynamic pulsing ambient flares - DISABLED */}
      <div className="absolute w-[1200px] h-[1200px] top-[20%] left-[-15%] bg-gradient-radial from-[#FF00E6]/30 via-[#B400FF]/15 to-transparent blur-[150px] pointer-events-none" style={{ animation: 'none' }} />
      <div className="absolute w-[1200px] h-[1200px] bottom-[10%] right-[-15%] bg-gradient-radial from-[#00FFFF]/30 via-[#B400FF]/15 to-transparent blur-[150px] pointer-events-none" style={{ animation: 'none' }} />

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col max-w-[1600px] mx-auto w-full items-center" style={{ marginTop: '-120px' }}>
        {/* Countdown Circle - STATIC */}
        <div className="countdown-large-static" style={{ background: 'transparent', boxShadow: 'none', textShadow: '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.5), 0 0 60px rgba(255, 255, 255, 0.3)' }}>
          {countdown}
        </div>

        {/* Header - STATIC */}
        <div className="text-center mb-12">
          <h1 className="text-7xl reveal-title-animated" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            {'THE PARLAYS'.split('').map((letter, index) => {
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
                  0 0 80px ${flickerColor.replace('COLOR_OPACITY', '0.2')}\n                `,
                filter: `
                  drop-shadow(0 0 15px ${flickerColor.replace('COLOR_OPACITY', '0.8')})
                  drop-shadow(0 0 30px ${flickerColor.replace('COLOR_OPACITY', '0.5')})
                `,
                animation: 'none'
              } : {};

              return (
                <span
                  key={index}
                  className="neon-letter"
                  style={flickerStyle}
                >
                  {letter === ' ' ? '\u00A0' : letter}
                </span>
              );
            })}
          </h1>
          <p className="text-2xl text-white/60 mt-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            These are your targets!
          </p>
        </div>

        {/* Parlay Grid - STATIC */}
        <div className="grid grid-cols-3 gap-6 max-w-[1400px] mx-auto">
          {parlays.map((parlay, index) => (
            <div key={parlay.id} className="flex items-center justify-center">
              <div className="reveal-parlay-card-static w-full">
                <ParlayCard
                  playerName={parlay.playerName}
                  prediction={parlay.prediction}
                  locked
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        /* STATIC VERSION - All animations disabled */
        .countdown-large-static {
          width: 150px;
          height: 150px;
          margin: 0 auto 2rem;
          border-radius: 50%;
          background: linear-gradient(135deg, #FF00E6, #B400FF, #00FFFF);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Orbitron', sans-serif;
          font-size: 5rem;
          color: white;
          box-shadow: 
            0 0 60px rgba(255, 0, 230, 0.6),
            0 0 120px rgba(0, 255, 255, 0.4),
            inset 0 0 60px rgba(255, 255, 255, 0.2);
          /* animation: none; - DISABLED */
        }

        /* Rainbow flow animation for title */
        @keyframes rainbow-flow {
          0% {
            text-shadow: 
              0 0 3px rgba(255, 255, 255, 1),
              0 0 8px rgba(255, 255, 255, 0.9),
              0 0 12px rgba(255, 45, 179, 0.9),
              0 0 20px rgba(255, 45, 179, 0.7),
              0 0 30px rgba(255, 45, 179, 0.5),
              0 0 45px rgba(255, 45, 179, 0.4),
              0 0 60px rgba(255, 45, 179, 0.3),
              0 0 80px rgba(255, 45, 179, 0.2);
            filter: 
              drop-shadow(0 0 15px rgba(255, 45, 179, 0.8))
              drop-shadow(0 0 30px rgba(255, 45, 179, 0.5));
          }
          16.66% {
            text-shadow: 
              0 0 3px rgba(255, 255, 255, 1),
              0 0 8px rgba(255, 255, 255, 0.9),
              0 0 12px rgba(155, 92, 255, 0.9),
              0 0 20px rgba(155, 92, 255, 0.7),
              0 0 30px rgba(155, 92, 255, 0.5),
              0 0 45px rgba(155, 92, 255, 0.4),
              0 0 60px rgba(155, 92, 255, 0.3),
              0 0 80px rgba(155, 92, 255, 0.2);
            filter: 
              drop-shadow(0 0 15px rgba(155, 92, 255, 0.8))
              drop-shadow(0 0 30px rgba(155, 92, 255, 0.5));
          }
          33.33% {
            text-shadow: 
              0 0 3px rgba(255, 255, 255, 1),
              0 0 8px rgba(255, 255, 255, 0.9),
              0 0 12px rgba(63, 208, 255, 0.9),
              0 0 20px rgba(63, 208, 255, 0.7),
              0 0 30px rgba(63, 208, 255, 0.5),
              0 0 45px rgba(63, 208, 255, 0.4),
              0 0 60px rgba(63, 208, 255, 0.3),
              0 0 80px rgba(63, 208, 255, 0.2);
            filter: 
              drop-shadow(0 0 15px rgba(63, 208, 255, 0.8))
              drop-shadow(0 0 30px rgba(63, 208, 255, 0.5));
          }
          50% {
            text-shadow: 
              0 0 3px rgba(255, 255, 255, 1),
              0 0 8px rgba(255, 255, 255, 0.9),
              0 0 12px rgba(0, 229, 255, 0.9),
              0 0 20px rgba(0, 229, 255, 0.7),
              0 0 30px rgba(0, 229, 255, 0.5),
              0 0 45px rgba(0, 229, 255, 0.4),
              0 0 60px rgba(0, 229, 255, 0.3),
              0 0 80px rgba(0, 229, 255, 0.2);
            filter: 
              drop-shadow(0 0 15px rgba(0, 229, 255, 0.8))
              drop-shadow(0 0 30px rgba(0, 229, 255, 0.5));
          }
          66.66% {
            text-shadow: 
              0 0 3px rgba(255, 255, 255, 1),
              0 0 8px rgba(255, 255, 255, 0.9),
              0 0 12px rgba(89, 255, 181, 0.9),
              0 0 20px rgba(89, 255, 181, 0.7),
              0 0 30px rgba(89, 255, 181, 0.5),
              0 0 45px rgba(89, 255, 181, 0.4),
              0 0 60px rgba(89, 255, 181, 0.3),
              0 0 80px rgba(89, 255, 181, 0.2);
            filter: 
              drop-shadow(0 0 15px rgba(89, 255, 181, 0.8))
              drop-shadow(0 0 30px rgba(89, 255, 181, 0.5));
          }
          83.33% {
            text-shadow: 
              0 0 3px rgba(255, 255, 255, 1),
              0 0 8px rgba(255, 255, 255, 0.9),
              0 0 12px rgba(255, 0, 230, 0.9),
              0 0 20px rgba(255, 0, 230, 0.7),
              0 0 30px rgba(255, 0, 230, 0.5),
              0 0 45px rgba(255, 0, 230, 0.4),
              0 0 60px rgba(255, 0, 230, 0.3),
              0 0 80px rgba(255, 0, 230, 0.2);
            filter: 
              drop-shadow(0 0 15px rgba(255, 0, 230, 0.8))
              drop-shadow(0 0 30px rgba(255, 0, 230, 0.5));
          }
          100% {
            text-shadow: 
              0 0 3px rgba(255, 255, 255, 1),
              0 0 8px rgba(255, 255, 255, 0.9),
              0 0 12px rgba(255, 45, 179, 0.9),
              0 0 20px rgba(255, 45, 179, 0.7),
              0 0 30px rgba(255, 45, 179, 0.5),
              0 0 45px rgba(255, 45, 179, 0.4),
              0 0 60px rgba(255, 45, 179, 0.3),
              0 0 80px rgba(255, 45, 179, 0.2);
            filter: 
              drop-shadow(0 0 15px rgba(255, 45, 179, 0.8))
              drop-shadow(0 0 30px rgba(255, 45, 179, 0.5));
          }
        }

        @keyframes brightness-pulse {
          0%, 100% {
            filter: brightness(1);
          }
          50% {
            filter: brightness(1.3);
          }
        }

        .reveal-title-animated {
          color: #ffffff;
          display: flex;
          justify-content: center;
        }

        .neon-letter {
          display: inline-block;
          position: relative;
          color: #ffffff;
          animation: rainbow-flow 5s linear infinite, brightness-pulse 18s ease-in-out infinite;
          animation-delay: 0s, 3s;
        }

        .reveal-parlay-card-static {
          height: 100%;
          /* animation: none; - DISABLED */
        }
      `}</style>
    </div>
  );
}