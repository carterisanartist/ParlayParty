import { motion } from 'motion/react';

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  className?: string;
}

export function ProgressBar({ progress, label, className = '' }: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <>
      <div className={`progress-container ${className}`}>
        {label && (
          <div className="progress-label" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            {label}
            <span className="progress-percentage">{Math.round(clampedProgress)}%</span>
          </div>
        )}
        <div className="progress-track">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${clampedProgress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      <style>{`
        .progress-container {
          width: 100%;
        }

        .progress-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .progress-percentage {
          font-size: 0.75rem;
          color: #00FFFF;
          text-shadow: 0 0 10px rgba(0, 255, 255, 0.6);
        }

        .progress-track {
          width: 100%;
          height: 10px;
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          overflow: hidden;
          position: relative;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #FF00E6 0%, #B400FF 50%, #00FFFF 100%);
          border-radius: 8px;
          box-shadow: 
            0 0 15px rgba(0, 255, 255, 0.5),
            0 0 30px rgba(255, 0, 230, 0.3);
          position: relative;
          animation: progress-shimmer 2s linear infinite;
        }

        @keyframes progress-shimmer {
          0% {
            filter: brightness(1);
          }
          50% {
            filter: brightness(1.3);
          }
          100% {
            filter: brightness(1);
          }
        }
      `}</style>
    </>
  );
}
