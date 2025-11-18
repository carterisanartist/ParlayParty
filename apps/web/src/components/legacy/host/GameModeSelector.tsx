'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type GameMode = 'classic' | 'speed' | 'team' | 'marathon' | 'tournament';

interface GameModeSelectorProps {
  selectedMode: GameMode;
  onModeSelect: (mode: GameMode) => void;
}

interface ModeInfo {
  id: GameMode;
  name: string;
  icon: string;
  description: string;
  features: string[];
  gradient: string;
  available: boolean;
}

const gameModes: ModeInfo[] = [
  {
    id: 'classic',
    name: 'CLASSIC',
    icon: '🎮',
    description: 'The original Parlay Party experience',
    features: ['Full videos', 'Standard scoring', 'Punishment wheel'],
    gradient: 'from-cyan-600 to-blue-600',
    available: true
  },
  {
    id: 'speed',
    name: 'SPEED MODE',
    icon: '⚡',
    description: 'Fast-paced rounds with time bonuses',
    features: ['30-second clips', '10-second parlays', 'Speed bonuses', '10 rapid rounds'],
    gradient: 'from-yellow-600 to-orange-600',
    available: true
  },
  {
    id: 'team',
    name: 'TEAM BATTLE',
    icon: '👥',
    description: 'Work together to dominate',
    features: ['2-4 teams', 'Shared scoring', 'Team chat', 'MVP awards'],
    gradient: 'from-purple-600 to-pink-600',
    available: true
  },
  {
    id: 'marathon',
    name: 'MARATHON',
    icon: '🏃',
    description: 'Endless fun with video queue',
    features: ['Continuous play', 'Checkpoint saves', 'Endurance bonuses'],
    gradient: 'from-green-600 to-teal-600',
    available: false
  },
  {
    id: 'tournament',
    name: 'TOURNAMENT',
    icon: '🏆',
    description: 'Competitive bracket system',
    features: ['Elimination rounds', 'Spectator mode', 'Prize pools'],
    gradient: 'from-red-600 to-pink-600',
    available: false
  }
];

export function GameModeSelector({ selectedMode, onModeSelect }: GameModeSelectorProps) {
  const [hoveredMode, setHoveredMode] = useState<GameMode | null>(null);
  
  return (
    <div className="space-y-6">
      <h2 className="font-display text-3xl glow-cyan text-center">
        SELECT GAME MODE
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gameModes.map((mode) => {
          const isSelected = selectedMode === mode.id;
          const isHovered = hoveredMode === mode.id;
          const isAvailable = mode.available;
          
          return (
            <motion.button
              key={mode.id}
              onClick={() => isAvailable && onModeSelect(mode.id)}
              onHoverStart={() => setHoveredMode(mode.id)}
              onHoverEnd={() => setHoveredMode(null)}
              disabled={!isAvailable}
              whileHover={isAvailable ? { scale: 1.05 } : {}}
              whileTap={isAvailable ? { scale: 0.95 } : {}}
              className={`
                relative p-6 rounded-xl transition-all
                ${isAvailable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
                ${isSelected ? 'ring-4 ring-accent-1' : ''}
              `}
              style={{
                background: isSelected || isHovered
                  ? `linear-gradient(135deg, ${mode.gradient.split(' ')[1]} 0%, ${mode.gradient.split(' ')[3]} 100%)`
                  : 'rgba(37, 37, 37, 0.8)',
                border: '2px solid',
                borderColor: isSelected ? 'var(--accent-1)' : 'rgba(182, 194, 225, 0.2)'
              }}
            >
              {/* Mode Icon */}
              <div className="text-5xl mb-4">{mode.icon}</div>
              
              {/* Mode Name */}
              <h3 className={`font-display text-2xl mb-2 ${isSelected ? 'glow-white' : ''}`}>
                {mode.name}
              </h3>
              
              {/* Description */}
              <p className="text-sm text-fg-subtle mb-4">
                {mode.description}
              </p>
              
              {/* Features */}
              <div className="space-y-1">
                {mode.features.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center text-xs text-left"
                  >
                    <span className="mr-2">•</span>
                    <span className={isSelected || isHovered ? 'text-white' : 'text-fg-subtle'}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Coming Soon Badge */}
              {!isAvailable && (
                <div className="absolute top-2 right-2 bg-bg-0/90 px-2 py-1 rounded text-xs text-warning">
                  COMING SOON
                </div>
              )}
              
              {/* Selected Indicator */}
              {isSelected && (
                <motion.div
                  layoutId="selectedMode"
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  style={{
                    boxShadow: '0 0 30px rgba(0, 255, 247, 0.6)'
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
      
      {/* Mode Preview */}
      <AnimatePresence mode="wait">
        {hoveredMode && gameModes.find(m => m.id === hoveredMode)?.available && (
          <motion.div
            key={hoveredMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6 p-4 bg-bg-0/50 rounded-lg text-center"
          >
            <p className="text-sm text-fg-subtle">
              {hoveredMode === 'speed' && '⚡ Get ready for lightning-fast rounds where every second counts!'}
              {hoveredMode === 'classic' && '🎮 The tried and true Parlay Party experience you know and love.'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
