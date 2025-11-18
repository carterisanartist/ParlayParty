'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Socket } from 'socket.io-client';
import type { Team } from './TeamSetup';
import { PlayerAvatar } from './PlayerAvatar';

interface TeamScoreData {
  teamId: string;
  baseScore: number;
  bonusScore: number;
  totalScore: number;
  mvpPlayerId?: string;
}

interface TeamScoreboardProps {
  socket: Socket;
  teams: Team[];
  showMVP?: boolean;
  isCompact?: boolean;
}

export function TeamScoreboard({ socket, teams, showMVP = false, isCompact = false }: TeamScoreboardProps) {
  const [teamScores, setTeamScores] = useState<Map<string, TeamScoreData>>(new Map());
  const [animatedScores, setAnimatedScores] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    // Initialize scores
    teams.forEach(team => {
      if (!teamScores.has(team.id)) {
        const initialScore: TeamScoreData = {
          teamId: team.id,
          baseScore: 0,
          bonusScore: 0,
          totalScore: 0
        };
        setTeamScores(prev => new Map(prev).set(team.id, initialScore));
        setAnimatedScores(prev => new Map(prev).set(team.id, 0));
      }
    });
  }, [teams]);

  useEffect(() => {
    // Listen for score updates
    socket.on('team:scoreUpdate', ({ teamScore }: { teamScore: TeamScoreData }) => {
      setTeamScores(prev => new Map(prev).set(teamScore.teamId, teamScore));
      
      // Animate score change
      const currentAnimated = animatedScores.get(teamScore.teamId) || 0;
      const diff = teamScore.totalScore - currentAnimated;
      const steps = 10;
      const stepSize = diff / steps;
      
      let step = 0;
      const interval = setInterval(() => {
        step++;
        setAnimatedScores(prev => {
          const newScore = currentAnimated + (stepSize * step);
          return new Map(prev).set(teamScore.teamId, newScore);
        });
        
        if (step >= steps) {
          clearInterval(interval);
          setAnimatedScores(prev => new Map(prev).set(teamScore.teamId, teamScore.totalScore));
        }
      }, 50);
    });

    // Get initial scores
    socket.emit('team:getScores');

    return () => {
      socket.off('team:scoreUpdate');
    };
  }, [socket, animatedScores]);

  // Sort teams by score
  const sortedTeams = [...teams].sort((a, b) => {
    const scoreA = teamScores.get(a.id)?.totalScore || 0;
    const scoreB = teamScores.get(b.id)?.totalScore || 0;
    return scoreB - scoreA;
  });

  if (isCompact) {
    return (
      <div className="bg-bg-0/90 backdrop-blur-sm rounded-xl p-4 border-2 border-fg-subtle/20">
        <h3 className="font-display text-xl glow-cyan mb-3 text-center">TEAM SCORES</h3>
        <div className="space-y-2">
          {sortedTeams.map((team, index) => {
            const score = teamScores.get(team.id);
            const animatedScore = Math.floor(animatedScores.get(team.id) || 0);
            const isLeading = index === 0 && animatedScore > 0;
            
            return (
              <motion.div
                key={team.id}
                layout
                className={`
                  flex items-center justify-between p-2 rounded-lg
                  ${isLeading ? 'ring-2 ring-accent-1' : ''}
                `}
                style={{
                  background: isLeading 
                    ? `linear-gradient(135deg, ${team.gradient.split(' ')[1]}20 0%, ${team.gradient.split(' ')[3]}20 100%)`
                    : 'rgba(37, 37, 37, 0.5)'
                }}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{team.emoji}</span>
                  <span className="font-semibold">{team.name}</span>
                </div>
                <motion.span
                  key={animatedScore}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="font-mono font-bold text-xl"
                  style={{ color: isLeading ? team.color : undefined }}
                >
                  {animatedScore}
                </motion.span>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-0/90 backdrop-blur-sm rounded-xl p-6 space-y-6">
      <h2 className="font-display text-3xl glow-cyan text-center">
        TEAM BATTLE
      </h2>
      
      <div className="space-y-4">
        <AnimatePresence>
          {sortedTeams.map((team, index) => {
            const score = teamScores.get(team.id);
            const animatedScore = Math.floor(animatedScores.get(team.id) || 0);
            const isLeading = index === 0 && animatedScore > 0;
            
            return (
              <motion.div
                key={team.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  card-neon p-4 relative overflow-hidden
                  ${isLeading ? 'ring-4' : ''}
                `}
                style={{
                  borderColor: team.color,
                  boxShadow: isLeading ? `0 0 30px ${team.color}60` : undefined,
                  ringColor: isLeading ? team.color : undefined
                }}
              >
                {/* Background gradient */}
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    background: `linear-gradient(135deg, ${team.gradient.split(' ')[1]} 0%, ${team.gradient.split(' ')[3]} 100%)`
                  }}
                />
                
                <div className="relative z-10">
                  {/* Team Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{team.emoji}</span>
                      <div>
                        <h3 
                          className="font-display text-2xl"
                          style={{ color: team.color }}
                        >
                          {team.name}
                        </h3>
                        <p className="text-sm text-fg-subtle">
                          {team.players.length} players
                        </p>
                      </div>
                    </div>
                    
                    {/* Leading indicator */}
                    {isLeading && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-accent-1 text-bg-0 px-3 py-1 rounded-full font-bold"
                      >
                        LEADING
                      </motion.div>
                    )}
                  </div>
                  
                  {/* Score Display */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <motion.div
                        key={animatedScore}
                        initial={{ scale: 1.5, color: team.color }}
                        animate={{ scale: 1, color: 'inherit' }}
                        transition={{ duration: 0.3 }}
                        className="text-5xl font-mono font-bold"
                      >
                        {animatedScore}
                      </motion.div>
                      
                      {score && score.bonusScore > 0 && (
                        <p className="text-sm text-fg-subtle">
                          +{score.bonusScore} bonus
                        </p>
                      )}
                    </div>
                    
                    {/* Team Members Mini Display */}
                    <div className="flex -space-x-2">
                      {team.players.slice(0, 3).map((player) => (
                        <div
                          key={player.id}
                          className={`
                            ${showMVP && score?.mvpPlayerId === player.id 
                              ? 'ring-2 ring-warning' 
                              : ''
                            }
                          `}
                        >
                          <PlayerAvatar 
                            player={player} 
                            size="sm"
                            className="border-2 border-bg-0"
                          />
                        </div>
                      ))}
                      {team.players.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-bg-1 border-2 border-bg-0 flex items-center justify-center text-xs font-bold">
                          +{team.players.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* MVP Display */}
                  {showMVP && score?.mvpPlayerId && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 pt-3 border-t border-fg-subtle/20"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-warning">🏆</span>
                        <span className="text-sm text-fg-subtle">MVP:</span>
                        <span className="font-semibold">
                          {team.players.find(p => p.id === score.mvpPlayerId)?.name}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      
      {/* Progress Bars */}
      {sortedTeams.length > 1 && (
        <div className="space-y-2">
          {sortedTeams.map((team) => {
            const score = animatedScores.get(team.id) || 0;
            const maxScore = Math.max(...Array.from(animatedScores.values()));
            const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
            
            return (
              <div key={team.id} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>{team.name}</span>
                  <span>{Math.floor(percentage)}%</span>
                </div>
                <div className="h-2 bg-bg-1 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full"
                    style={{ backgroundColor: team.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
