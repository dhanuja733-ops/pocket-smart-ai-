import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Conversation, Message, PersonaType } from '../types';
import { api } from '../lib/api';
import { PERSONAS } from '../lib/personas';
import { useAuth } from './AuthContext';

interface ChatContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  currentPersona: PersonaType;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setCurrentPersona: (persona: PersonaType) => void;
  createNewChat: (persona?: PersonaType, initialPrompt?: string) => Promise<string>;
  selectConversation: (id: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  regenerateLastResponse: () => Promise<void>;
  stopGeneration: () => void;
  renameConversation: (id: string, newTitle: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  clearActiveConversation: () => Promise<void>;
  rateMessage: (id: string, rating: 'liked' | 'disliked') => Promise<void>;
  filteredConversations: Conversation[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, settings } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPersona, setCurrentPersona] = useState<PersonaType>(settings.defaultPersona || 'general');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const abortControllerRef = useRef<AbortController | null>(null);

  // Load conversations on mount or user change
  useEffect(() => {
    loadConversations();
  }, [user?.id]);

  const loadConversations = async () => {
    try {
      const convs = await api.getConversations();
      setConversations(convs);
      if (convs.length > 0 && !activeConversation) {
        await selectConversation(convs[0].id);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  const selectConversation = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getConversationMessages(id);
      setActiveConversation(data.conversation);
      setMessages(data.messages);
      if (data.conversation.persona) {
        setCurrentPersona(data.conversation.persona as PersonaType);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load conversation');
    } finally {
      setIsLoading(false);
    }
  };

  const createNewChat = async (persona?: PersonaType, initialPrompt?: string): Promise<string> => {
    const selectedPersona = persona || currentPersona;
    setError(null);
    try {
      const title = initialPrompt
        ? initialPrompt.slice(0, 32) + (initialPrompt.length > 32 ? '...' : '')
        : `New ${PERSONAS[selectedPersona].name} Chat`;

      const newConv = await api.createConversation(title, selectedPersona);
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversation(newConv);
      setMessages([]);
      setCurrentPersona(selectedPersona);

      if (initialPrompt) {
        // Send initial prompt
        setTimeout(() => {
          sendMessageWithConv(newConv.id, initialPrompt, selectedPersona);
        }, 50);
      }
      return newConv.id;
    } catch (err: any) {
      setError(err.message || 'Failed to create new chat');
      return '';
    }
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  const sendMessageWithConv = async (convId: string, content: string, persona: PersonaType) => {
    if (!content.trim()) return;

    setError(null);

    // Optimistic user message
    const tempUserMsg: Message = {
      id: 'msg-temp-' + Date.now(),
      conversationId: convId,
      role: 'user',
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);

    // Save user message to backend
    try {
      api.saveMessage(convId, 'user', content.trim());
    } catch (e) {
      console.warn('Backend message save delayed:', e);
    }

    const personaConfig = PERSONAS[persona] || PERSONAS.general;
    const historyPayload = [...messages, tempUserMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Temp assistant message for streaming
    const tempAssistantId = 'msg-ai-' + Date.now();
    const tempAssistantMsg: Message = {
      id: tempAssistantId,
      conversationId: convId,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, tempAssistantMsg]);
    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let accumulatedText = '';

    if (settings.streamResponse) {
      await api.streamAIChat(
        historyPayload,
        personaConfig.systemPrompt,
        convId,
        (chunk) => {
          accumulatedText += chunk;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempAssistantId
                ? { ...m, content: accumulatedText, isStreaming: true }
                : m
            )
          );
        },
        (finalText) => {
          setIsStreaming(false);
          abortControllerRef.current = null;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempAssistantId
                ? { ...m, content: finalText || accumulatedText, isStreaming: false }
                : m
            )
          );
          // Refresh conversation title if needed
          loadConversations();
        },
        async (err) => {
          console.warn('Streaming error, attempting standard generation fallback:', err);
          try {
            const fallbackText = await api.sendAIChat(
              historyPayload,
              personaConfig.systemPrompt,
              convId
            );
            setMessages((prev) =>
              prev.map((m) =>
                m.id === tempAssistantId
                  ? { ...m, content: fallbackText, isStreaming: false }
                  : m
              )
            );
          } catch (stdErr: any) {
            setError(stdErr.message || 'Failed to generate answer. Please try again.');
            setMessages((prev) =>
              prev.map((m) =>
                m.id === tempAssistantId
                  ? {
                      ...m,
                      content: 'An error occurred while generating the response. Please check your connection and try again.',
                      isStreaming: false,
                      isError: true,
                    }
                  : m
              )
            );
          } finally {
            setIsStreaming(false);
            abortControllerRef.current = null;
          }
        },
        controller.signal
      );
    } else {
      // Standard non-streaming
      try {
        const text = await api.sendAIChat(
          historyPayload,
          personaConfig.systemPrompt,
          convId
        );
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempAssistantId
              ? { ...m, content: text, isStreaming: false }
              : m
          )
        );
        loadConversations();
      } catch (err: any) {
        setError(err.message || 'Generation failed');
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempAssistantId
              ? {
                  ...m,
                  content: 'Failed to generate response. Please try again.',
                  isStreaming: false,
                  isError: true,
                }
              : m
          )
        );
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    }
  };

  const sendMessage = async (content: string) => {
    let convId = activeConversation?.id;
    if (!convId) {
      convId = await createNewChat(currentPersona);
    }
    await sendMessageWithConv(convId, content, currentPersona);
  };

  const regenerateLastResponse = async () => {
    if (!activeConversation || messages.length === 0) return;

    // Find last user message
    let lastUserIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserIndex = i;
        break;
      }
    }

    if (lastUserIndex === -1) return;

    const userPrompt = messages[lastUserIndex].content;
    // Remove messages after last user message
    const trimmed = messages.slice(0, lastUserIndex);
    setMessages(trimmed);

    await sendMessageWithConv(activeConversation.id, userPrompt, currentPersona);
  };

  const renameConversation = async (id: string, newTitle: string) => {
    try {
      const updated = await api.renameConversation(id, newTitle);
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: updated.title } : c))
      );
      if (activeConversation?.id === id) {
        setActiveConversation((prev) => (prev ? { ...prev, title: updated.title } : null));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to rename conversation');
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      await api.deleteConversation(id);
      const remaining = conversations.filter((c) => c.id !== id);
      setConversations(remaining);
      if (activeConversation?.id === id) {
        if (remaining.length > 0) {
          selectConversation(remaining[0].id);
        } else {
          setActiveConversation(null);
          setMessages([]);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete conversation');
    }
  };

  const clearActiveConversation = async () => {
    if (!activeConversation) return;
    try {
      await api.clearConversation(activeConversation.id);
      setMessages([]);
      loadConversations();
    } catch (err: any) {
      setError(err.message || 'Failed to clear conversation');
    }
  };

  const rateMessage = async (id: string, rating: 'liked' | 'disliked') => {
    try {
      await api.rateMessage(id, rating);
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, rating } : m))
      );
    } catch (err) {
      console.warn('Failed to submit message rating:', err);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ChatContext.Provider
      value={{
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
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
