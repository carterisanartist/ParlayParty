'use client';

import { motion } from 'framer-motion';
import type { Player } from '@parlay-party/shared';

interface PlayerAvatarProps {
  player: Player;
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}

export function PlayerAvatar({ player, size = 'md', glow = false }: PlayerAvatarProps) {
  const sizeClasses = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-24 h-24 text-4xl',
  };

  const glowClass = glow ? 'neon-border' : 'border-2 border-fg-subtle';

  // Easter egg: Bart/Matthew/Matty B gets Pizza Hut logo
  const isPizzaHutName = (name: string) => {
    const lowerName = name.toLowerCase().replace(/\s+/g, '');
    return lowerName.includes('bart') || 
           lowerName.includes('matthew') || 
           lowerName.includes('mattyb') ||
           lowerName.includes('mattib') ||
           lowerName === 'matty' ||
           lowerName === 'matt';
  };

  const pizzaHutLogo = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Pizza_Hut_logo.svg/512px-Pizza_Hut_logo.svg.png';
  const shouldUsePizzaHut = isPizzaHutName(player.name);
  const avatarUrl = shouldUsePizzaHut ? pizzaHutLogo : player.avatarUrl;

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      className={`${sizeClasses[size]} ${glowClass} rounded-full flex items-center justify-center bg-bg-1 font-bold relative`}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={player.name}
          className="w-full h-full rounded-full object-cover"
          onError={(e) => {
            // Fallback to initials if image fails to load
            if (shouldUsePizzaHut) {
              console.log('Pizza Hut logo failed to load for', player.name);
              e.currentTarget.style.display = 'none';
            }
          }}
        />
      ) : (
        <span className="text-accent-1">
          {player.name.charAt(0).toUpperCase()}
        </span>
      )}
      
      {shouldUsePizzaHut && !avatarUrl && (
        <span className="text-2xl">🍕</span>
      )}
      
      {player.isHost && (
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent-2 rounded-full flex items-center justify-center text-xs">
          👑
        </div>
      )}
    </motion.div>
  );
}

