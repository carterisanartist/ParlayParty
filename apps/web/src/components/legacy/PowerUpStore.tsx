'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Socket } from 'socket.io-client';
import type { Player } from '@parlay-party/shared';

export enum PowerUpType {
  DOUBLE_POINTS = 'double_points',
  STEAL_POINTS = 'steal_points',
  IMMUNITY = 'immunity',
  REVEAL_HINT = 'reveal_hint',
  TIME_FREEZE = 'time_freeze',
  COMBO_BREAKER = 'combo_breaker'
}

interface PowerUp {
  id: string;
  type: PowerUpType;
  name: string;
  description: string;
  icon: string;
  color: string;
  cost: number;
  duration?: number;
  cooldown: number;
}

interface PlayerPowerUp {
  powerUp: PowerUp;
  quantity: number;
  cooldownRemaining?: number;
}

interface PowerUpStoreProps {
  socket: Socket;
  currentPlayer: Player;
  isOpen: boolean;
  onClose: () => void;
  onUse?: (type: PowerUpType, targetPlayerId?: string) => void;
}

const POWER_UP_DATA: PowerUp[] = [
  {
    id: 'double_points',
    type: PowerUpType.DOUBLE_POINTS,
    name: 'Double Points',
    description: 'Your next correct parlay earns 2x points',
    icon: '⚡',
    color: '#FFD700',
    cost: 5,
    cooldown: 60
  },
  {
    id: 'steal_points',
    type: PowerUpType.STEAL_POINTS,
    name: 'Point Thief',
    description: 'Steal 2 points from the current leader',
    icon: '🦹',
    color: '#FF4444',
    cost: 8,
    cooldown: 120
  },
  {
    id: 'immunity',
    type: PowerUpType.IMMUNITY,
    name: 'Immunity Shield',
    description: 'Protected from penalties for 30 seconds',
    icon: '🛡️',
    color: '#00D4FF',
    cost: 6,
    duration: 30,
    cooldown: 90
  },
  {
    id: 'reveal_hint',
    type: PowerUpType.REVEAL_HINT,
    name: 'Crystal Ball',
    description: 'Reveals one upcoming parlay category',
    icon: '🔮',
    color: '#8B00FF',
    cost: 4,
    cooldown: 45
  },
  {
    id: 'time_freeze',
    type: PowerUpType.TIME_FREEZE,
    name: 'Time Freeze',
    description: 'Get 5 extra seconds for your next decision',
    icon: '⏱️',
    color: '#00FF00',
    cost: 3,
    cooldown: 30
  },
  {
    id: 'combo_breaker',
    type: PowerUpType.COMBO_BREAKER,
    name: 'Combo Breaker',
    description: 'Reset an opponent\'s combo streak',
    icon: '💥',
    color: '#FF6B6B',
    cost: 7,
    cooldown: 90
  }
];

export function PowerUpStore({ socket, currentPlayer, isOpen, onClose, onUse }: PowerUpStoreProps) {
  const [activeTab, setActiveTab] = useState<'shop' | 'inventory'>('shop');
  const [inventory, setInventory] = useState<Map<PowerUpType, PlayerPowerUp>>(new Map());
  const [selectedPowerUp, setSelectedPowerUp] = useState<PowerUp | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeEffects, setActiveEffects] = useState<Set<PowerUpType>>(new Set());

  useEffect(() => {
    if (!isOpen) return;

    // Get player inventory
    socket.emit('powerups:getInventory');
    socket.emit('powerups:getActiveEffects');

    socket.on('powerups:inventory', ({ inventory: inv }) => {
      const newInventory = new Map<PowerUpType, PlayerPowerUp>();
      inv.forEach((item: PlayerPowerUp) => {
        newInventory.set(item.powerUp.type, item);
      });
      setInventory(newInventory);
    });

    socket.on('powerups:activeEffects', ({ effects }) => {
      setActiveEffects(new Set(effects.map((e: any) => e.type)));
    });

    socket.on('powerups:purchased', ({ powerUp, newScore }) => {
      setInventory(prev => {
        const newInv = new Map(prev);
        const existing = newInv.get(powerUp.type);
        if (existing) {
          existing.quantity++;
        } else {
          newInv.set(powerUp.type, { powerUp, quantity: 1 });
        }
        return newInv;
      });
      setLoading(false);
      setError('');
    });

    socket.on('powerups:error', ({ message }) => {
      setError(message);
      setLoading(false);
    });

    socket.on('powerups:used', ({ type, message }) => {
      setInventory(prev => {
        const newInv = new Map(prev);
        const item = newInv.get(type);
        if (item && item.quantity > 0) {
          item.quantity--;
        }
        return newInv;
      });
      onUse?.(type);
      setError('');
    });

    // Update cooldowns
    const cooldownInterval = setInterval(() => {
      socket.emit('powerups:getCooldowns');
    }, 1000);

    socket.on('powerups:cooldowns', ({ cooldowns }) => {
      setInventory(prev => {
        const newInv = new Map(prev);
        Object.entries(cooldowns).forEach(([type, remaining]) => {
          const item = newInv.get(type as PowerUpType);
          if (item) {
            item.cooldownRemaining = remaining as number;
          }
        });
        return newInv;
      });
    });

    return () => {
      clearInterval(cooldownInterval);
      socket.off('powerups:inventory');
      socket.off('powerups:activeEffects');
      socket.off('powerups:purchased');
      socket.off('powerups:error');
      socket.off('powerups:used');
      socket.off('powerups:cooldowns');
    };
  }, [isOpen, socket, onUse]);

  const handlePurchase = (powerUp: PowerUp) => {
    if (loading || currentPlayer.scoreTotal < powerUp.cost) return;
    
    setLoading(true);
    setError('');
    socket.emit('powerups:purchase', { type: powerUp.type });
  };

  const handleUse = (type: PowerUpType) => {
    const item = inventory.get(type);
    if (!item || item.quantity <= 0 || item.cooldownRemaining) return;

    // Some power-ups need target selection
    if (type === PowerUpType.STEAL_POINTS || type === PowerUpType.COMBO_BREAKER) {
      // TODO: Implement target selection UI
      socket.emit('powerups:getPlayers');
      return;
    }

    socket.emit('powerups:use', { type });
  };

  const canAfford = (cost: number) => currentPlayer.scoreTotal >= cost;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-4xl max-h-[80vh] overflow-hidden"
          >
            <div className="card-neon bg-bg-0/95 backdrop-blur-md">
              {/* Header */}
              <div className="p-6 border-b border-fg-subtle/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-4xl glow-violet">POWER-UP SHOP</h2>
                    <p className="text-fg-subtle mt-1">
                      Your Points: <span className="text-accent-1 font-bold">{currentPlayer.scoreTotal}</span>
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-3xl hover:text-danger transition-colors"
                  >
                    ✕
                  </button>
                </div>
                
                {/* Tabs */}
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => setActiveTab('shop')}
                    className={`
                      px-4 py-2 rounded-lg font-semibold transition-all
                      ${activeTab === 'shop' 
                        ? 'bg-accent-3 text-white' 
                        : 'bg-bg-1 text-fg-subtle hover:text-fg-0'
                      }
                    `}
                  >
                    🛒 Shop
                  </button>
                  <button
                    onClick={() => setActiveTab('inventory')}
                    className={`
                      px-4 py-2 rounded-lg font-semibold transition-all
                      ${activeTab === 'inventory' 
                        ? 'bg-accent-1 text-bg-0' 
                        : 'bg-bg-1 text-fg-subtle hover:text-fg-0'
                      }
                    `}
                  >
                    🎒 Inventory ({Array.from(inventory.values()).reduce((sum, item) => sum + item.quantity, 0)})
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[50vh]">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-4 bg-danger/20 border border-danger rounded-lg text-danger"
                  >
                    {error}
                  </motion.div>
                )}

                {activeTab === 'shop' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {POWER_UP_DATA.map((powerUp) => {
                      const owned = inventory.get(powerUp.type)?.quantity || 0;
                      const affordable = canAfford(powerUp.cost);
                      
                      return (
                        <motion.div
                          key={powerUp.id}
                          whileHover={{ scale: affordable ? 1.02 : 1 }}
                          className={`
                            relative p-4 rounded-xl border-2 transition-all cursor-pointer
                            ${affordable 
                              ? 'border-fg-subtle/30 hover:border-accent-1' 
                              : 'border-fg-subtle/10 opacity-50 cursor-not-allowed'
                            }
                          `}
                          style={{
                            background: affordable 
                              ? `linear-gradient(135deg, ${powerUp.color}10 0%, ${powerUp.color}20 100%)`
                              : 'rgba(37, 37, 37, 0.5)'
                          }}
                          onClick={() => affordable && setSelectedPowerUp(powerUp)}
                        >
                          <div className="text-center mb-3">
                            <div className="text-4xl mb-2">{powerUp.icon}</div>
                            <h3 className="font-bold text-lg" style={{ color: powerUp.color }}>
                              {powerUp.name}
                            </h3>
                          </div>
                          
                          <p className="text-sm text-fg-subtle mb-3">
                            {powerUp.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-lg">
                              {powerUp.cost} pts
                            </span>
                            {owned > 0 && (
                              <span className="text-sm bg-accent-1 text-bg-0 px-2 py-1 rounded">
                                Own: {owned}
                              </span>
                            )}
                          </div>
                          
                          {powerUp.duration && (
                            <p className="text-xs text-fg-subtle mt-2">
                              Duration: {powerUp.duration}s
                            </p>
                          )}
                          
                          <motion.button
                            whileHover={affordable ? { scale: 1.05 } : {}}
                            whileTap={affordable ? { scale: 0.95 } : {}}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePurchase(powerUp);
                            }}
                            disabled={!affordable || loading}
                            className={`
                              w-full mt-3 py-2 rounded-lg font-semibold transition-all
                              ${affordable 
                                ? 'bg-accent-3 text-white hover:bg-accent-3/80' 
                                : 'bg-bg-1 text-fg-subtle cursor-not-allowed'
                              }
                            `}
                          >
                            {loading ? 'Purchasing...' : 'Buy'}
                          </motion.button>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from(inventory.entries()).map(([type, item]) => {
                      const isActive = activeEffects.has(type);
                      const onCooldown = (item.cooldownRemaining || 0) > 0;
                      
                      return (
                        <motion.div
                          key={type}
                          whileHover={{ scale: item.quantity > 0 && !onCooldown ? 1.02 : 1 }}
                          className={`
                            relative p-4 rounded-xl border-2
                            ${item.quantity > 0 
                              ? 'border-accent-1/50' 
                              : 'border-fg-subtle/10 opacity-50'
                            }
                            ${isActive ? 'ring-2 ring-accent-1 ring-offset-2 ring-offset-bg-0' : ''}
                          `}
                          style={{
                            background: `linear-gradient(135deg, ${item.powerUp.color}10 0%, ${item.powerUp.color}20 100%)`
                          }}
                        >
                          <div className="text-center mb-3">
                            <div className="text-4xl mb-2">{item.powerUp.icon}</div>
                            <h3 className="font-bold text-lg" style={{ color: item.powerUp.color }}>
                              {item.powerUp.name}
                            </h3>
                            <p className="text-xl font-bold">×{item.quantity}</p>
                          </div>
                          
                          {isActive && (
                            <p className="text-sm text-success mb-2">
                              ACTIVE
                            </p>
                          )}
                          
                          {onCooldown && (
                            <p className="text-sm text-warning mb-2">
                              Cooldown: {item.cooldownRemaining}s
                            </p>
                          )}
                          
                          <motion.button
                            whileHover={item.quantity > 0 && !onCooldown ? { scale: 1.05 } : {}}
                            whileTap={item.quantity > 0 && !onCooldown ? { scale: 0.95 } : {}}
                            onClick={() => handleUse(type)}
                            disabled={item.quantity <= 0 || onCooldown}
                            className={`
                              w-full py-2 rounded-lg font-semibold transition-all
                              ${item.quantity > 0 && !onCooldown
                                ? 'bg-accent-1 text-bg-0 hover:bg-accent-1/80' 
                                : 'bg-bg-1 text-fg-subtle cursor-not-allowed'
                              }
                            `}
                          >
                            {onCooldown ? `Wait ${item.cooldownRemaining}s` : 'Use'}
                          </motion.button>
                        </motion.div>
                      );
                    })}
                    
                    {inventory.size === 0 && (
                      <div className="col-span-full text-center py-12 text-fg-subtle">
                        <p className="text-xl mb-2">No power-ups yet!</p>
                        <p>Visit the shop to purchase some.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
