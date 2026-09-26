import React, { useRef, useEffect } from 'react';
import { soundScapeEngine } from '../../audio/SoundScapeEngine';
import { VisualizerMode } from '../../types/soundscape';

interface SoundVisualizerProps {
  mode: VisualizerMode;
  isPlaying: boolean;
  accentColor?: string;
}

interface InteractiveRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  speed: number;
}

export const SoundVisualizer: React.FC<SoundVisualizerProps> = ({
  mode,
  isPlaying,
  accentColor = '#38bdf8'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ripplesRef = useRef<InteractiveRipple[]>([]);

  // Interactive touch / click ripple spawner
  const handleInteraction = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Ensure AudioContext is resumed on direct mobile touch event
    soundScapeEngine.resumeContext();

    // Map coordinates using getBoundingClientRect() rather than window coordinates
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ripplesRef.current.push({
      x,
      y,
      radius: 4,
      maxRadius: Math.max(rect.width, rect.height) * 0.45,
      opacity: 0.95,
      speed: 2.4
    });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    handleInteraction(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    // Only spawn ripple for single-touch; allow multi-finger pinch-to-zoom gestures to proceed natively
    if (e.touches && e.touches.length === 1) {
      handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    // Allocate initial FFT analysis buffer
    let analyser = soundScapeEngine.getAnalyser();
    let bufferLength = analyser ? analyser.frequencyBinCount : 128;
    let dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      // Continue requestAnimationFrame loop without aborting even if dimensions shift
      animId = requestAnimationFrame(draw);

      // Canvas Resizing & High-DPI scaling:
      // Dynamically detect devicePixelRatio and set explicit width/height
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const clientWidth = canvas.clientWidth || rect.width || 1024;
      const clientHeight = canvas.clientHeight || rect.height || 64;

      if (clientWidth <= 0 || clientHeight <= 0) {
        return;
      }

      const targetPixelWidth = Math.max(1, Math.floor(clientWidth * dpr));
      const targetPixelHeight = Math.max(1, Math.floor(clientHeight * dpr));

      if (canvas.width !== targetPixelWidth || canvas.height !== targetPixelHeight) {
        canvas.width = targetPixelWidth;
        canvas.height = targetPixelHeight;
      }

      // Reset matrix and scale by DPR so draw commands use logical CSS pixel units
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, clientWidth, clientHeight);

      // Dynamically re-verify AnalyserNode connection each frame to handle late AudioContext initialization
      const currentAnalyser = soundScapeEngine.getAnalyser();
      let avgEnergy = 0;

      if (currentAnalyser && isPlaying) {
        if (dataArray.length !== currentAnalyser.frequencyBinCount) {
          bufferLength = currentAnalyser.frequencyBinCount;
          dataArray = new Uint8Array(bufferLength);
        }

        if (mode === 'wave') {
          currentAnalyser.getByteTimeDomainData(dataArray);
        } else {
          currentAnalyser.getByteFrequencyData(dataArray);
        }

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        avgEnergy = sum / bufferLength;
      } else {
        // Idle ambient breathing state when paused or awaiting first strike
        phase += 0.02;
        avgEnergy = 128 + Math.sin(phase) * 8;
      }

      phase += 0.03;

      if (mode === 'wave') {
        // -------------------------------------------------------------
        // Mode 1: Organic Ambient Waveform
        // -------------------------------------------------------------
        ctx.lineWidth = 2.5;
        const gradient = ctx.createLinearGradient(0, 0, clientWidth, 0);
        gradient.addColorStop(0, 'rgba(56, 189, 248, 0.2)');
        gradient.addColorStop(0.5, accentColor);
        gradient.addColorStop(1, 'rgba(56, 189, 248, 0.2)');
        ctx.strokeStyle = gradient;

        ctx.beginPath();
        const sliceWidth = clientWidth / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = isPlaying ? (dataArray[i] / 128.0) : (1.0 + Math.sin(i * 0.15 + phase) * 0.08);
          const y = (v * clientHeight) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.lineTo(clientWidth, clientHeight / 2);
        ctx.stroke();

        // Secondary subtle harmonic layer
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.beginPath();
        x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const v = isPlaying 
            ? ((dataArray[i] / 128.0 - 1) * 0.6 + 1)
            : (1.0 + Math.cos(i * 0.12 - phase) * 0.06);
          const y = (v * clientHeight) / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.stroke();

      } else if (mode === 'bars') {
        // -------------------------------------------------------------
        // Mode 2: Minimalist Frequency Spectrum Bars
        // -------------------------------------------------------------
        const barCount = 48;
        const barWidth = (clientWidth / barCount) - 3;
        const step = Math.floor(bufferLength / barCount) || 1;

        for (let i = 0; i < barCount; i++) {
          const val = isPlaying ? dataArray[i * step] : (Math.sin(i * 0.3 + phase) * 15 + 20);
          const barHeight = Math.max(3, (val / 255) * (clientHeight * 0.75));

          const x = i * (barWidth + 3) + 1.5;
          const y = clientHeight - barHeight - 4;

          const grad = ctx.createLinearGradient(0, y, 0, clientHeight);
          grad.addColorStop(0, accentColor);
          grad.addColorStop(1, 'rgba(56, 189, 248, 0.15)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [3, 3, 0, 0]);
          ctx.fill();
        }

      } else {
        // -------------------------------------------------------------
        // Mode 3: Radial Zen Concentric Sound Ripple
        // -------------------------------------------------------------
        const centerX = clientWidth / 2;
        const centerY = clientHeight / 2;
        const baseRadius = Math.min(clientWidth, clientHeight) * 0.18;
        const pulse = isPlaying ? (avgEnergy / 255) * 28 : (Math.sin(phase) * 6 + 6);

        // Continuous ambient acoustic concentric ripples
        for (let r = 1; r <= 4; r++) {
          const radius = baseRadius + r * 14 + pulse * (r * 0.35);
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(56, 189, 248, ${0.45 / r})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Center glowing harmonic node
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius + pulse * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
        ctx.fill();
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Render interactive touch/click ripples mapped via getBoundingClientRect offsets
        const activeRipples = ripplesRef.current;
        for (let i = activeRipples.length - 1; i >= 0; i--) {
          const rip = activeRipples[i];
          rip.radius += rip.speed * (1 + (avgEnergy / 255) * 0.6);
          rip.opacity *= 0.955;

          if (rip.opacity <= 0.02 || rip.radius >= rip.maxRadius) {
            activeRipples.splice(i, 1);
            continue;
          }

          // Outer ripple boundary
          ctx.beginPath();
          ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(56, 189, 248, ${rip.opacity})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Internal secondary wave ring
          if (rip.radius > 12) {
            ctx.beginPath();
            ctx.arc(rip.x, rip.y, rip.radius * 0.58, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(167, 139, 250, ${rip.opacity * 0.65})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      ctx.restore();
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [mode, isPlaying, accentColor]);

  return (
    <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-pointer"
        style={{ touchAction: 'pan-x pan-y pinch-zoom' }}
        onPointerDown={handlePointerDown}
        onTouchStart={handleTouchStart}
        title="Interactive sound visualizer (Click or tap to ripple)"
      />
    </div>
  );
};
