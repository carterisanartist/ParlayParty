'use client';

import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

interface VFXLayerProps {
  children?: React.ReactNode;
}

export function VFXLayer({ children }: VFXLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const app = new PIXI.Application({
      view: canvasRef.current,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundAlpha: 0,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    appRef.current = app;

    const ambientGradient = new PIXI.Graphics();
    ambientGradient.beginFill(0x00fff7, 0.05);
    ambientGradient.drawCircle(window.innerWidth * 0.2, window.innerHeight * 0.3, 300);
    ambientGradient.endFill();
    ambientGradient.beginFill(0xff2d95, 0.05);
    ambientGradient.drawCircle(window.innerWidth * 0.8, window.innerHeight * 0.7, 300);
    ambientGradient.endFill();
    app.stage.addChild(ambientGradient);

    let time = 0;
    app.ticker.add(() => {
      time += 0.01;
      ambientGradient.x = Math.sin(time) * 50;
      ambientGradient.y = Math.cos(time * 0.7) * 30;
    });

    const handleResize = () => {
      app.renderer.resize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      app.destroy(true, { children: true });
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      <div style={{ position: 'relative', zIndex: 10 }}>{children}</div>
    </>
  );
}

export function createConfetti(app: PIXI.Application, x: number, y: number) {
  const colors = [0x00fff7, 0xff2d95, 0x8a6bff, 0x7fff00];
  const particleCount = 50;

  for (let i = 0; i < particleCount; i++) {
    const particle = new PIXI.Graphics();
    const color = colors[Math.floor(Math.random() * colors.length)];
    particle.beginFill(color);
    particle.drawRect(0, 0, 8, 8);
    particle.endFill();

    particle.x = x;
    particle.y = y;

    const angle = (Math.PI * 2 * i) / particleCount;
    const speed = 2 + Math.random() * 4;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed - 2;

    app.stage.addChild(particle);

    const animate = () => {
      particle.x += vx;
      particle.y += vy + 0.2;
      particle.alpha -= 0.02;
      particle.rotation += 0.1;

      if (particle.alpha > 0) {
        requestAnimationFrame(animate);
      } else {
        app.stage.removeChild(particle);
        particle.destroy();
      }
    };

    animate();
  }
}

export function createSparks(app: PIXI.Application, x: number, y: number) {
  const colors = [0xffc400, 0xff4444, 0xff2d95];
  const sparkCount = 20;

  for (let i = 0; i < sparkCount; i++) {
    const spark = new PIXI.Graphics();
    const color = colors[Math.floor(Math.random() * colors.length)];
    spark.beginFill(color);
    spark.drawCircle(0, 0, 3);
    spark.endFill();

    spark.x = x;
    spark.y = y;

    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 3;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    app.stage.addChild(spark);

    const animate = () => {
      spark.x += vx;
      spark.y += vy;
      spark.alpha -= 0.03;

      if (spark.alpha > 0) {
        requestAnimationFrame(animate);
      } else {
        app.stage.removeChild(spark);
        spark.destroy();
      }
    };

    animate();
  }
}

