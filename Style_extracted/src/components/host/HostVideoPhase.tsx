import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause } from 'lucide-react';
import { PlayerAvatar } from '../shared/PlayerAvatar';

interface Parlay {
  id: string;
  playerName: string;
  prediction: string;
  completed?: boolean;
}

interface Player {
  id: string;
  name: string;
  score: number;
}

interface EventLog {
  id: string;
  timestamp: string;
  parlay: string;
  player: string;
  verified: boolean;
}

interface HostVideoPhaseProps {
  parlays: Parlay[];
  players: Player[];
  videoUrl: string;
  onSkip: () => void;
}

export default function HostVideoPhase({ parlays, players, videoUrl, onSkip }: HostVideoPhaseProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const shouldCenterPlayers = players.length <= 4;

  return (
    <div className="min-h-screen bg-[#000000] relative overflow-hidden">
      {/* Import Orbitron font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B14] via-transparent to-transparent opacity-60" />

      {/* Floating particles */}
      <div className="particles-container">
        <div className="particle particle-magenta" style={{ top: '10%', left: '15%', animationDelay: '0s' }} />
        <div className="particle particle-cyan" style={{ top: '60%', left: '80%', animationDelay: '2s' }} />
        <div className="particle particle-violet" style={{ top: '30%', left: '70%', animationDelay: '4s' }} />
        <div className="particle particle-mint" style={{ top: '80%', left: '20%', animationDelay: '3s' }} />
        <div className="particle particle-magenta" style={{ top: '50%', left: '5%', animationDelay: '1s' }} />
        <div className="particle particle-cyan" style={{ top: '20%', left: '90%', animationDelay: '5s' }} />
        <div className="particle particle-violet" style={{ top: '15%', left: '45%', animationDelay: '1.5s' }} />
        <div className="particle particle-mint" style={{ top: '70%', left: '60%', animationDelay: '3.5s' }} />
        <div className="particle particle-magenta" style={{ top: '40%', left: '25%', animationDelay: '2.5s' }} />
        <div className="particle particle-cyan" style={{ top: '85%', left: '75%', animationDelay: '4.5s' }} />
        <div className="particle particle-violet" style={{ top: '5%', left: '55%', animationDelay: '0.5s' }} />
        <div className="particle particle-mint" style={{ top: '65%', left: '10%', animationDelay: '6s' }} />
        <div className="particle particle-magenta" style={{ top: '25%', left: '85%', animationDelay: '1.2s' }} />
        <div className="particle particle-cyan" style={{ top: '55%', left: '40%', animationDelay: '3.8s' }} />
        <div className="particle particle-violet" style={{ top: '90%', left: '50%', animationDelay: '2.2s' }} />
        <div className="particle particle-mint" style={{ top: '35%', left: '95%', animationDelay: '5.5s' }} />
        <div className="particle particle-magenta" style={{ top: '75%', left: '35%', animationDelay: '0.8s' }} />
        <div className="particle particle-cyan" style={{ top: '12%', left: '65%', animationDelay: '4.2s' }} />
        <div className="particle particle-violet" style={{ top: '45%', left: '15%', animationDelay: '1.8s' }} />
        <div className="particle particle-mint" style={{ top: '22%', left: '30%', animationDelay: '6.5s' }} />
        <div className="particle particle-magenta" style={{ top: '68%', left: '88%', animationDelay: '2.8s' }} />
        <div className="particle particle-cyan" style={{ top: '38%', left: '50%', animationDelay: '5.2s' }} />
        <div className="particle particle-violet" style={{ top: '82%', left: '42%', animationDelay: '3.2s' }} />
        <div className="particle particle-mint" style={{ top: '28%', left: '8%', animationDelay: '0.3s' }} />
        <div className="particle particle-magenta" style={{ top: '58%', left: '92%', animationDelay: '4.8s' }} />
        <div className="particle particle-cyan" style={{ top: '8%', left: '38%', animationDelay: '1.4s' }} />
        <div className="particle particle-violet" style={{ top: '95%', left: '68%', animationDelay: '6.2s' }} />
        <div className="particle particle-mint" style={{ top: '48%', left: '78%', animationDelay: '2.6s' }} />
        <div className="particle particle-magenta" style={{ top: '18%', left: '22%', animationDelay: '5.8s' }} />
        <div className="particle particle-cyan" style={{ top: '72%', left: '52%', animationDelay: '3.4s' }} />
        <div className="particle particle-violet" style={{ top: '42%', left: '12%', animationDelay: '0.6s' }} />
        <div className="particle particle-mint" style={{ top: '88%', left: '82%', animationDelay: '4.4s' }} />
        <div className="particle particle-magenta" style={{ top: '32%', left: '48%', animationDelay: '1.6s' }} />
        <div className="particle particle-cyan" style={{ top: '62%', left: '28%', animationDelay: '6.8s' }} />
        <div className="particle particle-violet" style={{ top: '52%', left: '62%', animationDelay: '2.4s' }} />
        <div className="particle particle-mint" style={{ top: '2%', left: '72%', animationDelay: '5.4s' }} />
      </div>

      {/* Main container */}
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-[1800px] grid grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN - Active Parlays */}
          <motion.div
            className="col-span-2"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="section-title" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              PARLAYS
            </h2>
            
            <div className="parlay-list">
              <AnimatePresence mode="popLayout">
                {parlays.map((parlay, index) => (
                  <motion.div
                    key={parlay.id}
                    className={`parlay-card ${parlay.completed ? 'parlay-completed' : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: index * 0.08,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                  >
                    <div className="parlay-header">
                      <PlayerAvatar name={parlay.playerName} size="small" />
                      <span className="parlay-name" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                        {parlay.playerName}
                      </span>
                    </div>
                    <p className="parlay-text" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                      {parlay.prediction}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* CENTER COLUMN - Video Player */}
          <motion.div
            className="col-span-8 flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Video Player */}
            <div className="video-player">
              <div className="video-placeholder">
                <Play className="w-24 h-24 text-white/20" />
                <p className="text-white/30 mt-4 text-sm" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  {videoUrl}
                </p>
              </div>
            </div>

            {/* Video Controls */}
            <div className="video-controls-bar">
              <button
                className={`play-button ${isPlaying ? 'play-button-playing' : 'play-button-paused'}`}
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              
              <div className="flex-1 px-6">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '35%' }} />
                </div>
              </div>
              
              <button 
                className="skip-button"
                onClick={onSkip}
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                SKIP VIDEO
              </button>
            </div>
          </motion.div>

          {/* RIGHT COLUMN - Live Scoreboard */}
          <motion.div
            className="col-span-2"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="section-title" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              SCOREBOARD
            </h2>
            
            <motion.div 
              className={`player-list ${shouldCenterPlayers ? 'player-list-centered' : ''}`}
              layout
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <AnimatePresence mode="popLayout">
                {sortedPlayers.map((player, index) => {
                  const getMedal = () => {
                    if (player.score === 0) return null;
                    if (index === 0) return '🥇';
                    if (index === 1) return '🥈';
                    if (index === 2) return '🥉';
                    return null;
                  };
                  
                  return (
                    <motion.div
                      key={player.id}
                      className="player-row"
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ 
                        duration: 0.4, 
                        delay: index * 0.08,
                        ease: [0.22, 1, 0.36, 1]
                      }}
                    >
                      <div className="player-rank" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                        #{index + 1}
                      </div>
                      
                      <div className="player-info">
                        <PlayerAvatar name={player.name} size="small" />
                        <span className="player-name" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                          {player.name}
                        </span>
                        {getMedal() && (
                          <span className="player-medal">{getMedal()}</span>
                        )}
                      </div>
                      
                      <div className="player-score" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                        {player.score}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </motion.div>

        </div>
      </div>

      <style>{`
        /* Floating Particles */
        .particles-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          filter: blur(2px);
          opacity: 0.55;
          animation: float 8s cubic-bezier(0.65, 0, 0.35, 1) infinite;
          will-change: transform, opacity;
        }

        .particle-magenta {
          background: #FF2DB3;
          box-shadow: 0 0 12px #FF2DB3;
        }

        .particle-cyan {
          background: #3FD0FF;
          box-shadow: 0 0 12px #3FD0FF;
        }

        .particle-violet {
          background: #9B5CFF;
          box-shadow: 0 0 12px #9B5CFF;
        }

        .particle-mint {
          background: #59FFB5;
          box-shadow: 0 0 12px #59FFB5;
        }

        @keyframes float {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
          25% {
            transform: translate(30px, -40px) scale(1.2);
            opacity: 0.5;
          }
          50% {
            transform: translate(-20px, -80px) scale(0.9);
            opacity: 0.4;
          }
          75% {
            transform: translate(40px, -60px) scale(1.1);
            opacity: 0.6;
          }
          100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
        }

        /* Section Titles */
        .section-title {
          font-size: 0.875rem;
          letter-spacing: 0.2em;
          color: #FFFFFF;
          text-align: center;
          margin-bottom: 1.5rem;
          text-shadow: 0 0 15px rgba(63, 208, 255, 0.6);
          animation: titleGlow 4s ease-in-out infinite;
        }

        @keyframes titleGlow {
          0%, 100% {
            text-shadow: 0 0 15px rgba(63, 208, 255, 0.6);
          }
          50% {
            text-shadow: 0 0 20px rgba(255, 45, 179, 0.6);
          }
        }

        /* Video Player */
        .video-player {
          width: 100%;
          aspect-ratio: 16/9;
          background: #000000;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          border: 2px solid rgba(255, 255, 255, 0.8);
          box-shadow: 
            0 0 30px rgba(255, 255, 255, 0.3),
            0 0 60px rgba(255, 255, 255, 0.15),
            inset 0 0 40px rgba(255, 255, 255, 0.03);
        }

        .video-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        /* Video Controls */
        .video-controls-bar {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 1.5rem;
          width: 100%;
          padding: 1rem 1.5rem;
          background: rgba(11, 11, 20, 0.5);
          backdrop-filter: blur(20px);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .play-button {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(59, 255, 181, 0.1);
          border: 1px solid rgba(59, 255, 181, 0.4);
          color: #59FFB5;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 0 15px rgba(59, 255, 181, 0.2);
        }

        .play-button:hover {
          background: rgba(59, 255, 181, 0.15);
          border-color: rgba(59, 255, 181, 0.6);
          box-shadow: 0 0 25px rgba(59, 255, 181, 0.4);
        }

        .play-button-playing {
          background: rgba(255, 45, 45, 0.15);
          border-color: rgba(255, 45, 45, 0.6);
          color: #FF4D4D;
          box-shadow: 0 0 25px rgba(255, 45, 45, 0.4);
        }

        .play-button-playing:hover {
          background: rgba(255, 45, 45, 0.2);
          border-color: rgba(255, 45, 45, 0.7);
          box-shadow: 0 0 30px rgba(255, 45, 45, 0.5);
        }

        .play-button-paused {
          background: rgba(59, 255, 181, 0.15);
          border-color: rgba(59, 255, 181, 0.6);
          color: #59FFB5;
          box-shadow: 0 0 25px rgba(59, 255, 181, 0.4);
        }

        .play-button-paused:hover {
          background: rgba(59, 255, 181, 0.2);
          border-color: rgba(59, 255, 181, 0.7);
          box-shadow: 0 0 30px rgba(59, 255, 181, 0.5);
        }

        .progress-bar {
          height: 5px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
          position: relative;
        }

        .progress-fill {
          height: 100%;
          background: #FFFFFF;
          border-radius: 3px;
          transition: width 0.3s ease;
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.3);
        }

        .skip-button {
          padding: 0.625rem 1.25rem;
          background: rgba(255, 45, 45, 0.1);
          border: 1px solid rgba(255, 45, 45, 0.4);
          border-radius: 8px;
          color: #FF4D4D;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 0 15px rgba(255, 45, 45, 0.2);
        }

        .skip-button:hover {
          background: rgba(255, 45, 45, 0.15);
          border-color: rgba(255, 45, 45, 0.6);
          box-shadow: 0 0 25px rgba(255, 45, 45, 0.4);
        }

        /* Parlay List */
        .parlay-list {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
          max-height: 700px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(63, 208, 255, 0.3) transparent;
        }

        .parlay-list::-webkit-scrollbar {
          width: 4px;
        }

        .parlay-list::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #FF2DB3, #3FD0FF);
          border-radius: 2px;
        }

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

        .parlay-completed {
          opacity: 0.4;
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

        /* Player List */
        .player-list {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
          max-height: none;
          overflow-y: visible;
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 45, 179, 0.3) transparent;
        }

        .player-list-centered {
          justify-content: center;
        }

        .player-list::-webkit-scrollbar {
          width: 4px;
        }

        .player-list::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #FF2DB3, #3FD0FF);
          border-radius: 2px;
        }

        .player-row {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 0.75rem;
          background: rgba(11, 11, 20, 0.4);
          backdrop-filter: blur(15px);
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .player-row:hover {
          background: rgba(11, 11, 20, 0.5);
        }

        .player-rank {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
          text-align: left;
        }

        .player-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
          min-width: 0;
        }

        .player-name {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.9);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
          min-width: 0;
        }

        .player-score {
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.9);
          text-align: right;
          text-shadow: 0 0 10px rgba(59, 255, 181, 0.5);
          font-weight: 600;
        }

        .player-medal {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.9);
          margin-left: 0.25rem;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}