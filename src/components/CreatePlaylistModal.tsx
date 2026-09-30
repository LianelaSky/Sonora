import React, { useState } from 'react';
import { UserPlaylist, Track } from '../types/music';
import { ListMusic, X, Check } from 'lucide-react';

interface CreatePlaylistModalProps {
  onSave: (name: string, description: string) => void;
  onClose: () => void;
}

export const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({ onSave, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim(), description.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none">
      <div className="w-full max-w-md bg-[#1c1c24] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#fa2d48]/20 flex items-center justify-center text-[#fa2d48]">
              <ListMusic className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">New Playlist</h2>
              <span className="text-[11px] text-white/50">Custom Library Collection</span>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-white/40 uppercase mb-1">
              Playlist Name
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Late Night Drives"
              className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/10 text-white font-medium focus:outline-none focus:border-[#fa2d48]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-white/40 uppercase mb-1">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add an optional description"
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/10 text-white focus:outline-none focus:border-[#fa2d48] resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-white/[0.08] bg-white/[0.02] text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#fa2d48] hover:bg-[#e0263f] text-white font-semibold shadow-lg shadow-[#fa2d48]/25 disabled:opacity-40"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Create Playlist</span>
          </button>
        </div>
      </div>
    </div>
  );
};
