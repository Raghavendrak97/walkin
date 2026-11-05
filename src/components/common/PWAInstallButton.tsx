import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed, hide
  if (isInstalled) {
    return null;
  }

  // Chromium / Desktop / Android flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-1.5 font-medium rounded-lg transition shadow-sm ${
          compact
            ? 'px-2.5 py-1 text-xs bg-blue-600 text-white hover:bg-blue-700'
            : 'px-3 py-1.5 text-xs bg-blue-600 text-white hover:bg-blue-700'
        }`}
        title="Install WALKIN app on your device"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 font-medium rounded-lg border border-slate-300 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-50 transition"
          title="Install on iOS Safari"
        >
          <Smartphone className="w-3.5 h-3.5 text-blue-600" />
          <span>Install iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">Install on iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-3 space-y-2 text-xs text-slate-600">
                <p>To install WALKIN on your iOS home screen:</p>
                <ol className="list-decimal list-inside space-y-1 pl-1 text-slate-700">
                  <li>Tap the <strong>Share</strong> button in Safari's bottom toolbar.</li>
                  <li>Scroll down the actions and tap <strong>Add to Home Screen</strong>.</li>
                  <li>Confirm by tapping <strong>Add</strong> at top right.</li>
                </ol>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-xs font-medium text-white hover:bg-blue-700 transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <button
      onClick={() => alert('To install WALKIN: On Chrome/Edge click the Install icon in the address bar or menu. On mobile, use "Add to Home screen".')}
      className="hidden sm:flex items-center gap-1.5 font-medium rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50 transition"
    >
      <Download className="w-3.5 h-3.5 text-slate-500" />
      <span>Install App</span>
    </button>
  );
};
