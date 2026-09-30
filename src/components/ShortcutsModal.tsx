import React, { useState } from 'react';
import { KeyboardShortcutConfig } from '../types/music';
import { Keyboard, X, RotateCcw, Check } from 'lucide-react';
import { DEFAULT_KEYBOARD_SHORTCUTS } from '../services/sampleData';

interface ShortcutsModalProps {
  shortcuts: KeyboardShortcutConfig[];
  onSaveShortcuts: (shortcuts: KeyboardShortcutConfig[]) => void;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({
  shortcuts,
  onSaveShortcuts,
  onClose,
}) => {
  const [activeShortcutList, setActiveShortcutList] = useState<KeyboardShortcutConfig[]>([...shortcuts]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    e.preventDefault();
    if (e.key === 'Escape') {
      setEditingId(null);
      return;
    }

    const key = e.key;
    const ctrl = e.ctrlKey || e.metaKey;
    const shift = e.shiftKey;
    const alt = e.altKey;

    setActiveShortcutList((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              currentKey: key === ' ' ? 'Space' : key,
              requiresCtrl: ctrl,
              requiresShift: shift,
              requiresAlt: alt,
            }
          : s
      )
    );
    setEditingId(null);
  };

  const handleResetDefaults = () => {
    setActiveShortcutList([...DEFAULT_KEYBOARD_SHORTCUTS]);
  };

  const handleSave = () => {
    onSaveShortcuts(activeShortcutList);
    onClose();
  };

  const formatKeyDisplay = (s: KeyboardShortcutConfig) => {
    const parts: string[] = [];
    if (s.requiresCtrl) parts.push('Ctrl');
    if (s.requiresAlt) parts.push('Alt');
    if (s.requiresShift) parts.push('Shift');
    parts.push(s.currentKey === ' ' ? 'Space' : s.currentKey);
    return parts.join(' + ');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none">
      <div className="w-full max-w-xl bg-[#1c1c24] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#fa2d48]/20 flex items-center justify-center text-[#fa2d48]">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Customizable Keyboard Shortcuts</h2>
              <span className="text-[11px] text-white/50">Windows Desktop Hotkeys</span>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-6 space-y-2 overflow-y-auto max-h-[60vh] text-xs">
          <p className="text-white/50 mb-4 text-[11px] leading-relaxed">
            Click on any hotkey box below and press your desired key combination to customize keyboard controls.
          </p>

          <div className="space-y-1.5">
            {activeShortcutList.map((shortcut) => {
              const isEditing = editingId === shortcut.id;

              return (
                <div
                  key={shortcut.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-colors"
                >
                  <div>
                    <div className="font-semibold text-white">{shortcut.label}</div>
                    <div className="text-[10px] text-white/40">{shortcut.action}</div>
                  </div>

                  {isEditing ? (
                    <div
                      tabIndex={0}
                      onKeyDown={(e) => handleKeyDown(e, shortcut.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#fa2d48] text-white font-mono font-bold animate-pulse outline-none cursor-pointer"
                    >
                      Press any key...
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingId(shortcut.id)}
                      className="px-3 py-1.5 rounded-lg bg-black/40 hover:bg-white/10 border border-white/10 text-white/90 font-mono font-medium hover:border-[#fa2d48] transition-colors"
                    >
                      {formatKeyDisplay(shortcut)}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.08] bg-white/[0.02]">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white/70 hover:text-white text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <div className="flex items-center gap-2">
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
              <span>Save Shortcuts</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
