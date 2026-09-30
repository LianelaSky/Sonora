import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../services/audioEngine';
import { Activity, X } from 'lucide-react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  onClose: () => void;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isPlaying, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const data = audioEngine.getVisualizerData();
      const barCount = 36;
      const barWidth = (width / barCount) - 2;

      for (let i = 0; i < barCount; i++) {
        // Calculate amplitude
        let rawVal = data[i * 2] || 0;
        if (!isPlaying) {
          rawVal = Math.sin(Date.now() / 400 + i * 0.2) * 6 + 10;
        }

        const barHeight = Math.max(4, (rawVal / 255) * height * 0.85);
        const x = i * (barWidth + 2);
        const y = height - barHeight;

        // Gradient from pink/red to amber
        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, '#fa2d48');
        gradient.addColorStop(0.7, '#fb7185');
        gradient.addColorStop(1, '#fbcfe8');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [3, 3, 0, 0]);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying]);

  return (
    <div className="fixed bottom-24 right-4 z-40 w-72 bg-[#1a1a24]/95 border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-2xl select-none">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.08] text-xs">
        <div className="flex items-center gap-1.5 text-white/80 font-semibold">
          <Activity className="w-3.5 h-3.5 text-[#fa2d48]" />
          <span>Spectrum Analyzer (24/96)</span>
        </div>
        <button onClick={onClose} className="text-white/40 hover:text-white p-0.5">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={260}
        height={90}
        className="w-full h-24 rounded-lg bg-black/40 border border-white/[0.04]"
      />

      <div className="flex justify-between text-[9px] text-white/40 font-mono mt-1.5 px-1">
        <span>32Hz</span>
        <span>1kHz</span>
        <span>16kHz</span>
      </div>
    </div>
  );
};
