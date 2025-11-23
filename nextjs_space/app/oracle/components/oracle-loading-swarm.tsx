
'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  pulsePhase: number;
}

interface OracleLoadingSwarmProps {
  isLoading: boolean;
  message?: string;
}

export function OracleLoadingSwarm({ isLoading, message = 'SYNCHRONIZING ORACLE NETWORK...' }: OracleLoadingSwarmProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!isLoading) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to container
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Neon oracle colors
    const colors = [
      '#3385ff', // Oracle green
      '#00ffff', // Cyan (AI Agents)
      '#ff00ff', // Magenta (Data Sources)
      '#ffff00', // Yellow (Blockchains)
      '#0066ff', // Terminal green
      '#0080ff', // Blue accent
    ];

    // Create particles
    const particleCount = 50;
    const particles: Particle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    // Central "Oracle Hub" particle
    const hubParticle: Particle = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: 0,
      vy: 0,
      size: 8,
      opacity: 1,
      color: '#3385ff',
      pulsePhase: 0,
    };

    let frame = 0;

    // Animation loop
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      frame++;

      // Update hub particle pulse
      hubParticle.pulsePhase += 0.05;
      const hubPulse = Math.sin(hubParticle.pulsePhase) * 3 + 8;

      // Draw hub particle with glow
      ctx.shadowBlur = 20;
      ctx.shadowColor = hubParticle.color;
      ctx.fillStyle = hubParticle.color;
      ctx.globalAlpha = hubParticle.opacity;
      ctx.beginPath();
      ctx.arc(hubParticle.x, hubParticle.y, hubPulse, 0, Math.PI * 2);
      ctx.fill();

      // Reset shadow for other particles
      ctx.shadowBlur = 0;

      // Update and draw particles
      particles.forEach((particle, i) => {
        // Move particle
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Attraction to hub
        const dx = hubParticle.x - particle.x;
        const dy = hubParticle.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 50) {
          const force = 0.002;
          particle.vx += (dx / distance) * force;
          particle.vy += (dy / distance) * force;
        }

        // Velocity damping
        particle.vx *= 0.98;
        particle.vy *= 0.98;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Pulse animation
        particle.pulsePhase += 0.03;
        const pulse = Math.sin(particle.pulsePhase) * 0.5 + 1;

        // Draw particle with glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = particle.color;
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Draw connections to nearby particles
        particles.forEach((other, j) => {
          if (i >= j) return;
          
          const dx2 = other.x - particle.x;
          const dy2 = other.y - particle.y;
          const dist = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          
          if (dist < 100) {
            ctx.strokeStyle = particle.color;
            ctx.globalAlpha = (1 - dist / 100) * 0.3;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        });

        // Draw connections to hub
        const hubDist = distance;
        if (hubDist < 150) {
          ctx.strokeStyle = '#3385ff';
          ctx.globalAlpha = (1 - hubDist / 150) * 0.2;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(hubParticle.x, hubParticle.y);
          ctx.stroke();
        }
      });

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm"
        >
          {/* Canvas for particles */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
          />

          {/* Loading message overlay */}
          <div className="relative z-10 flex flex-col items-center space-y-6">
            {/* Hexagonal loader */}
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
              className="relative w-24 h-24"
            >
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full"
              >
                <polygon
                  points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5"
                  fill="none"
                  stroke="#3385ff"
                  strokeWidth="2"
                  className="opacity-80"
                />
                <polygon
                  points="50,15 80,32.5 80,67.5 50,85 20,67.5 20,32.5"
                  fill="none"
                  stroke="#00ffff"
                  strokeWidth="2"
                  className="opacity-60"
                />
                <polygon
                  points="50,25 70,37.5 70,62.5 50,75 30,62.5 30,37.5"
                  fill="none"
                  stroke="#ff00ff"
                  strokeWidth="2"
                  className="opacity-40"
                />
              </svg>
              
              {/* Center pulse */}
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-4 h-4 rounded-full bg-[#3385ff] shadow-[0_0_20px_rgba(51,133,255,0.8)]" />
              </motion.div>
            </motion.div>

            {/* Loading message */}
            <motion.div
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="text-center space-y-2"
            >
              <div className="text-2xl font-terminal text-[#3385ff] tracking-wider">
                {message}
              </div>
              <div className="text-sm font-terminal text-[#0066ff] opacity-70">
                <motion.span
                  animate={{
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0,
                  }}
                >
                  ●
                </motion.span>
                {' '}
                <motion.span
                  animate={{
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                >
                  ●
                </motion.span>
                {' '}
                <motion.span
                  animate={{
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                >
                  ●
                </motion.span>
              </div>
            </motion.div>

            {/* Status indicators */}
            <div className="flex space-x-6 text-xs font-terminal">
              <motion.div
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="flex items-center space-x-2"
              >
                <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(0,255,255,0.8)]" />
                <span className="text-blue-400">AI_AGENTS</span>
              </motion.div>
              
              <motion.div
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.3,
                }}
                className="flex items-center space-x-2"
              >
                <div className="w-2 h-2 rounded-full bg-magenta-400 shadow-[0_0_10px_rgba(255,0,255,0.8)]" />
                <span className="text-magenta-400">DATA_FEEDS</span>
              </motion.div>
              
              <motion.div
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.6,
                }}
                className="flex items-center space-x-2"
              >
                <div className="w-2 h-2 rounded-full bg-blue-300 shadow-[0_0_10px_rgba(255,255,0,0.8)]" />
                <span className="text-blue-300">BLOCKCHAIN</span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
