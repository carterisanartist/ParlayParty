import { motion } from 'motion/react';
import { PlayerAvatar } from '../shared/PlayerAvatar';
import { ScoreboardRow } from '../shared/ScoreboardRow';
import { Trophy, Award, Medal, Home } from 'lucide-react';
import { NeonButton } from '../shared/NeonButton';
import { useState } from 'react';
import { ParlayButton } from '../shared/ParlayButton';

interface Player {
  id: string;
  name: string;
  score: number;
}

interface HostResultsProps {
  players: Player[];
  onContinue: () => void;
  onReturnToLobby?: () => void;
}

export default function HostResults({ players, onContinue, onReturnToLobby }: HostResultsProps) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const topThree = sortedPlayers.slice(0, 3);
  const restOfPlayers = sortedPlayers.slice(3);
  const [hoveredPlayer, setHoveredPlayer] = useState<string | null>(null);
  const [buttonClicked, setButtonClicked] = useState(false);

  // Flicker effect for FINAL RESULTS letters
  const [flickerLetter, setFlickerLetter] = useState<number | null>(null);
  const [flickerColor, setFlickerColor] = useState<string>('');

  useState(() => {
    const scheduleFlicker = () => {
      const randomDelay = 3000 + Math.random() * 2000; // Flicker every 3-5 seconds
      setTimeout(() => {
        const randomLetter = Math.floor(Math.random() * 13); // 13 letters in "FINAL RESULTS"
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

  const handleContinueClick = () => {
    setButtonClicked(true);
    setTimeout(() => {
      onContinue();
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#000000] relative overflow-hidden flex items-center justify-center p-8">
      {/* Import Orbitron font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Black Background */}
      <div className="absolute inset-0 bg-[#000000]" />
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/60 pointer-events-none" />
      
      {/* Lava Lamp Background Effect - Slower, smoother */}
      <div className="lava-lamp-container">
        <div className="lava-blob blob-1" />
        <div className="lava-blob blob-2" />
        <div className="lava-blob blob-3" />
        <div className="lava-blob blob-4" />
        <div className="lava-blob blob-5" />
        <div className="lava-blob blob-6" />
      </div>

      {/* Ambient Glowing Particles */}
      <div className="particles-container">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={`particle-${i}`}
            className="ambient-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col max-w-[1600px] mx-auto w-full">
        {/* Header with confetti burst */}
        <motion.div
          className="text-center mb-12 relative"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Title confetti burst */}
          <div className="title-confetti-burst">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={`burst-${i}`}
                className="burst-particle"
                initial={{ 
                  x: 0, 
                  y: 0, 
                  opacity: 1,
                  scale: 1 
                }}
                animate={{ 
                  x: Math.cos((i / 12) * Math.PI * 2) * 150,
                  y: Math.sin((i / 12) * Math.PI * 2) * 150,
                  opacity: 0,
                  scale: 0.5
                }}
                transition={{ 
                  duration: 1.2,
                  delay: 0.3,
                  ease: "easeOut"
                }}
                style={{
                  backgroundColor: [
                    '#FF00E6',
                    '#B400FF',
                    '#00FFFF',
                    '#FFD700',
                  ][i % 4],
                }}
              />
            ))}
          </div>

          <h1 className="results-title-new" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            {'FINAL RESULTS'.split('').map((letter, index) => {
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
          {/* Reflection glow */}
        </motion.div>

        {/* Winner Podium */}
        <motion.div
          className="flex items-end justify-center gap-6 mb-16 relative"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {/* 2nd Place */}
          {topThree[1] && (
            <motion.div
              className={`podium-card podium-second ${hoveredPlayer === topThree[1].id ? 'podium-highlighted' : ''}`}
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6, type: "spring", bounce: 0.3 }}
            >
              {/* Floating sparks */}
              <div className="floating-sparks">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={`spark-2-${i}`} className="spark" style={{ animationDelay: `${i * 0.7}s` }} />
                ))}
              </div>
              
              <div className="podium-avatar-wrapper">
                <PlayerAvatar name={topThree[1].name} size="large" className="podium-avatar" />
              </div>
              <h3 className="podium-name" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                {topThree[1].name}
              </h3>
              <div className="podium-rank rank-silver">
                <span style={{ fontFamily: 'Orbitron, sans-serif' }}>2ND PLACE</span>
              </div>
              <div className="podium-score">
                <span className="score-number" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  {topThree[1].score}
                </span>
                <span className="score-label">points</span>
              </div>
            </motion.div>
          )}

          {/* 1st Place - Winner */}
          {topThree[0] && (
            <motion.div
              className={`podium-card podium-first ${hoveredPlayer === topThree[0].id ? 'podium-highlighted' : ''}`}
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7, type: "spring", bounce: 0.3 }}
            >
              {/* Floating sparks */}
              <div className="floating-sparks">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={`spark-1-${i}`} className="spark spark-gold" style={{ animationDelay: `${i * 0.5}s` }} />
                ))}
              </div>
              
              <div className="podium-avatar-wrapper winner-avatar-wrapper">
                <PlayerAvatar name={topThree[0].name} size="large" className="podium-avatar winner-avatar" />
              </div>
              <h2 className="podium-name winner-name" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                {topThree[0].name}
              </h2>
              <div className="podium-rank rank-gold">
                <Trophy className="w-9 h-9" />
                <span style={{ fontFamily: 'Orbitron, sans-serif' }}>WINNER</span>
              </div>
              <div className="podium-score">
                <span className="score-number winner-score" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  {topThree[0].score}
                </span>
                <span className="score-label">points</span>
              </div>
            </motion.div>
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <motion.div
              className={`podium-card podium-third ${hoveredPlayer === topThree[2].id ? 'podium-highlighted' : ''}`}
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8, type: "spring", bounce: 0.3 }}
            >
              {/* Floating sparks */}
              <div className="floating-sparks">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={`spark-3-${i}`} className="spark" style={{ animationDelay: `${i * 0.7}s` }} />
                ))}
              </div>
              
              <div className="podium-avatar-wrapper">
                <PlayerAvatar name={topThree[2].name} size="large" className="podium-avatar" />
              </div>
              <h3 className="podium-name" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                {topThree[2].name}
              </h3>
              <div className="podium-rank rank-bronze">
                <span style={{ fontFamily: 'Orbitron, sans-serif' }}>3RD PLACE</span>
              </div>
              <div className="podium-score">
                <span className="score-number" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  {topThree[2].score}
                </span>
                <span className="score-label">points</span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Continue Button */}
        <motion.div
          className="text-center mt-10 relative flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.3 }}
        >
          <button
            onClick={onReturnToLobby}
            className="return-to-lobby-button-host"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            <Home className="w-5 h-5" />
            <span>Return to Lobby</span>
          </button>
        </motion.div>
      </div>

      <style>{`
        /* ===== BACKGROUND EFFECTS ===== */
        
        .lava-lamp-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
          mix-blend-mode: screen;
          opacity: 0.7;
        }

        .lava-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          animation: lava-blob-move-slow 40s ease-in-out infinite;
        }

        .blob-1 {
          width: 500px;
          height: 500px;
          top: 5%;
          left: 10%;
          background: radial-gradient(circle, rgba(255, 0, 230, 0.6), transparent);
          animation-duration: 45s;
        }

        .blob-2 {
          width: 600px;
          height: 600px;
          top: 40%;
          left: 65%;
          background: radial-gradient(circle, rgba(180, 0, 255, 0.6), transparent);
          animation-duration: 50s;
          animation-delay: 3s;
        }

        .blob-3 {
          width: 450px;
          height: 450px;
          top: 65%;
          left: 15%;
          background: radial-gradient(circle, rgba(0, 255, 255, 0.5), transparent);
          animation-duration: 48s;
          animation-delay: 6s;
        }

        .blob-4 {
          width: 550px;
          height: 550px;
          top: 20%;
          left: 75%;
          background: radial-gradient(circle, rgba(255, 0, 230, 0.5), transparent);
          animation-duration: 52s;
          animation-delay: 9s;
        }

        .blob-5 {
          width: 480px;
          height: 480px;
          top: 75%;
          left: 50%;
          background: radial-gradient(circle, rgba(0, 255, 255, 0.6), transparent);
          animation-duration: 46s;
          animation-delay: 12s;
        }

        .blob-6 {
          width: 520px;
          height: 520px;
          top: 50%;
          left: 35%;
          background: radial-gradient(circle, rgba(180, 0, 255, 0.5), transparent);
          animation-duration: 44s;
          animation-delay: 15s;
        }

        @keyframes lava-blob-move-slow {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(-40px, 60px) scale(1.15);
          }
          50% {
            transform: translate(50px, -50px) scale(0.95);
          }
          75% {
            transform: translate(-60px, -30px) scale(1.1);
          }
        }

        /* Ambient Particles */
        .particles-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
        }

        @keyframes particle-drift {
          0% {
            transform: translate(0, 0);
            opacity: 1;
          }
          50% {
            transform: translate(50px, -30px);
            opacity: 0.8;
          }
          100% {
            transform: translate(100px, -60px);
            opacity: 0;
          }
        }

        .ambient-particle {
          animation: particle-drift 12s cubic-bezier(0.65, 0, 0.35, 1) infinite;
          will-change: transform, opacity;
        }

        /* Multi-layer Confetti */
        .confetti-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
        }

        .confetti {
          position: absolute;
          border-radius: 50%;
          animation: confetti-fall linear infinite;
        }

        .confetti-large {
          width: 14px;
          height: 14px;
          opacity: 0.5;
        }

        .confetti-medium {
          width: 10px;
          height: 10px;
          opacity: 0.7;
        }

        .confetti-small {
          width: 6px;
          height: 6px;
          opacity: 0.9;
        }

        @keyframes confetti-fall {
          0% {
            top: -10%;
            transform: translateY(0) rotate(0deg);
          }
          100% {
            top: 110%;
            transform: translateY(0) rotate(720deg);
          }
        }

        /* ===== TITLE ===== */
        
        .results-title-new {
          font-size: 6rem;
          font-weight: 900;
          background: linear-gradient(180deg, #FFED4E 0%, #FFD700 50%, #FFA500 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 
            0 0 40px rgba(255, 215, 0, 0.8),
            0 0 80px rgba(255, 215, 0, 0.5);
          position: relative;
          letter-spacing: 0.1em;
          display: flex;
          justify-content: center;
        }

        /* Rainbow flow animation for title letters */
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
          background: linear-gradient(180deg, #FFED4E 0%, #FFD700 50%, #FFA500 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: rainbow-flow 5s linear infinite;
        }

        .title-confetti-burst {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .burst-particle {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        /* ===== PODIUM CARDS ===== */
        
        .podium-card {
          background: rgba(10, 10, 10, 0.7);
          backdrop-filter: blur(30px);
          border-radius: 24px;
          padding: 2rem 1.5rem;
          text-align: center;
          position: relative;
          width: 280px;
          transition: all 0.3s ease;
          animation: card-breathe 4s ease-in-out infinite;
          overflow: visible;
        }

        .podium-card::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 24px;
          padding: 2px;
          background: linear-gradient(135deg, var(--card-glow-1), var(--card-glow-2));
          -webkit-mask: 
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0.8;
        }

        .podium-card::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 24px;
          background: radial-gradient(circle at 50% 0%, var(--card-inner-glow), transparent 70%);
          opacity: 0.4;
          pointer-events: none;
        }

        @keyframes card-breathe {
          0%, 100% {
            box-shadow: 0 0 30px var(--card-shadow);
          }
          50% {
            box-shadow: 0 0 50px var(--card-shadow-bright);
          }
        }

        .podium-first {
          --card-glow-1: #FFD700;
          --card-glow-2: #FFA500;
          --card-inner-glow: rgba(255, 215, 0, 0.3);
          --card-shadow: rgba(255, 215, 0, 0.4);
          --card-shadow-bright: rgba(255, 215, 0, 0.7);
          height: 520px;
          transform: translateY(-20px);
        }

        .podium-second {
          --card-glow-1: #C0C0C0;
          --card-glow-2: #A8A8A8;
          --card-inner-glow: rgba(192, 192, 192, 0.3);
          --card-shadow: rgba(192, 192, 192, 0.4);
          --card-shadow-bright: rgba(192, 192, 192, 0.6);
          height: 460px;
        }

        .podium-third {
          --card-glow-1: #CD7F32;
          --card-glow-2: #B8732C;
          --card-inner-glow: rgba(205, 127, 50, 0.3);
          --card-shadow: rgba(205, 127, 50, 0.4);
          --card-shadow-bright: rgba(205, 127, 50, 0.6);
          height: 420px;
        }

        .podium-highlighted {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 0 60px var(--card-shadow-bright) !important;
        }

        /* Floating Sparks */
        .floating-sparks {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          height: 40px;
          pointer-events: none;
        }

        .spark {
          position: absolute;
          width: 4px;
          height: 4px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
          animation: spark-float 3s ease-in-out infinite;
        }

        .spark-gold {
          background: rgba(255, 215, 0, 1);
          box-shadow: 0 0 12px rgba(255, 215, 0, 0.9);
        }

        @keyframes spark-float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          50% {
            transform: translate(var(--spark-x, 30px), -40px) scale(0.5);
            opacity: 1;
          }
          90% {
            opacity: 0.5;
          }
        }

        .spark:nth-child(1) { --spark-x: -30px; left: 30%; }
        .spark:nth-child(2) { --spark-x: 20px; left: 50%; animation-delay: 0.5s; }
        .spark:nth-child(3) { --spark-x: 40px; left: 70%; animation-delay: 1s; }
        .spark:nth-child(4) { --spark-x: -20px; left: 40%; animation-delay: 1.5s; }
        .spark:nth-child(5) { --spark-x: 30px; left: 60%; animation-delay: 2s; }

        /* Avatar */
        .podium-avatar-wrapper {
          position: relative;
          margin: 0 auto 1.5rem;
          width: fit-content;
        }

        .winner-avatar-wrapper {
          transform: scale(1.2);
          margin-bottom: 1.5rem;
        }

        /* Names and Ranks */
        .podium-name {
          font-size: 1.5rem;
          color: white;
          margin-bottom: 1rem;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
        }

        .winner-name {
          font-size: 1.8rem;
        }

        .podium-rank {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          margin-bottom: 1rem;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .rank-gold {
          background: linear-gradient(135deg, #FFD700, #FFA500);
          color: #000;
          box-shadow: 0 0 30px rgba(255, 215, 0, 0.6);
        }

        .rank-silver {
          background: linear-gradient(135deg, #C0C0C0, #A8A8A8);
          color: #000;
          box-shadow: 0 0 25px rgba(192, 192, 192, 0.5);
        }

        .rank-bronze {
          background: linear-gradient(135deg, #CD7F32, #B8732C);
          color: #000;
          box-shadow: 0 0 25px rgba(205, 127, 50, 0.5);
        }

        /* Scores */
        .podium-score {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .score-number {
          font-size: 3rem;
          font-weight: 900;
          color: white;
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
        }

        .winner-score {
          font-size: 3.5rem;
          background: linear-gradient(180deg, #FFFFFF, #FFD700);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .score-label {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        /* ===== CONTINUE BUTTON ===== */
        
        .continue-button-new {
          position: relative;
          padding: 1.25rem 3.5rem;
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          background: rgba(0, 0, 0, 0.8);
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 16px;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.3s ease;
          outline: none !important;
        }

        .continue-button-new:focus {
          outline: none !important;
          box-shadow: none !important;
        }

        .continue-button-new:focus-visible {
          outline: none !important;
          box-shadow: none !important;
        }

        .continue-button-new:active {
          outline: none !important;
        }

        .button-text {
          position: relative;
          color: white;
          text-shadow: 
            0 0 10px rgba(255, 255, 255, 0.8),
            0 0 20px rgba(255, 255, 255, 0.5);
          animation: button-text-flicker 4s ease-in-out infinite;
        }

        @keyframes button-text-flicker {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.95;
          }
        }

        .continue-button-new:hover {
          transform: scale(1.05);
          box-shadow: 0 0 40px rgba(255, 255, 255, 0.6);
        }

        /* Return to Lobby Button */
        .return-to-lobby-button-host {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.75rem;
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          background: rgba(0, 0, 0, 0.6);
          border: 2px solid rgba(255, 255, 255, 0.25);
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.8);
          cursor: pointer;
          transition: all 0.3s ease;
          outline: none !important;
        }

        .return-to-lobby-button-host:hover {
          transform: scale(1.05);
          border-color: rgba(255, 255, 255, 0.4);
          color: rgba(255, 255, 255, 0.95);
          box-shadow: 0 0 25px rgba(255, 255, 255, 0.3);
        }

        .return-to-lobby-button-host:focus {
          outline: none !important;
        }

        .return-to-lobby-button-host:active {
          transform: scale(0.98);
        }

        /* Responsive adjustments */
        @media (max-width: 1024px) {
          .results-title-new {
            font-size: 4rem;
          }
          
          .podium-card {
            width: 240px;
            padding: 1.5rem 1rem;
          }

          .podium-first {
            height: 460px;
          }

          .podium-second {
            height: 400px;
          }

          .podium-third {
            height: 360px;
          }
        }

        @media (max-width: 768px) {
          .results-title-new {
            font-size: 3rem;
          }

          .podium-card {
            width: 200px;
          }
        }
      `}</style>
    </div>
  );
}