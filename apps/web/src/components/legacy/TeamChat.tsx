'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Socket } from 'socket.io-client';
import type { Player } from '@parlay-party/shared';
import type { Team } from './TeamSetup';

interface TeamChatProps {
  socket: Socket;
  currentPlayer: Player;
  team: Team;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: Date;
  isSystem?: boolean;
}

export function TeamChat({ 
  socket, 
  currentPlayer, 
  team, 
  isMinimized = false, 
  onToggleMinimize 
}: TeamChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Scroll to bottom on new messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Team chat event listeners
    socket.on('team:message', ({ message }: { message: ChatMessage }) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('team:typing', ({ playerId, playerName }) => {
      if (playerId !== currentPlayer.id) {
        setIsTyping(prev => new Set(prev).add(playerName));
        
        // Clear typing indicator after 3 seconds
        setTimeout(() => {
          setIsTyping(prev => {
            const next = new Set(prev);
            next.delete(playerName);
            return next;
          });
        }, 3000);
      }
    });

    socket.on('team:playerJoined', ({ playerName }) => {
      const systemMessage: ChatMessage = {
        id: `system-${Date.now()}`,
        playerId: 'system',
        playerName: 'System',
        message: `${playerName} joined the team!`,
        timestamp: new Date(),
        isSystem: true
      };
      setMessages(prev => [...prev, systemMessage]);
    });

    socket.on('team:playerLeft', ({ playerName }) => {
      const systemMessage: ChatMessage = {
        id: `system-${Date.now()}`,
        playerId: 'system',
        playerName: 'System',
        message: `${playerName} left the team.`,
        timestamp: new Date(),
        isSystem: true
      };
      setMessages(prev => [...prev, systemMessage]);
    });

    return () => {
      socket.off('team:message');
      socket.off('team:typing');
      socket.off('team:playerJoined');
      socket.off('team:playerLeft');
    };
  }, [socket, currentPlayer.id]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const message: ChatMessage = {
      id: `${currentPlayer.id}-${Date.now()}`,
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      message: inputMessage.trim(),
      timestamp: new Date()
    };

    socket.emit('team:sendMessage', { 
      teamId: team.id, 
      message 
    });

    setInputMessage('');
  };

  const handleTyping = () => {
    socket.emit('team:typing', { 
      teamId: team.id,
      playerId: currentPlayer.id,
      playerName: currentPlayer.name
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('team:stopTyping', {
        teamId: team.id,
        playerId: currentPlayer.id
      });
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        fixed bottom-4 right-4 z-40
        ${isMinimized ? 'w-80' : 'w-96'}
        bg-bg-0/95 backdrop-blur-md rounded-xl border-2 
        shadow-2xl transition-all
      `}
      style={{
        borderColor: team.color,
        boxShadow: `0 0 20px ${team.color}40`
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={onToggleMinimize}
        style={{
          background: `linear-gradient(135deg, ${team.gradient.split(' ')[1]} 0%, ${team.gradient.split(' ')[3]} 100%)`
        }}
      >
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{team.emoji}</span>
          <h3 className="font-bold text-white">
            {team.name} Chat
          </h3>
          <span className="text-xs bg-white/20 px-2 py-1 rounded text-white">
            {team.players.length} members
          </span>
        </div>
        <button className="text-white hover:bg-white/20 p-1 rounded">
          {isMinimized ? '▲' : '▼'}
        </button>
      </div>

      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-2">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`
                    ${msg.isSystem ? 'text-center' : ''}
                    ${msg.playerId === currentPlayer.id ? 'text-right' : 'text-left'}
                  `}
                >
                  {msg.isSystem ? (
                    <p className="text-xs text-fg-subtle italic">
                      {msg.message}
                    </p>
                  ) : (
                    <div
                      className={`
                        inline-block max-w-[80%] p-3 rounded-lg
                        ${msg.playerId === currentPlayer.id 
                          ? 'bg-accent-1 text-bg-0' 
                          : 'bg-bg-1 text-fg-0'
                        }
                      `}
                    >
                      {msg.playerId !== currentPlayer.id && (
                        <p className="text-xs font-semibold mb-1 opacity-80">
                          {msg.playerName}
                        </p>
                      )}
                      <p className="text-sm break-words">{msg.message}</p>
                      <p className="text-xs opacity-60 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Typing Indicators */}
              {isTyping.size > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-fg-subtle italic"
                >
                  {Array.from(isTyping).join(', ')} {isTyping.size === 1 ? 'is' : 'are'} typing...
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-fg-subtle/20">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => {
                    setInputMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 bg-bg-1 rounded-lg text-sm focus:outline-none focus:ring-2"
                  style={{ focusRingColor: team.color }}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  className="px-4 py-2 rounded-lg text-white font-semibold"
                  style={{
                    background: `linear-gradient(135deg, ${team.gradient.split(' ')[1]} 0%, ${team.gradient.split(' ')[3]} 100%)`
                  }}
                >
                  Send
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
