'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { Player } from '@parlay-party/shared';

interface PlayerAvatarProps {
  player: Player;
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}

export const PlayerAvatar = React.memo<PlayerAvatarProps>(({ player, size = 'md', glow = false }) => {
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

  // Use relative URL since logo is served from same server
  const pizzaHutLogo = '/pizza-hut-logo';
  const shouldUsePizzaHut = isPizzaHutName(player.name);
  
  console.log('🍕 Pizza check:', { name: player.name, shouldUsePizzaHut, logoUrl: pizzaHutLogo });

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      className={`${sizeClasses[size]} ${glowClass} rounded-full flex items-center justify-center bg-bg-1 font-bold relative`}
    >
      {shouldUsePizzaHut ? (
        <img
          src={pizzaHutLogo}
          alt="Pizza Hut Logo"
          className="w-full h-full rounded-full object-cover bg-white p-1"
          onError={(e) => {
            console.log('Pizza Hut logo failed to load for', player.name);
            e.currentTarget.outerHTML = '<span class="text-2xl">🍕</span>';
          }}
        />
      ) : player.avatarUrl ? (
        <img
          src={player.avatarUrl}
          alt={player.name}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <span className="text-accent-1">
          {player.name.charAt(0).toUpperCase()}
        </span>
      )}
      
      {player.isHost && (
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent-2 rounded-full flex items-center justify-center text-xs">
          👑
        </div>
      )}
    </motion.div>
  );
});

