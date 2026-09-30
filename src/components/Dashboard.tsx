import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Plus,
  MessageSquare,
  FileText,
  GraduationCap,
  PenTool,
  Lightbulb,
  Code2,
  Trash2,
  ArrowRight,
  Clock,
  User as UserIcon,
  TrendingUp,
  Shield,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { api } from '../lib/api';
import { DashboardStats, PersonaType } from '../types';

interface DashboardProps {
  onNavigateToChat: (persona?: PersonaType, initialPrompt?: string) => void;
  onOpenConversation: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigateToChat,
  onOpenConversation,
}) => {
  const { user } = useAuth();
  const { conversations, deleteConversation, createNewChat } = useChat();
  const [stats, setStats] = useState<DashboardStats>({
    totalConversations: conversations.length,
    totalMessages: 0,
    estimatedWords: 0,
    activePersona: 'Smart Assistant',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const s = await api.getStats();
        setStats(s);
      } catch (err) {
        console.warn('Stats fetch fallback:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [conversations]);

  const quickStarters = [
    {
      title: 'Student Exam Prep',
      desc: 'Generate quiz questions, study cards, and formula breakdowns',
      persona: 'student' as PersonaType,
      prompt: 'Help me review key topics and quiz me with 5 challenging questions',
      icon: GraduationCap,
      color: 'from-blue-600 to-indigo-600',
    },
    {
      title: 'Email & Letter Polisher',
      desc: 'Craft persuasive, polite, and professional email correspondence',
      persona: 'content' as PersonaType,
      prompt: 'Help me draft a formal follow-up email after a job or internship interview',
      icon: PenTool,
      color: 'from-purple-600 to-pink-600',
    },
    {
      title: 'Meeting & Lecture Summarizer',
      desc: 'Distill lengthy notes and transcripts into bulleted action items',
      persona: 'summarizer' as PersonaType,
      prompt: 'Here are my lecture notes. Please summarize the core ideas into bullet points',
      icon: FileText,
      color: 'from-emerald-600 to-teal-600',
    },
    {
      title: 'Micro-SaaS Idea Generator',
      desc: 'Brainstorm feasible software products for solo founders',
      persona: 'ideas' as PersonaType,
      prompt: 'Give me 3 profitable micro-SaaS ideas that can be built in a single weekend',
      icon: Lightbulb,
      color: 'from-amber-600 to-orange-600',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Pocket Smart AI Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Welcome back, {user?.name || 'Explorer'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track your assistant activity, jump into recent threads, or start a new workflow.
          </p>
        </div>

        {/* Start New Chat CTA */}
        <button
          onClick={() => onNavigateToChat('general')}
          className="px-6 py-3 rounded-2xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2 text-sm sm:text-base shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Start New Chat</span>
        </button>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Conversations */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {stats.totalConversations || conversations.length}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Total Conversations
            </div>
          </div>
        </div>

        {/* Messages Sent */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {stats.totalMessages || conversations.reduce((acc, c) => acc + (c.messageCount || 2), 0)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Messages Exchanged
            </div>
          </div>
        </div>

        {/* Estimated Words */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {(stats.estimatedWords || 1420).toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Words Generated
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[130px]">
              {user?.email}
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              Active • Pro Plan
            </div>
          </div>
        </div>
      </div>

      {/* Quick Launch Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>Quick Launch Assistance</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStarters.map((starter, idx) => {
            const Icon = starter.icon;
            return (
              <div
                key={idx}
                onClick={() => onNavigateToChat(starter.persona, starter.prompt)}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/60 dark:hover:border-indigo-500/60 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${starter.color} text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {starter.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {starter.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  <span>Launch Prompt</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Conversations Table / List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>Recent Conversations</span>
          </h2>
          <span className="text-xs text-slate-500">
            {conversations.length} saved chats
          </span>
        </div>

        {conversations.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 space-y-3">
            <MessageSquare className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              No conversations yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Start chatting with Pocket Smart AI to see your discussions, summaries, and notes listed here.
            </p>
            <button
              onClick={() => onNavigateToChat('general')}
              className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-sm hover:bg-indigo-700 transition"
            >
              Start Your First Chat
            </button>
          </div>
        ) : (
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {conversations.slice(0, 10).map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => onOpenConversation(conv.id)}
                  className="p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {conv.title}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                        {conv.persona || 'general'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate pl-6">
                      {conv.lastMessageSnippet || 'Conversation thread'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 pl-6 sm:pl-0 shrink-0">
                    <span className="text-xs text-slate-400">
                      {new Date(conv.updatedAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenConversation(conv.id);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 font-semibold text-xs transition"
                      >
                        Open
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Delete this conversation?')) {
                            deleteConversation(conv.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Delete conversation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
