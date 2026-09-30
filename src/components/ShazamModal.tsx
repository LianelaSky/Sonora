import React, { useState, useEffect } from 'react';
import { Track } from '../types/music';
import { shazamService, RecognitionResult } from '../services/shazamService';
import { Sparkles, Radio, Check, X, RefreshCw, Music2, Quote, ArrowRight, Disc } from 'lucide-react';

interface ShazamModalProps {
  track: Track | null;
  onApplyMetadata: (trackId: string, updatedFields: Partial<Track>) => void;
  onClose: () => void;
}

export const ShazamModal: React.FC<ShazamModalProps> = ({
  track,
  onApplyMetadata,
  onClose,
}) => {
  const [isRecognizing, setIsRecognizing] = useState(true);
  const [progressMsg, setProgressMsg] = useState('Listening to audio stream...');
  const [progressPct, setProgressPct] = useState(20);
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [applied, setApplied] = useState(false);

  const runRecognition = async () => {
    if (!track) return;
    setIsRecognizing(true);
    setApplied(false);
    setResult(null);

    const match = await shazamService.recognizeTrack(track, (msg, pct) => {
      setProgressMsg(msg);
      setProgressPct(pct);
    });

    setResult(match);
    setIsRecognizing(false);
  };

  useEffect(() => {
    runRecognition();
  }, [track]);

  const handleApply = () => {
    if (!track || !result) return;

    const updates: Partial<Track> = {
      title: result.title,
      artist: result.artist,
      album: result.album,
      year: result.year,
      genre: result.genre,
    };

    if (result.artworkUrl) {
      updates.artworkUrl = result.artworkUrl;
      updates.accentColors = result.accentColors;
    }

    if (result.lyrics) {
      updates.lyrics = result.lyrics;
    }

    onApplyMetadata(track.id, updates);
    setApplied(true);
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="w-full max-w-lg bg-[#181822] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#0088ff] to-[#00d4ff] flex items-center justify-center text-white shadow-md">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Sonora Shazam Auto-Detection</h2>
              <span className="text-[10px] text-white/50">Acoustic Audio Fingerprinting & Tag Matcher</span>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center text-center">
          {isRecognizing ? (
            <div className="py-10 flex flex-col items-center space-y-6">
              {/* Shazam Pulsing Radar Animation */}
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-[#0088ff]/20 animate-ping opacity-75" />
                <div className="absolute -inset-3 rounded-full bg-[#00d4ff]/10 animate-pulse" />
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#0088ff] to-[#00d4ff] flex items-center justify-center shadow-xl shadow-[#0088ff]/30">
                  <Radio className="w-10 h-10 text-white animate-bounce" />
                </div>
              </div>

              <div className="space-y-2 max-w-xs">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Listening to Local Audio...
                </h3>
                <p className="text-xs text-white/60">{progressMsg}</p>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-3">
                  <div
                    className="bg-gradient-to-r from-[#0088ff] to-[#00d4ff] h-full transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {track && (
                <div className="text-[11px] text-white/40 font-mono truncate max-w-xs px-3 py-1.5 rounded-lg bg-black/30 border border-white/5">
                  Analyzing: {track.fileName}
                </div>
              )}
            </div>
          ) : result ? (
            <div className="w-full space-y-6">
              {/* Match Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 text-left flex gap-4 items-start">
                <img
                  src={result.artworkUrl || track?.artworkUrl}
                  alt={result.title}
                  className="w-24 h-24 rounded-xl object-cover shadow-2xl border border-white/15 shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] tracking-wide">
                      {result.confidence}% MATCH
                    </span>
                    {result.lyrics?.syncedLines && (
                      <span className="px-2 py-0.5 rounded-full bg-[#fa2d48]/20 text-[#fa2d48] font-bold text-[10px] flex items-center gap-1">
                        <Quote className="w-2.5 h-2.5" />
                        Synced Lyrics
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-extrabold text-white truncate">{result.title}</h3>
                  <div className="text-xs font-semibold text-[#00d4ff] truncate">{result.artist}</div>
                  <div className="text-[11px] text-white/50 truncate">
                    {result.album} {result.year ? `· ${result.year}` : ''} {result.genre ? `· ${result.genre}` : ''}
                  </div>
                </div>
              </div>

              {/* Diff view */}
              <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.05] text-left text-xs space-y-1.5">
                <div className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1">
                  Metadata Update Preview
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-white/[0.03] truncate">
                    <span className="text-white/40 block text-[9px]">Original</span>
                    <span className="text-white/70 truncate block">{track?.title}</span>
                  </div>
                  <div className="p-2 rounded bg-[#0088ff]/15 border border-[#0088ff]/20 truncate">
                    <span className="text-[#00d4ff] block text-[9px] font-bold">Identified</span>
                    <span className="text-white font-medium truncate block">{result.title}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={runRecognition}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white/80 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Scan Again</span>
                </button>

                <button
                  onClick={handleApply}
                  disabled={applied}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0088ff] to-[#00d4ff] hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-[#0088ff]/25 transition-transform active:scale-95"
                >
                  {applied ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Updated Library!</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-white" />
                      <span>Apply Metadata & Sync Lyrics</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="py-8 space-y-4">
              <div className="text-white/40 text-sm">Could not confidently identify track.</div>
              <button
                onClick={runRecognition}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
