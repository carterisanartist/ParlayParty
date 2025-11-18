import { PlayerAvatar } from './PlayerAvatar';
import { motion } from 'motion/react';

interface ScoreboardRowProps {
  rank: number;
  playerName: string;
  score: number;
  isCurrentPlayer?: boolean;
}

export function ScoreboardRow({ rank, playerName, score, isCurrentPlayer = false }: ScoreboardRowProps) {
  const getRankColor = () => {
    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
    return 'rank-default';
  };

  return (
    <>
      <motion.div
        className={`scoreboard-row ${isCurrentPlayer ? 'scoreboard-row-current' : ''}`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: rank * 0.05 }}
      >
        <div className={`scoreboard-rank ${getRankColor()}`}>
          {rank}
        </div>
        <PlayerAvatar name={playerName} size="small" />
        <p className="scoreboard-name" style={{ fontFamily: 'Orbitron, sans-serif' }}>
          {playerName}
        </p>
        <p className="scoreboard-score" style={{ fontFamily: 'Orbitron, sans-serif', color: 'white', textShadow: 'none' }}>
          {score}
        </p>
      </motion.div>

      <style>{`
        .scoreboard-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.875rem 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .scoreboard-row:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(0, 255, 255, 0.2);
        }

        .scoreboard-row-current {
          background: rgba(255, 0, 230, 0.1);
          border-color: rgba(255, 0, 230, 0.3);
          box-shadow: 0 0 20px rgba(255, 0, 230, 0.2);
        }

        .scoreboard-rank {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Orbitron', sans-serif;
          font-size: 0.875rem;
          flex-shrink: 0;
        }

        .rank-gold {
          background: linear-gradient(135deg, #FFD700, #FFA500);
          color: #000;
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
          animation: rank-glow-gold 2s ease-in-out infinite;
        }

        .rank-silver {
          background: linear-gradient(135deg, #C0C0C0, #A8A8A8);
          color: #000;
          box-shadow: 0 0 15px rgba(192, 192, 192, 0.5);
        }

        .rank-bronze {
          background: linear-gradient(135deg, #CD7F32, #B8732C);
          color: #000;
          box-shadow: 0 0 15px rgba(205, 127, 50, 0.5);
        }

        .rank-default {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        @keyframes rank-glow-gold {
          0%, 100% {
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
          }
          50% {
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.8);
          }
        }

        .scoreboard-name {
          flex: 1;
          font-size: 1rem;
          color: white;
        }

        .scoreboard-score {
          font-size: 1.25rem;
          color: #00FFFF;
          text-shadow: 0 0 10px rgba(0, 255, 255, 0.6);
        }
      `}</style>
    </>
  );
}