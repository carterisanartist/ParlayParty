import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  Video,
  Copy,
  Check,
  Play,
  Trash2,
  GripVertical,
  Upload,
  Youtube,
  User,
  Pencil,
  Undo2,
} from "lucide-react";
import { Input } from "./ui/input";
import { ParlayButton } from "./shared/ParlayButton";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { VideoFileCard } from "./VideoFileCard";
import { useSocket } from '@/lib/socket';
import { QRCodeSVG } from 'qrcode.react';
import type { Player as GamePlayer, VideoType } from '@parlay-party/shared';

interface Player {
  id: string;
  name: string;
  avatar?: string;
  joinedAt: number;
}

interface VideoQueueItem {
  id: string;
  url: string;
  title?: string;
  addedBy: string;
  order: number;
  thumbnail?: string;
  videoType?: VideoType;
  videoId?: string;
}

interface HostLobbyProps {
  roomCode: string;
  onStartGame?: () => void;
  socket?: any;
  players?: GamePlayer[];
  currentPlayer?: GamePlayer;
}

type VideoTab = "youtube" | "tiktok" | "upload";

export default function HostLobby({
  roomCode,
  onStartGame,
  socket: propSocket,
  players: propPlayers,
  currentPlayer,
}: HostLobbyProps) {
  const hookSocket = useSocket(roomCode);
  const socket = propSocket || hookSocket.socket;
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [videoQueue, setVideoQueue] = useState<VideoQueueItem[]>([]);

  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(
    null,
  );
  const [activeTab, setActiveTab] =
    useState<VideoTab>("youtube");
  const [isDragging, setIsDragging] = useState(false);
  const [qrPulse, setQrPulse] = useState(0);
  const [flickerLetter, setFlickerLetter] = useState<
    number | null
  >(null);
  const [flickerColor, setFlickerColor] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Video management state
  const [deletedVideo, setDeletedVideo] = useState<VideoQueueItem | null>(null);
  const [showUndoToast, setShowUndoToast] = useState(false);
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Flicker effect for ROOM CODE letters
  useState(() => {
    const scheduleFlicker = () => {
      const randomDelay = 3000 + Math.random() * 2000; // Flicker every 3-5 seconds
      setTimeout(() => {
        const randomLetter = Math.floor(Math.random() * 9); // 9 letters in "ROOM CODE"
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

  const addVideo = () => {
    if (newVideoUrl.trim() && socket) {
      // Extract video ID from URL
      let videoId = '';
      let videoType: VideoType = 'youtube';
      
      if (activeTab === 'youtube') {
        const match = newVideoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=))([\w-]+)/);
        videoId = match ? match[1] : '';
        videoType = 'youtube';
      } else if (activeTab === 'tiktok') {
        videoType = 'tiktok';
        videoId = newVideoUrl; // For TikTok, just store the URL
      }

      if (videoId || activeTab === 'tiktok') {
        socket.emit('queue:add', {
          videoType,
          videoId,
          videoUrl: newVideoUrl,
          title: `${activeTab === 'youtube' ? 'YouTube' : 'TikTok'} Video ${videoQueue.length + 1}`
        });
        setNewVideoUrl('');
        setQrPulse((prev) => prev + 1);
      }
    }
  };

  const removeVideo = (id: string) => {
    if (!socket) return;
    
    const videoToRemove = videoQueue.find((v) => v.id === id);
    if (videoToRemove) {
      setDeletedVideo(videoToRemove);
      setShowUndoToast(true);
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }
      undoTimerRef.current = setTimeout(() => {
        setDeletedVideo(null);
        setShowUndoToast(false);
      }, 5000);
    }
    
    socket.emit('queue:remove', { videoId: id });
  };

  const handleUndoDelete = () => {
    if (deletedVideo) {
      setVideoQueue([...videoQueue, deletedVideo].sort((a, b) => a.order - b.order));
      setDeletedVideo(null);
      setShowUndoToast(false);
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }
    }
  };

  const handleRenameVideo = (id: string, newTitle: string) => {
    setVideoQueue(
      videoQueue.map((v) =>
        v.id === id ? { ...v, title: newTitle } : v
      )
    );
  };

  const handleMoveVideo = (dragIndex: number, hoverIndex: number) => {
    const draggedVideo = videoQueue[dragIndex];
    const newQueue = [...videoQueue];
    newQueue.splice(dragIndex, 1);
    newQueue.splice(hoverIndex, 0, draggedVideo);
    // Update order property
    const reorderedQueue = newQueue.map((video, index) => ({
      ...video,
      order: index,
    }));
    setVideoQueue(reorderedQueue);
  };

  const removePlayer = (id: string) => {
    if (socket) {
      socket.emit('player:kick', { playerId: id });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    files.forEach((file) => {
      if (file.type.startsWith("video/")) {
        const newVideo: VideoQueueItem = {
          id: Date.now().toString() + Math.random(),
          url: URL.createObjectURL(file),
          title: file.name,
          addedBy: "Host",
          order: videoQueue.length,
        };
        setVideoQueue((prev) => [...prev, newVideo]);
      }
    });
  };

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      if (file.type.startsWith("video/")) {
        const newVideo: VideoQueueItem = {
          id: Date.now().toString() + Math.random(),
          url: URL.createObjectURL(file),
          title: file.name,
          addedBy: "Host",
          order: videoQueue.length,
        };
        setVideoQueue((prev) => [...prev, newVideo]);
      }
    });
  };

  const handleStartGame = () => {
    if (!canStartGame) return;

    // Start countdown sequence
    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval);
          setTimeout(() => {
            if (socket) {
              socket.emit('host:startFromQueue');
            }
            if (onStartGame) {
              onStartGame();
            }
          }, 500);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const canStartGame =
    players.length >= 1 && videoQueue.length >= 1; // Changed to 1 player minimum for testing

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    // Convert GamePlayer to Player format
    if (propPlayers) {
      const convertedPlayers: Player[] = propPlayers
        .filter(p => p.name !== 'Host') // Don't show host in player list
        .map(p => ({
          id: p.id,
          name: p.name,
          joinedAt: p.joinedAt || Date.now()
        }));
      setPlayers(convertedPlayers);
    }

    const handlePlayerJoined = ({ player }: { player: GamePlayer }) => {
      if (player.name !== 'Host') {
        setPlayers(prev => [...prev, {
          id: player.id,
          name: player.name,
          joinedAt: Date.now()
        }]);
        setQrPulse(prev => prev + 1);
      }
    };

    const handlePlayerLeft = ({ playerId }: { playerId: string }) => {
      setPlayers(prev => prev.filter(p => p.id !== playerId));
    };

    const handleQueueUpdated = ({ videos }: { videos: any[] }) => {
      const convertedVideos: VideoQueueItem[] = videos.map((v, index) => ({
        id: v.id,
        url: v.videoUrl || '',
        title: v.title || `Video ${index + 1}`,
        addedBy: v.addedBy || 'Host',
        order: v.order || index,
        thumbnail: v.videoId ? `https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg` : undefined,
        videoType: v.videoType,
        videoId: v.videoId
      }));
      setVideoQueue(convertedVideos);
    };

    socket.on('player:joined', handlePlayerJoined);
    socket.on('player:left', handlePlayerLeft);
    socket.on('queue:updated', handleQueueUpdated);

    return () => {
      socket.off('player:joined', handlePlayerJoined);
      socket.off('player:left', handlePlayerLeft);
      socket.off('queue:updated', handleQueueUpdated);
    };
  }, [socket, propPlayers]);

  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center p-8"
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

      {/* Main container */}
      <div className="relative z-10 w-full max-w-[1400px]">
        {/* Room Code at Top with rotating neon plasma ring */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-block relative"
            whileHover={{ scale: 1.02 }}
            onHoverStart={() => setCopied(false)}
          >
            <div className="parlay-room-code">
              <div className="parlay-room-code-content">
                <p
                  className="neon-tube-text mb-3"
                  style={{ fontFamily: "Orbitron, sans-serif" }}
                >
                  {"ROOM CODE"
                    .split("")
                    .map((letter, index) => {
                      const isFlickering =
                        flickerLetter === index;
                      const flickerStyle =
                        isFlickering && flickerColor
                          ? {
                              textShadow: `
                        0 0 3px rgba(255, 255, 255, 1),
                        0 0 8px rgba(255, 255, 255, 0.9),
                        0 0 12px ${flickerColor.replace("COLOR_OPACITY", "0.9")},
                        0 0 20px ${flickerColor.replace("COLOR_OPACITY", "0.7")},
                        0 0 30px ${flickerColor.replace("COLOR_OPACITY", "0.5")},
                        0 0 45px ${flickerColor.replace("COLOR_OPACITY", "0.4")},
                        0 0 60px ${flickerColor.replace("COLOR_OPACITY", "0.3")},
                        0 0 80px ${flickerColor.replace("COLOR_OPACITY", "0.2")}
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
                          className="neon-letter"
                          style={flickerStyle}
                        >
                          {letter === " " ? "\u00A0" : letter}
                        </span>
                      );
                    })}
                </p>
                <div className="flex items-center justify-center gap-6 relative">
                  <div className="flex gap-3">
                    {roomCode.split("").map((letter, i) => (
                      <motion.span
                        key={i}
                        className="parlay-code-letter"
                        style={{
                          fontFamily: "Orbitron, sans-serif",
                        }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                      >
                        {letter}
                      </motion.span>
                    ))}
                  </div>

                  <button
                    onClick={copyRoomCode}
                    className="parlay-icon-button absolute right-0"
                  >
                    <div>
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Three Panel Layout */}
        <div className="grid grid-cols-12 gap-6 mb-10">
          {/* LEFT - Player List */}
          <motion.div
            className="col-span-4"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="parlay-panel">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Users
                  className="w-5 h-5 text-[#00FFFF]"
                  style={{
                    filter:
                      "drop-shadow(0 0 8px rgba(0, 255, 255, 0.8))",
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

              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {players.map((player, index) => (
                    <motion.div
                      key={player.id}
                      className="parlay-player-item group"
                      initial={{
                        opacity: 0,
                        x: -30,
                        scale: 0.9,
                      }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -30, scale: 0.9 }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.08,
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                      }}
                      layout
                    >
                      <div className="parlay-avatar">
                        <Users className="w-6 h-6 text-white/40" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm truncate text-[#e6e6f0]"
                          style={{
                            fontFamily: "Rubik, sans-serif",
                            fontWeight: 500,
                          }}
                        >
                          {player.name}
                        </p>
                        <p
                          className="text-xs text-white/40"
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

                      <motion.button
                        onClick={() => removePlayer(player.id)}
                        className="parlay-delete-button opacity-0 group-hover:opacity-100"
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <motion.p
                className="text-xs text-[#00FFFF] text-center mt-6"
                style={{ fontFamily: "Rubik, sans-serif" }}
                animate={{
                  opacity: [0.4, 0.8, 0.4],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                Waiting for players...
              </motion.p>

              {/* Room URL for manual sharing */}
              {typeof window !== 'undefined' && (
                <motion.p
                  className="mt-4 text-xs text-white/30 text-center break-all"
                  style={{ fontFamily: "Rubik, sans-serif" }}
                >
                  {`${window.location.origin}/play/${roomCode}`}
                </motion.p>
              )}
            </div>
          </motion.div>

          {/* CENTER - QR Code & Start Button */}
          <motion.div
            className="col-span-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="parlay-panel h-full flex flex-col items-center justify-center p-8">
              <h2
                className="text-base tracking-[0.2em] mb-8 text-center text-white"
                style={{ fontFamily: "Orbitron, sans-serif" }}
              >
                SCAN TO JOIN
              </h2>

              {/* QR Code with rotating white ring */}
              <div className="relative mb-10">
                {/* Rotating white ring with evenly spaced dashes */}
                <motion.div
                  className="absolute"
                  style={{
                    top: "50%",
                    left: "50%",
                    x: "-50%",
                    y: "-50%",
                    width: "320px",
                    height: "320px",
                  }}
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <svg
                    width="320"
                    height="320"
                    viewBox="0 0 320 320"
                  >
                    <defs>
                      <filter id="whiteGlow">
                        <feGaussianBlur
                          stdDeviation="3"
                          result="coloredBlur"
                        />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <circle
                      cx="160"
                      cy="160"
                      r="155"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="4"
                      strokeDasharray="20 20.29"
                      strokeOpacity="0.8"
                      filter="url(#whiteGlow)"
                    />
                  </svg>
                </motion.div>

                {/* Pulse ripple on player join */}
                <AnimatePresence>
                  {qrPulse > 0 && (
                    <motion.div
                      key={qrPulse}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                      initial={{
                        width: 280,
                        height: 280,
                        opacity: 0.8,
                      }}
                      animate={{
                        width: 400,
                        height: 400,
                        opacity: 0,
                      }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 1.2,
                        ease: "easeOut",
                      }}
                      style={{
                        border:
                          "3px solid rgba(255, 255, 255, 0.5)",
                        borderRadius: "20px",
                        boxShadow:
                          "0 0 30px rgba(255, 255, 255, 0.3)",
                      }}
                    />
                  )}
                </AnimatePresence>

                {/* Circular QR Code */}
                <div
                  className="parlay-qr-code"
                  style={{
                    background: "white",
                    borderRadius: "50%",
                    overflow: "hidden",
                    padding: "20px",
                  }}
                >
                  {typeof window !== 'undefined' && (
                    <QRCodeSVG
                      value={`${window.location.origin}/play/${roomCode}`}
                      size={240}
                      bgColor="#FFFFFF"
                      fgColor="#000000"
                      level="H"
                      style={{ borderRadius: "50%" }}
                    />
                  )}
                </div>
              </div>

              {/* Start Game Button with ignite effect */}
              <motion.button
                onClick={handleStartGame}
                disabled={!canStartGame}
                className="parlay-start-button"
                style={{ fontFamily: "Orbitron, sans-serif" }}
                whileHover={
                  canStartGame ? { scale: 1.03, y: -2 } : {}
                }
                whileTap={canStartGame ? { scale: 0.97 } : {}}
              >
                <Play
                  className="w-5 h-5"
                  style={{ marginRight: "12px" }}
                />
                START GAME
              </motion.button>

              {!canStartGame && (
                <motion.p
                  className="text-xs text-[#FF3333] mt-4 text-center"
                  style={{ 
                    fontFamily: "Rubik, sans-serif",
                    textShadow: "0 0 10px rgba(255, 51, 51, 0.8)"
                  }}
                  animate={{
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  {players.length < 2
                    ? "Need at least 2 players"
                    : "Add at least 1 video"}
                </motion.p>
              )}
            </div>
          </motion.div>

          {/* RIGHT - Video Submission with Tabs */}
          <motion.div
            className="col-span-4"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="parlay-panel">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Video
                    className="w-5 h-5 text-[#FF00E6]"
                    style={{
                      filter:
                        "drop-shadow(0 0 8px rgba(255, 0, 230, 0.8))",
                    }}
                  />
                  <h2
                    className="text-lg tracking-[0.15em] text-white"
                    style={{ fontFamily: "Orbitron, sans-serif" }}
                  >
                    VIDEOS
                  </h2>
                  <span className="parlay-badge">
                    {videoQueue.length}
                  </span>
                </div>
              </div>

              {/* Tab System */}
              <div className="flex gap-2 mb-4">
                {(
                  ["youtube", "tiktok", "upload"] as VideoTab[]
                ).map((tab) => (
                  <motion.button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 px-3 rounded-[14px] text-xs uppercase tracking-wider transition-all ${
                      activeTab === tab
                        ? "parlay-tab-active"
                        : "parlay-tab-inactive"
                    }`}
                    style={{
                      fontFamily: "Orbitron, sans-serif",
                    }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {tab === "youtube" && (
                      <Youtube className="w-3.5 h-3.5 inline mr-1" />
                    )}
                    {tab === "upload" && (
                      <Upload className="w-3.5 h-3.5 inline mr-1" />
                    )}
                    {tab === "tiktok" && (
                      <svg
                        className="w-3.5 h-3.5 inline mr-1"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                      </svg>
                    )}
                    {tab}
                  </motion.button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === "upload" ? (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="mb-6"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <motion.div
                      className={`parlay-dropzone ${isDragging ? "parlay-dropzone-active" : ""}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      whileHover={{ scale: 1.01 }}
                    >
                      <Upload className="w-8 h-8 mb-2 text-[#00FFFF]" />
                      <p
                        className="text-xs text-[#e6e6f0]"
                        style={{
                          fontFamily: "Rubik, sans-serif",
                        }}
                      >
                        Drag & drop
                      </p>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="url-input"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="mb-6 space-y-3"
                  >
                    <Input
                      type="text"
                      placeholder={`${activeTab === "youtube" ? "YouTube" : "TikTok"} URL...`}
                      value={newVideoUrl}
                      onChange={(e) =>
                        setNewVideoUrl(e.target.value)
                      }
                      onKeyDown={(e) =>
                        e.key === "Enter" && addVideo()
                      }
                      className="parlay-input"
                      style={{
                        fontFamily: "Rubik, sans-serif",
                      }}
                    />
                    <motion.button
                      onClick={addVideo}
                      className="parlay-add-button w-full flex items-center justify-center"
                      style={{
                        fontFamily: "Orbitron, sans-serif",
                      }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      ADD VIDEO
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Video List */}
              <DndProvider backend={HTML5Backend}>
                <div className="space-y-2 max-h-72 overflow-y-auto parlay-scrollbar">
                  <AnimatePresence mode="popLayout">
                    {videoQueue.map((video, index) => (
                      <VideoFileCard
                        key={video.id}
                        video={video}
                        index={index}
                        onRename={handleRenameVideo}
                        onDelete={removeVideo}
                        onMove={handleMoveVideo}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </DndProvider>

              {videoQueue.length === 0 && (
                <div className="flex items-center justify-center h-32">
                  <p
                    className="text-xs text-white/20 text-center"
                    style={{ fontFamily: "Rubik, sans-serif" }}
                  >
                    No videos yet
                    <br />
                    Add a video to begin
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>


      </div>

      {/* Countdown Overlay */}
      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              className="relative z-10 parlay-countdown"
              style={{ fontFamily: "Orbitron, sans-serif" }}
              key={countdown}
              initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{
                duration: 0.4,
                ease: [0.34, 1.56, 0.64, 1],
              }}
            >
              {countdown}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Undo Toast */}
      <AnimatePresence>
        {showUndoToast && deletedVideo && (
          <motion.div
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ 
              duration: 0.4, 
              ease: [0.34, 1.56, 0.64, 1]
            }}
          >
            <div className="undo-toast">
              <div className="flex items-center gap-4">
                <Trash2 className="w-4 h-4 text-[#ff4444]" style={{ filter: "drop-shadow(0 0 6px rgba(255, 68, 68, 0.8))" }} />
                <p style={{ fontFamily: "Rubik, sans-serif" }}>
                  <span className="text-white/90">Deleted </span>
                  <span className="text-[#00FFFF]">{deletedVideo.title}</span>
                </p>
                <motion.button
                  onClick={handleUndoDelete}
                  className="undo-button"
                  style={{ fontFamily: "Orbitron, sans-serif" }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Undo2 className="w-3.5 h-3.5 mr-1.5" />
                  UNDO
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        /* ==========================================
           PARLAY PARTY LOBBY - DARK NEON THEME
           ========================================== */

        /* NEON TUBE TEXT - Main Menu Style */
        .neon-tube-text {
          position: relative;
          z-index: 10;
          font-size: 43px;
          font-weight: 800;
          letter-spacing: 0.15em;
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

        /* Responsive sizing for neon text */
        @media (max-width: 640px) {
          .neon-tube-text {
            font-size: 22px;
            letter-spacing: 0.12em;
          }
        }

        @media (min-width: 641px) and (max-width: 768px) {
          .neon-tube-text {
            font-size: 28px;
          }
        }

        /* Animated gradient text for headers */
        @keyframes gradientSweep {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .parlay-gradient-text {
          background: linear-gradient(90deg, #FF00E6, #B400FF, #00FFFF, #00FF88, #FF00E6);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientSweep 4s linear infinite;
          letter-spacing: 0.1em;
        }

        /* Room Code Card */
        .parlay-room-code {
          position: relative;
          padding: 32px 56px;
          border-radius: 20px;
        }

        .parlay-room-code-content {
          position: relative;
          z-index: 1;
        }

        .parlay-code-letter {
          font-size: 48px;
          font-weight: 900;
          color: #ffffff;
          text-shadow: 
            0 0 14px rgba(255, 0, 230, 0.3),
            0 0 28px rgba(0, 255, 255, 0.25);
          letter-spacing: 0.1em;
        }

        .parlay-underline {
          width: 60px;
          height: 2px;
          margin: 16px auto 0;
          background: linear-gradient(90deg, #FF00E6, #B400FF, #00FFFF);
          border-radius: 1px;
          box-shadow: 0 0 8px rgba(255, 0, 230, 0.5);
        }

        .parlay-icon-button {
          width: 36px;
          height: 36px;
          border-radius: 14px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #e6e6f0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease-in-out;
        }

        @keyframes icon-button-glow {
          0%, 100% { 
            border-color: rgba(255, 255, 255, 0.5);
            box-shadow: 
              0 0 12px rgba(255, 255, 255, 0.4),
              0 0 24px rgba(255, 0, 230, 0.3),
              0 0 36px rgba(0, 255, 255, 0.2),
              inset 0 0 15px rgba(255, 255, 255, 0.05);
          }
          50% { 
            border-color: rgba(255, 255, 255, 0.8);
            box-shadow: 
              0 0 18px rgba(255, 255, 255, 0.6),
              0 0 30px rgba(255, 0, 230, 0.5),
              0 0 45px rgba(0, 255, 255, 0.4),
              inset 0 0 20px rgba(255, 255, 255, 0.1);
          }
        }

        .parlay-icon-button:hover {
          background: transparent;
          border-color: rgba(255, 255, 255, 0.6);
          color: #FFFFFF;
          animation: icon-button-glow 1.5s ease-in-out infinite;
        }

        /* Main Panel */
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

        /* Badge */
        .parlay-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          background: rgba(0, 255, 255, 0.15);
          border: 1px solid rgba(0, 255, 255, 0.5);
          color: #00FFFF;
          text-shadow: 0 0 10px rgba(0, 255, 255, 0.9);
          box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
        }

        /* Player Item */
        .parlay-player-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .parlay-player-item:hover {
          background: rgba(0, 255, 255, 0.05);
          border-color: rgba(0, 255, 255, 0.25);
          box-shadow: 0 0 20px rgba(0, 255, 255, 0.15);
        }

        /* Avatar */
        .parlay-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 2px solid rgba(255, 255, 255, 0.4);
          box-shadow: 
            0 0 20px rgba(255, 255, 255, 0.3),
            inset 0 0 15px rgba(255, 255, 255, 0.1);
        }

        /* Status Dot */
        .parlay-status-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #00FF88;
          box-shadow: 
            0 0 12px rgba(0, 255, 136, 0.9),
            0 0 20px rgba(0, 255, 136, 0.6);
          flex-shrink: 0;
        }

        /* Circular QR Code */
        .parlay-qr-code {
          position: relative;
          width: 280px;
          height: 280px;
          background: white;
          border-radius: 50%;
          box-shadow: 
            0 0 0 3px rgba(255, 0, 230, 0.5),
            0 0 40px rgba(255, 0, 230, 0.4),
            0 0 60px rgba(0, 255, 255, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Start Button with ignite effect */
        .parlay-start-button {
          width: 100%;
          max-width: 380px;
          height: 58px;
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
        }

        @keyframes outline-glow {
          0%, 100% { 
            border-color: rgba(255, 255, 255, 0.5);
            box-shadow: 
              0 0 15px rgba(255, 255, 255, 0.4),
              0 0 30px rgba(255, 0, 230, 0.3),
              0 0 45px rgba(0, 255, 255, 0.2),
              inset 0 0 20px rgba(255, 255, 255, 0.05);
          }
          50% { 
            border-color: rgba(255, 255, 255, 0.8);
            box-shadow: 
              0 0 25px rgba(255, 255, 255, 0.6),
              0 0 40px rgba(255, 0, 230, 0.5),
              0 0 60px rgba(0, 255, 255, 0.4),
              inset 0 0 30px rgba(255, 255, 255, 0.1);
          }
        }

        .parlay-start-button:not(:disabled):hover {
          background: transparent;
          border-color: rgba(255, 255, 255, 0.6);
          color: #FFFFFF;
          animation: outline-glow 1.5s ease-in-out infinite;
        }

        .parlay-start-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          border-color: rgba(255, 255, 255, 0.2);
        }

        /* Tabs */
        .parlay-tab-active {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.08));
          border: 1px solid rgba(255, 255, 255, 0.5);
          color: #FFFFFF;
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
        }

        @keyframes tab-pulse {
          0%, 100% { box-shadow: 0 0 15px rgba(255, 255, 255, 0.3); }
          50% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.5); }
        }

        .parlay-tab-active {
          animation: tab-pulse 1.8s ease-in-out infinite;
        }

        .parlay-tab-inactive {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.5);
          transition: all 0.15s ease-in-out;
        }

        .parlay-tab-inactive:hover {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.03));
          border-color: rgba(255, 255, 255, 0.3);
          color: rgba(255, 255, 255, 0.8);
        }

        /* Dropzone */
        .parlay-dropzone {
          height: 140px;
          border: 3px dashed rgba(63, 208, 255, 0.3);
          border-radius: 14px;
          background: rgba(63, 208, 255, 0.03);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .parlay-dropzone:hover {
          border-color: rgba(63, 208, 255, 0.5);
          background: rgba(63, 208, 255, 0.06);
          box-shadow: 
            0 0 25px rgba(63, 208, 255, 0.2),
            inset 0 0 30px rgba(63, 208, 255, 0.05);
        }

        .parlay-dropzone-active {
          border-color: rgba(63, 208, 255, 0.7);
          background: rgba(63, 208, 255, 0.1);
          box-shadow: 
            0 0 35px rgba(63, 208, 255, 0.4),
            inset 0 0 40px rgba(63, 208, 255, 0.1);
        }

        /* Input */
        .parlay-input {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid #34345a;
          color: #e6e6f0;
          height: 46px;
          border-radius: 14px;
          padding: 0 16px;
          font-size: 13px;
          transition: all 0.15s ease-in-out;
        }

        .parlay-input::placeholder {
          color: #8d92a9;
        }

        .parlay-input:focus {
          outline: none;
          box-shadow: 0 0 0 4px rgba(108, 60, 255, 0.2);
          border-color: #6c3cff;
        }

        /* Add Video Button */
        .parlay-add-button {
          height: 46px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 14px;
          color: #e6e6f0;
          font-size: 13px;
          letter-spacing: 0.15em;
          font-weight: 600;
          transition: all 0.3s ease-in-out;
        }

        @keyframes add-button-glow {
          0%, 100% { 
            border-color: rgba(255, 255, 255, 0.5);
            box-shadow: 
              0 0 15px rgba(255, 255, 255, 0.4),
              0 0 30px rgba(255, 45, 179, 0.3),
              0 0 45px rgba(63, 208, 255, 0.2),
              inset 0 0 20px rgba(255, 255, 255, 0.05);
          }
          50% { 
            border-color: rgba(255, 255, 255, 0.8);
            box-shadow: 
              0 0 25px rgba(255, 255, 255, 0.6),
              0 0 40px rgba(255, 45, 179, 0.5),
              0 0 60px rgba(63, 208, 255, 0.4),
              inset 0 0 30px rgba(255, 255, 255, 0.1);
          }
        }

        .parlay-add-button:hover {
          background: transparent;
          border-color: rgba(255, 255, 255, 0.6);
          color: #FFFFFF;
          animation: add-button-glow 1.5s ease-in-out infinite;
        }

        /* Video Item */
        .parlay-video-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .parlay-video-item:hover {
          background: rgba(255, 45, 179, 0.05);
          border-color: rgba(255, 45, 179, 0.25);
          box-shadow: 0 0 15px rgba(255, 45, 179, 0.15);
        }

        .parlay-video-thumbnail {
          width: 60px;
          height: 45px;
          border-radius: 6px;
          overflow: hidden;
          flex-shrink: 0;
          border: 1px solid rgba(255, 45, 179, 0.3);
          box-shadow: 0 0 10px rgba(255, 45, 179, 0.2);
        }

        /* Delete Button */
        .parlay-delete-button {
          padding: 7px;
          background: rgba(255, 0, 0, 0.1);
          border: 1px solid rgba(255, 0, 0, 0.3);
          border-radius: 6px;
          color: #ff4444;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .parlay-delete-button:hover {
          background: rgba(255, 0, 0, 0.25);
          border-color: rgba(255, 0, 0, 0.6);
          box-shadow: 0 0 15px rgba(255, 0, 0, 0.4);
        }

        /* Countdown */
        .parlay-countdown {
          font-size: 200px;
          font-weight: 900;
          color: white;
          text-shadow: 
            0 0 40px rgba(255, 45, 179, 1),
            0 0 80px rgba(255, 45, 179, 0.8),
            0 0 120px rgba(63, 208, 255, 0.6);
        }

        /* Scrollbar */
        .parlay-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .parlay-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 3px;
        }

        .parlay-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 45, 179, 0.5);
          border-radius: 3px;
        }

        .parlay-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 45, 179, 0.7);
        }

        /* Undo Toast */
        .undo-toast {
          background: rgba(8, 8, 8, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 255, 255, 0.4);
          border-radius: 16px;
          padding: 16px 24px;
          box-shadow: 
            0 0 30px rgba(0, 255, 255, 0.3),
            0 0 60px rgba(0, 255, 255, 0.15),
            inset 0 0 20px rgba(0, 255, 255, 0.05);
          min-width: 300px;
        }

        .undo-button {
          display: flex;
          align-items: center;
          padding: 6px 14px;
          background: rgba(0, 255, 255, 0.15);
          border: 1px solid rgba(0, 255, 255, 0.5);
          border-radius: 10px;
          color: #00FFFF;
          font-size: 11px;
          letter-spacing: 0.1em;
          font-weight: 600;
          transition: all 0.2s ease;
          box-shadow: 0 0 12px rgba(0, 255, 255, 0.3);
        }

        .undo-button:hover {
          background: rgba(0, 255, 255, 0.25);
          border-color: rgba(0, 255, 255, 0.7);
          box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
          text-shadow: 0 0 8px rgba(0, 255, 255, 0.8);
        }

        /* Accessibility - reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .parlay-gradient-text,
          .parlay-tab-active,
          .parlay-start-button:not(:disabled):hover {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}