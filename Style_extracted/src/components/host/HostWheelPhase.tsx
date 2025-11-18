import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCw, X } from 'lucide-react';
import { PlayerAvatar } from '../shared/PlayerAvatar';

interface Punishment {
  id: string;
  text: string;
  submittedBy: string;
}

interface HostWheelPhaseProps {
  punishments: Punishment[];
  onComplete: (selectedPunishment: Punishment) => void;
}

export default function HostWheelPhase({ punishments, onComplete }: HostWheelPhaseProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [showZoomedText, setShowZoomedText] = useState(false);
  const [iridescentOffset, setIridescentOffset] = useState(0);
  const [removedPunishments, setRemovedPunishments] = useState<Set<string>>(new Set());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wheelRotation = useRef(0);
  const animationRef = useRef<number>();

  // Flicker effect for PUNISHMENT WHEEL letters
  const [flickerLetter, setFlickerLetter] = useState<number | null>(null);
  const [flickerColor, setFlickerColor] = useState<string>('');

  // Filter out removed punishments
  const activePunishments = punishments.filter(p => !removedPunishments.has(p.id));

  // Flicker scheduling effect
  useEffect(() => {
    const scheduleFlicker = () => {
      const randomDelay = 3000 + Math.random() * 2000; // Flicker every 3-5 seconds
      setTimeout(() => {
        const randomLetter = Math.floor(Math.random() * 16); // 16 letters in "PUNISHMENT WHEEL"
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
  }, []);

  // Micro-iridescent animation when idle
  useEffect(() => {
    if (!isSpinning) {
      const animate = () => {
        setIridescentOffset(prev => (prev + 0.3) % 360);
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSpinning]);

  useEffect(() => {
    drawWheel();
  }, [activePunishments, selectedIndex, iridescentOffset, isSpinning]);

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 300;
    const sliceAngle = (2 * Math.PI) / activePunishments.length;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Enhanced iridescent conic gradient background - MUCH brighter!
    const iridescentGradient = ctx.createConicGradient(((iridescentOffset * Math.PI) / 180), centerX, centerY);
    iridescentGradient.addColorStop(0, 'rgba(0, 255, 255, 0.4)');      // Cyan - increased from 0.15
    iridescentGradient.addColorStop(0.25, 'rgba(255, 0, 230, 0.45)');  // Magenta - increased from 0.15
    iridescentGradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.4)');    // Gold - increased from 0.15
    iridescentGradient.addColorStop(0.75, 'rgba(180, 0, 255, 0.45)');  // Violet - added
    iridescentGradient.addColorStop(1, 'rgba(0, 255, 255, 0.4)');      // Cyan - increased from 0.15

    // Draw iridescent base
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = iridescentGradient;
    ctx.fill();

    // Draw transparent segments with white tick marks
    activePunishments.forEach((punishment, index) => {
      const startAngle = index * sliceAngle - Math.PI / 2;
      const endAngle = startAngle + sliceAngle;
      const midAngle = startAngle + sliceAngle / 2;

      // Highlight selected segment
      if (selectedIndex === index && !isSpinning) {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fill();
      }

      // White tick marks (segment separators)
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(startAngle) * radius,
        centerY + Math.sin(startAngle) * radius
      );
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw labels inside the ring - centered in the safe zone
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(midAngle);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px Orbitron, sans-serif';
      
      // Position text in the center of the safe zone (scaled proportionally)
      const textRadius = 170;
      const text = punishment.text.length > 18 ? punishment.text.substring(0, 15) + '...' : punishment.text;
      
      // Draw white glow layers - reduced opacity
      ctx.shadowColor = 'rgba(255, 255, 255, 0.25)';
      ctx.shadowBlur = 8;
      ctx.fillText(text, textRadius, 5);
      
      ctx.shadowBlur = 4;
      ctx.fillText(text, textRadius, 5);
      
      // Final crisp text layer
      ctx.shadowBlur = 0;
      ctx.fillText(text, textRadius, 5);
      
      ctx.restore();
    });

    // Outer neon ring - VIVID rainbow gradient with intense glow
    // Create rainbow gradient for the ring
    const ringGradient = ctx.createConicGradient(0, centerX, centerY);
    ringGradient.addColorStop(0, '#00FFFF');      // Cyan
    ringGradient.addColorStop(0.25, '#FF00CC');   // Magenta
    ringGradient.addColorStop(0.5, '#FFD700');    // Gold
    ringGradient.addColorStop(0.75, '#B400FF');   // Violet
    ringGradient.addColorStop(1, '#00FFFF');      // Cyan
    
    // Intense outer glow layer
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = ringGradient;
    ctx.lineWidth = 4;
    ctx.shadowColor = 'rgba(255, 255, 255, 1)';
    ctx.shadowBlur = 30;
    ctx.stroke();
    
    // Secondary intense glow layer
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = ringGradient;
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 40;
    ctx.stroke();
    
    // Third glow layer for maximum brightness
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
    ctx.shadowBlur = 50;
    ctx.stroke();
    
    ctx.shadowBlur = 0;

    // Inner neon ring - brighter with cyan glow
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 15, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(0, 255, 255, 0.8)';
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Center hub - frosted glass circle with radial light
    const hubGradient = ctx.createRadialGradient(centerX, centerY - 10, 0, centerX, centerY, 55);
    hubGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    hubGradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.08)');
    hubGradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, 55, 0, 2 * Math.PI);
    ctx.fillStyle = hubGradient;
    ctx.fill();
    
    // Hub outer glow - brighter
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
  };

  const spinWheel = () => {
    setButtonClicked(true);
    setIsSpinning(true);
    setSelectedIndex(null);
    setShowZoomedText(false);

    // Simulate spinning
    const randomIndex = Math.floor(Math.random() * activePunishments.length);
    
    setTimeout(() => {
      setSelectedIndex(randomIndex);
      setIsSpinning(false);
      
      // Show zoomed text after selection with slight delay for wheel settle
      setTimeout(() => {
        setShowZoomedText(true);
        
        // Hide zoomed text and complete after 3 seconds
        setTimeout(() => {
          setShowZoomedText(false);
          setTimeout(() => {
            onComplete(activePunishments[randomIndex]);
          }, 500);
        }, 3000);
      }, 600);
    }, 4000);
  };

  const handleRemovePunishment = (punishmentId: string) => {
    setRemovedPunishments(prev => new Set(prev).add(punishmentId));
  };

  return (
    <div className="min-h-screen bg-[#000000] relative overflow-hidden flex items-center justify-center p-8">
      {/* Import Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Premium Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0033] via-[#0a0012] to-[#000000]" />
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/70 pointer-events-none" />
      
      {/* Optional soft radial gradient behind wheel for focal glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[800px] h-[800px] bg-gradient-radial from-[rgba(100,50,150,0.08)] via-transparent to-transparent blur-3xl" />
      </div>

      {/* Content */}
      <div className={`relative z-10 flex-1 flex flex-col max-w-[1600px] mx-auto w-full transition-opacity duration-500 ${showZoomedText ? 'content-dimmed' : ''}`}>
        {/* Header */}
        <motion.div
          className="text-center mb-3 relative mt-24"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <h1 className="wheel-title" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            {'PUNISHMENT WHEEL'.split('').map((letter, index) => {
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
          <motion.p 
            className="wheel-subtitle" 
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Spin to decide the loser's fate!
          </motion.p>
        </motion.div>

        {/* Wheel Container */}
        <div className="flex-1 flex items-center justify-center mb-8 -mt-12">
          <div className="flex gap-16 items-center">
            {/* Wheel and Button Column */}
            <div className="flex flex-col items-center gap-6">
              {/* Wheel Canvas */}
              <motion.div
                className="wheel-container"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ 
                  scale: selectedIndex !== null && !isSpinning ? [1, 1.05, 1] : 1,
                  opacity: selectedIndex !== null && !isSpinning ? [1, 1.15, 1] : 1,
                  rotate: isSpinning ? 1440 : (selectedIndex !== null ? [1442, 1440] : 0)
                }}
                transition={{ 
                  scale: { 
                    duration: 0.6, 
                    times: [0, 0.5, 1], 
                    ease: [0.34, 1.56, 0.64, 1]
                  },
                  opacity: {
                    duration: selectedIndex !== null && !isSpinning ? 0.8 : 0.6,
                    times: selectedIndex !== null && !isSpinning ? [0, 0.5, 1] : [0, 1]
                  },
                  rotate: { 
                    duration: isSpinning ? 4 : 0.4, 
                    ease: isSpinning ? [0.43, 0.13, 0.23, 0.96] : [0.34, 1.56, 0.64, 1],
                    times: !isSpinning && selectedIndex !== null ? [0, 1] : undefined
                  }
                }}
              >
                <canvas
                  ref={canvasRef}
                  width={750}
                  height={750}
                  className="wheel-canvas"
                />
              </motion.div>

              {/* Spin Button */}
              <motion.div
                className="text-center relative"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <motion.button
                  onClick={spinWheel}
                  disabled={isSpinning || selectedIndex !== null}
                  className="spin-button"
                  style={{ fontFamily: 'Orbitron, sans-serif' }}
                  whileHover={!isSpinning && selectedIndex === null ? { scale: 1.03 } : {}}
                  whileTap={!isSpinning && selectedIndex === null ? { scale: 0.97 } : {}}
                >
                  <span className="button-text">
                    {isSpinning ? 'SPINNING...' : selectedIndex !== null ? 'SELECTED!' : 'SPIN THE WHEEL'}
                  </span>
                </motion.button>
              </motion.div>
            </div>

            {/* Submissions Panel */}
            <motion.div
              className="punishments-list"
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
            >
              <div className="list-title-wrapper">
                <h3 className="list-title" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  SUBMISSIONS
                </h3>
                <div className="title-underline" />
              </div>
              <div className="space-y-3 max-h-[500px] overflow-y-auto wheel-scrollbar">
                {activePunishments.map((punishment, index) => (
                  <motion.div
                    key={punishment.id}
                    className={`punishment-item ${selectedIndex === index ? 'punishment-selected' : ''}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                  >
                    <div className="punishment-item-content">
                      <PlayerAvatar
                        name={punishment.submittedBy}
                        size="small"
                      />
                      <div className="punishment-text-wrapper">
                        <p className="punishment-text" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                          {punishment.text}
                        </p>
                        <p className="punishment-author" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                          {punishment.submittedBy}
                        </p>
                      </div>
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePunishment(punishment.id);
                        }}
                        className="remove-button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label="Remove punishment"
                      >
                        <X className="remove-icon" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Zoomed Winner Text Overlay */}
      <AnimatePresence>
        {showZoomedText && selectedIndex !== null && (
          <motion.div
            className="zoomed-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ 
              opacity: { duration: 0.4 },
              exit: { duration: 0.5, ease: 'easeIn' }
            }}
          >
            {/* Radial Spotlight Behind Text */}
            <motion.div
              className="text-spotlight"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            />
            
            <motion.div
              className="zoomed-text-container"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ 
                scale: [0.9, 1.05, 1],
                opacity: 1
              }}
              exit={{ 
                scale: 0.96,
                opacity: 0
              }}
              transition={{ 
                scale: {
                  duration: 0.4,
                  times: [0, 0.6, 1],
                  ease: [0.34, 1, 0.64, 1]
                },
                opacity: { duration: 0.4 },
                exit: { duration: 0.5, ease: 'easeIn' }
              }}
            >
              <motion.div
                className="zoomed-text"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
                initial={{ 
                  textShadow: '0 0 20px rgba(255, 255, 255, 0.6)'
                }}
                animate={{ 
                  textShadow: [
                    '0 0 25px rgba(255, 255, 255, 0.7)',
                    '0 0 40px rgba(255, 255, 255, 1)',
                    '0 0 30px rgba(255, 255, 255, 0.8)'
                  ]
                }}
                transition={{ 
                  duration: 0.5,
                  delay: 0.3,
                  times: [0, 0.5, 1],
                  ease: 'easeOut'
                }}
              >
                {activePunishments[selectedIndex].text}
              </motion.div>
              <motion.div
                className="submission-credit"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4, ease: 'easeOut' }}
              >
                SUBMITTED BY {activePunishments[selectedIndex].submittedBy.toUpperCase()}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        /* ===== HEADER ===== */
        
        .wheel-title {
          font-size: 4rem;
          font-weight: 900;
          color: #FFFFFF;
          letter-spacing: 0.15em;
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
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
          color: #FFFFFF;
          animation: rainbow-flow 5s linear infinite;
        }

        .wheel-subtitle {
          font-size: 1.5rem;
          color: rgba(255, 255, 255, 0.85);
          letter-spacing: 0.08em;
          font-weight: 400;
          margin-top: 0.5rem;
        }

        /* ===== WHEEL ===== */
        
        .wheel-container {
          position: relative;
        }

        .wheel-canvas {
          display: block;
        }

        /* ===== SUBMISSIONS LIST ===== */
        
        .punishments-list {
          width: 360px;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(12px);
          border-radius: 18px;
          padding: 1.75rem;
          position: relative;
          overflow: hidden;
          box-shadow: 
            0 3px 10px rgba(0, 0, 0, 0.5),
            inset 0 0 0 1px rgba(255, 255, 255, 0.12);
        }

        .list-title-wrapper {
          position: relative;
          margin-bottom: 1.75rem;
        }

        .list-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #FFFFFF;
          letter-spacing: 0.15em;
          text-align: center;
          margin-bottom: 0.75rem;
          text-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
        }

        .title-underline {
          width: 50%;
          height: 1px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 1px;
        }

        .punishment-item {
          position: relative;
          padding: 16px 18px;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(6px);
          border-radius: 14px;
          transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
          margin-bottom: 12px;
          border: 1px solid transparent;
        }

        .punishment-item:hover {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 20px rgba(255, 255, 255, 0.08);
        }

        .punishment-selected {
          background: rgba(255, 255, 255, 0.12) !important;
          border: 1px solid rgba(255, 255, 255, 0.3) !important;
          box-shadow: 0 4px 25px rgba(255, 255, 255, 0.2) !important;
          animation: punishment-selected-pulse 1.5s ease-in-out 1;
        }

        @keyframes punishment-selected-pulse {
          0%, 100% {
            box-shadow: 0 4px 25px rgba(255, 255, 255, 0.2);
          }
          50% {
            box-shadow: 0 4px 35px rgba(255, 255, 255, 0.35);
          }
        }

        .punishment-item-content {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .punishment-text-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .punishment-text {
          font-size: 1rem;
          color: #FFFFFF;
          font-weight: 700;
          line-height: 1.3;
        }

        .punishment-author {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .remove-button {
          position: absolute;
          top: 5px;
          right: 5px;
          background: none;
          border: none;
          cursor: pointer;
          z-index: 10;
        }

        .remove-icon {
          width: 1.25rem;
          height: 1.25rem;
          color: rgba(255, 255, 255, 0.8);
          filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.5));
        }

        .wheel-scrollbar::-webkit-scrollbar {
          width: 5px;
        }

        .wheel-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 3px;
        }

        .wheel-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }

        .wheel-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        /* ===== SPIN BUTTON ===== */
        
        .spin-button {
          position: relative;
          padding: 1.25rem 3.5rem;
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          border: none;
          border-radius: 16px;
          cursor: pointer;
          overflow: visible;
          transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }

        .spin-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .spin-button:not(:disabled)::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 16px;
          padding: 2px;
          background: linear-gradient(90deg, #00FFFF, #FF00CC, #FFD700, #00FFFF);
          background-size: 300% 100%;
          -webkit-mask: 
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: button-border-flow 3s linear infinite;
        }

        @keyframes button-border-flow {
          0% {
            background-position: 0% 0%;
          }
          100% {
            background-position: 300% 0%;
          }
        }

        .spin-button:not(:disabled)::after {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 16px;
          background: linear-gradient(90deg, #00FFFF, #FF00CC, #FFD700, #00FFFF);
          background-size: 300% 100%;
          opacity: 0;
          filter: blur(10px);
          animation: button-glow-pulse 2.5s ease-in-out infinite;
          z-index: -1;
        }

        @keyframes button-glow-pulse {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }

        .button-text {
          position: relative;
          color: white;
          text-shadow: 0 0 15px rgba(255, 255, 255, 0.6);
        }

        .spin-button:not(:disabled):hover {
          background: rgba(0, 0, 0, 0.85);
          box-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
        }

        .spin-button:not(:disabled):hover .button-text {
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.9);
        }

        /* ===== ZOOMED OVERLAY ===== */
        
        .content-dimmed {
          opacity: 0.25;
        }

        .zoomed-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          pointer-events: none;
          z-index: 1000;
        }

        .text-spotlight {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
          pointer-events: none;
          z-index: 999;
        }

        .zoomed-text-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
          z-index: 1001;
        }

        .zoomed-text {
          font-size: 4.5rem;
          font-weight: 900;
          color: #FFFFFF;
          text-align: center;
          max-width: 90%;
          line-height: 1.15;
          pointer-events: none;
        }

        .submission-credit {
          font-size: 1.4rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.85);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        /* ===== RESPONSIVE ===== */
        
        @media (max-width: 1400px) {
          .wheel-title {
            font-size: 4rem;
          }
          
          .punishments-list {
            width: 380px;
          }
        }

        @media (max-width: 1200px) {
          .wheel-title {
            font-size: 3.5rem;
          }
          
          .wheel-subtitle {
            font-size: 1.5rem;
          }
          
          .punishments-list {
            width: 340px;
            padding: 1.5rem;
          }
        }

        @media (max-width: 1024px) {
          .wheel-title {
            font-size: 3rem;
          }
          
          .punishments-list {
            width: 300px;
          }
        }
      `}</style>
    </div>
  );
}