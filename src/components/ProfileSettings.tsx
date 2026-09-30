import React, { useState } from 'react';
import {
  User as UserIcon,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Laptop,
  Check,
  Save,
  Lock,
  Download,
  Trash2,
  LogOut,
  Mail,
  Sparkles,
  Shield,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useChat } from '../context/ChatContext';

interface ProfileSettingsProps {
  initialTab?: 'profile' | 'appearance' | 'chat' | 'security';
  onNavigateToChat: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  initialTab = 'profile',
  onNavigateToChat,
}) => {
  const { user, updateProfile, settings, updateSettings, logout, isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
  const { conversations, clearActiveConversation } = useChat();

  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'chat' | 'security'>(initialTab);

  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [selectedAvatar, setSelectedAvatar] = useState(
    user?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=alex'
  );
  const [isSaved, setIsSaved] = useState(false);

  // Security password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);

  const avatarOptions = [
    'https://api.dicebear.com/7.x/bottts/svg?seed=alex',
    'https://api.dicebear.com/7.x/bottts/svg?seed=sarah',
    'https://api.dicebear.com/7.x/bottts/svg?seed=quantum',
    'https://api.dicebear.com/7.x/bottts/svg?seed=cosmo',
    'https://api.dicebear.com/7.x/bottts/svg?seed=neo',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  ];

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name,
      bio,
      avatarUrl: selectedAvatar,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordMsg('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg('Passwords do not match');
      return;
    }
    setPasswordMsg('Password successfully updated!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordMsg(null), 3000);
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(conversations, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pocket_smart_ai_export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in duration-200">
      {/* Page Title */}
      <div className="pb-6 mb-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Account & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal details, AI response settings, and visual themes.
        </p>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 mb-8 overflow-x-auto no-scrollbar">
        {[
          { id: 'profile', label: 'User Profile', icon: UserIcon },
          { id: 'appearance', label: 'Appearance', icon: Sun },
          { id: 'chat', label: 'Chat Settings', icon: Sliders },
          { id: 'security', label: 'Account & Security', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0 ${
                active
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Profile */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-indigo-500" />
              <span>Personal Information</span>
            </h2>

            {/* Avatar Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Choose Your Avatar
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {avatarOptions.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(url)}
                    className={`relative w-12 h-12 rounded-full overflow-hidden border-2 transition ${
                      selectedAvatar === url
                        ? 'border-indigo-600 ring-2 ring-indigo-500/30 scale-105'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    <img src={url} alt="Avatar" className="w-full h-full object-cover bg-slate-100" />
                    {selectedAvatar === url && (
                      <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-indigo-700 font-bold" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Name Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-slate-500 text-sm cursor-not-allowed"
                />
              </div>
            </div>

            {/* Bio Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Bio / About You
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell Pocket Smart AI a bit about yourself (student, researcher, creator)..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 active:scale-95 transition flex items-center gap-2 text-xs sm:text-sm"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>

              {isSaved && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  Saved successfully!
                </span>
              )}
            </div>
          </div>
        </form>
      )}

      {/* Tab 2: Appearance */}
      {activeTab === 'appearance' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <Sun className="w-4 h-4 text-indigo-500" />
              <span>Theme & Interface</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize the look and feel of Pocket Smart AI across your screens.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Light Mode */}
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-4 rounded-2xl border text-left space-y-2 transition ${
                theme === 'light'
                  ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                <Sun className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Light Mode</h4>
              <p className="text-xs text-slate-500">Crisp, high-contrast daylight reading</p>
            </button>

            {/* Dark Mode */}
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-2xl border text-left space-y-2 transition ${
                theme === 'dark'
                  ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-slate-800 text-indigo-400 flex items-center justify-center">
                <Moon className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Dark Mode</h4>
              <p className="text-xs text-slate-500">Easy on the eyes for night productivity</p>
            </button>

            {/* System Mode */}
            <button
              type="button"
              onClick={() => setTheme('system')}
              className={`p-4 rounded-2xl border text-left space-y-2 transition ${
                theme === 'system'
                  ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                <Laptop className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">System Default</h4>
              <p className="text-xs text-slate-500">Automatically syncs with your OS</p>
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Chat Settings */}
      {activeTab === 'chat' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <Sliders className="w-4 h-4 text-indigo-500" />
              <span>Chat Behavior & Output</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Fine-tune how Pocket Smart AI responds to your prompts.
            </p>
          </div>

          <div className="space-y-4">
            {/* Enter to Send Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Enter Key Sends Message
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  When enabled, press Enter to send and Shift+Enter for new line
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.enterToSend}
                onChange={(e) => updateSettings({ enterToSend: e.target.checked })}
                className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
            </div>

            {/* Real-time Streaming */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Real-time Token Streaming
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Stream words progressively as the AI creates them for instant feedback
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.streamResponse}
                onChange={(e) => updateSettings({ streamResponse: e.target.checked })}
                className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
            </div>

            {/* Response Style */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Response Tone & Length
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select your default conversational style preference
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'concise', label: 'Concise', desc: 'Short & punchy' },
                  { id: 'balanced', label: 'Balanced', desc: 'Best all-around' },
                  { id: 'detailed', label: 'Detailed', desc: 'Deep breakdowns' },
                  { id: 'creative', label: 'Creative', desc: 'Story & colorful' },
                ].map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => updateSettings({ responseStyle: style.id as any })}
                    className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition ${
                      settings.responseStyle === style.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    <div className="font-bold">{style.label}</div>
                    <div className="text-[10px] opacity-80">{style.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Security & Data */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Change Password */}
          <form onSubmit={handlePasswordChange} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                <Lock className="w-4 h-4 text-indigo-500" />
                <span>Security & Password</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update your account password regularly to keep your chat history secure.
              </p>
            </div>

            {passwordMsg && (
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                {passwordMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 text-xs transition"
            >
              Update Password
            </button>
          </form>

          {/* Export & Data Management */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Data Management & Backup
            </h3>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Export All Conversations
                </h4>
                <p className="text-xs text-slate-500">
                  Download a complete JSON archive of all your chat sessions and messages.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportData}
                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shrink-0 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>

            {/* Logout */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-red-700 dark:text-red-300">
                  Session Logout
                </h4>
                <p className="text-xs text-red-600/80 dark:text-red-400/80">
                  Safely sign out of Pocket Smart AI on this device.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  onNavigateToChat();
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
