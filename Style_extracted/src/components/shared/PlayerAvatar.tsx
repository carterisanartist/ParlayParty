import { Users } from 'lucide-react';

interface PlayerAvatarProps {
  name: string;
  image?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function PlayerAvatar({ name, image, size = 'medium', className = '' }: PlayerAvatarProps) {
  const initial = name.charAt(0).toUpperCase();
  
  // Pizza Hut easter egg
  const isPizzaHut = name.toLowerCase().includes('pizza') || name.toLowerCase().includes('hut');
  
  const sizeClasses = {
    small: 'w-10 h-10 text-lg',
    medium: 'w-12 h-12 text-xl',
    large: 'w-16 h-16 text-2xl'
  };

  const iconSizes = {
    small: 'w-5 h-5',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  return (
    <>
      <div className={`player-avatar ${sizeClasses[size]} ${isPizzaHut ? 'pizza-hut-glow' : ''} ${className}`}>
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover rounded-full" />
        ) : isPizzaHut ? (
          <span className="text-2xl">🍕</span>
        ) : (
          <Users className={`${iconSizes[size]} text-white/40`} />
        )}
      </div>

      <style>{`
        .player-avatar {
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Orbitron', sans-serif;
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.4);
          box-shadow: 
            0 0 20px rgba(255, 255, 255, 0.3),
            inset 0 0 15px rgba(255, 255, 255, 0.1);
          flex-shrink: 0;
        }

        .pizza-hut-glow {
          background: linear-gradient(135deg, #E31837, #FFC72C);
          box-shadow: 
            0 0 30px rgba(227, 24, 55, 0.6),
            0 0 50px rgba(255, 199, 44, 0.4);
          animation: pizza-pulse 2s ease-in-out infinite;
        }

        @keyframes pizza-pulse {
          0%, 100% {
            box-shadow: 
              0 0 30px rgba(227, 24, 55, 0.6),
              0 0 50px rgba(255, 199, 44, 0.4);
          }
          50% {
            box-shadow: 
              0 0 40px rgba(227, 24, 55, 0.8),
              0 0 70px rgba(255, 199, 44, 0.6);
          }
        }
      `}</style>
    </>
  );
}