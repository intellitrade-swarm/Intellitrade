
'use client';

import { useEffect, useRef } from 'react';

export function HexagonGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const hexagonSize = 50;
    const cols = Math.ceil(canvas.width / (hexagonSize * 1.5)) + 2;
    const rows = Math.ceil(canvas.height / (hexagonSize * Math.sqrt(3))) + 2;

    const drawHexagon = (x: number, y: number, size: number, opacity: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const hx = x + size * Math.cos(angle);
        const hy = y + size * Math.sin(angle);
        if (i === 0) {
          ctx.moveTo(hx, hy);
        } else {
          ctx.lineTo(hx, hy);
        }
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(0, 255, 255, ${opacity})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Glow effect
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(0, 255, 255, 0.5)';
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    const hexagons: Array<{ x: number; y: number; opacity: number; pulse: number }> = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * hexagonSize * 1.5;
        const y = row * hexagonSize * Math.sqrt(3) + (col % 2) * (hexagonSize * Math.sqrt(3) / 2);
        hexagons.push({
          x,
          y,
          opacity: Math.random() * 0.2 + 0.05,
          pulse: Math.random() * Math.PI * 2
        });
      }
    }

    let animationFrameId: number;
    let frame = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame += 0.02;

      hexagons.forEach((hex, i) => {
        const pulseOpacity = hex.opacity + Math.sin(frame + hex.pulse) * 0.1;
        drawHexagon(hex.x, hex.y, hexagonSize, pulseOpacity);

        // Random activation effect
        if (Math.random() < 0.001) {
          hex.opacity = Math.min(hex.opacity + 0.2, 0.4);
        } else if (hex.opacity > 0.05) {
          hex.opacity *= 0.99;
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.3 }}
    />
  );
}
