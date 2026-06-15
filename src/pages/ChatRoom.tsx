import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { trpc } from '@/providers/trpc';
import {
  MessageCircle, ChevronLeft, Send, Loader2, Users,
  Bot, Zap, Hash, CircleUser, Sparkles,
} from 'lucide-react';

interface Room {
  id: number;
  name: string;
  description: string;
  topic: string;
}

interface DisplayMessage {
  id: number;
  roomId: number;
  userName: string;
  content: string;
  isAi: number;
  createdAt: string;
}

const rooms: Room[] = [
  { id: 1, name: 'General', description: 'General discussion about engineering and learning', topic: 'general' },
  { id: 2, name: 'DC Circuits', description: 'Discussion about DC circuit analysis topics', topic: 'dc-circuits' },
  { id: 3, name: 'Study Group', description: 'Collaborative study sessions and help', topic: 'study' },
  { id: 4, name: 'Math Help', description: 'Get help with math problems and concepts', topic: 'math' },
];

const roomIcons: Record<string, React.ReactNode> = {
  general: <MessageCircle className="w-4 h-4" />,
  'dc-circuits': <Zap className="w-4 h-4" />,
  study: <Users className="w-4 h-4" />,
  math: <Hash className="w-4 h-4" />,
};

const roomColors: Record<string, string> = {
  general: '#3b82f6',
  'dc-circuits': '#f59e0b',
  study: '#10b981',
  math: '#8b5cf6',
};

export default function ChatRoom() {
  const { user, isAuthenticated } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState<number>(1);
  const [input, setInput] = useState('');
  const [localMessages, setLocalMessages] = useState<DisplayMessage[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const utils = trpc.useUtils();

  // Fetch messages from DB
  const { data: dbMessages } = trpc.chat.getMessages.useQuery(
    { roomId: selectedRoom },
    { refetchInterval: 5000 }
  );

  // Mutations
  const sendMessageMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: () => utils.chat.getMessages.invalidate({ roomId: selectedRoom }),
  });
  const askAiMutation = trpc.chat.askAi.useMutation({
    onSuccess: () => {
      utils.chat.getMessages.invalidate({ roomId: selectedRoom });
      setIsAiLoading(false);
    },
    onError: () => setIsAiLoading(false),
  });

  // Merge local + DB messages
  useEffect(() => {
    const dbOnes = (dbMessages || []).map(m => ({
      id: m.id,
      roomId: m.roomId,
      userName: m.userName || (m.isAi ? 'CircuitBot' : 'Guest'),
      content: m.content,
      isAi: m.isAi,
      createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
    }));
    // Merge, deduplicate by id
    const merged = [...localMessages, ...dbOnes];
    const unique = merged.filter((m, i, a) => a.findIndex(x => x.id === m.id) === i);
    unique.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    setLocalMessages(unique);
  }, [dbMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages.length]);

  const handleSend = async () => {
    if (!input.trim() || isAiLoading) return;

    const content = input.trim();
    setInput('');

    // Save user message via tRPC
    const result = await sendMessageMutation.mutateAsync({
      roomId: selectedRoom,
      content,
      userName: user?.name || undefined,
    });

    // Add to local state immediately
    setLocalMessages(prev => [...prev, {
      id: result.id,
      roomId: selectedRoom,
      userName: result.userName || user?.name || 'You',
      content: result.content,
      isAi: 0,
      createdAt: new Date().toISOString(),
    }]);

    // Check if message mentions AI
    if (content.toLowerCase().includes('@bot') || content.toLowerCase().includes('@circuit')) {
      setIsAiLoading(true);
      try {
        await askAiMutation.mutateAsync({
          roomId: selectedRoom,
          content,
        });
      } catch (err) {
        console.error('[ChatRoom] AI request failed:', err);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const currentRoom = rooms.find(r => r.id === selectedRoom);
  const messages = localMessages.filter(m => m.roomId === selectedRoom);

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* Room Sidebar */}
      <div className="w-64 border-r border-white/5 flex flex-col shrink-0 hidden md:flex">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle className="w-4 h-4 text-[#3b82f6]" />
            <h2 className="text-sm font-semibold">Chat Rooms</h2>
          </div>
          <p className="text-[10px] text-[#737373]">Join the conversation</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {rooms.map(room => (
            <button
              key={room.id}
              onClick={() => { setSelectedRoom(room.id); }}
              className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs transition-all ${
                selectedRoom === room.id
                  ? 'bg-white/10 text-white'
                  : 'text-[#737373] hover:text-white hover:bg-white/5'
              }`}
            >
              <span style={{ color: roomColors[room.topic] ?? '#737373' }}>
                {roomIcons[room.topic] ?? <Hash className="w-4 h-4" />}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{room.name}</div>
                <div className="text-[10px] text-[#525252] truncate">{room.description}</div>
              </div>
            </button>
          ))}
        </div>
        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-2 text-[10px] text-[#525252]">
            <Bot className="w-3 h-3" />
            <span>Type @bot to ask CircuitBot</span>
          </div>
          {isAuthenticated && (
            <div className="flex items-center gap-1 mt-1 text-[10px] text-[#10b981]">
              <Sparkles className="w-3 h-3" />
              <span>Kimi AI enabled</span>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Room Selector */}
      <div className="md:hidden fixed bottom-20 left-4 right-4 z-30">
        <div className="flex gap-1 p-1 bg-[#0a0a0a]/90 backdrop-blur-lg rounded-xl border border-white/10 overflow-x-auto">
          {rooms.map(room => (
            <button
              key={room.id}
              onClick={() => setSelectedRoom(room.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all ${
                selectedRoom === room.id ? 'bg-white/10 text-white' : 'text-[#737373]'
              }`}
            >
              <span style={{ color: roomColors[room.topic] ?? '#737373' }}>
                {roomIcons[room.topic] ?? <Hash className="w-3 h-3" />}
              </span>
              {room.name}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="border-b border-white/5 px-4 py-3 flex items-center gap-3 shrink-0">
          <Link to="/" className="text-[#737373] hover:text-white transition-colors shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{
              backgroundColor: `${roomColors[currentRoom?.topic ?? 'general']}15`,
              border: `1px solid ${roomColors[currentRoom?.topic ?? 'general']}30`,
            }}
          >
            <span style={{ color: roomColors[currentRoom?.topic ?? 'general'] }}>
              {roomIcons[currentRoom?.topic ?? 'general'] ?? <Hash className="w-4 h-4" />}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold">{currentRoom?.name ?? 'Chat'}</h1>
            <p className="text-[10px] text-[#737373] truncate">{currentRoom?.description}</p>
          </div>
          {isAuthenticated && (
            <div className="flex items-center gap-1 text-[10px] text-[#10b981]">
              <Sparkles className="w-3 h-3" />
              <span className="hidden sm:inline">Kimi AI</span>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle className="w-10 h-10 text-[#525252] mb-3" />
              <p className="text-sm text-[#737373] mb-1">No messages yet</p>
              <p className="text-[10px] text-[#525252] max-w-xs">
                Be the first to send a message! Type @bot to get help from CircuitBot.
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((msg, i) => {
                const isAi = msg.isAi === 1;
                const isOwn = !isAi && msg.userName === (user?.name || 'You');
                const showAvatar = i === 0 || messages[i - 1].isAi !== msg.isAi || messages[i - 1].userName !== msg.userName;

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2.5 ${isOwn ? 'flex-row-reverse' : ''}`}
                  >
                    {showAvatar && (
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isAi ? 'bg-[#10b981]/15 text-[#10b981]' : isOwn ? 'bg-[#3b82f6]/15 text-[#3b82f6]' : 'bg-white/5 text-[#737373]'
                        }`}
                      >
                        {isAi ? <Bot className="w-3.5 h-3.5" /> : <CircleUser className="w-3.5 h-3.5" />}
                      </div>
                    )}
                    {!showAvatar && <div className="w-7 shrink-0" />}
                    <div className={`max-w-[75%] ${isOwn ? 'text-right' : ''}`}>
                      {showAvatar && (
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={`text-[10px] font-medium ${isAi ? 'text-[#10b981]' : 'text-[#737373]'}`}>
                            {msg.userName}
                          </span>
                          {isAi && <span className="text-[9px] px-1 py-0.5 rounded bg-[#10b981]/10 text-[#10b981]">AI</span>}
                        </div>
                      )}
                      <div
                        className={`inline-block rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                          isAi ? 'bg-[#10b981]/5 border border-[#10b981]/15 text-[#d4d4d4]' : isOwn ? 'bg-[#3b82f6]/15 text-[#d4d4d4]' : 'bg-white/5 text-[#d4d4d4]'
                        }`}
                      >
                        <div dangerouslySetInnerHTML={{
                          __html: msg.content
                            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                            .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 rounded bg-white/10 text-[10px]">$1</code>')
                            .replace(/\n/g, '<br/>'),
                        }} />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {isAiLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#10b981]/15 flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5 text-[#10b981]" />
                  </div>
                  <div className="bg-[#10b981]/5 border border-[#10b981]/15 rounded-2xl px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <Loader2 className="w-3 h-3 text-[#10b981] animate-spin" />
                      <span className="text-[10px] text-[#737373]">
                        {isAuthenticated ? 'Kimi AI is thinking...' : 'CircuitBot is thinking...'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/5 px-4 py-3 shrink-0">
          <div className="flex items-end gap-2 max-w-3xl mx-auto">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... Use @bot to ask CircuitBot"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-[#f6f6f6] placeholder-[#737373] outline-none resize-none min-h-[44px] max-h-[120px] focus:border-[#3b82f6]/30"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isAiLoading}
              className="px-4 py-3 bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl transition-colors shrink-0"
            >
              {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
