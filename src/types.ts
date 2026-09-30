export type Role = 'user' | 'assistant' | 'system';

export type PersonaType = 'general' | 'student' | 'summarizer' | 'content' | 'ideas' | 'code';

export interface PersonaConfig {
  id: PersonaType;
  name: string;
  shortDesc: string;
  icon: string;
  systemPrompt: string;
  suggestedPrompts: string[];
}

export interface Message {
  id: string;
  conversationId: string;
  role: Role;
  content: string;
  createdAt: string;
  isStreaming?: boolean;
  isError?: boolean;
  rating?: 'liked' | 'disliked';
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  persona: PersonaType;
  createdAt: string;
  updatedAt: string;
  lastMessageSnippet?: string;
  messageCount: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
  isGuest?: boolean;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  enterToSend: boolean;
  defaultPersona: PersonaType;
  streamResponse: boolean;
  responseStyle: 'concise' | 'balanced' | 'detailed' | 'creative';
}

export interface DashboardStats {
  totalConversations: number;
  totalMessages: number;
  estimatedWords: number;
  activePersona: string;
}
