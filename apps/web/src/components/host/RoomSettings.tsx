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

          {/* Two Player Mode */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-fg-subtle">
              TWO-PLAYER MODE
            </label>
            <select
              value={settings.twoPlayerMode}
              onChange={(e) =>
                onChange({
                  ...settings,
                  twoPlayerMode: e.target.value as any,
                })
              }
              className="input-neon w-full"
            >
              <option value="unanimous">Unanimous (both agree)</option>
              <option value="single_caller_verify">Single Caller + Verify</option>
              <option value="judge_mode">Judge Mode</option>
              <option value="speed_call">Speed Call</option>
            </select>
            <p className="text-xs text-fg-subtle mt-1">Special rules for 2-player games</p>
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

