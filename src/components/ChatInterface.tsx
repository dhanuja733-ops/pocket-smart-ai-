import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Search,
  Trash2,
  Edit2,
  Check,
  X,
  Send,
  Square,
  Copy,
  RotateCw,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  VolumeX,
  Share2,
  Download,
  AlertCircle,
  Menu,
  ChevronDown,
  GraduationCap,
  FileText,
  PenTool,
  Lightbulb,
  Code2,
  Bot,
  User as UserIcon,
  Clock,
  ArrowDown,
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { PERSONAS } from '../lib/personas';
import { PersonaType } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatInterfaceProps {
  onNavigateToDashboard: () => void;
  onNavigateToSettings: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onNavigateToDashboard,
  onNavigateToSettings,
}) => {
  const { user } = useAuth();
  const {
    conversations,
    activeConversation,
    messages,
    isLoading,
    isStreaming,
    error,
    currentPersona,
    searchQuery,
    setSearchQuery,
    setCurrentPersona,
    createNewChat,
    selectConversation,
    sendMessage,
    regenerateLastResponse,
    stopGeneration,
    renameConversation,
    deleteConversation,
    clearActiveConversation,
    rateMessage,
    filteredConversations,
  } = useChat();

  const [inputMessage, setInputMessage] = useState('');
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [activeSpeechMsgId, setActiveSpeechMsgId] = useState<string | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message or streaming token
  useEffect(() => {
    if (!showScrollBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isStreaming]);

  // Track if user scrolled up
  const handleScroll = () => {
    if (!chatScrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatScrollContainerRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 140;
    setShowScrollBottom(isUp);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollBottom(false);
  };

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    if (!inputMessage.trim() || isStreaming) return;
    const text = inputMessage.trim();
    setInputMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await sendMessage(text);
  };

  const handleCopyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleSpeak = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (activeSpeechMsgId === id) {
      window.speechSynthesis.cancel();
      setActiveSpeechMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown before speaking
    const cleanText = text.replace(/[*#`_~>\[\]]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.onend = () => setActiveSpeechMsgId(null);
    utterance.onerror = () => setActiveSpeechMsgId(null);
    setActiveSpeechMsgId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleStartRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingConvId(id);
    setEditingTitle(currentTitle);
  };

  const handleSaveRename = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingTitle.trim()) {
      await renameConversation(id, editingTitle.trim());
    }
    setEditingConvId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingConvId(null);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      await deleteConversation(id);
    }
  };

  const handleExportMarkdown = () => {
    if (!activeConversation || messages.length === 0) return;
    let markdown = `# ${activeConversation.title}\n`;
    markdown += `*Exported from Pocket Smart AI on ${new Date().toLocaleDateString()}*\n\n`;

    messages.forEach((m) => {
      const author = m.role === 'assistant' ? 'Pocket Smart AI' : 'User';
      markdown += `### ${author} (${new Date(m.createdAt).toLocaleTimeString()}):\n\n${m.content}\n\n---\n\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeConversation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentPersonaConfig = PERSONAS[currentPersona] || PERSONAS.general;

  const personaList: { id: PersonaType; label: string; icon: any }[] = [
    { id: 'general', label: 'General', icon: Sparkles },
    { id: 'student', label: 'Student', icon: GraduationCap },
    { id: 'summarizer', label: 'Summarizer', icon: FileText },
    { id: 'content', label: 'Writer', icon: PenTool },
    { id: 'ideas', label: 'Ideas', icon: Lightbulb },
    { id: 'code', label: 'Code', icon: Code2 },
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm lg:hidden animate-in fade-in"
        />
      )}

      {/* Sidebar (Desktop + Mobile Slide-out Drawer) */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 sm:w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header & New Chat */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                Conversations
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={() => {
              createNewChat(currentPersona);
              setSidebarOpen(false);
            }}
            className="w-full py-2.5 px-3.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition active:scale-98 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chat history..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Persona quick switch chips */}
        <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar flex items-center gap-1.5">
          {personaList.map((p) => {
            const Icon = p.icon;
            const active = currentPersona === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setCurrentPersona(p.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 shrink-0 transition ${
                  active
                    ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-10 px-4 text-slate-400">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs">No conversations found.</p>
              <button
                onClick={() => createNewChat(currentPersona)}
                className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                Start a new one
              </button>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = activeConversation?.id === conv.id;
              const isEditing = editingConvId === conv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    selectConversation(conv.id);
                    setSidebarOpen(false);
                  }}
                  className={`group relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-100 font-medium border border-indigo-200/80 dark:border-indigo-800/80'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <Sparkles
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
                      }`}
                    />
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-1.5 py-0.5 rounded border border-indigo-400 bg-white dark:bg-slate-800 text-xs focus:outline-none"
                      />
                    ) : (
                      <span className="truncate block">{conv.title}</span>
                    )}
                  </div>

                  {/* Actions (Rename / Delete) */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                    {isEditing ? (
                      <>
                        <button
                          onClick={(e) => handleSaveRename(conv.id, e)}
                          className="p-1 hover:text-emerald-600 rounded"
                          title="Save"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={handleCancelRename}
                          className="p-1 hover:text-red-500 rounded"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={(e) => handleStartRename(conv.id, conv.title, e)}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                          title="Rename"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(conv.id, e)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer User info */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div
            onClick={onNavigateToDashboard}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition min-w-0"
          >
            <img
              src={user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=user`}
              alt={user?.name || 'User'}
              className="w-7 h-7 rounded-full border border-indigo-200 dark:border-indigo-800 object-cover bg-indigo-50"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {user?.name}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {user?.isGuest ? 'Guest Session' : 'Member'}
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToSettings}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Settings"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Chat Workspace */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Chat Header */}
        <header className="h-14 px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 -ml-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              title="Open history"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                {activeConversation?.title || 'Pocket Smart AI Chat'}
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1 font-medium text-indigo-600 dark:text-indigo-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Gemini 3.8 Flash
                </span>
                <span>•</span>
                <span>{currentPersonaConfig.name}</span>
              </div>
            </div>
          </div>

          {/* Header Action Tools */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Persona Switcher Dropdown */}
            <div className="relative">
              <select
                value={currentPersona}
                onChange={(e) => setCurrentPersona(e.target.value as PersonaType)}
                className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 py-1.5 px-2.5 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer"
              >
                {Object.values(PERSONAS).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Export Markdown */}
            {messages.length > 0 && (
              <button
                onClick={handleExportMarkdown}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                title="Export conversation to Markdown"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            {/* Clear Chat */}
            {messages.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Clear all messages in this conversation?')) {
                    clearActiveConversation();
                  }
                }}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                title="Clear messages"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>

        {/* Chat Messages Container */}
        <div
          ref={chatScrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6"
        >
          {messages.length === 0 ? (
            /* Empty Chat State */
            <div className="max-w-2xl mx-auto my-auto text-center py-8 sm:py-12 space-y-6 animate-in fade-in zoom-in-95">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-400 text-white shadow-xl shadow-indigo-500/25">
                <Sparkles className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  How can I help you today?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  {currentPersonaConfig.shortDesc}
                </p>
              </div>

              {/* Categorized Starter Prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
                {currentPersonaConfig.suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(prompt)}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 shadow-sm hover:shadow-md transition text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium group flex items-start gap-2.5"
                  >
                    <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Message List */
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg, index) => {
                const isUser = msg.role === 'user';
                const isLastAssistant =
                  !isUser && index === messages.length - 1 && !isStreaming;

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 sm:gap-4 animate-in fade-in ${
                      isUser ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {/* Avatar */}
                    {isUser ? (
                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-sm">
                        ME
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-sky-400 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`relative group max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 sm:p-5 shadow-sm ${
                        isUser
                          ? 'bg-indigo-600 text-white rounded-tr-sm'
                          : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-sm'
                      }`}
                    >
                      {/* Author badge & time */}
                      <div className="flex items-center justify-between gap-4 mb-1.5 text-[11px] opacity-75">
                        <span className="font-semibold">
                          {isUser ? 'You' : 'Pocket Smart AI'}
                        </span>
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      {/* Content */}
                      {isUser ? (
                        <p className="text-sm sm:text-[15px] whitespace-pre-wrap leading-relaxed">
                          {msg.content}
                        </p>
                      ) : (
                        <div className="relative">
                          <MarkdownRenderer content={msg.content} />
                          {msg.isStreaming && (
                            <span className="animate-cursor bg-indigo-500" />
                          )}
                        </div>
                      )}

                      {/* Assistant Actions Bar */}
                      {!isUser && !msg.isStreaming && msg.content && (
                        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                          <div className="flex items-center gap-1">
                            {/* Copy button */}
                            <button
                              onClick={() => handleCopyMessage(msg.id, msg.content)}
                              className="p-1.5 rounded-lg hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1"
                              title="Copy text"
                            >
                              {copiedMsgId === msg.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                  <span className="text-[10px] text-emerald-500">Copied</span>
                                </>
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Text-to-speech button */}
                            <button
                              onClick={() => handleSpeak(msg.id, msg.content)}
                              className={`p-1.5 rounded-lg transition ${
                                activeSpeechMsgId === msg.id
                                  ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950'
                                  : 'hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                              title={activeSpeechMsgId === msg.id ? 'Stop reading' : 'Read aloud'}
                            >
                              {activeSpeechMsgId === msg.id ? (
                                <VolumeX className="w-3.5 h-3.5" />
                              ) : (
                                <Volume2 className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Thumbs rating */}
                            <button
                              onClick={() => rateMessage(msg.id, 'liked')}
                              className={`p-1.5 rounded-lg transition ${
                                msg.rating === 'liked'
                                  ? 'text-emerald-500'
                                  : 'hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                              title="Helpful response"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => rateMessage(msg.id, 'disliked')}
                              className={`p-1.5 rounded-lg transition ${
                                msg.rating === 'disliked'
                                  ? 'text-rose-500'
                                  : 'hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                              title="Needs improvement"
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Regenerate for last message */}
                          {isLastAssistant && (
                            <button
                              onClick={regenerateLastResponse}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-[11px] font-medium"
                            >
                              <RotateCw className="w-3 h-3" />
                              <span>Regenerate</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Error banner */}
              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-center justify-between text-xs text-red-700 dark:text-red-300">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                  <button
                    onClick={regenerateLastResponse}
                    className="font-bold underline ml-2"
                  >
                    Retry
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Scroll To Bottom Button */}
        {showScrollBottom && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-28 right-6 z-20 p-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg text-slate-700 dark:text-slate-200 hover:scale-105 active:scale-95 transition"
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </button>
        )}

        {/* Chat Input Dock */}
        <div className="p-3 sm:p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shrink-0">
          <div className="max-w-3xl mx-auto space-y-2">
            {/* Input bar */}
            <div className="relative rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition flex items-end p-2 gap-2">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Ask Pocket Smart AI anything..."
                className="flex-1 bg-transparent border-none text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm sm:text-base resize-none focus:outline-none focus:ring-0 max-h-44 py-1.5 px-2"
              />

              {/* Action button: Send or Stop */}
              {isStreaming ? (
                <button
                  type="button"
                  onClick={stopGeneration}
                  className="p-2.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 active:scale-95 transition shadow-sm shrink-0 flex items-center gap-1.5 text-xs font-semibold"
                  title="Stop generating"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden sm:inline">Stop</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!inputMessage.trim() || isLoading}
                  className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition shadow-md shadow-indigo-500/25 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  title="Send message (Enter)"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Input Footer Note */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <div className="hidden sm:flex items-center gap-2">
                <span>Press <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">Shift+Enter</kbd> for new line</span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-center sm:text-right w-full sm:w-auto">
                Pocket Smart AI can make mistakes. Verify critical facts.
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
