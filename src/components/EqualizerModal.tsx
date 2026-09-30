import React, { useState } from 'react';
import { Sliders, X, RotateCcw, Volume2, ShieldCheck } from 'lucide-react';
import { EQ_FREQUENCIES } from '../services/audioEngine';
import { DEFAULT_EQUALIZER_PRESETS } from '../services/sampleData';

interface EqualizerModalProps {
  eqGains: number[];
  onChangeGains: (gains: number[]) => void;
  soundCheckEnabled: boolean;
  onToggleSoundCheck: () => void;
  onClose: () => void;
}

export const EqualizerModal: React.FC<EqualizerModalProps> = ({
  eqGains,
  onChangeGains,
  soundCheckEnabled,
  onToggleSoundCheck,
  onClose,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('custom');

  const handlePresetSelect = (presetId: string) => {
    setSelectedPresetId(presetId);
    const found = DEFAULT_EQUALIZER_PRESETS.find((p) => p.id === presetId);
    if (found) {
      onChangeGains([...found.gains]);
    }
  };

  const handleGainChange = (index: number, val: number) => {
    const updated = [...eqGains];
    updated[index] = val;
    onChangeGains(updated);
    setSelectedPresetId('custom');
  };

  const handleReset = () => {
    handlePresetSelect('flat');
  };

  const formatFreq = (hz: number) => {
    return hz >= 1000 ? `${hz / 1000}K` : `${hz}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none">
      <div className="w-full max-w-2xl bg-[#1c1c24] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#fa2d48]/20 flex items-center justify-center text-[#fa2d48]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">10-Band Graphic Equalizer</h2>
              <span className="text-[11px] text-white/50">High-Resolution Studio Acoustic Tuning</span>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs">
            <div className="flex items-center gap-3">
              <span className="text-white/60">Preset:</span>
              <select
                value={selectedPresetId}
                onChange={(e) => handlePresetSelect(e.target.value)}
                className="bg-black/60 border border-white/15 text-white rounded-lg px-3 py-1.5 font-medium focus:outline-none focus:border-[#fa2d48]"
              >
                <option value="custom">Custom Tuning</option>
                {DEFAULT_EQUALIZER_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sound Check Normalization */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-white/80 hover:text-white">
                <input
                  type="checkbox"
                  checked={soundCheckEnabled}
                  onChange={onToggleSoundCheck}
                  className="rounded border-white/20 text-[#fa2d48] focus:ring-0"
                />
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Sound Check
                </span>
              </label>

              <button
                onClick={handleReset}
                className="flex items-center gap-1 px-3 py-1 rounded bg-white/10 hover:bg-white/15 text-white/70 hover:text-white transition-colors"
                title="Reset to Flat"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* 10 Vertical EQ Sliders */}
          <div className="relative pt-6 pb-2 px-4 rounded-xl bg-black/30 border border-white/[0.04]">
            {/* 0dB Center Reference Line */}
            <div className="absolute top-[48%] left-4 right-4 h-px bg-white/10 pointer-events-none" />
            <div className="absolute top-[48%] left-1 -translate-y-1/2 text-[9px] text-white/30 font-mono">0dB</div>
            <div className="absolute top-4 left-1 text-[9px] text-white/30 font-mono">+12</div>
            <div className="absolute bottom-10 left-1 text-[9px] text-white/30 font-mono">-12</div>

            <div className="flex items-center justify-between gap-2 h-48 pl-6">
              {EQ_FREQUENCIES.map((freq, idx) => {
                const gain = eqGains[idx] || 0;
                return (
                  <div key={freq} className="flex-1 flex flex-col items-center h-full justify-between group">
                    <span className="text-[10px] text-white/40 tabular-nums group-hover:text-white">
                      {gain > 0 ? `+${gain}` : gain}
                    </span>

                    {/* Vertical Slider */}
                    <div className="h-32 flex items-center justify-center">
                      <input
                        type="range"
                        min={-12}
                        max={12}
                        step={0.5}
                        value={gain}
                        onChange={(e) => handleGainChange(idx, parseFloat(e.target.value))}
                        className="h-28 w-2 appearance-none bg-white/20 rounded-full outline-none"
                        style={{
                          WebkitAppearance: 'slider-vertical',
                          // @ts-ignore
                          writingMode: 'bt-lr',
                        }}
                      />
                    </div>

                    <span className="text-[10px] font-mono text-white/60 group-hover:text-[#fa2d48]">
                      {formatFreq(freq)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.08] bg-white/[0.02] text-xs">
          <span className="text-white/40">
            Real-time biquad audio filtering powered by Web Audio API.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#fa2d48] hover:bg-[#e0263f] text-white font-semibold shadow-lg shadow-[#fa2d48]/20"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
