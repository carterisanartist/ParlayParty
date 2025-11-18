import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, Copy, Check, LogOut, HelpCircle, X } from "lucide-react";

interface Player {
  id: string;
  name: string;
  isReady: boolean;
}

interface PlayerLobbyProps {
  roomCode: string;
  playerName: string;
  players: Player[];
  onLeaveRoom?: () => void;
}

export default function PlayerLobby({
  roomCode,
  playerName,
  players,
  onLeaveRoom,
}: PlayerLobbyProps) {
  const [copied, setCopied] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [flickerLetter, setFlickerLetter] = useState<number | null>(null);
  const [flickerColor, setFlickerColor] = useState<string>("");

  // Flicker effect for LOBBY letters
  useState(() => {
    const scheduleFlicker = () => {
      const randomDelay = 3000 + Math.random() * 2000; // Flicker every 3-5 seconds
      setTimeout(() => {
        const randomLetter = Math.floor(Math.random() * 5); // 5 letters in "LOBBY"
        // Pick a random neon color from the palette
        const colors = [
          "rgba(255, 0, 102, COLOR_OPACITY)", // Pink
          "rgba(153, 51, 255, COLOR_OPACITY)", // Purple
          "rgba(0, 102, 255, COLOR_OPACITY)", // Blue
          "rgba(0, 204, 255, COLOR_OPACITY)", // Cyan
          "rgba(0, 255, 136, COLOR_OPACITY)", // Green
          "rgba(255, 0, 153, COLOR_OPACITY)", // Magenta
        ];
        const randomColor =
          colors[Math.floor(Math.random() * colors.length)];
        setFlickerLetter(randomLetter);
        setFlickerColor(randomColor);
        setTimeout(() => {
          setFlickerLetter(null);
          setFlickerColor("");
        }, 400);
        scheduleFlicker();
      }, randomDelay);
    };

    const initialTimer = setTimeout(scheduleFlicker, 8000);
    return () => clearTimeout(initialTimer);
  });

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center p-6"
      style={{ background: "#000000" }}
    >
      {/* Import Fonts */}
      <link
        rel="preconnect"
        href="https://fonts.googleapis.com"
      />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Rubik:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Radial gradient centered behind content */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 1200px 800px at 50% 20%, #0A001A 0%, #000000 60%)",
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

      {/* Main container - mobile optimized */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        
        {/* Header with LOBBY title */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 
            className="player-lobby-title mb-6"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            {"LOBBY".split("").map((letter, index) => {
              const isFlickering = flickerLetter === index;
              const flickerStyle = isFlickering && flickerColor
                ? {
                    textShadow: `
                      0 0 8px rgba(255, 255, 255, 1),
                      0 0 16px rgba(255, 255, 255, 0.9),
                      0 0 24px ${flickerColor.replace("COLOR_OPACITY", "0.9")},
                      0 0 32px ${flickerColor.replace("COLOR_OPACITY", "0.7")},
                      0 0 48px ${flickerColor.replace("COLOR_OPACITY", "0.5")},
                      0 0 64px ${flickerColor.replace("COLOR_OPACITY", "0.4")},
                      0 0 80px ${flickerColor.replace("COLOR_OPACITY", "0.3")},
                      0 0 100px ${flickerColor.replace("COLOR_OPACITY", "0.2")}
                    `,
                    filter: `
                      drop-shadow(0 0 15px ${flickerColor.replace("COLOR_OPACITY", "0.8")})
                      drop-shadow(0 0 30px ${flickerColor.replace("COLOR_OPACITY", "0.5")})
                    `,
                    animation: "none",
                  }
                : {};

              return (
                <span
                  key={index}
                  className="player-lobby-letter"
                  style={flickerStyle}
                >
                  {letter}
                </span>
              );
            })}
          </h1>

          {/* Room Code Pill */}
          <motion.div
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full player-room-code-pill"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <p className="text-xs text-white uppercase tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Room Code:
            </p>
            <p className="text-2xl text-white tracking-[0.2em]" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              {roomCode}
            </p>
            
            <button
              onClick={copyRoomCode}
              className="parlay-icon-button-small"
              aria-label="Copy room code"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </motion.div>
        </motion.div>

        {/* Player List Panel - EXACT SAME STYLING AS HOST LOBBY */}
        <motion.div
          className="w-full parlay-panel mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Users
              className="w-5 h-5 text-[#00FFFF]"
              style={{
                filter: "drop-shadow(0 0 8px rgba(0, 255, 255, 0.8))",
              }}
            />
            <h2
              className="text-lg tracking-[0.15em] text-white"
              style={{ fontFamily: "Orbitron, sans-serif" }}
            >
              PLAYERS
            </h2>
            <span className="parlay-badge">
              {players.length}
            </span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto parlay-scrollbar">
            {players.map((player, index) => (
              <motion.div
                key={player.id}
                className="parlay-player-item"
                initial={{
                  opacity: 0,
                  x: -30,
                  scale: 0.9,
                }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{
                  duration: 0.4,
                  delay: 0.6 + index * 0.08,
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                }}
              >
                <div className="parlay-avatar">
                  <Users className="w-6 h-6 text-white/40" />
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm truncate text-white"
                    style={{
                      fontFamily: "Rubik, sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    {player.name}
                    {player.name === playerName && (
                      <span className="text-xs text-[#00FFFF] ml-2">(You)</span>
                    )}
                  </p>
                  <p
                    className="text-xs text-white"
                    style={{
                      fontFamily: "Rubik, sans-serif",
                    }}
                  >
                    {index === 0 ? "Host" : "Player"}
                  </p>
                </div>

                <motion.div
                  className="parlay-status-dot"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.7, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Waiting message with pulsing glow */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.p
            className="text-sm text-[#00FFFF]"
            style={{ fontFamily: 'Rubik, sans-serif' }}
            animate={{
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Waiting for host to start the game...
          </motion.p>
        </motion.div>

        {/* Buttons Container */}
        <div className="w-full space-y-3">
          {/* Leave Room Button */}
          <motion.button
            onClick={onLeaveRoom}
            className="player-leave-button w-full"
            style={{ fontFamily: 'Orbitron, sans-serif', textAlign: 'center' }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            LEAVE ROOM
          </motion.button>

          {/* How to Play Button */}
          <motion.button
            onClick={() => setShowHowToPlay(!showHowToPlay)}
            className="player-howtoplay-button w-full"
            style={{ fontFamily: 'Orbitron, sans-serif', textAlign: 'center' }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            HOW TO PLAY
          </motion.button>
        </div>
      </div>

      {/* How to Play Modal */}
      <AnimatePresence>
        {showHowToPlay && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHowToPlay(false)}
            />

            {/* Modal */}
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="howtoplay-modal w-full max-w-lg max-h-[80vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    HOW TO PLAY
                  </h2>
                  <button
                    onClick={() => setShowHowToPlay(false)}
                    className="howtoplay-close-button"
                    aria-label="Close"
                  >
                  </button>
                </div>

                {/* Content */}
                <div className="space-y-6 text-white" style={{ fontFamily: 'Rubik, sans-serif' }}>
                  {/* Game Overview */}
                  <div>
                    <h3 className="text-lg mb-2 text-[#00FFFF]" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                      🎯 GAME OVERVIEW
                    </h3>
                    <p className="text-sm text-white/80 leading-relaxed">
                      Parlay Party is a social prediction game where players watch videos together and make bets (parlays) 
                      on events that will happen. Call out your predictions in real-time and earn points for being right!
                    </p>
                  </div>

                  {/* How to Play */}
                  <div>
                    <h3 className="text-lg mb-2 text-[#00FFFF]" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                      📝 HOW TO PLAY
                    </h3>
                    <ol className="text-sm text-white/80 leading-relaxed space-y-2 list-decimal list-inside">
                      <li><strong>Join the room</strong> - Enter the room code shown by the host</li>
                      <li><strong>Submit your parlay</strong> - Predict an event that will happen in the video</li>
                      <li><strong>Watch together</strong> - View the video with everyone in the room</li>
                      <li><strong>Call your parlay</strong> - When your prediction happens, call it out!</li>
                      <li><strong>Earn points</strong> - Get points for correct predictions</li>
                      <li><strong>Win or face punishment</strong> - Lowest score may face a fun punishment</li>
                    </ol>
                  </div>

                  {/* Rules */}
                  <div>
                    <h3 className="text-lg mb-2 text-[#00FFFF]" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                      ⚖️ RULES
                    </h3>
                    <ul className="text-sm text-white/80 leading-relaxed space-y-2 list-disc list-inside">
                      <li>Each player submits ONE parlay per video</li>
                      <li>Parlays must be specific and observable events</li>
                      <li>You can only call your own parlay</li>
                      <li>The host verifies if called parlays are correct</li>
                      <li>Points are awarded for successful parlays</li>
                      <li>Have fun and keep it respectful!</li>
                    </ul>
                  </div>

                  {/* Tips */}
                  <div>
                    <h3 className="text-lg mb-2 text-[#00FFFF]" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                      💡 TIPS
                    </h3>
                    <ul className="text-sm text-white/80 leading-relaxed space-y-2 list-disc list-inside">
                      <li>Make predictions that are likely but not too obvious</li>
                      <li>Be ready to call your parlay quickly when it happens</li>
                      <li>Watch the entire video carefully for your prediction</li>
                      <li>Get creative with your predictions to stand out!</li>
                    </ul>
                  </div>
                </div>

                {/* Close Button */}
                <motion.button
                  onClick={() => setShowHowToPlay(false)}
                  className="howtoplay-got-it-button w-full mt-8"
                  style={{ fontFamily: 'Orbitron, sans-serif' }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  GOT IT!
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        /* ==========================================
           PLAYER LOBBY - MATCHING HOST LOBBY STYLE
           ========================================== */

        /* LOBBY Title - white-cyan glow like Host Lobby */
        .player-lobby-title {
          font-size: 56px;
          font-weight: 800;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #ffffff;
          text-shadow: 
            0 0 8px rgba(255, 255, 255, 0.9),
            0 0 16px rgba(0, 255, 255, 0.6),
            0 0 24px rgba(0, 255, 255, 0.4),
            0 0 32px rgba(0, 255, 255, 0.3);
          animation: player-title-glow 3s ease-in-out infinite;
        }

        @keyframes player-title-glow {
          0%, 100% {
            text-shadow: 
              0 0 8px rgba(255, 255, 255, 0.9),
              0 0 16px rgba(0, 255, 255, 0.6),
              0 0 24px rgba(0, 255, 255, 0.4),
              0 0 32px rgba(0, 255, 255, 0.3);
          }
          50% {
            text-shadow: 
              0 0 12px rgba(255, 255, 255, 1),
              0 0 24px rgba(0, 255, 255, 0.8),
              0 0 36px rgba(0, 255, 255, 0.6),
              0 0 48px rgba(0, 255, 255, 0.4);
          }
        }

        /* Room Code Pill - white border glow */
        .player-room-code-pill {
          background: rgba(8, 8, 8, 0.4);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 
            0 0 20px rgba(255, 255, 255, 0.1),
            0 0 30px rgba(0, 255, 255, 0.15),
            inset 0 0 20px rgba(255, 255, 255, 0.02);
          transition: all 0.3s ease;
        }

        .player-room-code-pill:hover {
          border-color: rgba(255, 255, 255, 0.3);
          box-shadow: 
            0 0 25px rgba(255, 255, 255, 0.15),
            0 0 40px rgba(0, 255, 255, 0.2),
            inset 0 0 25px rgba(255, 255, 255, 0.03);
        }

        /* Small icon button */
        .parlay-icon-button-small {
          width: 28px;
          height: 28px;
          border-radius: 12px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #e6e6f0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease-in-out;
        }

        .parlay-icon-button-small:hover {
          border-color: rgba(255, 255, 255, 0.6);
          color: #FFFFFF;
          box-shadow: 
            0 0 12px rgba(255, 255, 255, 0.4),
            0 0 24px rgba(0, 255, 255, 0.3);
        }

        /* Main Panel - EXACT SAME AS HOST LOBBY */
        .parlay-panel {
          position: relative;
          padding: 28px 24px;
          background: rgba(8, 8, 8, 0.5);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          transition: all 0.3s ease;
        }

        .parlay-panel:hover {
          background: rgba(8, 8, 8, 0.6);
        }

        /* Badge - EXACT SAME AS HOST LOBBY */
        .parlay-badge {
          padding: 4px 12px;
          background: rgba(0, 255, 255, 0.15);
          border: 1px solid rgba(0, 255, 255, 0.3);
          border-radius: 14px;
          font-size: 13px;
          font-family: 'Orbitron', sans-serif;
          color: #00FFFF;
          text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
        }

        /* Player Item - EXACT SAME AS HOST LOBBY */
        .parlay-player-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 14px;
          transition: all 0.3s ease;
        }

        .parlay-player-item:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.1);
          box-shadow: 
            0 4px 20px rgba(0, 255, 255, 0.1),
            inset 0 0 15px rgba(255, 255, 255, 0.02);
        }

        /* Avatar - EXACT SAME AS HOST LOBBY */
        .parlay-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(63, 208, 255, 0.2), rgba(155, 92, 255, 0.2));
          border: 1px solid rgba(255, 255, 255, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Orbitron', sans-serif;
          font-size: 18px;
          color: white;
          box-shadow: 
            0 0 15px rgba(0, 255, 255, 0.2),
            inset 0 0 15px rgba(255, 255, 255, 0.1);
          flex-shrink: 0;
        }

        /* Status Dot - EXACT SAME AS HOST LOBBY */
        .parlay-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00FF88;
          box-shadow: 
            0 0 12px rgba(0, 255, 136, 0.8),
            0 0 24px rgba(0, 255, 136, 0.4);
          flex-shrink: 0;
        }

        /* Leave Room Button - styled like Host Lobby buttons */
        .player-leave-button {
          padding: 14px 32px;
          background: rgba(8, 8, 8, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          border-radius: 16px;
          color: white;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          transition: all 0.3s ease;
          box-shadow: 
            0 0 20px rgba(255, 255, 255, 0.1),
            inset 0 0 15px rgba(255, 255, 255, 0.02);
        }

        .player-leave-button:hover:not(:disabled) {
          border-color: rgba(255, 255, 255, 0.5);
          box-shadow: 
            0 0 30px rgba(255, 255, 255, 0.2),
            0 0 45px rgba(0, 255, 255, 0.2),
            inset 0 0 20px rgba(255, 255, 255, 0.05);
          background: rgba(8, 8, 8, 0.7);
        }

        /* How to Play Button - subtle secondary style */
        .player-howtoplay-button {
          padding: 12px 24px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 14px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          transition: all 0.3s ease;
        }

        .player-howtoplay-button:hover:not(:disabled) {
          border-color: rgba(255, 255, 255, 0.3);
          color: rgba(255, 255, 255, 0.9);
          box-shadow: 
            0 0 15px rgba(255, 255, 255, 0.1),
            inset 0 0 10px rgba(255, 255, 255, 0.02);
        }

        /* Scrollbar - EXACT SAME AS HOST LOBBY */
        .parlay-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .parlay-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 3px;
        }

        .parlay-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 255, 0.3);
          border-radius: 3px;
        }

        .parlay-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 255, 255, 0.5);
        }

        /* Responsive adjustments */
        @media (max-width: 640px) {
          .player-lobby-title {
            font-size: 42px;
            letter-spacing: 0.12em;
          }
        }

        /* Letter animation styles - EXACT SAME AS HOST LOBBY */
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
          25% {
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
          50% {
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
          75% {
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

        .player-lobby-letter {
          display: inline-block;
          position: relative;
          color: #ffffff;
          animation: rainbow-flow 5s linear infinite, brightness-pulse 18s ease-in-out infinite;
          animation-delay: 0s, 3s;
          transition: all 0.3s ease-out;
        }

        /* How to Play Modal Styles */
        .howtoplay-modal {
          background: rgba(8, 8, 8, 0.8);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 24px;
          color: white;
          font-family: 'Rubik', sans-serif;
        }

        .howtoplay-close-button {
          background: transparent;
          border: none;
          color: #00FFFF;
          font-size: 16px;
          cursor: pointer;
          transition: color 0.3s ease;
        }

        .howtoplay-close-button:hover {
          color: #FF00FF;
        }

        .howtoplay-got-it-button {
          padding: 14px 32px;
          background: rgba(8, 8, 8, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          border-radius: 16px;
          color: white;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          transition: all 0.3s ease;
          box-shadow: 
            0 0 20px rgba(255, 255, 255, 0.1),
            inset 0 0 15px rgba(255, 255, 255, 0.02);
        }

        .howtoplay-got-it-button:hover:not(:disabled) {
          border-color: rgba(255, 255, 255, 0.5);
          box-shadow: 
            0 0 30px rgba(255, 255, 255, 0.2),
            0 0 45px rgba(0, 255, 255, 0.2),
            inset 0 0 20px rgba(255, 255, 255, 0.05);
          background: rgba(8, 8, 8, 0.7);
        }
      `}</style>
    </div>
  );
}