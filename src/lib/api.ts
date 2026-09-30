import { Conversation, Message, User, DashboardStats, PersonaType } from '../types';

const TOKEN_KEY = 'pocket_smart_ai_token';
const USER_KEY = 'pocket_smart_ai_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): User | null {
  const data = localStorage.getItem(USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function setStoredUser(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function getHeaders(): HeadersInit {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['x-user-id'] = token;
  }
  return headers;
}

export const api = {
  async checkHealth() {
    try {
      const res = await fetch('/api/health');
      return await res.json();
    } catch {
      return { status: 'offline', geminiAvailable: false };
    }
  },

  async register(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to register');
    }
    const data = await res.json();
    setStoredToken(data.token);
    setStoredUser(data.user);
    return data;
  },

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Invalid email or password');
    }
    const data = await res.json();
    setStoredToken(data.token);
    setStoredUser(data.user);
    return data;
  },

  async getCurrentUser(): Promise<User> {
    const res = await fetch('/api/auth/me', { headers: getHeaders() });
    if (!res.ok) throw new Error('Unauthorized');
    const data = await res.json();
    setStoredUser(data.user);
    return data.user;
  },

  async updateProfile(profile: Partial<User>): Promise<User> {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profile),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    const data = await res.json();
    setStoredUser(data.user);
    return data.user;
  },

  async resetPassword(email: string): Promise<{ message: string }> {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return await res.json();
  },

  async getConversations(): Promise<Conversation[]> {
    try {
      const res = await fetch('/api/conversations', { headers: getHeaders() });
      if (!res.ok) return [];
      const data = await res.json();
      return data.conversations || [];
    } catch {
      return [];
    }
  },

  async createConversation(title: string, persona: PersonaType = 'general'): Promise<Conversation> {
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title, persona }),
    });
    if (!res.ok) throw new Error('Failed to create conversation');
    const data = await res.json();
    return data.conversation;
  },

  async getConversationMessages(id: string): Promise<{ conversation: Conversation; messages: Message[] }> {
    const res = await fetch(`/api/conversations/${id}/messages`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch messages');
    return await res.json();
  },

  async saveMessage(conversationId: string, role: 'user' | 'assistant', content: string): Promise<Message> {
    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ role, content }),
    });
    if (!res.ok) throw new Error('Failed to save message');
    const data = await res.json();
    return data.message;
  },

  async renameConversation(id: string, title: string): Promise<Conversation> {
    const res = await fetch(`/api/conversations/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error('Failed to rename conversation');
    const data = await res.json();
    return data.conversation;
  },

  async deleteConversation(id: string): Promise<boolean> {
    const res = await fetch(`/api/conversations/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.ok;
  },

  async clearConversation(id: string): Promise<boolean> {
    const res = await fetch(`/api/conversations/${id}/messages`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.ok;
  },

  async rateMessage(id: string, rating: 'liked' | 'disliked'): Promise<void> {
    await fetch(`/api/messages/${id}/rate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ rating }),
    });
  },

  async getStats(): Promise<DashboardStats> {
    try {
      const res = await fetch('/api/stats', { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to load stats');
      return await res.json();
    } catch {
      return {
        totalConversations: 0,
        totalMessages: 0,
        estimatedWords: 0,
        activePersona: 'Smart Assistant',
      };
    }
  },

  async sendAIChat(
    messages: { role: string; content: string }[],
    systemInstruction: string,
    conversationId?: string
  ): Promise<string> {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ messages, systemInstruction, conversationId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'AI generation failed');
    }
    const data = await res.json();
    return data.text;
  },

  async streamAIChat(
    messages: { role: string; content: string }[],
    systemInstruction: string,
    conversationId: string | undefined,
    onChunk: (chunk: string) => void,
    onDone: (fullText: string) => void,
    onError: (err: Error) => void,
    signal?: AbortSignal
  ) {
    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ messages, systemInstruction, conversationId }),
        signal,
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}: ${res.statusText}`);
      }

      if (!res.body) {
        throw new Error('ReadableStream not supported by browser or server response');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullText = '';
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6);
            if (dataStr === '[DONE]') {
              onDone(fullText);
              return;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.text) {
                fullText += parsed.text;
                onChunk(parsed.text);
              }
            } catch (pErr) {
              // Ignore partial parse failures
            }
          }
        }
      }

      onDone(fullText);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return;
      }
      onError(err);
    }
  },
};
