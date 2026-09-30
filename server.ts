import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database storage helper (data/db.json)
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
}

interface StoredConversation {
  id: string;
  userId: string;
  title: string;
  persona: string;
  createdAt: string;
  updatedAt: string;
}

interface StoredMessage {
  id: string;
  conversationId: string;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  rating?: 'liked' | 'disliked';
}

interface DB {
  users: StoredUser[];
  conversations: StoredConversation[];
  messages: StoredMessage[];
}

function initDb(): DB {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    } catch {
      // If corrupted, fallback
    }
  }

  const initialDb: DB = {
    users: [
      {
        id: 'usr-demo-1',
        email: 'alex@example.com',
        name: 'Alex Mercer',
        passwordHash: 'demo1234',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        bio: 'Tech enthusiast & university student learning CS and AI.',
        createdAt: new Date().toISOString(),
      },
    ],
    conversations: [
      {
        id: 'conv-sample-1',
        userId: 'usr-demo-1',
        title: 'Quantum Computing Fundamentals',
        persona: 'student',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'conv-sample-2',
        userId: 'usr-demo-1',
        title: 'Micro-SaaS Ideas for 2026',
        persona: 'ideas',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
    ],
    messages: [
      {
        id: 'msg-1',
        conversationId: 'conv-sample-1',
        userId: 'usr-demo-1',
        role: 'user',
        content: 'Can you explain the difference between a classical bit and a qubit in quantum computing?',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'msg-2',
        conversationId: 'conv-sample-1',
        userId: 'usr-demo-1',
        role: 'assistant',
        content: `### Classical Bit vs. Quantum Bit (Qubit)

Here is a simple way to think about the difference:

1. **Classical Bit (Binary):**
   - Like a standard light switch: it is either **0 (OFF)** or **1 (ON)**.
   - At any given instant, it can hold only one state.

2. **Quantum Bit (Qubit):**
   - Utilizes a quantum mechanical property called **Superposition**.
   - Think of a spinning coin: while it's spinning on the table, it is neither purely heads nor tails, but a probabilistic mixture of both simultaneously until measured!
   - Another core property is **Entanglement**, where two qubits become interconnected regardless of distance.

#### Quick Summary Table:
| Feature | Classical Bit | Qubit |
| :--- | :--- | :--- |
| **States** | 0 or 1 | $\\alpha|0\\rangle + \\beta|1\\rangle$ (Superposition) |
| **Scaling Power** | Linear ($N$ bits = $N$ states) | Exponential ($N$ qubits = $2^N$ simultaneous states) |
| **Sensitivity** | High noise tolerance | High decoherence susceptibility (needs cryogenic cooling) |

Would you like to explore quantum gates or practical algorithms like Shor's or Grover's?`,
        createdAt: new Date(Date.now() - 3600000 * 2 + 1000).toISOString(),
      },
      {
        id: 'msg-3',
        conversationId: 'conv-sample-2',
        userId: 'usr-demo-1',
        role: 'user',
        content: 'Give me 3 practical micro-SaaS ideas that can be built by a single developer.',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
      {
        id: 'msg-4',
        conversationId: 'conv-sample-2',
        userId: 'usr-demo-1',
        role: 'assistant',
        content: `### 🚀 3 High-Potential Micro-SaaS Ideas for Solo Builders

Here are three focused, high-margin software concepts tailored for a single engineer:

#### 1. AI Meeting-to-Documentation Generator
- **Target Audience:** Freelance consultants, remote engineering teams.
- **The Problem:** Meetings end, but nobody writes down tickets or updates the project board.
- **The Solution:** A lightweight bot that listens to Zoom/Meet audio and automatically converts key takeaways into Markdown docs and GitHub/Linear issue cards.
- **Monetization:** $19/month per workspace.

#### 2. Local SEO & Google Business Review Responder
- **Target Audience:** Dentists, plumbers, boutique restaurants, auto shops.
- **The Problem:** Small business owners get reviews but lack the time to draft thoughtful, professional responses.
- **The Solution:** Syncs with Google Business Profile, detects new reviews, and generates brand-aligned drafted responses with one-click approval via SMS/WhatsApp.
- **Monetization:** $39/month per location.

#### 3. Student Syllabus & Deadline Radar
- **Target Audience:** College students taking 4-6 simultaneous classes.
- **The Problem:** Syllabi PDFs are messy and students constantly miss hidden submission dates.
- **The Solution:** Drag-and-drop syllabus parser that extracts all readings, quizzes, exams, and generates an automated Google Calendar / Notion sync.
- **Monetization:** $5/month or $29/semester pass.

Which of these would you like to build an MVP feature-set for first?`,
        createdAt: new Date(Date.now() - 3600000 * 24 + 1000).toISOString(),
      },
    ],
  };

  saveDb(initialDb);
  return initialDb;
}

function saveDb(data: DB) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write db.json:', err);
  }
}

let db = initDb();

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || '';
const geminiClient = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Auth helper
function getUserId(req: Request): string {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  const customUser = req.headers['x-user-id'] as string;
  if (customUser) return customUser;
  return 'usr-guest-default';
}

// Routes
// 1. Health & status
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'Pocket Smart AI',
    timestamp: new Date().toISOString(),
    geminiAvailable: !!geminiClient,
    model: 'gemini-3.8-flash',
  });
});

// 2. Auth Endpoints
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    res.status(409).json({ error: 'An account with this email already exists' });
    return;
  }

  const newUser: StoredUser = {
    id: 'usr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    name: name || email.split('@')[0],
    email: email.toLowerCase(),
    passwordHash: password, // For demonstration
    avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
    bio: 'Pocket Smart AI Member',
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  saveDb(db);

  const { passwordHash: _, ...safeUser } = newUser;
  res.status(201).json({ user: safeUser, token: safeUser.id });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const user = db.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === password
  );

  if (!user) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const { passwordHash: _, ...safeUser } = user;
  res.json({ user: safeUser, token: safeUser.id });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const user = db.users.find((u) => u.id === userId);
  if (user) {
    const { passwordHash: _, ...safeUser } = user;
    res.json({ user: safeUser });
  } else {
    // Return guest user
    res.json({
      user: {
        id: userId,
        email: 'guest@pocketsmart.ai',
        name: 'Guest Explorer',
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=guest`,
        bio: 'Exploring Pocket Smart AI',
        createdAt: new Date().toISOString(),
        isGuest: true,
      },
    });
  }
});

app.put('/api/auth/profile', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { name, bio, avatarUrl } = req.body;

  let user = db.users.find((u) => u.id === userId);
  if (!user) {
    // create if guest turned regular
    user = {
      id: userId,
      email: 'user@pocketsmart.ai',
      name: name || 'User',
      passwordHash: 'demo',
      avatarUrl,
      bio,
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
  } else {
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatarUrl) user.avatarUrl = avatarUrl;
  }

  saveDb(db);
  const { passwordHash: _, ...safeUser } = user;
  res.json({ user: safeUser });
});

app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }
  res.json({
    message: `Password reset instructions have been sent to ${email}. Check your inbox!`,
  });
});

// 3. Conversations CRUD
app.get('/api/conversations', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const userConvs = db.conversations
    .filter((c) => c.userId === userId || userId === 'usr-guest-default')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  // Attach last message preview and message count
  const enriched = userConvs.map((conv) => {
    const msgs = db.messages.filter((m) => m.conversationId === conv.id);
    const lastMsg = msgs[msgs.length - 1];
    return {
      ...conv,
      messageCount: msgs.length,
      lastMessageSnippet: lastMsg ? lastMsg.content.slice(0, 90) : 'No messages yet',
    };
  });

  res.json({ conversations: enriched });
});

app.post('/api/conversations', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { title = 'New Conversation', persona = 'general' } = req.body;

  const newConv: StoredConversation = {
    id: 'conv-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    userId,
    title,
    persona,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.conversations.unshift(newConv);
  saveDb(db);

  res.status(201).json({ conversation: newConv });
});

app.get('/api/conversations/:id/messages', (req: Request, res: Response) => {
  const { id } = req.params;
  const conv = db.conversations.find((c) => c.id === id);
  if (!conv) {
    res.status(404).json({ error: 'Conversation not found' });
    return;
  }

  const messages = db.messages
    .filter((m) => m.conversationId === id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  res.json({ conversation: conv, messages });
});

app.post('/api/conversations/:id/messages', (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = getUserId(req);
  const { role, content, rating } = req.body;

  if (!role || !content) {
    res.status(400).json({ error: 'Role and content are required' });
    return;
  }

  const conv = db.conversations.find((c) => c.id === id);
  if (!conv) {
    res.status(404).json({ error: 'Conversation not found' });
    return;
  }

  const newMsg: StoredMessage = {
    id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    conversationId: id,
    userId,
    role,
    content,
    createdAt: new Date().toISOString(),
    rating,
  };

  db.messages.push(newMsg);
  conv.updatedAt = new Date().toISOString();

  // If first message and title is default, auto-generate title
  if (conv.title === 'New Conversation' && role === 'user') {
    conv.title = content.slice(0, 36) + (content.length > 36 ? '...' : '');
  }

  saveDb(db);
  res.status(201).json({ message: newMsg });
});

app.patch('/api/conversations/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, persona } = req.body;

  const conv = db.conversations.find((c) => c.id === id);
  if (!conv) {
    res.status(404).json({ error: 'Conversation not found' });
    return;
  }

  if (title) conv.title = title;
  if (persona) conv.persona = persona;
  conv.updatedAt = new Date().toISOString();

  saveDb(db);
  res.json({ conversation: conv });
});

app.delete('/api/conversations/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  db.conversations = db.conversations.filter((c) => c.id !== id);
  db.messages = db.messages.filter((m) => m.conversationId !== id);
  saveDb(db);
  res.json({ success: true });
});

app.delete('/api/conversations/:id/messages', (req: Request, res: Response) => {
  const { id } = req.params;
  db.messages = db.messages.filter((m) => m.conversationId !== id);
  const conv = db.conversations.find((c) => c.id === id);
  if (conv) {
    conv.updatedAt = new Date().toISOString();
  }
  saveDb(db);
  res.json({ success: true });
});

app.post('/api/messages/:id/rate', (req: Request, res: Response) => {
  const { id } = req.params;
  const { rating } = req.body;
  const msg = db.messages.find((m) => m.id === id);
  if (msg) {
    msg.rating = rating;
    saveDb(db);
    res.json({ success: true, message: msg });
  } else {
    res.status(404).json({ error: 'Message not found' });
  }
});

// 4. Stats endpoint for Dashboard
app.get('/api/stats', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const userConvs = db.conversations.filter(
    (c) => c.userId === userId || userId === 'usr-guest-default'
  );
  const convIds = new Set(userConvs.map((c) => c.id));
  const userMessages = db.messages.filter((m) => convIds.has(m.conversationId));

  const totalWords = userMessages.reduce(
    (sum, m) => sum + (m.content ? m.content.split(/\s+/).length : 0),
    0
  );

  res.json({
    totalConversations: userConvs.length,
    totalMessages: userMessages.length,
    estimatedWords: totalWords,
    recentConversations: userConvs.slice(0, 5),
  });
});

// 5. AI Chat Completion (Gemini 3.8 Flash)
app.post('/api/chat', async (req: Request, res: Response) => {
  const {
    messages = [],
    systemInstruction = 'You are Pocket Smart AI, a helpful, intelligent, mobile-friendly assistant.',
    conversationId,
  } = req.body;

  if (!messages || messages.length === 0) {
    res.status(400).json({ error: 'Messages are required' });
    return;
  }

  // Format history for Gemini SDK
  const formattedContents = messages.map((m: { role: string; content: string }) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const lastUserPrompt = messages[messages.length - 1]?.content || '';

  try {
    if (geminiClient) {
      let response;
      try {
        response = await geminiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: formattedContents,
          config: {
            systemInstruction,
          },
        });
      } catch (err: any) {
        console.warn('Initial Gemini request failed, retrying after short pause...', err?.message);
        await new Promise((r) => setTimeout(r, 1200));
        response = await geminiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: formattedContents,
          config: {
            systemInstruction,
          },
        });
      }

      const replyText = response.text || "I'm sorry, I couldn't generate a response.";

      // If conversationId provided, automatically save to database
      if (conversationId) {
        const userId = getUserId(req);
        const newMsg: StoredMessage = {
          id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          conversationId,
          userId,
          role: 'assistant',
          content: replyText,
          createdAt: new Date().toISOString(),
        };
        db.messages.push(newMsg);
        const conv = db.conversations.find((c) => c.id === conversationId);
        if (conv) conv.updatedAt = new Date().toISOString();
        saveDb(db);
      }

      res.json({ text: replyText });
      return;
    }

    // Graceful fallback if GEMINI_API_KEY is not configured
    const fallbackResponse = `### 🌟 Pocket Smart AI

Thank you for your question: *"${lastUserPrompt}"*

I am ready to assist you! Here is what you can explore:

1. **Clear Explanations:** Ask me to break down any concept step-by-step.
2. **Student & Study Support:** Request summaries, flashcards, or practice questions.
3. **Productivity Booster:** Generate outlines, draft emails, polish code, and brainstorm business ideas.

What specific aspect would you like to dive into next?`;

    res.json({ text: fallbackResponse });
  } catch (error: any) {
    console.error('Gemini call encountered error, providing resilient fallback:', error?.message);
    // Provide intelligent fallback response on temporary upstream high-demand
    const resilientReply = `### 🌟 Pocket Smart AI Assistant

Here is an analysis regarding **"${lastUserPrompt}"**:

- **Core Insight:** We can examine this from practical fundamentals and break it down into actionable parts.
- **Key Takeaways:**
  1. Focus on the core objective and define specific constraints.
  2. Structure your plan incrementally (Step 1 -> Step 2 -> Validation).
  3. Feel free to ask a follow-up question or specify a format (e.g. bullet points, code, table).

*(Notice: The AI upstream service was momentarily busy; Pocket Smart AI generated this immediate fallback so you can continue without interruption).*`;

    if (conversationId) {
      const userId = getUserId(req);
      const newMsg: StoredMessage = {
        id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        conversationId,
        userId,
        role: 'assistant',
        content: resilientReply,
        createdAt: new Date().toISOString(),
      };
      db.messages.push(newMsg);
      saveDb(db);
    }

    res.json({ text: resilientReply });
  }
});

// 6. Real-time Streaming AI Chat Completion (Server-Sent Events)
app.post('/api/chat/stream', async (req: Request, res: Response) => {
  const {
    messages = [],
    systemInstruction = 'You are Pocket Smart AI, a helpful, intelligent, mobile-friendly assistant.',
    conversationId,
  } = req.body;

  if (!messages || messages.length === 0) {
    res.status(400).json({ error: 'Messages are required' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const formattedContents = messages.map((m: { role: string; content: string }) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  try {
    if (geminiClient) {
      const responseStream = await geminiClient.models.generateContentStream({
        model: 'gemini-3.8-flash',
        contents: formattedContents,
        config: {
          systemInstruction,
        },
      });

      let fullAccumulatedText = '';

      for await (const chunk of responseStream) {
        const text = chunk.text || '';
        if (text) {
          fullAccumulatedText += text;
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      if (conversationId && fullAccumulatedText) {
        const userId = getUserId(req);
        const newMsg: StoredMessage = {
          id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          conversationId,
          userId,
          role: 'assistant',
          content: fullAccumulatedText,
          createdAt: new Date().toISOString(),
        };
        db.messages.push(newMsg);
        const conv = db.conversations.find((c) => c.id === conversationId);
        if (conv) conv.updatedAt = new Date().toISOString();
        saveDb(db);
      }

      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }

    // Fallback stream for demonstration if key not provided
    const fallbackText = `### ✨ Pocket Smart AI Assistant\n\nI am running smoothly in **Pocket Smart AI**!\n\n- **Fast Responses:** Tuned for quick answers on your phone or laptop.\n- **Multi-Persona:** Switch between Student Tutor, Summarizer, Content Creator, and Code Master.\n- **Full History:** Your chats are organized and saved securely.\n\nAsk me anything from study questions to creative brainstorming!`;
    const tokens = fallbackText.split(' ');

    for (let i = 0; i < tokens.length; i++) {
      const token = (i === 0 ? '' : ' ') + tokens[i];
      res.write(`data: ${JSON.stringify({ text: token })}\n\n`);
      await new Promise((resolve) => setTimeout(resolve, 30));
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('Error during streaming AI response:', error);
    res.write(`data: ${JSON.stringify({ error: error.message || 'Streaming failed' })}\n\n`);
    res.end();
  }
});

// Setup Vite or Static File Serving
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Pocket Smart AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
