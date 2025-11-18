import { motion } from 'motion/react';

interface EventCounterProps {
  label: string;
  count: number;
  icon?: React.ReactNode;
  color?: 'cyan' | 'magenta' | 'violet';
}

export function EventCounter({ label, count, icon, color = 'cyan' }: EventCounterProps) {
  const colorVariants = {
    cyan: 'event-counter-cyan',
    magenta: 'event-counter-magenta',
    violet: 'event-counter-violet'
  };

  return (
    <>
      <motion.div
        className={`event-counter ${colorVariants[color]}`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {icon && <div className="event-counter-icon">{icon}</div>}
        <div className="event-counter-content">
          <p className="event-counter-count" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            {count}
          </p>
          <p className="event-counter-label" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            {label}
          </p>
        </div>
      </motion.div>

      <style>{`
        .event-counter {
          background: rgba(15, 15, 15, 0.7);
          backdrop-filter: blur(20px);
          border: 1.5px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          position: relative;
        }

        .event-counter-cyan {
          box-shadow: 
            0 0 20px rgba(0, 255, 255, 0.2),
            inset 0 0 20px rgba(0, 0, 0, 0.5);
        }

        .event-counter-cyan::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 12px;
          padding: 1.5px;
          background: linear-gradient(135deg, #00FFFF 0%, #B400FF 100%);
          -webkit-mask: 
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0.3;
          pointer-events: none;
        }

        .event-counter-magenta {
          box-shadow: 
            0 0 20px rgba(255, 0, 230, 0.2),
            inset 0 0 20px rgba(0, 0, 0, 0.5);
        }

        .event-counter-magenta::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 12px;
          padding: 1.5px;
          background: linear-gradient(135deg, #FF00E6 0%, #B400FF 100%);
          -webkit-mask: 
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0.3;
          pointer-events: none;
        }

        .event-counter-violet {
          box-shadow: 
            0 0 20px rgba(180, 0, 255, 0.2),
            inset 0 0 20px rgba(0, 0, 0, 0.5);
        }

        .event-counter-violet::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 12px;
          padding: 1.5px;
          background: linear-gradient(135deg, #B400FF 0%, #FF00E6 100%);
          -webkit-mask: 
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0.3;
          pointer-events: none;
        }

        .event-counter-icon {
          color: #00FFFF;
          filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.6));
        }

        .event-counter-content {
          flex: 1;
        }

        .event-counter-count {
          font-size: 1.5rem;
          color: white;
          margin: 0;
          line-height: 1;
        }

        .event-counter-label {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
          margin: 0;
          margin-top: 0.25rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      `}</style>
    </>
  );
}
