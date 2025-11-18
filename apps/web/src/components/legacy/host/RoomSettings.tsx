'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { DEFAULT_ROOM_SETTINGS } from '@parlay-party/shared';
import type { RoomSettings } from '@parlay-party/shared';

interface RoomSettingsProps {
  settings: RoomSettings;
  onChange: (settings: RoomSettings) => void;
}

export function RoomSettingsPanel({ settings, onChange }: RoomSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="card-neon p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-display text-2xl glow-violet">GAME SETTINGS</h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-accent-3 text-2xl"
        >
          {isOpen ? '▼' : '▶'}
        </button>
      </div>

      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="space-y-4"
        >
          {/* Pause Duration */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-fg-subtle">
              PAUSE DURATION (seconds) - Time to smoke/drink! 🔥
            </label>
            <input
              type="number"
              value={settings.pauseDurationSec}
              onChange={(e) =>
                onChange({ ...settings, pauseDurationSec: parseInt(e.target.value) || 20 })
              }
              min={5}
              max={60}
              className="input-neon w-32 text-center"
            />
            <p className="text-xs text-fg-subtle mt-1">
              How long video pauses when events happen
            </p>
          </div>

          {/* Consensus Threshold */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-fg-subtle">
              CONSENSUS THRESHOLD (%)
            </label>
            <input
              type="number"
              value={settings.consensusThresholdPct * 100}
              onChange={(e) =>
                onChange({
                  ...settings,
                  consensusThresholdPct: (parseInt(e.target.value) || 50) / 100,
                })
              }
              min={25}
              max={100}
              step={5}
              className="input-neon w-32 text-center"
            />
            <p className="text-xs text-fg-subtle mt-1">
              % of players needed to trigger auto-pause
            </p>
          </div>

          {/* Min Votes */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-fg-subtle">
              MINIMUM VOTES
            </label>
            <input
              type="number"
              value={settings.minVotes}
              onChange={(e) =>
                onChange({ ...settings, minVotes: parseInt(e.target.value) || 3 })
              }
              min={1}
              max={10}
              className="input-neon w-32 text-center"
            />
            <p className="text-xs text-fg-subtle mt-1">Minimum votes for auto-pause</p>
          </div>

          {/* Score Multiplier */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-fg-subtle">
              SCORE MULTIPLIER
            </label>
            <input
              type="number"
              value={settings.scoreMultiplier}
              onChange={(e) =>
                onChange({
                  ...settings,
                  scoreMultiplier: parseFloat(e.target.value) || 3.0,
                })
              }
              min={1}
              max={10}
              step={0.5}
              className="input-neon w-32 text-center"
            />
            <p className="text-xs text-fg-subtle mt-1">Completion bonus multiplier</p>
          </div>

          {/* Game Modes */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-fg-subtle">
              GAME MODES
            </label>
            <select
              value={settings.twoPlayerMode}
              onChange={(e) =>
                onChange({
                  ...settings,
                  twoPlayerMode: e.target.value as any,
                })
              }
              className="input-neon w-full text-sm"
            >
              <option value="unanimous">Unanimous - Both players must agree on same event</option>
              <option value="single_caller_verify">Single Caller - First calls, second verifies within 2s</option>
              <option value="judge_mode">Judge Mode - Host confirms every call manually</option>
              <option value="speed_call">Speed Call - First correct caller scores instantly</option>
            </select>
            <p className="text-xs text-fg-subtle mt-1">
              {settings.twoPlayerMode === 'unanimous' && 'Both players must call the same event within 1.5s to pause'}
              {settings.twoPlayerMode === 'single_caller_verify' && 'First call opens 2s window for second player to match'}
              {settings.twoPlayerMode === 'judge_mode' && 'Any call pauses for host review'}
              {settings.twoPlayerMode === 'speed_call' && 'First correct gets points, opponent has 3s to match'}
            </p>
          </div>

          <button
            onClick={() => onChange(DEFAULT_ROOM_SETTINGS)}
            className="w-full py-2 px-4 bg-bg-0 border border-fg-subtle/30 rounded-lg text-sm text-fg-subtle hover:border-accent-3"
          >
            Reset to Defaults
          </button>
        </motion.div>
      )}
    </div>
  );
}

