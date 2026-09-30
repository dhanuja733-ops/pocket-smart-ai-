import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider, useChat } from './context/ChatContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { ChatInterface } from './components/ChatInterface';
import { Dashboard } from './components/Dashboard';
import { ProfileSettings } from './components/ProfileSettings';
import { AuthModal } from './components/AuthModal';
import { PersonaType } from './types';

function AppContent() {
  const [currentView, setCurrentView] = useState<'home' | 'chat' | 'dashboard' | 'profile' | 'settings'>('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const { createNewChat, selectConversation } = useChat();

  const handleStartChat = async (persona?: PersonaType, initialPrompt?: string) => {
    if (initialPrompt || persona) {
      await createNewChat(persona, initialPrompt);
    }
    setCurrentView('chat');
  };

  const handleOpenConversation = async (id: string) => {
    await selectConversation(id);
    setCurrentView('chat');
  };

  const handleOpenAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      {/* Universal Navigation Header */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main View Router */}
      <div className="flex-1 flex flex-col">
        {currentView === 'home' && (
          <>
            <main className="flex-1">
              <LandingPage
                onStartChat={handleStartChat}
                onOpenDashboard={() => setCurrentView('dashboard')}
                onOpenAuth={handleOpenAuth}
              />
            </main>
            <Footer
              onNavigate={setCurrentView}
              onOpenAuth={() => handleOpenAuth('login')}
            />
          </>
        )}

        {currentView === 'chat' && (
          <ChatInterface
            onNavigateToDashboard={() => setCurrentView('dashboard')}
            onNavigateToSettings={() => setCurrentView('settings')}
          />
        )}

        {currentView === 'dashboard' && (
          <>
            <main className="flex-1">
              <Dashboard
                onNavigateToChat={handleStartChat}
                onOpenConversation={handleOpenConversation}
              />
            </main>
            <Footer
              onNavigate={setCurrentView}
              onOpenAuth={() => handleOpenAuth('login')}
            />
          </>
        )}

        {currentView === 'profile' && (
          <>
            <main className="flex-1">
              <ProfileSettings
                initialTab="profile"
                onNavigateToChat={() => setCurrentView('chat')}
              />
            </main>
            <Footer
              onNavigate={setCurrentView}
              onOpenAuth={() => handleOpenAuth('login')}
            />
          </>
        )}

        {currentView === 'settings' && (
          <>
            <main className="flex-1">
              <ProfileSettings
                initialTab="appearance"
                onNavigateToChat={() => setCurrentView('chat')}
              />
            </main>
            <Footer
              onNavigate={setCurrentView}
              onOpenAuth={() => handleOpenAuth('login')}
            />
          </>
        )}
      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ChatProvider>
          <AppContent />
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
