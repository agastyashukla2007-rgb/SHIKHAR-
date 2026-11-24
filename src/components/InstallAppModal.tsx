import React, { useState } from 'react';
import {
  CheckCircle2,
  Download,
  ExternalLink,
  FolderGit2,
  Info,
  Settings,
  Smartphone,
  WifiOff,
  X,
} from 'lucide-react';
import {
  ApkReleaseConfig,
  getApkReleaseConfig,
  saveApkReleaseConfig,
  useOnlineStatus,
  usePWAInstall,
} from '../hooks/usePWAInstall';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [apkConfig, setApkConfig] = useState<ApkReleaseConfig>(() => getApkReleaseConfig());
  const [repoInput, setRepoInput] = useState(apkConfig.githubRepo);
  const [urlInput, setUrlInput] = useState(apkConfig.directApkUrl);
  const [showConfig, setShowConfig] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [installAttemptedMsg, setInstallAttemptedMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInstallPwa = async () => {
    const accepted = await install();
    if (accepted) {
      setInstallAttemptedMsg('SankalpPrep installed on your device!');
    }
  };

  const handleSaveApkLink = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveApkReleaseConfig({
      githubRepo: repoInput,
      directApkUrl: urlInput,
    });
    setApkConfig(updated);
    setRepoInput(updated.githubRepo);
    setUrlInput(updated.directApkUrl);
    setSavedMsg(
      updated.directApkUrl
        ? 'APK download link saved for this browser.'
        : 'Please enter a valid GitHub repo (owner/repo) or https:// APK link.'
    );
    setTimeout(() => setSavedMsg(null), 3500);
  };

  const releasesPageUrl = apkConfig.githubRepo
    ? `https://github.com/${apkConfig.githubRepo}/releases/latest`
    : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Install SankalpPrep App or Download Android APK"
    >
      <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-blue-700" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Install App & Download Android APK
              </h2>
              <p className="text-xs text-slate-500">
                फोन पर ऐप इंस्टॉल करें या Android APK डाउनलोड करें
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            aria-label="Close install dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Option 1: Instant 1-Tap PWA Install */}
          <section className="border border-blue-200 bg-blue-50/50 rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-blue-800">
                  Method 1 · Instant Mobile App Install (Works Offline)
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                  Install Directly on Android / iPhone / Desktop
                </h3>
              </div>
              {isInstalled && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 whitespace-nowrap">
                  <CheckCircle2 className="w-4 h-4" /> Installed
                </span>
              )}
            </div>

            {isInstalled ? (
              <p className="text-xs text-emerald-800">
                SankalpPrep is already running as an installed app on this device. Saved quizzes work offline too.
              </p>
            ) : isInstallable ? (
              <div className="space-y-2">
                <p className="text-xs text-slate-600">
                  Adds the SankalpPrep icon directly to your home screen in full-screen standalone mode without Play Store delays.
                </p>
                <button
                  type="button"
                  onClick={handleInstallPwa}
                  className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Install SankalpPrep App Now · अभी इंस्टॉल करें
                </button>
              </div>
            ) : isIOS ? (
              <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-700 space-y-1">
                <div className="font-semibold text-slate-900">iPhone / iPad (Safari):</div>
                <p>1. Tap the <strong>Share</strong> icon in Safari bottom toolbar.</p>
                <p>2. Scroll down and tap <strong>Add to Home Screen</strong>.</p>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-700 space-y-1">
                <div className="font-semibold text-slate-900">Android Chrome / Edge:</div>
                <p>
                  1. Open this app directly in Chrome (not inside an embedded preview frame) and tap the <strong>⋮ Menu</strong>.
                </p>
                <p>
                  2. Tap <strong>Install App</strong> or <strong>Add to Home screen</strong> (होम स्क्रीन पर जोड़ें).
                </p>
              </div>
            )}

            {installAttemptedMsg && (
              <div className="text-xs text-emerald-700 font-medium">{installAttemptedMsg}</div>
            )}
          </section>

          {/* Option 2: Direct Android APK Download from GitHub Releases */}
          <section className="border border-slate-200 bg-white rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-xs font-semibold text-emerald-700">
                  Method 2 · Direct Android .APK Installer (GitHub Releases)
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                  Download SankalpPrep-debug.apk
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfig((v) => !v)}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 px-2 py-1 rounded border border-slate-200"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{showConfig ? 'Hide Link Setup' : 'Configure APK URL'}</span>
              </button>
            </div>

            {apkConfig.directApkUrl ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <a
                    href={apkConfig.directApkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download="SankalpPrep-debug.apk"
                    className="flex-1 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <Download className="w-4 h-4" />
                    Download Android APK (.apk)
                  </a>
                  {releasesPageUrl && (
                    <a
                      href={releasesPageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <span>Release Notes</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] text-slate-600 space-y-1">
                  <div className="font-semibold text-slate-800">
                    APK इंस्टॉल करने का तरीका (How to install APK on Android):
                  </div>
                  <p>1. Download <code className="font-mono text-slate-800">SankalpPrep-debug.apk</code> and tap the file.</p>
                  <p>2. If asked, tap <strong>Settings → Allow from this source</strong> (इस स्रोत से अनुमति दें).</p>
                  <p>3. Tap <strong>Install</strong> and open SankalpPrep.</p>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 text-xs text-amber-950 space-y-1.5">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">GitHub Release APK URL is not linked yet.</p>
                    <p className="text-[11px] text-amber-900 mt-0.5">
                      Push this project to GitHub — the included GitHub Actions workflow builds <code className="font-mono">SankalpPrep-debug.apk</code> automatically on every tag (<code className="font-mono">v1.0.0</code>) or manual run. Then click <strong>Configure APK URL</strong> above to paste your <code className="font-mono">owner/repo</code>!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {showConfig && (
              <form onSubmit={handleSaveApkLink} className="pt-2 border-t border-slate-100 space-y-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    GitHub Repository (e.g. username/sankalpprep)
                  </label>
                  <div className="flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="agastyashukla/sankalpprep"
                      value={repoInput}
                      onChange={(e) => setRepoInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Or Direct HTTPS APK Release URL (optional override)
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/user/repo/releases/latest/download/SankalpPrep-debug.apk"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 font-mono"
                  />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                  >
                    Save APK Download Link
                  </button>
                  {savedMsg && <span className="text-[11px] text-emerald-700 font-medium">{savedMsg}</span>}
                </div>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-medium text-white border border-amber-700">
      <WifiOff className="w-3.5 h-3.5" />
      <span>Offline Mode — Cached quizzes & notes active</span>
    </div>
  );
};
