// frontend/src/components/CircuitAnimation.jsx
import React, { useEffect, useRef } from 'react';

export default function CircuitAnimation() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Handle high-DPI and responsive resizing
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Grid spacing matches PCB traces
    const GRID_SIZE = 45;
    const PULSE_COUNT = 32;

    class CurrentPulse {
      constructor() {
        this.reset();
      }

      reset() {
        // Snap start position to an orthogonal grid
        const cols = Math.floor(canvas.width / GRID_SIZE);
        const rows = Math.floor(canvas.height / GRID_SIZE);
        this.x = Math.floor(Math.random() * cols) * GRID_SIZE;
        this.y = Math.floor(Math.random() * rows) * GRID_SIZE;

        // Velocity along orthogonal axes (dx, dy)
        const directions = [
          { dx: 1, dy: 0 },
          { dx: -1, dy: 0 },
          { dx: 0, dy: 1 },
          { dx: 0, dy: -1 },
        ];
        const dir = directions[Math.floor(Math.random() * directions.length)];
        this.speed = 1.6 + Math.random() * 2.2;
        this.vx = dir.dx * this.speed;
        this.vy = dir.dy * this.speed;

        this.length = 25 + Math.random() * 35; // trail length
        this.history = [];
        this.life = 0;
        this.maxLife = 120 + Math.floor(Math.random() * 180);
        this.size = 2 + Math.random() * 1.5;

        // Color variance: warm gold to intense electric amber
        const hues = [38, 42, 48];
        this.hue = hues[Math.floor(Math.random() * hues.length)];
        this.alpha = 0.5 + Math.random() * 0.5;
      }

      update() {
        this.history.push({ x: this.x, y: this.y });
        if (this.history.length > this.length) {
          this.history.shift();
        }

        this.x += this.vx;
        this.y += this.vy;
        this.life++;

        // At grid intersections, occasionally turn 90 degrees like real copper traces
        if (
          Math.floor(this.x) % GRID_SIZE < this.speed &&
          Math.floor(this.y) % GRID_SIZE < this.speed &&
          Math.random() < 0.22
        ) {
          if (this.vx !== 0) {
            this.vy = (Math.random() < 0.5 ? 1 : -1) * this.speed;
            this.vx = 0;
          } else {
            this.vx = (Math.random() < 0.5 ? 1 : -1) * this.speed;
            this.vy = 0;
          }
        }

        // Reset if offscreen or lifespan exceeded
        if (
          this.life > this.maxLife ||
          this.x < 0 ||
          this.x > canvas.width ||
          this.y < 0 ||
          this.y > canvas.height
        ) {
          this.reset();
        }
      }

      draw(context) {
        if (this.history.length < 2) return;

        // 1. Draw glowing fading electron trail
        context.beginPath();
        context.moveTo(this.history[0].x, this.history[0].y);
        for (let i = 1; i < this.history.length; i++) {
          context.lineTo(this.history[i].x, this.history[i].y);
        }
        context.strokeStyle = `hsla(${this.hue}, 95%, 50%, ${this.alpha * 0.4})`;
        context.lineWidth = 1.5;
        context.stroke();

        // 2. Draw intense leading pulse head
        context.shadowColor = `hsl(${this.hue}, 100%, 65%)`;
        context.shadowBlur = 10;
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fillStyle = `hsl(${this.hue}, 100%, 75%)`;
        context.fill();

        // Reset shadow to avoid polluting other draw calls
        context.shadowBlur = 0;
      }
    }

    // Initialize pulse swarm
    const pulses = Array.from({ length: PULSE_COUNT }, () => new CurrentPulse());

    const render = () => {
      // Clear canvas with transparent clearRect so underlying image remains sharp
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < pulses.length; i++) {
        pulses[i].update();
        pulses[i].draw(ctx);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-[1] opacity-75 mix-blend-screen"
    />
  );
}