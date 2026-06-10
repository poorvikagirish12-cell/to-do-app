import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Copy, Check, BellRing, Settings, Info } from 'lucide-react';

export default function Profile() {
  const { user, updateProfile } = useAuthStore();
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC');
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setStatusMsg('');
    const success = await updateProfile({ timezone });
    if (success) {
      setStatusMsg('Profile configurations updated successfully.');
    } else {
      setStatusMsg('Failed to update settings. Please try again.');
    }
  };

  const copyToClipboard = () => {
    if (!user?.ntfy_topic) return;
    navigator.clipboard.writeText(user.ntfy_topic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ntfyUrl = `https://ntfy.sh/${user?.ntfy_topic}`;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">Profile Configurations</h2>
        <p className="text-gray-400 text-sm mt-1">Configure your personal scheduler preferences and notification integrations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Form */}
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleSaveSettings} className="glass-panel p-6 rounded-3xl space-y-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 rounded-xl bg-neonBlue/10 text-neonBlue">
                <Settings size={20} />
              </div>
              <h3 className="text-lg font-bold">Preferences</h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                User Account
              </label>
              <div className="px-4 py-3.5 rounded-xl bg-white/5 border border-white/5 text-gray-300 select-none">
                {user?.username} ({user?.email || 'no email registered'})
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Timezone (Determines alert hours)
              </label>
              <select
                className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-neonBlue/50 transition-colors"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              >
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="US/Eastern">US/Eastern (New York)</option>
                <option value="US/Central">US/Central (Chicago)</option>
                <option value="US/Mountain">US/Mountain (Denver)</option>
                <option value="US/Pacific">US/Pacific (Los Angeles)</option>
                <option value="Europe/London">Europe/London (London)</option>
                <option value="Europe/Paris">Europe/Paris (Paris)</option>
                <option value="Asia/Kolkata">Asia/Kolkata (India)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (Tokyo)</option>
                <option value="Australia/Sydney">Australia/Sydney (Sydney)</option>
              </select>
              <p className="text-[11px] text-gray-400 mt-2 flex items-start space-x-1.5">
                <Info size={14} className="mt-0.5 shrink-0 text-neonBlue" />
                <span>We only dispatch task reminders at local 9:00 AM based on this timezone.</span>
              </p>
            </div>

            {statusMsg && (
              <div className={`text-xs font-semibold py-3 px-4 rounded-xl border ${
                statusMsg.includes('failed') 
                  ? 'bg-red-500/10 text-red-400 border-red-500/10' 
                  : 'bg-green-500/10 text-green-400 border-green-500/10'
              }`}>
                {statusMsg}
              </div>
            )}

            <button
              type="submit"
              className="px-6 py-3.5 rounded-xl font-bold bg-gradient-to-r from-neonBlue to-[#4facfe] text-[#06070c] hover:brightness-105 active:scale-95 transition-all shadow-[0_4px_15px_0_rgba(0,242,254,0.2)]"
            >
              Save Preferences
            </button>
          </form>
        </div>

        {/* ntfy.sh Setup Card */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
            {/* Background blur ring */}
            <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-neonBlue/10 blur-xl pointer-events-none"></div>

            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-xl bg-neonBlue/10 text-neonBlue">
                <BellRing size={20} />
              </div>
              <h3 className="text-lg font-bold">Push Alerts</h3>
            </div>

            <div className="space-y-5">
              <p className="text-xs text-gray-400 leading-relaxed">
                Dimensional Todo uses <strong>ntfy.sh</strong> for secure, real-time push notifications. No tokens or login required on your phone!
              </p>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                  Your Private Topic Name
                </label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/5 text-xs text-neonBlue truncate font-mono select-all">
                    {user?.ntfy_topic || 'Generating...'}
                  </code>
                  <button
                    onClick={copyToClipboard}
                    className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5 transition-all"
                    title="Copy topic name"
                  >
                    {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={ntfyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center py-3 px-4 rounded-xl border border-neonBlue/30 text-neonBlue font-semibold text-xs hover:bg-neonBlue/5 active:scale-95 transition-all text-center"
                >
                  View Notification Channel
                </a>
              </div>
            </div>
          </div>

          {/* Setup Guide */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-gray-400">Subscription Steps</h4>
            <ol className="text-xs text-gray-300 space-y-3 list-decimal list-inside pl-1 leading-relaxed">
              <li>
                Download <strong>ntfy</strong> on your phone (Google Play Store, iOS App Store, or F-Droid).
              </li>
              <li>
                Open the app, tap <strong>+</strong> or <strong>Subscribe</strong>.
              </li>
              <li>
                Enter your private topic name: <code className="text-neonBlue font-mono text-[10px] bg-white/5 px-1 py-0.5 rounded">{user?.ntfy_topic}</code>
              </li>
              <li>
                That's it! You'll receive alert reminders directly on your device.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
