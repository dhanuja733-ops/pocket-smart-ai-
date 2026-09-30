import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  MessageSquare,
  Zap,
  FileText,
  PenTool,
  GraduationCap,
  Lightbulb,
  History,
  LayoutDashboard,
  CheckCircle2,
  Check,
  Copy,
  ChevronRight,
  Shield,
  Smartphone,
  Send,
  Bot,
  User as UserIcon,
} from 'lucide-react';
import { PersonaType } from '../types';
import { PERSONAS } from '../lib/personas';

interface LandingPageProps {
  onStartChat: (persona?: PersonaType, initialPrompt?: string) => void;
  onOpenDashboard: () => void;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartChat,
  onOpenDashboard,
  onOpenAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'student' | 'creator' | 'professional'>('student');
  const [interactiveInput, setInteractiveInput] = useState('');
  const [copiedDemo, setCopiedDemo] = useState(false);

  const features = [
    {
      icon: MessageSquare,
      title: 'AI Chat Assistant',
      desc: 'Ask questions, converse naturally, and receive accurate responses tailored to your inquiry.',
      persona: 'general' as PersonaType,
      tag: 'Core Feature',
      color: 'from-blue-500 to-indigo-500',
    },
    {
      icon: Zap,
      title: 'Smart Answers',
      desc: 'Crystal-clear explanations backed by logical reasoning, step-by-step breakdowns, and source clarity.',
      persona: 'general' as PersonaType,
      tag: 'Fast & Accurate',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: FileText,
      title: 'Summarization Pro',
      desc: 'Condense long articles, lectures, research papers, and dense text into instant bulleted executive takeaways.',
      persona: 'summarizer' as PersonaType,
      tag: 'High Signal',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: PenTool,
      title: 'Content Generation',
      desc: 'Draft professional emails, study notes, articles, social captions, essay outlines, and persuasive copy.',
      persona: 'content' as PersonaType,
      tag: 'Creative Writing',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: GraduationCap,
      title: 'Student Assistance',
      desc: 'Empowering students with concept tutoring, exam preparation, homework reasoning, and coding guidance.',
      persona: 'student' as PersonaType,
      tag: 'Education',
      color: 'from-indigo-500 to-sky-500',
    },
    {
      icon: Lightbulb,
      title: 'Idea Generator',
      desc: 'Brainstorm profitable micro-SaaS startups, final year capstone projects, video hooks, and fresh creative concepts.',
      persona: 'ideas' as PersonaType,
      tag: 'Brainstorming',
      color: 'from-yellow-500 to-amber-600',
    },
    {
      icon: History,
      title: 'Chat History',
      desc: 'All your past conversations are safely preserved, searchable, editable, and always ready for continuation.',
      persona: 'general' as PersonaType,
      tag: 'Persistence',
      color: 'from-slate-600 to-slate-800',
    },
    {
      icon: LayoutDashboard,
      title: 'Personal Dashboard',
      desc: 'Monitor user statistics, messages sent, popular subjects, and jump right back into active threads.',
      persona: 'general' as PersonaType,
      tag: 'Analytics',
      color: 'from-cyan-500 to-blue-600',
    },
  ];

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (interactiveInput.trim()) {
      onStartChat('general', interactiveInput.trim());
    } else {
      onStartChat('general');
    }
  };

  const copyDemoCode = () => {
    navigator.clipboard.writeText(`// Example prompt for Pocket Smart AI\nExplain how photosynthesis works in 3 clear bullet points.`);
    setCopiedDemo(true);
    setTimeout(() => setCopiedDemo(false), 2000);
  };

  return (
    <div className="space-y-24 sm:space-y-32 pb-20 overflow-hidden">
      {/* 1. Hero Section */}
      <section className="relative pt-12 sm:pt-20 lg:pt-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/20 via-sky-400/20 to-purple-500/15 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/70 dark:border-indigo-800/70 text-indigo-700 dark:text-indigo-300 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
            <span>Next-Gen AI Assistant for Everyone</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            <span className="block">Pocket Smart AI</span>
            <span className="bg-gradient-to-r from-indigo-600 via-sky-600 to-indigo-700 dark:from-indigo-400 dark:via-sky-300 dark:to-indigo-300 bg-clip-text text-transparent">
              Your Smart AI Assistant in Your Pocket
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Ask questions, generate ideas, summarize information, learn new concepts, and get intelligent assistance anytime from one simple AI platform.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onStartChat('general')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2 group text-base"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start Chatting</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="#features"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-sm transition flex items-center justify-center gap-2 text-base"
            >
              Explore Features
            </a>
          </div>

          {/* Trust Highlights */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Mobile-First & Ultra Fast</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Powered by Gemini 3.8 Flash</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Free to Get Started</span>
            </div>
          </div>
        </div>

        {/* Interactive Hero Visual Card (Chat Preview) */}
        <div className="mt-12 max-w-3xl mx-auto">
          <div className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 sm:p-6 overflow-hidden">
            {/* Window control dots */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 mb-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs font-mono text-slate-400">pocket-smart-ai.web.app</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  Live Preview
                </span>
              </div>
            </div>

            {/* Mock message exchange */}
            <div className="space-y-4 text-sm">
              {/* User message */}
              <div className="flex items-start gap-3 justify-end">
                <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%] sm:max-w-[75%] shadow-sm">
                  <p>Can you summarize how neural networks learn in simple terms for a college student?</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 font-bold text-xs">
                  ME
                </div>
              </div>

              {/* AI message */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-sky-400 flex items-center justify-center text-white shrink-0 shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/60 rounded-2xl rounded-tl-sm p-4 max-w-[90%] text-slate-800 dark:text-slate-200 space-y-2">
                  <p className="font-semibold text-indigo-600 dark:text-indigo-400">
                    Think of training a neural network like tuning a radio:
                  </p>
                  <ul className="space-y-1.5 pl-4 list-disc text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    <li>
                      <strong className="text-slate-900 dark:text-white">Forward Pass:</strong> The network makes an initial guess based on its current internal knobs (weights).
                    </li>
                    <li>
                      <strong className="text-slate-900 dark:text-white">Loss Calculation:</strong> It measures how far off the guess was from reality (the "error").
                    </li>
                    <li>
                      <strong className="text-slate-900 dark:text-white">Backpropagation:</strong> It nudges millions of knobs backward in the exact direction that reduces the error.
                    </li>
                  </ul>
                  <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-medium">
                      Student Tutor Mode
                    </span>
                    <span>• 0.4s response time</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick interactive input inside hero */}
            <form onSubmit={handleHeroSubmit} className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={interactiveInput}
                onChange={(e) => setInteractiveInput(e.target.value)}
                placeholder="Ask Pocket Smart AI anything right now..."
                className="flex-1 py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 active:scale-95 transition"
                title="Send to chat"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Suggested quick chips */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-medium">Try asking:</span>
              {[
                'Explain quantum entanglement',
                'Write an internship cover letter',
                '5 Micro-SaaS ideas',
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => onStartChat('general', chip)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            Intelligent Features
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Built for Students, Creators & Everyday Thinkers
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            A comprehensive suite of assistive AI tools engineered for instant answers, deep learning, and effortless productivity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                onClick={() => onStartChat(feat.persona)}
                className="group relative p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feat.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {feat.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {feat.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  <span>Open Mode</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-b from-indigo-50/60 to-white dark:from-slate-900 dark:to-slate-950 border border-indigo-100 dark:border-slate-800 p-8 sm:p-12 lg:p-16">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              Simple 3-Step Flow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              How Pocket Smart AI Works
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              No complex setup or training required. Open the web app on any device and start immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="relative p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-indigo-500/30">
                01
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Create an Account or Sign In
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Sign in with one click or explore as a guest. Your sessions, preferences, and conversations are safely maintained.
              </p>
              <div className="pt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                Instant Access • 100% Free
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
              <div className="w-12 h-12 rounded-xl bg-sky-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-sky-500/30">
                02
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Ask Pocket Smart AI Anything
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Type your homework questions, paste a 20-page article to summarize, draft a letter, or brainstorm your next big venture.
              </p>
              <div className="pt-2 text-xs font-semibold text-sky-600 dark:text-sky-400">
                Supports Multiple Personas
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-emerald-500/30">
                03
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Receive Smart Answers & Continue
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Get formatted Markdown responses with code snippets, copy to clipboard with one click, or ask follow-up questions seamlessly.
              </p>
              <div className="pt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Continuous Conversations
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Audience Showcase Tabs (Student, Creator, Professional) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Tailored for Every Workflow
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Switch specialized AI modes suited to what you are doing right now.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[
            { id: 'student', label: 'Students & Learners', icon: GraduationCap },
            { id: 'creator', label: 'Writers & Creators', icon: PenTool },
            { id: 'professional', label: 'Builders & Pros', icon: Lightbulb },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  active
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          {activeTab === 'student' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Academic Excellence
                </span>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Master Tough Concepts, Not Just Memorize
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Pocket Smart AI acts like a 24/7 personal tutor that never runs out of patience. Get math solutions with step-by-step logic, science analogies, and automated self-quizzes before exam day.
                </p>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Explain complex papers and textbook chapters simply</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Generate practice exam flashcards and quiz questions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Debug Python, C++, Java, or JavaScript code assignments</span>
                  </li>
                </ul>
                <button
                  onClick={() => onStartChat('student')}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition"
                >
                  Launch Student Mode
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-mono space-y-3">
                <div className="text-slate-400 text-[11px]">// Student Tutor Sample</div>
                <div className="text-indigo-600 dark:text-indigo-400 font-semibold">
                  Q: Why is Mitochondria called the powerhouse of the cell?
                </div>
                <div className="text-slate-700 dark:text-slate-200 leading-relaxed">
                  A: Mitochondria produce <strong>ATP (adenosine triphosphate)</strong> through cellular respiration. ATP acts like the universal rechargeable battery currency that cells spend to perform work!
                </div>
              </div>
            </div>
          )}

          {activeTab === 'creator' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                  Writing & Social
                </span>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Overcome Writer’s Block in 10 Seconds
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Whether writing high-stakes emails to professors or clients, drafting engaging newsletter openers, or crafting viral social threads, generate compelling variations instantly.
                </p>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Professional email polisher with tailored tone settings</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Engaging hooks and video scripts for TikTok & YouTube</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Essay outlines with strong argumentative theses</span>
                  </li>
                </ul>
                <button
                  onClick={() => onStartChat('content')}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition"
                >
                  Launch Content Creator Mode
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-mono space-y-3">
                <div className="text-slate-400 text-[11px]">// Content Creator Sample</div>
                <div className="text-purple-600 dark:text-purple-400 font-semibold">
                  Subject: Quick Follow-Up on AI Research Collaboration
                </div>
                <div className="text-slate-700 dark:text-slate-200 leading-relaxed">
                  "Dear Dr. Watson, Thank you for the inspiring lecture on Saturday. I reviewed your recent paper on state space models and have two hypotheses regarding edge inference..."
                </div>
              </div>
            </div>
          )}

          {activeTab === 'professional' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Entrepreneurship & Tech
                </span>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Validate Ideas & Build Working MVPs
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Brainstorm profitable product concepts, discover niche problems that need solving, and get clean, production-ready code algorithms ready to copy-paste.
                </p>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Explore micro-SaaS and side-hustle business models</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Full-stack coding assistance with TypeScript, Python, SQL</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Competitor analysis and unique value proposition mapping</span>
                  </li>
                </ul>
                <button
                  onClick={() => onStartChat('ideas')}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition"
                >
                  Launch Idea Generator Mode
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-mono space-y-3">
                <div className="text-slate-400 text-[11px]">// Idea Generator Sample</div>
                <div className="text-amber-600 dark:text-amber-400 font-semibold">
                  Idea: Automated Syllabus-to-Calendar Sync
                </div>
                <div className="text-slate-700 dark:text-slate-200 leading-relaxed">
                  Target: 20M+ university students.<br />
                  Pain Point: Manually keying assignment dates from 6 PDFs into Google Calendar.<br />
                  Est. Build Time: 1 weekend with OCR & Google Calendar API.
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. About Section */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
          {/* Subtle glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-900/60 border border-indigo-700/60 text-indigo-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>About Pocket Smart AI</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              “Pocket Smart AI is an intelligent AI assistant designed to make everyday tasks easier through a simple, accessible and user-friendly AI experience.”
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              We built Pocket Smart AI with a singular vision: eliminate the clutter, cognitive overhead, and confusion of modern AI tools. Whether you are reviewing for tomorrow’s calculus mid-term, drafting an urgent email on the subway, or looking for your next startup inspiration, Pocket Smart AI is right there in your pocket.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-800">
              <div>
                <div className="text-2xl font-extrabold text-indigo-400">100%</div>
                <div className="text-xs text-slate-400">Mobile Friendly</div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-sky-400">&lt; 0.5s</div>
                <div className="text-xs text-slate-400">Streaming Speed</div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-emerald-400">24 / 7</div>
                <div className="text-xs text-slate-400">Always Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Call To Action Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Ready to experience your smart assistant?
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
          Try it right now in your browser. No credit card required. Fast, smart, and ready whenever you are.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onStartChat('general')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/25 active:scale-95 transition flex items-center justify-center gap-2 text-base"
          >
            <Sparkles className="w-5 h-5" />
            <span>Start Chatting Now</span>
          </button>
          <button
            onClick={onOpenDashboard}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-sm transition flex items-center justify-center gap-2 text-base"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Open Dashboard</span>
          </button>
        </div>
      </section>
    </div>
  );
};
