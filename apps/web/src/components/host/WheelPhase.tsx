'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { audioManager } from '@/lib/audio';
import type { Player, Round, WheelEntry, PunishmentSpin } from '@parlay-party/shared';
import type { Socket } from 'socket.io-client';
import * as PIXI from 'pixi.js';

interface WheelPhaseProps {
  socket: Socket;
  round: Round;
  players: Player[];
}

export function WheelPhase({ socket, round, players }: WheelPhaseProps) {
  const [entries, setEntries] = useState<WheelEntry[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<{ entry: WheelEntry; loser: Player } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);

  const animateWheel = () => {
    if (!appRef.current) return;

    let rotation = 0;
    let speed = 0.5;
    const deceleration = 0.98;

    const animate = () => {
      rotation += speed;
      speed *= deceleration;

      if (appRef.current && appRef.current.stage.children[0]) {
        appRef.current.stage.children[0].rotation = rotation;
      }

      if (speed > 0.01) {
        audioManager.playWheelTick();
        requestAnimationFrame(animate);
      }
    };

    animate();
  };

  useEffect(() => {
    socket.on('wheel:entry_added', ({ entry }) => {
      setEntries((prev) => [...prev, entry]);
    });

    socket.on('wheel:spinning', () => {
      setIsSpinning(true);
      animateWheel();
    });

    socket.on('wheel:result', ({ selectedEntry, loser }) => {
      setIsSpinning(false);
      setResult({ entry: selectedEntry, loser });
      audioManager.playWheelCrash();
    });

    return () => {
      socket.off('wheel:entry_added');
      socket.off('wheel:spinning');
      socket.off('wheel:result');
    };
  }, [socket]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const app = new PIXI.Application({
      view: canvasRef.current,
      width: 500,
      height: 500,
      backgroundAlpha: 0,
    });

    appRef.current = app;
    drawWheel(app, entries);

    return () => {
      app.destroy(true);
    };
  }, [entries]);

  const drawWheel = (app: PIXI.Application, entries: WheelEntry[]) => {
    const approvedEntries = entries.filter((e) => e.status === 'approved');
    if (approvedEntries.length === 0) return;

    const centerX = 250;
    const centerY = 250;
    const radius = 200;
    const colors = [0x00fff7, 0xff2d95, 0x8a6bff, 0x7fff00, 0xffc400];

    const wheel = new PIXI.Graphics();
    const segmentAngle = (Math.PI * 2) / approvedEntries.length;

    approvedEntries.forEach((entry, index) => {
      const startAngle = segmentAngle * index;
      const endAngle = segmentAngle * (index + 1);
      const color = colors[index % colors.length];

      wheel.beginFill(color, 0.8);
      wheel.moveTo(centerX, centerY);
      wheel.arc(centerX, centerY, radius, startAngle, endAngle);
      wheel.lineTo(centerX, centerY);
      wheel.endFill();

      wheel.lineStyle(2, 0xffffff, 0.5);
      wheel.moveTo(centerX, centerY);
      const lineX = centerX + Math.cos(startAngle) * radius;
      const lineY = centerY + Math.sin(startAngle) * radius;
      wheel.lineTo(lineX, lineY);
    });

    app.stage.addChild(wheel);
  };

  const handleSpin = () => {
    socket.emit('wheel:spin');
  };

  const approvedCount = entries.filter((e) => e.status === 'approved').length;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="font-display text-7xl glow-pink tracking-wider mb-4">
          WHEEL OF PUNISHMENT
        </h1>
        <p className="text-2xl text-fg-subtle">
          {approvedCount} punishment{approvedCount !== 1 ? 's' : ''} approved
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="card-neon p-8">
          <h2 className="font-display text-3xl glow-cyan mb-6">SUBMISSIONS</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className={`
                  p-4 rounded-lg
                  ${entry.status === 'approved' ? 'bg-success/10 border-2 border-success' : 'bg-bg-0'}
                `}
              >
                <p className="text-lg">{entry.text}</p>
                {entry.status === 'pending' && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => socket.emit('wheel:moderate', { entryId: entry.id, status: 'approved' })}
                      className="text-sm px-3 py-1 bg-success/20 border border-success text-success rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => socket.emit('wheel:moderate', { entryId: entry.id, status: 'rejected' })}
                      className="text-sm px-3 py-1 bg-danger/20 border border-danger text-danger rounded"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card-neon p-8 text-center space-y-6">
          <canvas ref={canvasRef} className="mx-auto" />

          {!isSpinning && !result && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSpin}
              disabled={approvedCount === 0}
              className="btn-neon-pink py-4 px-12 text-2xl font-display tracking-widest disabled:opacity-50"
            >
              SPIN THE WHEEL
            </motion.button>
          )}

          {isSpinning && (
            <div className="text-3xl font-display glow-cyan animate-pulse">
              SPINNING...
            </div>
          )}

          {result && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="space-y-4"
            >
              <p className="text-2xl text-fg-subtle">The loser is...</p>
              <p className="text-5xl font-display glow-pink">{result.loser.name}</p>
              <div className="card-neon p-6 bg-accent-2/10">
                <p className="text-3xl font-semibold">{result.entry.text}</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

