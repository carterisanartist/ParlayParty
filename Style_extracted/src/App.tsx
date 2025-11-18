import { useState } from 'react';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { Instagram, Menu, X } from 'lucide-react';
import { MessageCircle } from 'lucide-react';

// Import all screens
import HostLobby from './components/HostLobby';
import PlayerLobby from './components/PlayerLobby';
import HostParlayEntry from './components/host/HostParlayEntry';
import HostParlayReveal from './components/host/HostParlayReveal';
import HostVideoPhase from './components/host/HostVideoPhase';
import HostResults from './components/host/HostResults';
import HostWheelPhase from './components/host/HostWheelPhase';
import PlayerParlayEntry from './components/mobile/PlayerParlayEntry';
import PlayerParlayLocked from './components/mobile/PlayerParlayLocked';
import PlayerReveal from './components/mobile/PlayerReveal';
import PlayerVideoPhase from './components/mobile/PlayerVideoPhase';
import PlayerParlayPickerModal from './components/mobile/PlayerParlayPickerModal';
import PlayerVerificationModal from './components/mobile/PlayerVerificationModal';
import PlayerWheelSubmit from './components/mobile/PlayerWheelSubmit';
import PlayerResults from './components/mobile/PlayerResults';

type Screen = 
  | 'home' 
  | 'host-lobby' 
  | 'player-lobby'
  | 'host-parlay-entry'
  | 'host-parlay-reveal'
  | 'host-video-phase'
  | 'host-results'
  | 'host-wheel-phase'
  | 'player-parlay-entry'
  | 'player-parlay-locked'
  | 'player-reveal'
  | 'player-video-phase'
  | 'player-wheel-submit'
  | 'player-results';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [clickedButton, setClickedButton] = useState<string | null>(null);
  const [flickerLetter, setFlickerLetter] = useState<number | null>(null);
  const [flickerColor, setFlickerColor] = useState<string>('');
  const [showDevMenu, setShowDevMenu] = useState(false);
  const [showModalDemo, setShowModalDemo] = useState(false);
  
  // Player state for parlay entry screen
  const [parlayPlayers, setParlayPlayers] = useState([
    { id: '1', name: 'Carter', locked: true },
    { id: '2', name: 'Trevor', locked: false },
    { id: '3', name: 'Alex', locked: true },
    { id: '4', name: 'Sam', locked: false },
  ]);

  // Handler to remove a player from parlay entry
  const handleRemovePlayer = (playerId: string) => {
    setParlayPlayers(prevPlayers => prevPlayers.filter(player => player.id !== playerId));
  };
  
  // Mock data
  const mockPlayers = [
    { id: '1', name: 'Carter', isReady: true },
    { id: '2', name: 'Trevor', isReady: false },
    { id: '3', name: 'Alex', isReady: true },
  ];

  const mockParlays = [
    { id: '1', playerName: 'Carter', prediction: 'Someone says "literally" within the first minute' },
    { id: '2', playerName: 'Trevor', prediction: 'Video has over 1M views' },
    { id: '3', playerName: 'Alex', prediction: 'Someone laughs uncontrollably' },
  ];

  const mockPlayersWithLocked = [
    { id: '1', name: 'Carter', locked: true },
    { id: '2', name: 'Trevor', locked: false },
    { id: '3', name: 'Alex', locked: true },
    { id: '4', name: 'Sam', locked: false },
  ];

  const mockScoreboard = [
    { id: '1', name: 'Carter', score: 250 },
    { id: '2', name: 'Trevor', score: 180 },
    { id: '3', name: 'Alex', score: 150 },
    { id: '4', name: 'Sam', score: 120 },
  ];

  const mockPunishments = [
    { id: '1', text: 'Take a shot', submittedBy: 'Carter' },
    { id: '2', text: 'Do 20 push-ups', submittedBy: 'Trevor' },
    { id: '3', text: 'Post an embarrassing photo', submittedBy: 'Alex' },
    { id: '4', text: 'Sing a song', submittedBy: 'Sam' },
  ];

  // Screen categories for the dev menu
  const screenCategories = [
    {
      name: 'Main Flow',
      screens: [
        { id: 'home' as Screen, label: '🏠 Home / Landing' },
        { id: 'host-lobby' as Screen, label: '🖥️ Host Lobby' },
        { id: 'player-lobby' as Screen, label: '📱 Player Lobby' },
      ]
    },
    {
      name: 'Host Screens (Desktop)',
      screens: [
        { id: 'host-parlay-entry' as Screen, label: '📝 Parlay Entry' },
        { id: 'host-parlay-reveal' as Screen, label: '🎭 Parlay Reveal' },
        { id: 'host-video-phase' as Screen, label: '▶️ Video Phase' },
        { id: 'host-results' as Screen, label: '🏆 Results' },
        { id: 'host-wheel-phase' as Screen, label: '🎡 Wheel Phase' },
      ]
    },
    {
      name: 'Player Screens (Mobile)',
      screens: [
        { id: 'player-parlay-entry' as Screen, label: '📝 Parlay Entry' },
        { id: 'player-parlay-locked' as Screen, label: '🔒 Parlay Locked' },
        { id: 'player-reveal' as Screen, label: '🎭 Reveal' },
        { id: 'player-video-phase' as Screen, label: '▶️ Video Phase' },
        { id: 'player-results' as Screen, label: '🏆 Results' },
        { id: 'player-wheel-submit' as Screen, label: '🎡 Wheel Submit' },
      ]
    }
  ];

  // Periodic random letter flicker every ~7 seconds
  useState(() => {
    const scheduleFlicker = () => {
      const randomDelay = 3000 + Math.random() * 2000; // Flicker every 3-5 seconds
      setTimeout(() => {
        const randomLetter = Math.floor(Math.random() * 11);
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

  const handleJoinClick = () => {
    setClickedButton('join');
    setTimeout(() => setClickedButton(null), 300);
    setShowJoinForm(!showJoinForm);
  };

  const handleCreateClick = () => {
    setClickedButton('create');
    setTimeout(() => setClickedButton(null), 300);
    setCurrentScreen('host-lobby');
  };

  const handleEnterClick = () => {
    if (roomCode.length !== 6 || playerName.trim().length === 0) return;
    setCurrentScreen('player-lobby');
  };

  // Render the selected screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'host-lobby':
        return (
          <motion.div
            key="host-lobby"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <HostLobby roomCode="ABCD" onStartGame={() => setCurrentScreen('host-parlay-entry')} />
          </motion.div>
        );
      
      case 'player-lobby':
        return (
          <motion.div
            key="player-lobby"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <PlayerLobby 
              roomCode={roomCode || "ABCD"} 
              playerName={playerName || "Player"} 
              players={mockPlayers} 
              onLeaveRoom={() => setCurrentScreen('home')}
            />
          </motion.div>
        );
      
      case 'host-parlay-entry':
        return <HostParlayEntry 
          players={parlayPlayers} 
          onForceStart={() => setCurrentScreen('host-parlay-reveal')} 
          onRemovePlayer={handleRemovePlayer}
        />;
      
      case 'host-parlay-reveal':
        return <HostParlayReveal parlays={mockParlays} onRevealComplete={() => setCurrentScreen('host-video-phase')} />;
      
      case 'host-video-phase':
        return <HostVideoPhase parlays={mockParlays} players={mockScoreboard} videoUrl="https://youtube.com/watch?v=example" onSkip={() => setCurrentScreen('host-results')} />;
      
      case 'host-results':
        return <HostResults players={mockScoreboard} onContinue={() => setCurrentScreen('host-wheel-phase')} onReturnToLobby={() => setCurrentScreen('home')} />;
      
      case 'host-wheel-phase':
        return <HostWheelPhase punishments={mockPunishments} onComplete={(p) => console.log('Selected:', p)} />;
      
      case 'player-parlay-entry':
        return <PlayerParlayEntry playerName="Carter" videoTitle="Epic Gaming Moments" onSubmit={(p) => setCurrentScreen('player-parlay-locked')} />;
      
      case 'player-parlay-locked':
        return <PlayerParlayLocked playerName="Carter" prediction="Someone says 'literally' within the first minute" />;
      
      case 'player-reveal':
        return <PlayerReveal currentPlayerName="Carter" currentPlayerParlay={mockParlays[0].prediction} allParlays={mockParlays} onRevealComplete={() => setCurrentScreen('player-video-phase')} />;
      
      case 'player-video-phase':
        return (
          <>
            <PlayerVideoPhase playerName="Carter" parlays={mockParlays} onCallEvent={() => setShowModalDemo(true)} />
            <PlayerParlayPickerModal isOpen={showModalDemo} parlays={mockParlays} onSelect={(id) => { setShowModalDemo(false); }} onClose={() => setShowModalDemo(false)} />
          </>
        );
      
      case 'player-wheel-submit':
        return <PlayerWheelSubmit playerName="Carter" onSubmit={(p) => console.log('Punishment:', p)} />;
      
      case 'player-results':
        return <PlayerResults playerName="Carter" score={250} rank={1} totalPlayers={4} correctParlays={3} totalParlays={3} onReturnToLobby={() => setCurrentScreen('home')} />;
      
      default:
        return renderHomeScreen();
    }
  };

  const renderHomeScreen = () => (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Import Orbitron font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Layered atmospheric background */}
      <div className="absolute inset-0 bg-black" />
      
      {/* Radial gradient centered behind title */}
      <div className="cyber-radial-gradient" />
      
      {/* Ambient light flares */}
      <div className="ambient-flare-left" />
      <div className="ambient-flare-right" />
      
      {/* Subtle noise texture overlay */}
      <div className="noise-overlay" />
      
      {/* Diagonal light sweep */}
      <motion.div 
        className="diagonal-sweep"
        initial={{ x: '-150%', y: '-150%' }}
        animate={{ x: '150%', y: '150%' }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatDelay: 12,
          ease: 'linear'
        }}
      />

      {/* Main container */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center justify-center">
        {/* Title with liquid rainbow outline */}
        <motion.div 
          className="text-center mb-6"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Premium Floating Neon Title */}
          <div className="relative flex justify-center items-center py-8">
            {/* Enhanced ambient halo behind logo */}
            <div className="logo-ambient-halo" />
            
            {/* Neon Text */}
            <h1 className="neon-tube-text" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              {'PARLAY PARTY'.split('').map((letter, index) => {
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
                  <motion.span
                    key={index}
                    className={`neon-letter ${isFlickering ? 'letter-flicker' : ''}`}
                    style={flickerStyle}
                    initial={{ opacity: 0, filter: 'brightness(0)' }}
                    animate={{ 
                      opacity: 1,
                      filter: 'brightness(1)'
                    }}
                    transition={{
                      duration: 0.1,
                      delay: 0.5 + (index * 0.08),
                      ease: 'easeOut'
                    }}
                  >
                    {letter === ' ' ? '\u00A0' : letter}
                  </motion.span>
                );
              })}
            </h1>
          </div>

          {/* Tagline */}
          <motion.p 
            className="text-base sm:text-lg text-white/75 tracking-wide px-4"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Bets. Shots. Chaos.
          </motion.p>
          {/* Watermark text */}
          <motion.p 
            className="text-xs text-white/50 mt-3 tracking-wide"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            by Carter & Trevor
          </motion.p>
        </motion.div>

        {/* Buttons section - no container box */}
        <motion.div
          className="w-full max-w-sm space-y-5 mt-10"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Join Game Button */}
          <motion.button
            onClick={handleJoinClick}
            className={`rainbow-hover-button w-full h-14 rounded-lg uppercase tracking-widest transition-all relative overflow-hidden group ${
              clickedButton === 'join' ? 'neon-flash' : ''
            }`}
            style={{ fontFamily: 'Orbitron, sans-serif' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10 block w-full text-center font-[Orbitron]">{showJoinForm ? 'Hide' : 'Join Game'}</span>
          </motion.button>

          {/* Join Form - Expandable */}
          <AnimatePresence>
            {showJoinForm && (
              <motion.div
                initial={{ height: 0, opacity: 0, y: -10 }}
                animate={{ height: 'auto', opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
              >
                <div className="pt-2 space-y-5">
                  {/* Room Code Input */}
                  <div className="space-y-2">
                    <label 
                      htmlFor="roomCode" 
                      className="block text-xs uppercase tracking-widest text-gray-400"
                      style={{ fontFamily: 'Orbitron, sans-serif' }}
                    >
                      Room Code
                    </label>
                    <Input
                      id="roomCode"
                      type="text"
                      placeholder="XXXXXX"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      className="bg-black/40 backdrop-blur-sm border border-gray-700/50 text-white placeholder:text-gray-600 h-12 text-center tracking-[0.4em] uppercase focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                      style={{ fontFamily: 'Orbitron, sans-serif' }}
                      maxLength={6}
                    />
                  </div>

                  {/* Player Name Input */}
                  <div className="space-y-2">
                    <label 
                      htmlFor="playerName" 
                      className="block text-xs uppercase tracking-widest text-gray-400"
                      style={{ fontFamily: 'Orbitron, sans-serif' }}
                    >
                      Player Name
                    </label>
                    <Input
                      id="playerName"
                      type="text"
                      placeholder="Enter your name"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      className="bg-black/40 backdrop-blur-sm border border-gray-700/50 text-white placeholder:text-gray-600 h-12 text-center focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                      style={{ fontFamily: 'Orbitron, sans-serif' }}
                      maxLength={20}
                    />
                  </div>

                  {/* Enter Button */}
                  <button
                    className="rainbow-hover-button w-full h-12 rounded-lg uppercase tracking-widest transition-all relative overflow-hidden group"
                    style={{ fontFamily: 'Orbitron, sans-serif' }}
                    disabled={roomCode.length !== 6 || playerName.trim().length === 0}
                    onClick={handleEnterClick}
                  >
                    <span className="relative z-10 block w-full text-center">Enter</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Create Room Button */}
          <motion.button
            onClick={handleCreateClick}
            className={`rainbow-hover-button w-full h-14 rounded-lg uppercase tracking-widest transition-all relative overflow-hidden group ${
              clickedButton === 'create' ? 'neon-flash' : ''
            }`}
            style={{ fontFamily: 'Orbitron, sans-serif' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10 block w-full text-center">Create Room</span>
          </motion.button>
        </motion.div>

        {/* Social buttons below the box */}
        <motion.div 
          className="flex justify-center items-center gap-10 mt-12 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
        >
          {/* Ambient glow behind icons */}
          <div className="social-ambient-glow" />
          
          {/* Instagram Icon */}
          <motion.a
            href="https://www.instagram.com/mutual.ly"
            target="_blank"
            rel="noopener noreferrer"
            className="social-neon-icon"
            aria-label="Follow us on Instagram"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              y: [0, -2, 0],
            }}
            transition={{
              y: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          >
            <div className="social-icon-ring" />
            <Instagram className="w-8 h-8 relative z-10" style={{ opacity: 0.9 }} />
          </motion.a>
          
          {/* Discord Icon */}
          <motion.a
            href="https://discord.gg/cU3FXvxM6c"
            target="_blank"
            rel="noopener noreferrer"
            className="social-neon-icon"
            aria-label="Join our Discord"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              y: [0, -2, 0],
            }}
            transition={{
              y: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }
            }}
          >
            <div className="social-icon-ring" />
            <svg className="w-8 h-8 relative z-10" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.9 }}>
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.074.074 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
          </motion.a>
        </motion.div>
      </div>

      {/* CSS for liquid rainbow effects */}
      <style>{`
        /* ========================================
           ATMOSPHERIC BACKGROUND LAYERS
           ======================================== */
        
        /* Radial gradient centered behind title */
        .cyber-radial-gradient {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse 1200px 800px at 50% 20%,
            #0A001A 0%,
            #000000 60%
          );
          z-index: 1;
        }

        /* Ambient light flare - Left (Magenta) */
        .ambient-flare-left {
          position: absolute;
          width: 800px;
          height: 800px;
          top: 20%;
          left: -10%;
          background: radial-gradient(
            circle,
            rgba(255, 0, 230, 0.25) 0%,
            rgba(255, 0, 230, 0.1) 30%,
            transparent 60%
          );
          filter: blur(100px);
          z-index: 2;
          pointer-events: none;
        }

        /* Ambient light flare - Right (Cyan) */
        .ambient-flare-right {
          position: absolute;
          width: 800px;
          height: 800px;
          top: 40%;
          right: -10%;
          background: radial-gradient(
            circle,
            rgba(0, 255, 255, 0.25) 0%,
            rgba(0, 255, 255, 0.1) 30%,
            transparent 60%
          );
          filter: blur(100px);
          z-index: 2;
          pointer-events: none;
        }

        /* Subtle noise texture overlay */
        .noise-overlay {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.02;
          z-index: 3;
          pointer-events: none;
        }

        /* Diagonal light sweep animation */
        .diagonal-sweep {
          position: absolute;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            135deg,
            transparent 40%,
            rgba(255, 255, 255, 0.05) 49%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0.05) 51%,
            transparent 60%
          );
          z-index: 4;
          pointer-events: none;
        }

        /* ========================================
           ENHANCED NEON LOGO ANIMATIONS
           ======================================== */

        .neon-tube-text {
          position: relative;
          z-index: 10;
          font-size: 48px;
          font-weight: 900;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #ffffff;
          display: flex;
          justify-content: center;
          padding: 0;
          margin: 0;
        }

        /* Enhanced neon letter with animated rainbow glow */
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

        /* Brightness pulse animation (every 15-20s) */
        @keyframes brightness-pulse {
          0%, 100% {
            filter: brightness(1);
          }
          50% {
            filter: brightness(1.3);
          }
        }

        .neon-letter {
          display: inline-block;
          position: relative;
          color: #ffffff;
          animation: rainbow-flow 5s linear infinite, brightness-pulse 18s ease-in-out infinite;
          animation-delay: 0s, 3s;
        }

        /* Responsive sizing */
        @media (max-width: 640px) {
          .neon-tube-text {
            font-size: 24px;
            letter-spacing: 0.15em;
          }
        }

        @media (min-width: 641px) and (max-width: 768px) {
          .neon-tube-text {
            font-size: 30px;
          }
        }

        /* Rainbow hover button styling */
        .rainbow-hover-button {
          background: linear-gradient(
            180deg,
            #191919 0%,
            #111111 100%
          );
          backdrop-filter: blur(10px);
          border: 1.5px solid rgba(255, 255, 255, 0.08);
          color: white;
          position: relative;
          box-shadow: 
            0 0 25px rgba(255, 0, 230, 0.15),
            0 0 25px rgba(0, 255, 255, 0.15);
          transition: all 0.3s ease-out;
          animation: button-pulse 2s ease-in-out infinite;
        }

        /* Subtle breathing pulse */
        @keyframes button-pulse {
          0%, 100% {
            box-shadow: 
              0 0 25px rgba(255, 0, 230, 0.15),
              0 0 25px rgba(0, 255, 255, 0.15);
            filter: brightness(0.9);
          }
          50% {
            box-shadow: 
              0 0 30px rgba(255, 0, 230, 0.2),
              0 0 30px rgba(0, 255, 255, 0.2);
            filter: brightness(1);
          }
        }

        /* Text inner glow */
        .rainbow-hover-button span {
          text-shadow: 0 0 2px rgba(255, 255, 255, 0.6);
        }

        .rainbow-hover-button::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 0.625rem;
          background: linear-gradient(
            135deg,
            #FF00E6 0%,
            #B400FF 50%,
            #00FFFF 100%
          );
          opacity: 0;
          transition: opacity 0.3s ease-out;
          z-index: -1;
          filter: blur(25px);
        }

        .rainbow-hover-button:hover::before {
          opacity: 0;
          filter: blur(45px);
          animation: none;
        }

        .rainbow-hover-button:hover {
          border-color: rgba(255, 255, 255, 0.25);
          box-shadow: 
            0 0 40px rgba(255, 0, 230, 0.3),
            0 0 60px rgba(0, 255, 255, 0.25),
            inset 0 0 0px rgba(0, 255, 255, 0);
          filter: brightness(1.15);
          transform: translateY(-2px);
          animation: none;
        }

        .rainbow-hover-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Logo ambient halo */
        .logo-ambient-halo {
          position: absolute;
          inset: -60px;
          background: radial-gradient(
            ellipse,
            rgba(255, 0, 230, 0.15) 0%,
            rgba(0, 255, 255, 0.1) 30%,
            transparent 70%
          );
          filter: blur(80px);
          z-index: -1;
          pointer-events: none;
        }

        /* Social neon icons */
        .social-neon-icon {
          position: relative;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.03);
          border: 1.5px solid rgba(255, 255, 255, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .social-icon-ring {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid transparent;
          background: linear-gradient(135deg, #FFFFFF, #FFFFFF, #FFFFFF) border-box;
          -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.3s ease;
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.6)) drop-shadow(0 0 15px rgba(255, 255, 255, 0.4));
        }

        .social-neon-icon:hover .social-icon-ring {
          opacity: 0.9;
        }

        .social-neon-icon:hover {
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 
            0 0 20px rgba(255, 255, 255, 0.4),
            0 0 40px rgba(255, 255, 255, 0.2),
            0 0 60px rgba(255, 255, 255, 0.1);
        }

        .social-ambient-glow {
          position: absolute;
          inset: -30px;
          background: radial-gradient(
            ellipse,
            rgba(0, 255, 255, 0.1) 0%,
            transparent 70%
          );
          filter: blur(40px);
          z-index: -1;
          pointer-events: none;
        }
      `}</style>
    </div>
  );

  return (
    <>
      {/* Developer Screen Selector Menu */}
      <div className="dev-menu-container">
        <button
          className="dev-menu-toggle"
          onClick={() => setShowDevMenu(!showDevMenu)}
          title="Screen Selector"
        >
          {showDevMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <AnimatePresence>
          {showDevMenu && (
            <motion.div
              className="dev-menu"
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <h2 className="dev-menu-title">Screen Selector</h2>
              <p className="dev-menu-subtitle">Select a screen to preview</p>
              
              <div className="dev-menu-content">
                {screenCategories.map((category) => (
                  <div key={category.name} className="dev-menu-category">
                    <h3 className="dev-category-title">{category.name}</h3>
                    <div className="dev-screen-list">
                      {category.screens.map((screen) => (
                        <button
                          key={screen.id}
                          className={`dev-screen-button ${currentScreen === screen.id ? 'dev-screen-active' : ''}`}
                          onClick={() => {
                            setCurrentScreen(screen.id);
                            setShowDevMenu(false);
                          }}
                        >
                          {screen.label}
                          {currentScreen === screen.id && <span className="dev-active-indicator">●</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Render current screen */}
      {renderScreen()}

      <style>{`
        .dev-menu-container {
          position: fixed;
          top: 20px;
          left: 20px;
          z-index: 9999;
          font-family: 'Orbitron', sans-serif;
        }

        .dev-menu-toggle {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          background: linear-gradient(135deg, #FF00E6, #B400FF);
          border: 2px solid rgba(255, 255, 255, 0.2);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 
            0 4px 20px rgba(255, 0, 230, 0.4),
            0 0 40px rgba(180, 0, 255, 0.3);
          transition: all 0.3s ease;
        }

        .dev-menu-toggle:hover {
          transform: scale(1.1);
          box-shadow: 
            0 6px 30px rgba(255, 0, 230, 0.6),
            0 0 60px rgba(180, 0, 255, 0.5);
        }

        .dev-menu {
          position: absolute;
          top: 0;
          left: 0;
          width: 380px;
          max-height: calc(100vh - 40px);
          background: rgba(10, 10, 10, 0.98);
          backdrop-filter: blur(20px);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          box-shadow: 
            0 8px 40px rgba(0, 0, 0, 0.8),
            0 0 60px rgba(255, 0, 230, 0.2);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .dev-menu-title {
          font-size: 1.25rem;
          color: white;
          padding: 1.5rem 1.5rem 0.5rem;
          margin: 0;
          text-shadow: 0 0 10px rgba(0, 255, 255, 0.6);
        }

        .dev-menu-subtitle {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
          padding: 0 1.5rem 1rem;
          margin: 0;
        }

        .dev-menu-content {
          flex: 1;
          overflow-y: auto;
          padding: 0 1rem 1rem;
        }

        .dev-menu-content::-webkit-scrollbar {
          width: 6px;
        }

        .dev-menu-content::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }

        .dev-menu-content::-webkit-scrollbar-thumb {
          background: rgba(255, 0, 230, 0.3);
          border-radius: 3px;
        }

        .dev-menu-content::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 0, 230, 0.5);
        }

        .dev-menu-category {
          margin-bottom: 1.5rem;
        }

        .dev-category-title {
          font-size: 0.875rem;
          color: #00FFFF;
          text-shadow: 0 0 10px rgba(0, 255, 255, 0.6);
          margin: 0 0 0.75rem 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .dev-screen-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .dev-screen-button {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 0.875rem 1rem;
          color: white;
          font-size: 0.875rem;
          text-align: left;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .dev-screen-button:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(0, 255, 255, 0.3);
          transform: translateX(4px);
        }

        .dev-screen-active {
          background: rgba(255, 0, 230, 0.15);
          border-color: rgba(255, 0, 230, 0.5);
          box-shadow: 0 0 20px rgba(255, 0, 230, 0.2);
        }

        .dev-active-indicator {
          color: #FF00E6;
          font-size: 1.5rem;
          line-height: 0;
          animation: dev-pulse 2s ease-in-out infinite;
        }

        @keyframes dev-pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </>
  );
}