import React, { useEffect, useRef } from 'react';

export default function AirParticlesBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse interactive wind effect
    const mouse = {
      x: null,
      y: null,
      radius: 150,
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
      initClouds();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    // Air Particles Definition
    let particles = [];
    const PARTICLE_COUNT = Math.min(Math.floor((width * height) / 7500), 140);

    // Cloud Fog Puffs Definition
    let clouds = [];
    const CLOUD_COUNT = 8;

    class CloudPuff {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.radius = Math.random() * 260 + 180;
        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = (Math.random() - 0.5) * 0.2;
        this.alpha = Math.random() * 0.18 + 0.08;
        // Atmospheric cloud color palette
        const colors = [
          'rgba(56, 189, 248, ', // sky blue / cyan
          'rgba(99, 102, 241, ', // indigo
          'rgba(147, 197, 253, ', // soft azure
          'rgba(14, 165, 233, ', // deep ocean cyan
          'rgba(139, 92, 246, ', // purple mist
          'rgba(45, 212, 191, ', // teal mist
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x - this.radius > width) this.x = -this.radius;
        if (this.x + this.radius < 0) this.x = width + this.radius;
        if (this.y - this.radius > height) this.y = -this.radius;
        if (this.y + this.radius < 0) this.y = height + this.radius;
      }

      draw() {
        const gradient = ctx.createRadialGradient(
          this.x,
          this.y,
          0,
          this.x,
          this.y,
          this.radius
        );
        gradient.addColorStop(0, `${this.color}${this.alpha})`);
        gradient.addColorStop(0.5, `${this.color}${this.alpha * 0.5})`);
        gradient.addColorStop(1, `${this.color}0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    class AirParticle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2.8 + 1.2;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = Math.random() * 25 + 5;
        this.vx = (Math.random() - 0.45) * 0.7; // gentle drift
        this.vy = (Math.random() - 0.6) * 0.6; // gentle upward floating
        this.alpha = Math.random() * 0.7 + 0.3;
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.04 + 0.015;
        
        // Colors: PM2.5 / Air molecule highlights
        const palettes = [
          'rgba(56, 189, 248,',  // Cyan 400
          'rgba(96, 165, 250,',  // Blue 400
          'rgba(167, 139, 250,', // Purple 400
          'rgba(52, 211, 153,',  // Emerald / Clean air
          'rgba(255, 255, 255,', // Crisp White sparkle
          'rgba(34, 211, 238,',  // Neon Cyan
        ];
        this.color = palettes[Math.floor(Math.random() * palettes.length)];
      }

      update() {
        this.pulse += this.pulseSpeed;
        const currentAlpha = Math.max(0.2, this.alpha + Math.sin(this.pulse) * 0.3);

        // Movement with slight atmospheric air current
        this.x += this.vx + Math.sin(this.pulse * 0.6) * 0.3;
        this.y += this.vy + Math.cos(this.pulse * 0.6) * 0.3;

        // Screen boundary wrap
        if (this.x < -15) this.x = width + 15;
        if (this.x > width + 15) this.x = -15;
        if (this.y < -15) this.y = height + 15;
        if (this.y > height + 15) this.y = -15;

        // Mouse air deflection
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouse.radius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const maxDistance = mouse.radius;
            const force = (maxDistance - distance) / maxDistance;
            const directionX = forceDirectionX * force * this.density * 0.8;
            const directionY = forceDirectionY * force * this.density * 0.8;

            this.x -= directionX;
            this.y -= directionY;
          }
        }

        this.currentAlpha = currentAlpha;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `${this.color} ${this.currentAlpha})`;
        ctx.shadowBlur = this.size * 6;
        ctx.shadowColor = `${this.color} 0.9)`;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }
    }

    function initClouds() {
      clouds = [];
      for (let i = 0; i < CLOUD_COUNT; i++) {
        clouds.push(new CloudPuff());
      }
    }

    function initParticles() {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new AirParticle());
      }
    }

    initClouds();
    initParticles();

    // Connect air particles with atmospheric stream lines
    function drawAirFlowLines() {
      const maxDistance = 115;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            const lineAlpha = (1 - distance / maxDistance) * 0.25;
            ctx.strokeStyle = `rgba(147, 197, 253, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Render Soft Cloud Volumetrics
      for (let i = 0; i < clouds.length; i++) {
        clouds[i].update();
        clouds[i].draw();
      }

      // Render Air Stream Lines
      drawAirFlowLines();

      // Render Air Quality Particles
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }

      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Cloud Dark Theme Ambient Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#06141B] via-[#0b1d28] to-[#06141B] opacity-95" />
      
      {/* Dynamic Luminous Cloud Nebulas in Background */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-gradient-to-br from-blue-600/25 via-indigo-700/15 to-transparent rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/3 -right-32 w-[650px] h-[650px] bg-gradient-to-tl from-cyan-500/20 via-sky-600/15 to-transparent rounded-full blur-3xl" />
      <div className="absolute -bottom-32 left-1/4 w-[700px] h-[700px] bg-gradient-to-tr from-indigo-900/25 via-purple-900/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-cyan-400/10 rounded-full blur-2xl" />

      {/* Atmospheric Air Mist Canvas with Floating Particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Subtle Atmospheric Vignette Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,rgba(6,20,27,0.55)_100%)] pointer-events-none" />
    </div>
  );
}
