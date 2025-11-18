import { motion } from 'motion/react';
import { PlayerAvatar } from '../shared/PlayerAvatar';
import { Trophy, Award, Medal, Home } from 'lucide-react';
import { useState } from 'react';

interface PlayerResultsProps {
  playerName: string;
  score: number;
  rank: number;
  totalPlayers: number;
  correctParlays: number;
  totalParlays: number;
  onReturnToLobby?: () => void;
}

export default function PlayerResults({ 
  playerName, 
  score, 
  rank, 
  totalPlayers, 
  correctParlays, 
  totalParlays,
  onReturnToLobby
}: PlayerResultsProps) {
  // Flicker effect for title letters
  const [flickerLetter, setFlickerLetter] = useState<number | null>(null);
  const [flickerColor, setFlickerColor] = useState<string>('');

  useState(() => {
    const scheduleFlicker = () => {
      const randomDelay = 3000 + Math.random() * 2000;
      setTimeout(() => {
        const titleText = rank === 1 ? 'WINNER!' : rank <= 3 ? `${rank}${getRankSuffix(rank)} PLACE!` : 'GAME OVER';
        const randomLetter = Math.floor(Math.random() * titleText.length);
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

  const getRankIcon = () => {
    if (rank === 1) return <Trophy className="w-9 h-9" />;
    if (rank === 2) return <Award className="w-9 h-9" />;
    if (rank === 3) return <Medal className="w-9 h-9" />;
    return null;
  };

  const getRankColor = () => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return '#00FFFF';
  };

  const getRankGradient = () => {
    if (rank === 1) return 'linear-gradient(135deg, #FFD700, #FFA500)';
    if (rank === 2) return 'linear-gradient(135deg, #C0C0C0, #A0A0A0)';
    if (rank === 3) return 'linear-gradient(135deg, #CD7F32, #B8860B)';
    return 'linear-gradient(135deg, #00FFFF, #0099CC)';
  };

  const isWinner = rank <= 3;
  const titleText = rank === 1 ? 'WINNER!' : rank <= 3 ? `${rank}${getRankSuffix(rank)} PLACE!` : 'GAME OVER';

  return (
    <div className="min-h-screen bg-[#000000] relative overflow-hidden flex items-center justify-center p-6">
      {/* Import Orbitron font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Black Background */}
      <div className="absolute inset-0 bg-[#000000]" />
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/60 pointer-events-none" />
      
      {/* Lava Lamp Background Effect */}
      <div className="lava-lamp-container">
        <div className="lava-blob blob-1" />
        <div className="lava-blob blob-2" />
        <div className="lava-blob blob-3" />
        <div className="lava-blob blob-4" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center max-w-md w-full">
        {/* Header with confetti burst */}
        <motion.div
          className="text-center mb-8 relative"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Title confetti burst */}
          {isWinner && (
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
                    x: Math.cos((i / 12) * Math.PI * 2) * 100,
                    y: Math.sin((i / 12) * Math.PI * 2) * 100,
                    opacity: 0,
                    scale: 0.5
                  }}
                  transition={{ 
                    duration: 1.2,
                    delay: 0.3,
                    ease: "easeOut"
                  }}
                  style={{
                    backgroundColor: ['#FF00E6', '#B400FF', '#00FFFF', '#FFD700'][i % 4],
                  }}
                />
              ))}
            </div>
          )}

          <h1 className="results-title-mobile" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            {titleText.split('').map((letter, index) => {
              const isFlickering = flickerLetter === index;
              const flickerStyle = isFlickering && flickerColor ? {
                textShadow: `
                  0 0 3px rgba(255, 255, 255, 1),
                  0 0 8px rgba(255, 255, 255, 0.9),
                  0 0 12px ${flickerColor.replace('COLOR_OPACITY', '0.9')},
                  0 0 20px ${flickerColor.replace('COLOR_OPACITY', '0.7')},
                  0 0 30px ${flickerColor.replace('COLOR_OPACITY', '0.5')},
                  0 0 45px ${flickerColor.replace('COLOR_OPACITY', '0.4')}
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
        </motion.div>

        {/* Player Card */}
        <motion.div
          className="player-result-card"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4, type: "spring", bounce: 0.3 }}
          style={{
            '--card-glow-1': getRankColor(),
            '--card-glow-2': getRankColor(),
            '--card-shadow': `${getRankColor()}40`,
            '--card-shadow-bright': `${getRankColor()}60`,
            '--card-inner-glow': `${getRankColor()}30`,
          } as React.CSSProperties}
        >
          {/* Floating sparks */}
          {isWinner && (
            <div className="floating-sparks">
              {Array.from({ length: rank === 1 ? 5 : 3 }).map((_, i) => (
                <div 
                  key={`spark-${i}`} 
                  className={`spark ${rank === 1 ? 'spark-gold' : ''}`}
                  style={{ animationDelay: `${i * 0.6}s` }} 
                />
              ))}
            </div>
          )}
          
          {/* Rank Icon Badge */}
          {isWinner && (
            <div className="rank-icon-badge" style={{ color: getRankColor(), transform: 'scale(0.85)' }}>
              {getRankIcon()}
            </div>
          )}

          <div className="avatar-wrapper">
            <PlayerAvatar name={playerName} size="large" className="player-avatar" />
          </div>
          
          <h2 className="player-name" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            {playerName}
          </h2>
          
          <div className="rank-badge" style={{ borderColor: getRankColor(), color: getRankColor() }}>
            <span style={{ fontFamily: 'Orbitron, sans-serif' }}>
              RANK #{rank} / {totalPlayers}
            </span>
          </div>

          {/* Stats Row */}
          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-label" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                SCORE
              </div>
              <div className="stat-value" style={{ fontFamily: 'Orbitron, sans-serif', color: getRankColor() }}>
                {score}
              </div>
            </div>
            
            <div className="stat-divider" />
            
            <div className="stat-item">
              <div className="stat-label" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                PARLAYS
              </div>
              <div className="stat-value" style={{ fontFamily: 'Orbitron, sans-serif', color: getRankColor() }}>
                {correctParlays}/{totalParlays}
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="result-message" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            {rank === 1 
              ? '🎉 LEGENDARY! You dominated!' 
              : rank <= 3 
              ? '✨ Great job! Podium finish!' 
              : '💪 Keep practicing!'}
          </div>
        </motion.div>

        {/* Return to Lobby Button - Outside Card */}
        <motion.div
          className="mt-6 w-full flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <button
            className="return-to-lobby-button-mobile"
            onClick={onReturnToLobby}
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            <Home className="w-6 h-6" />
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
          width: 400px;
          height: 400px;
          top: 10%;
          left: 5%;
          background: radial-gradient(circle, rgba(255, 0, 230, 0.6), transparent);
          animation-duration: 42s;
        }

        .blob-2 {
          width: 450px;
          height: 450px;
          top: 50%;
          left: 60%;
          background: radial-gradient(circle, rgba(180, 0, 255, 0.6), transparent);
          animation-duration: 48s;
          animation-delay: 3s;
        }

        .blob-3 {
          width: 350px;
          height: 350px;
          top: 70%;
          left: 10%;
          background: radial-gradient(circle, rgba(0, 255, 255, 0.5), transparent);
          animation-duration: 45s;
          animation-delay: 6s;
        }

        .blob-4 {
          width: 400px;
          height: 400px;
          top: 30%;
          left: 70%;
          background: radial-gradient(circle, rgba(255, 215, 0, 0.4), transparent);
          animation-duration: 50s;
          animation-delay: 9s;
        }

        @keyframes lava-blob-move-slow {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(-30px, 50px) scale(1.15);
          }
          50% {
            transform: translate(40px, -40px) scale(0.95);
          }
          75% {
            transform: translate(-50px, -25px) scale(1.1);
          }
        }

        /* ===== TITLE ===== */
        
        .results-title-mobile {
          font-size: 3rem;
          font-weight: 900;
          background: linear-gradient(180deg, #FFED4E 0%, #FFD700 50%, #FFA500 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 
            0 0 40px rgba(255, 215, 0, 0.8),
            0 0 80px rgba(255, 215, 0, 0.5);
          position: relative;
          letter-spacing: 0.08em;
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
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

        @keyframes rainbow-flow {
          0% {
            text-shadow: 
              0 0 3px rgba(255, 255, 255, 1),
              0 0 8px rgba(255, 255, 255, 0.9),
              0 0 12px rgba(255, 0, 102, 0.9),
              0 0 20px rgba(255, 0, 102, 0.7);
            filter: 
              drop-shadow(0 0 15px rgba(255, 0, 102, 0.8))
              drop-shadow(0 0 30px rgba(255, 0, 102, 0.5));
          }
          16.66% {
            text-shadow: 
              0 0 3px rgba(255, 255, 255, 1),
              0 0 8px rgba(255, 255, 255, 0.9),
              0 0 12px rgba(153, 51, 255, 0.9),
              0 0 20px rgba(153, 51, 255, 0.7);
            filter: 
              drop-shadow(0 0 15px rgba(153, 51, 255, 0.8))
              drop-shadow(0 0 30px rgba(153, 51, 255, 0.5));
          }
          33.33% {
            text-shadow: 
              0 0 3px rgba(255, 255, 255, 1),
              0 0 8px rgba(255, 255, 255, 0.9),
              0 0 12px rgba(0, 102, 255, 0.9),
              0 0 20px rgba(0, 102, 255, 0.7);
            filter: 
              drop-shadow(0 0 15px rgba(0, 102, 255, 0.8))
              drop-shadow(0 0 30px rgba(0, 102, 255, 0.5));
          }
          50% {
            text-shadow: 
              0 0 3px rgba(255, 255, 255, 1),
              0 0 8px rgba(255, 255, 255, 0.9),
              0 0 12px rgba(0, 204, 255, 0.9),
              0 0 20px rgba(0, 204, 255, 0.7);
            filter: 
              drop-shadow(0 0 15px rgba(0, 204, 255, 0.8))
              drop-shadow(0 0 30px rgba(0, 204, 255, 0.5));
          }
          66.66% {
            text-shadow: 
              0 0 3px rgba(255, 255, 255, 1),
              0 0 8px rgba(255, 255, 255, 0.9),
              0 0 12px rgba(0, 255, 136, 0.9),
              0 0 20px rgba(0, 255, 136, 0.7);
            filter: 
              drop-shadow(0 0 15px rgba(0, 255, 136, 0.8))
              drop-shadow(0 0 30px rgba(0, 255, 136, 0.5));
          }
          83.33% {
            text-shadow: 
              0 0 3px rgba(255, 255, 255, 1),
              0 0 8px rgba(255, 255, 255, 0.9),
              0 0 12px rgba(255, 0, 153, 0.9),
              0 0 20px rgba(255, 0, 153, 0.7);
            filter: 
              drop-shadow(0 0 15px rgba(255, 0, 153, 0.8))
              drop-shadow(0 0 30px rgba(255, 0, 153, 0.5));
          }
          100% {
            text-shadow: 
              0 0 3px rgba(255, 255, 255, 1),
              0 0 8px rgba(255, 255, 255, 0.9),
              0 0 12px rgba(255, 0, 102, 0.9),
              0 0 20px rgba(255, 0, 102, 0.7);
            filter: 
              drop-shadow(0 0 15px rgba(255, 0, 102, 0.8))
              drop-shadow(0 0 30px rgba(255, 0, 102, 0.5));
          }
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
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        /* ===== PLAYER CARD ===== */
        
        .player-result-card {
          background: rgba(10, 10, 10, 0.7);
          backdrop-filter: blur(30px);
          border-radius: 24px;
          padding: 2rem 1.5rem;
          text-align: center;
          position: relative;
          width: 100%;
          max-width: 380px;
          transition: all 0.3s ease;
          animation: card-breathe 4s ease-in-out infinite;
          overflow: visible;
        }

        .player-result-card::before {
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

        .player-result-card::after {
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

        /* Floating Sparks */
        .floating-sparks {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: visible;
        }

        .spark {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #FFFFFF;
          box-shadow: 0 0 10px #FFFFFF;
          animation: spark-float 3s ease-in-out infinite;
          opacity: 0;
        }

        .spark:nth-child(1) { top: 20%; left: 10%; animation-delay: 0s; }
        .spark:nth-child(2) { top: 30%; right: 15%; animation-delay: 0.6s; }
        .spark:nth-child(3) { bottom: 40%; left: 15%; animation-delay: 1.2s; }
        .spark:nth-child(4) { top: 60%; right: 10%; animation-delay: 1.8s; }
        .spark:nth-child(5) { bottom: 25%; left: 50%; animation-delay: 2.4s; }

        .spark-gold {
          background: #FFD700;
          box-shadow: 0 0 15px #FFD700;
        }

        @keyframes spark-float {
          0%, 100% {
            transform: translateY(0) scale(0);
            opacity: 0;
          }
          50% {
            transform: translateY(-15px) scale(1);
            opacity: 1;
          }
        }

        /* Rank Icon Badge */
        .rank-icon-badge {
          position: absolute;
          top: -20px;
          right: -10px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(10, 10, 10, 0.9);
          border: 3px solid currentColor;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px currentColor;
          z-index: 10;
        }

        /* Avatar */
        .avatar-wrapper {
          margin: 0 auto 1.5rem;
          position: relative;
        }

        .player-avatar {
          transform: scale(1);
          transition: transform 0.3s ease;
        }

        /* Player Name */
        .player-name {
          font-size: 1.75rem;
          font-weight: 700;
          color: white;
          margin-bottom: 1rem;
          letter-spacing: 0.05em;
        }

        /* Rank Badge */
        .rank-badge {
          display: inline-block;
          padding: 0.5rem 1.25rem;
          border: 2px solid;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          margin-bottom: 1.5rem;
          background: rgba(0, 0, 0, 0.3);
        }

        /* Stats Row */
        .stats-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          margin-bottom: 1.5rem;
          padding: 1.25rem 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .stat-item {
          flex: 1;
          text-align: center;
        }

        .stat-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.5);
          letter-spacing: 0.1em;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 900;
          letter-spacing: 0.05em;
        }

        .stat-divider {
          width: 1px;
          height: 50px;
          background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.2), transparent);
        }

        /* Result Message */
        .result-message {
          font-size: 0.9rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.8);
          letter-spacing: 0.02em;
          line-height: 1.5;
        }

        /* Return to Lobby Button - Outside Card */
        .return-to-lobby-button-mobile {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1rem 2rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 16px;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.9);
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          width: 100%;
          max-width: 280px;
        }

        .return-to-lobby-button-mobile:hover {
          transform: scale(1.05);
          border-color: rgba(255, 255, 255, 0.5);
          color: rgba(255, 255, 255, 1);
          box-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
        }

        .return-to-lobby-button-mobile:active {
          transform: scale(0.98);
        }

        /* Responsive */
        @media (max-width: 480px) {
          .results-title-mobile {
            font-size: 2.25rem;
          }

          .player-result-card {
            padding: 1.75rem 1.25rem;
          }

          .player-name {
            font-size: 1.5rem;
          }

          .stat-value {
            font-size: 1.75rem;
          }

          .stats-row {
            gap: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}

function getRankSuffix(rank: number): string {
  if (rank === 1) return 'ST';
  if (rank === 2) return 'ND';
  if (rank === 3) return 'RD';
  return 'TH';
}