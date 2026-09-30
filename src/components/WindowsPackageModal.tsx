import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Terminal, 
  ExternalLink, 
  Check, 
  Copy, 
  Layers, 
  Sparkles, 
  Monitor, 
  HardDrive, 
  ShieldCheck,
  CheckCircle2,
  Box
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface WindowsPackageModalProps {
  onClose: () => void;
}

export const WindowsPackageModal: React.FC<WindowsPackageModalProps> = ({ onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pwa' | 'electron' | 'msix' | 'tauri'>('pwa');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(id);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const electronCode = `# 1. Build the Vite production bundle
npm run build

# 2. Package into a standalone Windows .exe installer
npx electron-builder --win --x64`;

  const electronPackageConfig = `// Add this to your package.json:
{
  "main": "electron/main.cjs",
  "scripts": {
    "electron": "electron .",
    "package:win": "npm run build && electron-builder --win"
  },
  "build": {
    "appId": "com.sonora.music",
    "productName": "Sonora Music",
    "win": {
      "target": ["nsis", "portable"],
      "icon": "public/icon.svg"
    }
  }
}`;

  const tauriCode = `# 1. Add Tauri CLI
npm install -D @tauri-apps/cli

# 2. Initialize and build lightweight Windows .msi / .exe (<10MB)
npx tauri init
npx tauri build`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none text-white">
      <div className="w-full max-w-2xl bg-[#1a1a24] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0078d4] to-[#00bcf2] flex items-center justify-center text-white shadow-md">
              <Monitor className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Package & Install for Windows</h2>
              <span className="text-[11px] text-white/50">Run Sonora as a native Windows 11 desktop app</span>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 pb-2 flex gap-2 border-b border-white/[0.06] text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'pwa'
                ? 'bg-white text-black font-semibold shadow'
                : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>1-Click Install (PWA)</span>
          </button>

          <button
            onClick={() => setActiveTab('electron')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'electron'
                ? 'bg-white text-black font-semibold shadow'
                : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Standalone .EXE (Electron)</span>
          </button>

          <button
            onClick={() => setActiveTab('msix')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'msix'
                ? 'bg-white text-black font-semibold shadow'
                : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>MSIX / Windows Store</span>
          </button>

          <button
            onClick={() => setActiveTab('tauri')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'tauri'
                ? 'bg-white text-black font-semibold shadow'
                : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Tauri (.MSI)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {activeTab === 'pwa' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0078d4]/15 to-transparent border border-[#0078d4]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm text-white">
                    <CheckCircle2 className="w-4 h-4 text-[#00bcf2]" />
                    <span>Instant Windows Desktop Installation</span>
                  </div>
                  {isInstalled && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                      Already Installed!
                    </span>
                  )}
                </div>

                <p className="text-white/70 leading-relaxed text-[11px]">
                  You can install Sonora right now into Windows without installing Node.js or compilers.
                  It runs in an isolated Windows 11 Mica frame with taskbar pin, startup launch, offline file access, and audio media keys.
                </p>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={async () => {
                      if (isInstallable) {
                        await install();
                      } else {
                        alert(
                          'To install on Windows:\n1. Click the "Install Sonora" icon in Edge or Chrome\'s address bar (or menu > Apps > Install this site as an app).\n2. Sonora will appear as a native Windows desktop app with its own taskbar icon!'
                        );
                      }
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#fa2d48] to-[#fb5e74] hover:brightness-110 text-white font-bold text-xs shadow-lg shadow-[#fa2d48]/25 transition-transform active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isInstallable ? 'Install Sonora to Windows' : 'How to Install in 1 Click'}</span>
                  </button>
                </div>
              </div>

              {/* Step by step Edge/Chrome guide */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">
                  In Microsoft Edge or Google Chrome on Windows:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px] text-[#fa2d48]">1</div>
                    <div className="font-semibold text-white text-[11px]">Address Bar Icon</div>
                    <div className="text-[10px] text-white/50">Look for the app install badge icon on the right of the URL bar.</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px] text-[#fa2d48]">2</div>
                    <div className="font-semibold text-white text-[11px]">Click "Install"</div>
                    <div className="text-[10px] text-white/50">Confirm prompt to install "Sonora Music" on your Windows system.</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px] text-[#fa2d48]">3</div>
                    <div className="font-semibold text-white text-[11px]">Pin to Taskbar</div>
                    <div className="text-[10px] text-white/50">Windows will offer to pin it to your Taskbar and Start Menu!</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'electron' && (
            <div className="space-y-4">
              <p className="text-white/70 leading-relaxed text-[11px]">
                We have already generated the complete <code>electron/main.cjs</code> entry point in this repository!
                To compile an actual standalone <code>.exe</code> installer (NSIS or portable) for Windows:
              </p>

              <div>
                <div className="flex items-center justify-between pb-1.5">
                  <span className="text-[10px] font-semibold text-white/40 uppercase">Commands to Run (Terminal)</span>
                  <button
                    onClick={() => copyToClipboard(electronCode, 'electron')}
                    className="text-[#00d4ff] hover:underline flex items-center gap-1 text-[11px]"
                  >
                    {copiedTab === 'electron' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedTab === 'electron' ? 'Copied!' : 'Copy Commands'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-black/60 border border-white/10 text-emerald-400 font-mono text-[11px] overflow-x-auto">
                  {electronCode}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between pb-1.5">
                  <span className="text-[10px] font-semibold text-white/40 uppercase">Package.json Configuration</span>
                  <button
                    onClick={() => copyToClipboard(electronPackageConfig, 'electron-config')}
                    className="text-[#00d4ff] hover:underline flex items-center gap-1 text-[11px]"
                  >
                    {copiedTab === 'electron-config' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedTab === 'electron-config' ? 'Copied!' : 'Copy Config'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-black/60 border border-white/10 text-amber-300 font-mono text-[10px] overflow-x-auto max-h-36">
                  {electronPackageConfig}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'msix' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <h3 className="font-bold text-white text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0078d4]" />
                  Microsoft Official PWABuilder (.MSIX Package)
                </h3>
                <p className="text-white/60 text-[11px] leading-relaxed">
                  Microsoft's official PWABuilder tool converts this app's URL directly into a signed <code>.msix</code> Windows installer package ready to double-click on any Windows 10/11 PC or submit to the Microsoft Store.
                </p>
                <div className="pt-2">
                  <a
                    href="https://www.pwabuilder.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0078d4] hover:bg-[#006cbd] text-white font-semibold text-xs transition-colors"
                  >
                    <span>Open PWABuilder.com</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="text-[11px] text-white/50 space-y-1">
                <div>• Paste the application URL into PWABuilder.</div>
                <div>• Click <strong>Package for Windows</strong>.</div>
                <div>• Download the generated <code>.msix</code> package and double-click to install on Windows!</div>
              </div>
            </div>
          )}

          {activeTab === 'tauri' && (
            <div className="space-y-3">
              <p className="text-white/70 text-[11px] leading-relaxed">
                Tauri uses Windows native WebView2 and Rust, generating an ultra-compact (~8MB) <code>.msi</code> installer that consumes 80% less RAM than Electron.
              </p>
              <div className="flex items-center justify-between pb-1">
                <span className="text-[10px] font-semibold text-white/40 uppercase">Tauri Build Steps</span>
                <button
                  onClick={() => copyToClipboard(tauriCode, 'tauri')}
                  className="text-[#00d4ff] hover:underline flex items-center gap-1 text-[11px]"
                >
                  {copiedTab === 'tauri' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedTab === 'tauri' ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-black/60 border border-white/10 text-emerald-400 font-mono text-[11px] overflow-x-auto">
                {tauriCode}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.08] bg-white/[0.02] text-xs">
          <span className="text-white/40">
            Pre-configured with Windows 11 Mica, taskbar audio keys, and offline storage.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
