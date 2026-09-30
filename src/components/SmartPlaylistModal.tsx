import React, { useState } from 'react';
import { SmartPlaylist, SmartRule, SmartRuleField, SmartRuleOperator, Track } from '../types/music';
import { evaluateSmartPlaylist } from '../services/sampleData';
import { Sparkles, Plus, Trash2, X, Check } from 'lucide-react';

interface SmartPlaylistModalProps {
  initialPlaylist?: SmartPlaylist | null;
  allTracks: Track[];
  onSave: (playlist: SmartPlaylist) => void;
  onClose: () => void;
}

export const SmartPlaylistModal: React.FC<SmartPlaylistModalProps> = ({
  initialPlaylist,
  allTracks,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(initialPlaylist?.name || 'New Smart Playlist');
  const [description, setDescription] = useState(initialPlaylist?.description || 'Automatically updated based on library rules.');
  const [matchType, setMatchType] = useState<'all' | 'any'>(initialPlaylist?.matchType || 'all');
  const [rules, setRules] = useState<SmartRule[]>(
    initialPlaylist?.rules || [
      { id: '1', field: 'isHiRes', operator: 'isTrue', value: true },
    ]
  );
  const [limit, setLimit] = useState<number | undefined>(initialPlaylist?.limit);
  const [sortBy, setSortBy] = useState<SmartPlaylist['sortBy']>(initialPlaylist?.sortBy || 'dateAdded');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialPlaylist?.sortOrder || 'desc');

  const addRule = () => {
    setRules([
      ...rules,
      {
        id: Math.random().toString(36).substring(2, 9),
        field: 'genre',
        operator: 'contains',
        value: 'Electronic',
      },
    ]);
  };

  const removeRule = (id: string) => {
    setRules(rules.filter((r) => r.id !== id));
  };

  const updateRule = (id: string, updates: Partial<SmartRule>) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  // Preview matching tracks in real-time
  const previewPlaylist: SmartPlaylist = {
    id: initialPlaylist?.id || 'temp',
    name,
    description,
    matchType,
    rules,
    limit,
    sortBy,
    sortOrder,
    isSmart: true,
  };

  const matchedTracks = evaluateSmartPlaylist(previewPlaylist, allTracks);

  const handleSave = () => {
    const finalPlaylist: SmartPlaylist = {
      id: initialPlaylist?.id || 'smart_' + Math.random().toString(36).substring(2, 9),
      name: name.trim() || 'Untitled Smart Playlist',
      description,
      matchType,
      rules,
      limit: limit ? Number(limit) : undefined,
      sortBy,
      sortOrder,
      isSmart: true,
      coverGradient: initialPlaylist?.coverGradient || ['#fa2d48', '#881337'],
    };
    onSave(finalPlaylist);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md select-none">
      <div className="w-full max-w-2xl bg-[#1c1c24] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#fa2d48]/20 flex items-center justify-center text-[#fa2d48]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {initialPlaylist ? 'Edit Smart Playlist' : 'New Smart Playlist'}
              </h2>
              <span className="text-[11px] text-white/50">Apple Music Rule Generator</span>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-white/40 uppercase mb-1">
                Playlist Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/10 text-white font-medium focus:outline-none focus:border-[#fa2d48]"
                placeholder="e.g. 90's Lossless Masters"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-white/40 uppercase mb-1">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/10 text-white focus:outline-none focus:border-[#fa2d48]"
                placeholder="Short description"
              />
            </div>
          </div>

          {/* Match Rule Logic */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-white/70">Match</span>
            <select
              value={matchType}
              onChange={(e) => setMatchType(e.target.value as any)}
              className="bg-black/60 border border-white/15 text-white rounded-md px-2.5 py-1 font-semibold focus:outline-none"
            >
              <option value="all">ALL</option>
              <option value="any">ANY</option>
            </select>
            <span className="text-white/70">of the following rules:</span>
          </div>

          {/* Rules List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-white/40 uppercase">Rules</span>
              <button
                onClick={addRule}
                className="flex items-center gap-1 text-[#fa2d48] hover:underline font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Rule</span>
              </button>
            </div>

            {rules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]"
              >
                {/* Field */}
                <select
                  value={rule.field}
                  onChange={(e) => updateRule(rule.id, { field: e.target.value as SmartRuleField })}
                  className="bg-black/60 border border-white/15 text-white rounded-md px-2 py-1 focus:outline-none"
                >
                  <option value="artist">Artist</option>
                  <option value="album">Album</option>
                  <option value="title">Title</option>
                  <option value="genre">Genre</option>
                  <option value="year">Year</option>
                  <option value="playCount">Play Count</option>
                  <option value="isFavorite">Favorite</option>
                  <option value="isHiRes">Hi-Res Lossless</option>
                  <option value="isLossless">Lossless</option>
                </select>

                {/* Operator */}
                <select
                  value={rule.operator}
                  onChange={(e) => updateRule(rule.id, { operator: e.target.value as SmartRuleOperator })}
                  className="bg-black/60 border border-white/15 text-white rounded-md px-2 py-1 focus:outline-none"
                >
                  {rule.field === 'isFavorite' || rule.field === 'isHiRes' || rule.field === 'isLossless' ? (
                    <>
                      <option value="isTrue">is true</option>
                      <option value="isFalse">is false</option>
                    </>
                  ) : rule.field === 'year' || rule.field === 'playCount' ? (
                    <>
                      <option value="equals">is</option>
                      <option value="greaterThan">is greater than</option>
                      <option value="lessThan">is less than</option>
                    </>
                  ) : (
                    <>
                      <option value="contains">contains</option>
                      <option value="doesNotContain">does not contain</option>
                      <option value="equals">is</option>
                    </>
                  )}
                </select>

                {/* Value Input */}
                {rule.field !== 'isFavorite' && rule.field !== 'isHiRes' && rule.field !== 'isLossless' && (
                  <input
                    type={rule.field === 'year' || rule.field === 'playCount' ? 'number' : 'text'}
                    value={String(rule.value || '')}
                    onChange={(e) =>
                      updateRule(rule.id, {
                        value: rule.field === 'year' || rule.field === 'playCount' ? Number(e.target.value) : e.target.value,
                      })
                    }
                    className="flex-1 px-2.5 py-1 rounded bg-black/60 border border-white/15 text-white focus:outline-none"
                    placeholder="Value..."
                  />
                )}

                {/* Delete button */}
                <button
                  onClick={() => removeRule(rule.id)}
                  disabled={rules.length <= 1}
                  className="text-white/30 hover:text-red-400 p-1 disabled:opacity-20"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Limits & Sorting */}
          <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div>
              <label className="block text-[10px] text-white/40 mb-1">Limit (optional)</label>
              <input
                type="number"
                value={limit || ''}
                onChange={(e) => setLimit(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g. 25"
                className="w-full px-2 py-1 rounded bg-black/60 border border-white/15 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-white/40 mb-1">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-2 py-1 rounded bg-black/60 border border-white/15 text-white focus:outline-none"
              >
                <option value="dateAdded">Date Added</option>
                <option value="playCount">Play Count</option>
                <option value="title">Title</option>
                <option value="artist">Artist</option>
                <option value="year">Year</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-white/40 mb-1">Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="w-full px-2 py-1 rounded bg-black/60 border border-white/15 text-white focus:outline-none"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>

          {/* Real-time Match Indicator */}
          <div className="p-3 rounded-xl bg-[#fa2d48]/10 border border-[#fa2d48]/20 flex items-center justify-between text-xs">
            <span className="text-white/80">
              Live Preview: <strong>{matchedTracks.length} tracks</strong> match these criteria
            </span>
            <span className="text-[#fa2d48] font-bold">Auto-Syncs</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-white/[0.08] bg-white/[0.02]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#fa2d48] hover:bg-[#e0263f] text-white text-xs font-semibold shadow-lg shadow-[#fa2d48]/25"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Smart Playlist</span>
          </button>
        </div>
      </div>
    </div>
  );
};
