import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { windowsNative } from '../services/windowsNative';
import { 
  Download, 
  X, 
  CheckCircle2, 
  Terminal, 
  HardDrive, 
  AppWindow, 
  Layers, 
  ShieldCheck, 
  Volume2, 
  Sparkles,
  ExternalLink 
} from 'lucide-react';

interface WindowsInstallModalProps {
  onClose: () => void;
}

export const WindowsInstallModal: React.FC<WindowsInstallModalProps> = ({ onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'winui' | 'direct' | 'exe'>('winui');
  const [copiedCmd, setCopiedCmd] = useState(false);

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setTimeout(() => onClose(), 1000);
    }
  };

  const copyBuildCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none text-white font-sans">
      <div className="w-full max-w-xl bg-[#181822] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0078d4] to-[#2b88d8] flex items-center justify-center text-white shadow-md">
              <AppWindow className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Windows Native Desktop Setup</h2>
              <span className="text-[11px] text-white/50">Pure C# / WinUI 3 &amp; Windows Desktop Engines</span>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 flex gap-2 border-b border-white/[0.06] overflow-x-auto">
          <button
            onClick={() => setActiveTab('winui')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'winui'
                ? 'border-[#0078d4] text-white'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#0078d4]" />
            <span>Pure Native (C# / WinUI 3)</span>
          </button>
          <button
            onClick={() => setActiveTab('direct')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'direct'
                ? 'border-[#0078d4] text-white'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            Direct Windows PWA Install
          </button>
          <button
            onClick={() => setActiveTab('exe')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'exe'
                ? 'border-[#0078d4] text-white'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            Electron Installer (.exe)
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs max-h-[75vh] overflow-y-auto">
          {activeTab === 'winui' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0078d4]/15 to-transparent border border-[#0078d4]/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-white text-sm">
                    <Sparkles className="w-4 h-4 text-[#0078d4]" />
                    <span>Real Native C# / .NET 8 + WinUI 3 Solution</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    Zero Chromium · ~25MB RAM
                  </span>
                </div>
                <p className="text-white/70 text-[11px] leading-relaxed">
                  The complete source code for the pure C# WinUI 3 solution is ready in the <code className="text-[#2b88d8] font-mono">/winui</code> folder of this project!
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-white/80 pt-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>WASAPI Exclusive Mode (Bit-perfect)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Mica Glass Backdrop (Win 11)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>TagLib# Lossless Audio Reader</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Up to 24-bit / 192kHz direct to DAC</span>
                  </div>
                </div>
              </div>

              {/* Quick CLI Run Instructions */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-white/80 font-mono text-[11px]">
                  <span>Run Native App via .NET CLI:</span>
                  <button
                    onClick={() => copyBuildCommand('cd winui/Sonora.Native && dotnet run')}
                    className="text-[#0078d4] hover:underline text-[10px]"
                  >
                    {copiedCmd ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="p-2.5 rounded-lg bg-black/60 font-mono text-[11px] text-emerald-400 border border-white/5 select-all">
                  cd winui/Sonora.Native &amp;&amp; dotnet run
                </div>
              </div>

              {/* Single File Publish Command */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-white/80 font-mono text-[11px]">
                  <span>Publish Single-File Native .EXE:</span>
                  <button
                    onClick={() => copyBuildCommand('cd winui/Sonora.Native && dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true')}
                    className="text-[#0078d4] hover:underline text-[10px]"
                  >
                    {copiedCmd ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="p-2.5 rounded-lg bg-black/60 font-mono text-[11px] text-cyan-300 border border-white/5 select-all text-[10px] break-all">
                  dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true
                </div>
              </div>
            </div>
          ) : activeTab === 'direct' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-white text-sm">
                    <Sparkles className="w-4 h-4 text-[#0078d4]" />
                    <span>Windows 11 Integration Highlights</span>
                  </div>
                  {isInstalled ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                      Installed on Windows
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-[#2b88d8] text-[10px] font-bold">
                      Ready to Install
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-[11px] text-white/70">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Windows Start Menu & Taskbar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Title Bar Overlay (Mica glass)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Double-click .FLAC/.MP3 files</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Windows 11 Volume & Media keys</span>
                  </div>
                </div>
              </div>

              {isInstalled ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-center space-y-1">
                  <div className="font-bold">Sonora is already installed as a Windows app!</div>
                  <div className="text-[11px] text-emerald-300/80">
                    You can launch it anytime from your Windows Start Menu, Taskbar, or search for "Sonora Music".
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-white/60 leading-relaxed text-[11px]">
                    Click the button below to register Sonora Music directly with Windows. It installs as a dedicated desktop app with offline file associations, zero browser address bar, and hardware media keys.
                  </p>

                  <button
                    onClick={handleInstallClick}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#0078d4] to-[#00a2ed] hover:brightness-110 text-white font-bold text-xs shadow-lg shadow-[#0078d4]/30 flex items-center justify-center gap-2 transition-transform active:scale-98"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install Sonora on Windows</span>
                  </button>

                  <div className="text-[10px] text-white/40 text-center">
                    Works in Microsoft Edge and Google Chrome on Windows 10 & 11.
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-white/80 font-mono text-[11px]">
                  <span>Package Windows .EXE / NSIS Installer</span>
                  <button
                    onClick={() => copyBuildCommand('npm run build && npx electron-builder --win')}
                    className="text-[#0078d4] hover:underline text-[10px]"
                  >
                    {copiedCmd ? 'Copied!' : 'Copy Command'}
                  </button>
                </div>
                <div className="p-2.5 rounded-lg bg-black/60 font-mono text-[11px] text-emerald-400 select-all border border-white/5">
                  npm run build && npx electron-builder --win
                </div>
              </div>

              <div className="space-y-2 text-white/70 text-[11px]">
                <div className="font-semibold text-white">Full Native Windows Executable includes:</div>
                <ul className="space-y-1 list-disc pl-4 text-white/60">
                  <li>Windows 11 Taskbar Thumbnail Toolbar (mini player preview in taskbar)</li>
                  <li>Windows System Tray minimization and background playback icon</li>
                  <li>Direct Windows File Explorer folder picker (`dialog.showOpenDialog`)</li>
                  <li>Global hardware keyboard shortcuts (Play/Pause, Next, Prev)</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.08] bg-white/[0.02] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
