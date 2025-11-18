'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerAvatar } from './PlayerAvatar';
import type { Player } from '@parlay-party/shared';
import type { Socket } from 'socket.io-client';

export interface Team {
  id: string;
  name: string;
  color: string;
  gradient: string;
  emoji: string;
  players: Player[];
  totalScore: number;
}

interface TeamSetupProps {
  socket: Socket;
  players: Player[];
  isHost: boolean;
  onTeamsReady: (teams: Team[]) => void;
}

const TEAM_PRESETS: Omit<Team, 'id' | 'players' | 'totalScore'>[] = [
  {
    name: 'Fire Squad',
    color: '#FF4444',
    gradient: 'from-red-600 to-orange-600',
    emoji: '🔥'
  },
  {
    name: 'Ice Breakers',
    color: '#00D4FF',
    gradient: 'from-cyan-600 to-blue-600',
    emoji: '🧊'
  },
  {
    name: 'Thunder Bolts',
    color: '#FFD700',
    gradient: 'from-yellow-600 to-amber-600',
    emoji: '⚡'
  },
  {
    name: 'Shadow Force',
    color: '#8B00FF',
    gradient: 'from-purple-600 to-violet-600',
    emoji: '🌙'
  }
];

export function TeamSetup({ socket, players, isHost, onTeamsReady }: TeamSetupProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamCount, setTeamCount] = useState(2);
  const [assignmentMode, setAssignmentMode] = useState<'random' | 'manual'>('random');
  const [draggedPlayer, setDraggedPlayer] = useState<Player | null>(null);

  useEffect(() => {
    // Initialize teams based on count
    const newTeams: Team[] = TEAM_PRESETS.slice(0, teamCount).map((preset, index) => ({
      ...preset,
      id: `team-${index}`,
      players: [],
      totalScore: 0
    }));
    setTeams(newTeams);
  }, [teamCount]);

  useEffect(() => {
    // Listen for team updates from server
    socket.on('teams:updated', ({ teams: updatedTeams }) => {
      setTeams(updatedTeams);
    });

    socket.on('teams:ready', ({ teams: finalTeams }) => {
      onTeamsReady(finalTeams);
    });

    return () => {
      socket.off('teams:updated');
      socket.off('teams:ready');
    };
  }, [socket, onTeamsReady]);

  const handleRandomAssignment = () => {
    const playersToAssign = players.filter(p => !p.isHost);
    const shuffled = [...playersToAssign].sort(() => Math.random() - 0.5);
    
    const newTeams = teams.map(team => ({ ...team, players: [] as Player[] }));
    
    shuffled.forEach((player, index) => {
      const teamIndex = index % teamCount;
      newTeams[teamIndex].players.push(player);
    });
    
    setTeams(newTeams);
    if (isHost) {
      socket.emit('teams:assign', { teams: newTeams });
    }
  };

  const handleManualAssignment = (playerId: string, teamId: string) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    const newTeams = teams.map(team => ({
      ...team,
      players: team.players.filter(p => p.id !== playerId)
    }));

    const targetTeam = newTeams.find(t => t.id === teamId);
    if (targetTeam) {
      targetTeam.players.push(player);
    }

    setTeams(newTeams);
    if (isHost) {
      socket.emit('teams:assign', { teams: newTeams });
    }
  };

  const handleConfirmTeams = () => {
    if (!isHost) return;
    
    // Check if all players are assigned
    const assignedPlayers = teams.reduce((count, team) => count + team.players.length, 0);
    const totalPlayers = players.filter(p => !p.isHost).length;
    
    if (assignedPlayers !== totalPlayers) {
      alert('Please assign all players to teams!');
      return;
    }
    
    socket.emit('teams:confirm', { teams });
  };

  const unassignedPlayers = players.filter(p => 
    !p.isHost && !teams.some(team => team.players.some(tp => tp.id === p.id))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-0 to-bg-1 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="font-display text-6xl md:text-8xl glow-cyan">
            TEAM SETUP
          </h1>
          
          {isHost && (
            <div className="space-y-6">
              <div className="flex justify-center items-center space-x-6">
                <div className="card-neon px-6 py-3">
                  <label className="text-sm text-fg-subtle">TEAMS</label>
                  <div className="flex items-center space-x-2 mt-1">
                    {[2, 3, 4].map(num => (
                      <button
                        key={num}
                        onClick={() => setTeamCount(num)}
                        className={`
                          w-12 h-12 rounded-lg font-bold text-xl transition-all
                          ${teamCount === num 
                            ? 'bg-accent-1 text-bg-0' 
                            : 'bg-bg-0 text-fg-subtle hover:text-fg-0'
                          }
                        `}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="card-neon px-6 py-3">
                  <label className="text-sm text-fg-subtle">MODE</label>
                  <div className="flex space-x-2 mt-1">
                    <button
                      onClick={() => setAssignmentMode('random')}
                      className={`
                        px-4 py-2 rounded-lg font-semibold transition-all
                        ${assignmentMode === 'random' 
                          ? 'bg-accent-2 text-white' 
                          : 'bg-bg-0 text-fg-subtle'
                        }
                      `}
                    >
                      🎲 Random
                    </button>
                    <button
                      onClick={() => setAssignmentMode('manual')}
                      className={`
                        px-4 py-2 rounded-lg font-semibold transition-all
                        ${assignmentMode === 'manual' 
                          ? 'bg-accent-3 text-white' 
                          : 'bg-bg-0 text-fg-subtle'
                        }
                      `}
                    >
                      ✋ Manual
                    </button>
                  </div>
                </div>
              </div>
              
              {assignmentMode === 'random' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRandomAssignment}
                  className="btn-neon-pink py-3 px-8 text-xl"
                >
                  🎲 SHUFFLE TEAMS
                </motion.button>
              )}
            </div>
          )}
        </motion.div>

        {/* Teams Display */}
        <div className={`grid grid-cols-${teamCount} gap-6`}>
          {teams.map((team) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: teams.indexOf(team) * 0.1 }}
              className="card-neon p-6 relative overflow-hidden"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedPlayer && isHost && assignmentMode === 'manual') {
                  handleManualAssignment(draggedPlayer.id, team.id);
                }
              }}
            >
              {/* Team Header */}
              <div 
                className="absolute inset-0 opacity-10"
                style={{
                  background: `linear-gradient(135deg, ${team.gradient.split(' ')[1]} 0%, ${team.gradient.split(' ')[3]} 100%)`
                }}
              />
              
              <div className="relative z-10">
                <div className="text-center mb-6">
                  <div className="text-5xl mb-2">{team.emoji}</div>
                  <h2 className="font-display text-3xl" style={{ color: team.color }}>
                    {team.name}
                  </h2>
                  <p className="text-sm text-fg-subtle mt-1">
                    {team.players.length} players
                  </p>
                </div>

                {/* Team Members */}
                <div className="space-y-3 min-h-[200px]">
                  {team.players.length === 0 ? (
                    <p className="text-center text-fg-subtle py-12">
                      {assignmentMode === 'manual' ? 'Drag players here' : 'No players yet'}
                    </p>
                  ) : (
                    team.players.map((player) => (
                      <motion.div
                        key={player.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        draggable={isHost && assignmentMode === 'manual'}
                        onDragStart={() => setDraggedPlayer(player)}
                        className={`
                          flex items-center space-x-3 p-3 bg-bg-0/50 rounded-lg
                          ${isHost && assignmentMode === 'manual' ? 'cursor-move' : ''}
                        `}
                      >
                        <PlayerAvatar player={player} size="sm" />
                        <p className="font-semibold">{player.name}</p>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Unassigned Players */}
        {assignmentMode === 'manual' && unassignedPlayers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-neon p-6"
          >
            <h3 className="font-display text-2xl text-center mb-4 glow-violet">
              UNASSIGNED PLAYERS
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {unassignedPlayers.map((player) => (
                <motion.div
                  key={player.id}
                  layout
                  draggable={isHost}
                  onDragStart={() => setDraggedPlayer(player)}
                  whileHover={{ scale: 1.05 }}
                  className={`
                    flex items-center space-x-2 p-3 bg-bg-0 rounded-lg
                    ${isHost ? 'cursor-move' : ''}
                  `}
                >
                  <PlayerAvatar player={player} size="sm" />
                  <p className="font-semibold">{player.name}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Confirm Button */}
        {isHost && (
          <div className="text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleConfirmTeams}
              disabled={teams.some(t => t.players.length === 0) || unassignedPlayers.length > 0}
              className="btn-neon-cyan py-4 px-12 text-2xl font-display disabled:opacity-50"
            >
              START TEAM BATTLE
            </motion.button>
          </div>
        )}

        {/* Waiting Message for Non-Host */}
        {!isHost && (
          <div className="text-center">
            <p className="text-xl text-fg-subtle">
              Waiting for host to assign teams...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
