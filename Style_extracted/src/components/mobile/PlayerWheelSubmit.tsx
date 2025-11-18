import { useState } from 'react';
import { motion } from 'motion/react';
import { Send, Check, Dices } from 'lucide-react';

interface PlayerWheelSubmitProps {
  playerName: string;
  onSubmit: (punishment: string) => void;
}

export default function PlayerWheelSubmit({ playerName, onSubmit }: PlayerWheelSubmitProps) {
  const [punishment, setPunishment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Large pool of punishment examples
  const allPunishmentExamples = [
    'Take a shot',
    'Do 20 push-ups',
    'Post an embarrassing photo',
    'Sing karaoke',
    'Dance for 30 seconds',
    'Tell your most embarrassing story',
    'Let someone draw on your face',
    'Wear a silly hat for 1 hour',
    'Do your best celebrity impression',
    'Speak in an accent for 5 minutes',
    'Let group choose your next profile pic',
    'Text your crush right now',
    'Call your mom and sing to her',
    'Do 10 burpees',
    'Eat something spicy',
    'Read your last text out loud',
    'Show your camera roll',
    'Let someone read your texts',
    'Post a story saying you lost',
    'Do a handstand',
    'Plank for 1 minute',
    'Give someone a piggyback ride',
    'Speak only in questions for 5 min',
    'No phone for 30 minutes',
  ];

  // Function to get random examples
  const getRandomExamples = (count: number = 6) => {
    const shuffled = [...allPunishmentExamples].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  // State for current batch of examples
  const [examplePunishments, setExamplePunishments] = useState(() => getRandomExamples(6));

  // Function to re-roll examples
  const rerollExamples = () => {
    setExamplePunishments(getRandomExamples(6));
  };

  const handleSubmit = () => {
    if (punishment.trim()) {
      setSubmitted(true);
      onSubmit(punishment);
    }
  };

  const handleExampleClick = (example: string) => {
    setPunishment(example);
  };

  if (submitted) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6" style={{ background: '#000000' }}>
        {/* Import Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

        {/* Background Gradient */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 1000px 600px at 50% 50%, #0A001A 0%, #000000 70%)',
            zIndex: 1,
          }}
        />

        {/* Soft Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, #000000 100%)',
            zIndex: 2,
          }}
        />

        {/* Success glow flare */}
        <div 
          className="absolute w-[600px] h-[600px] top-1/2 left-1/2 pointer-events-none"
          style={{
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(180, 0, 255, 0.4) 0%, rgba(180, 0, 255, 0.15) 30%, transparent 70%)',
            filter: 'blur(80px)',
            zIndex: 3,
          }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-md w-full text-center">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, duration: 0.6 }}
            className="success-icon-container"
          >
            <Check className="w-16 h-16" strokeWidth={2.5} style={{ filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))' }} />
          </motion.div>

          {/* Title */}
          <motion.h1
            className="success-title"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            SUBMITTED!
          </motion.h1>

          {/* Submitted Punishment Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="frosted-card"
          >
            <p className="card-label" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              Your punishment
            </p>
            <p className="card-text" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              "{punishment}"
            </p>
          </motion.div>

          {/* Waiting Text */}
          <motion.p
            className="waiting-text"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Waiting for the wheel to spin...
          </motion.p>
        </div>

        <style>{`
          .success-icon-container {
            position: relative;
            width: 140px;
            height: 140px;
            margin: 0 auto 2rem;
            border-radius: 50%;
            background: linear-gradient(135deg, #B400FF, #FF00E6);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            box-shadow: 
              0 0 40px rgba(180, 0, 255, 0.7),
              0 0 80px rgba(255, 0, 230, 0.5),
              0 0 120px rgba(180, 0, 255, 0.3);
          }

          .success-title {
            font-size: 2.5rem;
            font-weight: 900;
            color: #B400FF;
            text-shadow: 
              0 0 20px rgba(180, 0, 255, 0.9),
              0 0 40px rgba(180, 0, 255, 0.7),
              0 0 60px rgba(255, 0, 230, 0.5);
            margin-bottom: 2rem;
            letter-spacing: 0.05em;
          }

          .frosted-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 
              0 8px 32px rgba(0, 0, 0, 0.4),
              inset 0 0 20px rgba(180, 0, 255, 0.05);
          }

          .card-label {
            font-size: 0.875rem;
            color: rgba(255, 255, 255, 0.6);
            margin-bottom: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
          }

          .card-text {
            font-size: 1.125rem;
            color: white;
            line-height: 1.6;
          }

          .waiting-text {
            font-size: 1rem;
            color: rgba(255, 255, 255, 0.5);
            margin-top: 2rem;
            font-weight: 400;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col" style={{ background: '#000000' }}>
      {/* Import Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Background Gradient */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 1000px 800px at 50% 30%, #0A001A 0%, #000000 60%)',
          zIndex: 1,
        }}
      />

      {/* Soft Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, #000000 100%)',
          zIndex: 2,
        }}
      />

      {/* Subtle noise texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          opacity: 0.02,
          zIndex: 3,
        }}
      />

      {/* Radial glow flares */}
      <div 
        className="absolute w-[500px] h-[500px] pointer-events-none"
        style={{
          top: '10%',
          left: '-15%',
          background: 'radial-gradient(circle, rgba(180, 0, 255, 0.15) 0%, rgba(180, 0, 255, 0.05) 40%, transparent 70%)',
          filter: 'blur(60px)',
          zIndex: 4,
        }}
      />
      <div 
        className="absolute w-[400px] h-[400px] pointer-events-none"
        style={{
          bottom: '15%',
          right: '-10%',
          background: 'radial-gradient(circle, rgba(255, 0, 230, 0.12) 0%, rgba(255, 0, 230, 0.04) 40%, transparent 70%)',
          filter: 'blur(60px)',
          zIndex: 4,
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 flex-1 flex flex-col justify-center max-w-md mx-auto w-full px-6 py-8">
        
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="main-title" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            PUNISHMENT WHEEL
          </h1>
          <p className="subtitle" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            Submit a punishment for the loser
          </p>
        </motion.div>

        {/* Examples Card */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="glass-card">
            <h3 className="card-header" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              EXAMPLES
            </h3>
            <div className="examples-grid">
              {examplePunishments.map((example, i) => (
                <motion.button
                  key={i}
                  className="example-pill"
                  onClick={() => handleExampleClick(example)}
                  whileTap={{ scale: 0.95 }}
                  style={{ fontFamily: 'Rajdhani, sans-serif' }}
                >
                  {example}
                </motion.button>
              ))}
            </div>
            <button
              className="reroll-button"
              onClick={rerollExamples}
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              <Dices className="w-4 h-4" />
              REROLL
            </button>
          </div>
        </motion.div>

        {/* Input Card */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="glass-card">
            <label className="input-label" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              YOUR PUNISHMENT
            </label>
            <textarea
              value={punishment}
              onChange={(e) => setPunishment(e.target.value.slice(0, 100))}
              placeholder="Be creative and fair..."
              className="punishment-input"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
              rows={3}
            />
            <div className="char-counter" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              {punishment.length}/100
            </div>
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <button
            className={`submit-button ${!punishment.trim() ? 'submit-button-disabled' : ''}`}
            onClick={handleSubmit}
            disabled={!punishment.trim()}
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            <div className="submit-button-glow" />
            <div className="submit-button-content">
              <Send className="w-5 h-5" />
              <span>SUBMIT</span>
            </div>
          </button>
        </motion.div>
      </div>

      <style>{`
        /* Header Styles */
        .main-title {
          font-size: 2rem;
          font-weight: 900;
          color: white;
          text-shadow: 
            0 0 15px rgba(180, 0, 255, 0.8),
            0 0 30px rgba(180, 0, 255, 0.5),
            0 0 45px rgba(255, 0, 230, 0.3);
          letter-spacing: 0.08em;
          margin-bottom: 0.5rem;
        }

        .subtitle {
          font-size: 1rem;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.7);
          letter-spacing: 0.02em;
        }

        /* Glass Card */
        .glass-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.25rem;
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.3),
            inset 0 0 20px rgba(180, 0, 255, 0.03);
        }

        .card-header {
          font-size: 0.75rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.6);
          letter-spacing: 0.15em;
          margin-bottom: 1rem;
        }

        /* Examples Grid */
        .examples-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .example-pill {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: white;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          text-align: center;
          min-height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .example-pill:hover {
          background: rgba(180, 0, 255, 0.15);
          border-color: rgba(180, 0, 255, 0.4);
          box-shadow: 0 0 20px rgba(180, 0, 255, 0.2);
        }

        .example-pill:active {
          transform: scale(0.95);
        }

        /* Reroll Button */
        .reroll-button {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: white;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }

        .reroll-button:hover {
          background: rgba(180, 0, 255, 0.15);
          border-color: rgba(180, 0, 255, 0.4);
          box-shadow: 0 0 20px rgba(180, 0, 255, 0.2);
        }

        .reroll-button:active {
          transform: scale(0.95);
        }

        /* Input Styles */
        .input-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.7);
          letter-spacing: 0.15em;
          margin-bottom: 0.75rem;
        }

        .punishment-input {
          width: 100%;
          background: rgba(0, 0, 0, 0.4);
          border: 1.5px solid rgba(255, 255, 255, 0.15);
          border-radius: 10px;
          padding: 0.875rem;
          font-size: 1rem;
          font-weight: 500;
          color: white;
          resize: none;
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          line-height: 1.6;
        }

        .punishment-input::placeholder {
          color: rgba(255, 255, 255, 0.3);
          font-weight: 400;
        }

        .punishment-input:focus {
          outline: none;
          border-color: rgba(180, 0, 255, 0.6);
          background: rgba(0, 0, 0, 0.5);
          box-shadow: 
            0 0 0 3px rgba(180, 0, 255, 0.1),
            0 0 25px rgba(180, 0, 255, 0.25);
        }

        .char-counter {
          text-align: right;
          font-size: 0.75rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.4);
          margin-top: 0.5rem;
        }

        /* Submit Button */
        .submit-button {
          position: relative;
          width: 100%;
          min-height: 64px;
          background: transparent;
          border: 2px solid transparent;
          border-radius: 12px;
          font-size: 1.125rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: white;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .submit-button::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 12px;
          padding: 2px;
          background: linear-gradient(135deg, #B400FF, #ffffff, #B400FF);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: border-flow 3s linear infinite;
          background-size: 200% 200%;
        }

        @keyframes border-flow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .submit-button-glow {
          position: absolute;
          inset: -2px;
          background: linear-gradient(135deg, rgba(180, 0, 255, 0.4), rgba(255, 255, 255, 0.3));
          border-radius: 12px;
          filter: blur(15px);
          opacity: 0;
          transition: opacity 0.3s ease;
          animation: button-pulse 2s ease-in-out infinite;
        }

        @keyframes button-pulse {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }

        .submit-button:hover .submit-button-glow {
          opacity: 0.8;
        }

        .submit-button-content {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(10px);
          border-radius: 10px;
          height: 100%;
          padding: 1rem;
        }

        .submit-button:hover {
          transform: translateY(-2px);
        }

        .submit-button:active {
          transform: translateY(0);
        }

        .submit-button-disabled {
          opacity: 0.4;
          cursor: not-allowed;
          pointer-events: none;
        }

        .submit-button-disabled .submit-button-glow {
          animation: none;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}