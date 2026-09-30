import React from 'react';
import { Track } from '../types/music';
import { ListMusic, X, Play, Trash2, ArrowRight } from 'lucide-react';

interface QueueDrawerProps {
  currentTrack: Track | null;
  queue: Track[];
  onPlayTrack: (track: Track) => void;
  onClearQueue: () => void;
  onClose: () => void;
}

export const QueueDrawer: React.FC<QueueDrawerProps> = ({
  currentTrack,
  queue,
  onPlayTrack,
  onClearQueue,
  onClose,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed top-10 right-0 bottom-22 w-80 bg-[#16161f]/95 border-l border-white/[0.08] shadow-2xl backdrop-blur-3xl z-40 flex flex-col select-none text-xs">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <ListMusic className="w-4 h-4 text-[#fa2d48]" />
          <h3 className="font-bold text-sm text-white">Playing Next</h3>
        </div>
        <div className="flex items-center gap-1">
          {queue.length > 0 && (
            <button
              onClick={onClearQueue}
              className="text-[11px] text-white/50 hover:text-white px-2 py-1 rounded hover:bg-white/[0.06] transition-colors"
            >
              Clear
            </button>
          )}
          <button onClick={onClose} className="p-1 text-white/50 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Currently Playing Track */}
        {currentTrack && (
          <div>
            <div className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">
              Now Playing
            </div>
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.06] border border-white/10">
              <img
                src={currentTrack.artworkUrl}
                alt=""
                className="w-10 h-10 rounded-md object-cover border border-white/10 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-white truncate text-xs">{currentTrack.title}</div>
                <div className="text-white/60 truncate text-[11px]">{currentTrack.artist}</div>
              </div>
              <span className="text-[10px] text-[#fa2d48] font-bold">PLAYING</span>
            </div>
          </div>
        )}

        {/* Next Up List */}
        <div>
          <div className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">
            Up Next ({queue.length})
          </div>

          {queue.length === 0 ? (
            <div className="p-8 text-center text-white/30 text-xs italic">
              Queue is empty. Select any song or album to queue up tracks.
            </div>
          ) : (
            <div className="space-y-1">
              {queue.map((track, idx) => (
                <div
                  key={`${track.id}-${idx}`}
                  onClick={() => onPlayTrack(track)}
                  className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer group"
                >
                  <span className="w-4 text-center text-[10px] text-white/30 group-hover:text-white tabular-nums">
                    {idx + 1}
                  </span>
                  <img
                    src={track.artworkUrl}
                    alt=""
                    className="w-8 h-8 rounded object-cover border border-white/10 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-white truncate text-xs group-hover:text-[#fa2d48]">
                      {track.title}
                    </div>
                    <div className="text-white/50 truncate text-[10px]">{track.artist}</div>
                  </div>
                  <span className="text-[10px] text-white/40 tabular-nums">
                    {formatTime(track.duration)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
