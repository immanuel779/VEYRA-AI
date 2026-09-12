import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { TopBar } from '../components/layout/TopBar';
import { Sidebar } from '../components/sidebar/Sidebar';
import { Logo } from '../components/ui/Logo';
import { BrandLogo } from '../components/ui/BrandLogo';
import { MarkdownMessage } from '../components/chat/MarkdownMessage';
import { MessageActions } from '../components/chat/MessageActions';
import { MessageAttachments } from '../components/chat/MessageAttachments';
import { AttachmentPreview } from '../components/chat/AttachmentPreview';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { streamChat, extractFiles } from '../services/api';
import { exportConversation } from '../utils/exportConversation';
import { uploadToCloudinary, type UploadResult } from '../services/cloudinary';
import {
  ArrowUp, Square, Sparkles, Code2, Lightbulb, BookOpen, Globe, Mic, MicOff, Paperclip, AlertCircle,
} from 'lucide-react';
import {
  listConversations,
  createConversation,
  getMessages,
  addMessage,
  setMessageFeedback,
  renameConversation,
  deleteConversation,
  deriveTitle,
  type ConversationDoc,
  type Attachment,
} from '../services/conversations';

type Role = 'user' | 'assistant';

interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  attachments?: Attachment[];
  feedback?: 'like' | 'dislike' | null;
  createdAt?: Date | null;
}

const MAX_INPUT_CHARS = 10000;
const MAX_ATTACHMENTS = 5;

const suggestions = [
  { icon: Code2, title: 'Explain React simply', hint: 'Start with components and props' },
  { icon: Lightbulb, title: 'Help me plan a business', hint: 'From idea to first customer' },
  { icon: BookOpen, title: 'Give me a JS project idea', hint: 'Something I can build this week' },
  { icon: Sparkles, title: 'Brainstorm creative ideas', hint: 'Writing, design, or life' },
];

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function Timestamp({ date }: { date?: Date | null }) {
  if (!date) return null;
  const d = new Date(date);
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return (
    <span className="text-[10px] text-muted/70 tabular-nums">
      {hh}:{mm}
    </span>
  );
}

export function ChatPage() {
  const { user, getToken } = useAuth();
  const { prefs } = usePreferences();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [searchStatus, setSearchStatus] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [pendingAttachments, setPendingAttachments] = useState<UploadResult[]>([]);
  const [uploading, setUploading] = useState(false);

  const [conversations, setConversations] = useState<ConversationDoc[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const skipNextLoadRef = useRef<string | null>(null);
  const statusTimeoutRef = useRef<number | null>(null);
  const voiceBaseRef = useRef<string>('');

  const speech = useSpeechRecognition({
    onTranscript: (transcript) => {
      const base = voiceBaseRef.current;
      const combined = (base ? base + transcript : transcript).slice(0, MAX_INPUT_CHARS);
      setInput(combined);
      requestAnimationFrame(() => autoResize());
    },
    onError: (err) => {
      setVoiceError(err);
      window.setTimeout(() => setVoiceError(null), 4000);
    },
  });

  useEffect(() => {
    if (!user) return;
    setListLoading(true);
    listConversations(user.uid)
      .then(setConversations)
      .catch((e) => console.error('list conversations failed', e))
      .finally(() => setListLoading(false));
  }, [user]);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    if (skipNextLoadRef.current === activeId) {
      skipNextLoadRef.current = null;
      return;
    }
    getMessages(activeId)
      .then((docs) => {
        setMessages(
          docs.map((d) => ({
            id: d.id,
            role: d.role,
            content: d.content,
            attachments: d.attachments ?? [],
            feedback: d.feedback ?? null,
            createdAt: d.createdAt,
          }))
        );
      })
      .catch((e) => console.error('get messages failed', e));
  }, [activeId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  }

  function refreshList() {
    if (!user) return;
    listConversations(user.uid).then(setConversations).catch(() => {});
  }

  function showStatus(status: string) {
    setSearchStatus(status);
    if (statusTimeoutRef.current) {
      window.clearTimeout(statusTimeoutRef.current);
    }
    statusTimeoutRef.current = window.setTimeout(() => {
      setSearchStatus(null);
    }, 4000);
  }

  function showFileError(msg: string) {
    setFileError(msg);
    window.setTimeout(() => setFileError(null), 5000);
  }

  function handleMicClick() {
    if (streaming) return;
    if (!speech.isSupported) {
      setVoiceError('Voice input is not supported in this browser. Try Chrome or Safari.');
      window.setTimeout(() => setVoiceError(null), 4000);
      return;
    }
    if (!speech.isListening) {
      voiceBaseRef.current = input ? input.trim() + ' ' : '';
    }
    speech.toggle();
  }

  function handleAttachClick() {
    if (streaming || uploading) return;
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const arr = Array.from(files);
    if (pendingAttachments.length + arr.length > MAX_ATTACHMENTS) {
      showFileError(`Maximum ${MAX_ATTACHMENTS} files per message.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploading(true);
    try {
      for (const file of arr) {
        const result = await uploadToCloudinary(file);
        setPendingAttachments((prev) => [...prev, result]);
      }
    } catch (err) {
      showFileError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function removeAttachment(index: number) {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  function handleExport() {
    if (!activeId || messages.length === 0) return;
    const conv = conversations.find((c) => c.id === activeId);
    const title = conv?.title || 'Conversation';
    exportConversation(
      title,
      messages.map((m) => ({
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      })),
      'markdown'
    );
  }

  async function streamResponse(
    history: {
      role: Role;
      content: string;
      attachments?: Attachment[];
    }[],
    assistantId: string
  ): Promise<string> {
    const controller = new AbortController();
    abortRef.current = controller;

    const recentHistory = history.slice(-15).map((m) => ({
      role: m.role,
      content: m.content.slice(0, MAX_INPUT_CHARS),
      attachments: m.attachments,
    }));

    let acc = '';
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      await streamChat({
        messages: recentHistory,
        token,
        signal: controller.signal,
        webSearch: prefs.webSearch,
        onDelta: (delta) => {
          acc += delta;
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: acc } : m))
          );
        },
        onStatus: (status) => {
          showStatus(status);
        },
      });

      return acc;
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        const fallback = acc || '_(generation stopped)_';
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: fallback } : m))
        );
        return fallback;
      } else {
        const msg = err instanceof Error ? err.message : 'Something went wrong.';
        const fallback = acc || `_⚠️ ${msg}_`;
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: fallback } : m))
        );
        return fallback;
      }
    } finally {
      abortRef.current = null;
      setSearchStatus(null);
    }
  }

  async function send(text: string) {
    const trimmed = text.trim();
    const atts = pendingAttachments;

    if ((!trimmed && atts.length === 0) || streaming || !user) return;

    if (speech.isListening) speech.stop();

    // Step 1: Extract text from non-image attachments
    const enrichable = atts.filter((a) => a.type === 'file');
    let attachmentPayload: Attachment[] = atts.map((a) => ({
      url: a.url,
      type: a.type,
      name: a.name,
      size: a.size,
      mime: a.mime,
      publicId: a.publicId,
    }));

    if (enrichable.length > 0) {
      setStreaming(true);
      showStatus(`Reading ${enrichable.length} file${enrichable.length > 1 ? 's' : ''}…`);
      try {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');

        const extractionResults = await extractFiles(
          enrichable.map((a) => ({ url: a.url, mime: a.mime, name: a.name })),
          token
        );

        const textByUrl = new Map(
          extractionResults.map((r) => [r.url, r.textContent])
        );

        attachmentPayload = attachmentPayload.map((a) => {
          const extracted = textByUrl.get(a.url);
          return extracted ? { ...a, textContent: extracted } : a;
        });
      } catch (err) {
        console.error('[send] extract step failed:', err);
      }
    }

    // Step 2: Add user + assistant placeholder messages
    const userMsg: ChatMessage = {
      id: uid(),
      role: 'user',
      content: trimmed,
      attachments: attachmentPayload,
      createdAt: new Date(),
    };
    const assistantId = uid();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      createdAt: new Date(),
    };

    const next = [...messages, userMsg];
    setMessages([...next, assistantMsg]);
    setInput('');
    setPendingAttachments([]);
    voiceBaseRef.current = '';
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setStreaming(true);

    let convId = activeId;

    try {
      if (!convId) {
        const title = trimmed || attachmentPayload[0]?.name || 'New chat';
        convId = await createConversation(user.uid, deriveTitle(title));
        skipNextLoadRef.current = convId;
        setActiveId(convId);
      }

      await addMessage(convId, 'user', trimmed, userMsg.id, attachmentPayload);

      // Step 3: Build history with attachments — backend inlines file text
      const history = next.map((m) => ({
        role: m.role,
        content: m.content,
        attachments: m.attachments,
      }));

      const assistantFinal = await streamResponse(history, assistantId);

      if (assistantFinal) {
        await addMessage(convId, 'assistant', assistantFinal, assistantId);
      }
    } finally {
      setStreaming(false);
      refreshList();
    }
  }

  async function regenerate(assistantId: string) {
    if (streaming || !activeId) return;

    if (messages[messages.length - 1].id !== assistantId) return;
    const lastAssistant = messages[messages.length - 1];
    if (lastAssistant.role !== 'assistant') return;

    const history = messages.slice(0, -1).map((m) => ({
      role: m.role,
      content: m.content,
      attachments: m.attachments,
    }));

    setMessages((prev) =>
      prev.map((m) =>
        m.id === assistantId ? { ...m, content: '', feedback: null } : m
      )
    );
    setStreaming(true);

    try {
      const assistantFinal = await streamResponse(history, assistantId);
      if (assistantFinal) {
        await addMessage(activeId, 'assistant', assistantFinal, assistantId);
      }
    } finally {
      setStreaming(false);
      refreshList();
    }
  }

  async function giveFeedback(
    messageId: string,
    type: 'like' | 'dislike' | null
  ) {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, feedback: type } : m))
    );
    if (!activeId) return;
    try {
      await setMessageFeedback(activeId, messageId, type);
    } catch (e) {
      console.error('feedback failed', e);
    }
  }

  function stop() {
    abortRef.current?.abort();
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    const shouldSend =
      e.key === 'Enter' &&
      !e.shiftKey &&
      (prefs.enterToSend || e.ctrlKey || e.metaKey);
    if (shouldSend) {
      e.preventDefault();
      send(input);
    }
  }

  function handleNewChat() {
    if (streaming) abortRef.current?.abort();
    if (speech.isListening) speech.stop();
    setActiveId(null);
    setMessages([]);
    setInput('');
    setPendingAttachments([]);
    setSearchStatus(null);
    setFileError(null);
    voiceBaseRef.current = '';
    textareaRef.current?.focus();
  }

  async function handleRename(id: string, title: string) {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title } : c))
    );
    try {
      await renameConversation(id, title);
    } catch (e) {
      console.error('rename failed', e);
      refreshList();
    }
  }

  async function handleDelete(id: string) {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) {
      setActiveId(null);
      setMessages([]);
    }
    try {
      await deleteConversation(id);
    } catch (e) {
      console.error('delete failed', e);
      refreshList();
    }
  }

  const isEmpty = messages.length === 0;
  const lastAssistantId = (() => {
    const last = messages[messages.length - 1];
    return last?.role === 'assistant' ? last.id : null;
  })();

  const micDisabled = streaming;
  const canExport = !!activeId && messages.length > 0 && !streaming;
  const canSend = (input.trim().length > 0 || pendingAttachments.length > 0) && !streaming && !uploading;
  const showCounter = input.length > MAX_INPUT_CHARS * 0.8;

  return (
    <AppLayout
      mobileSidebarOpen={mobileSidebarOpen}
      onCloseMobileSidebar={() => setMobileSidebarOpen(false)}
      sidebar={
        <Sidebar
          conversations={conversations}
          activeId={activeId}
          loading={listLoading}
          search={search}
          onSearchChange={setSearch}
          onNewChat={() => {
            handleNewChat();
            setMobileSidebarOpen(false);
          }}
          onSelect={(id) => {
            setActiveId(id);
            setMobileSidebarOpen(false);
          }}
          onRename={handleRename}
          onDelete={handleDelete}
        />
      }
    >
      <TopBar
        onMenuClick={() => setMobileSidebarOpen(true)}
        onExport={canExport ? handleExport : undefined}
      />

      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center px-5 sm:px-8 overflow-y-auto">
          <div className="w-full max-w-2xl py-10">
            <div className="flex flex-col items-center space-y-5 animate-fade-up">
              <BrandLogo size={72} />
              <div className="text-center space-y-2">
                <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-balance leading-[1.1]">
                  What would you like
                  <br />
                  <span className="text-accent">to talk about?</span>
                </h1>
                <p className="text-muted text-sm sm:text-base">Think. Ask. Explore.</p>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {suggestions.map((s, i) => {
                const Icon = s.icon;
                return (
                  <button
                    key={i}
                    onClick={() => send(s.title)}
                    className="group text-left p-4 rounded-xl border border-edge bg-surface/60 hover:border-accent/40 hover:bg-accent-soft/40 transition-all duration-200 ease-out active:scale-[0.99] animate-fade-up"
                    style={{ animationDelay: `${100 + i * 50}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-8 h-8 rounded-lg bg-accent-soft flex items-center justify-center text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white">
                        <Icon size={15} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-ink tracking-tight">{s.title}</div>
                        <div className="text-xs text-muted mt-0.5 truncate">{s.hint}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            {messages.map((m) =>
              m.role === 'user' ? (
                <div key={m.id} className="flex flex-col items-end gap-1 animate-fade-up">
                  {prefs.showTimestamps && <Timestamp date={m.createdAt} />}
                  <div className="max-w-[85%] rounded-2xl rounded-br-md bg-accent text-white px-4 py-2.5 text-sm leading-relaxed">
                    {m.attachments && m.attachments.length > 0 && (
                      <MessageAttachments attachments={m.attachments} />
                    )}
                    {m.content && (
                      <div className="whitespace-pre-wrap break-words">{m.content}</div>
                    )}
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex gap-3 animate-fade-up group/assistant">
                  <div className="shrink-0 w-7 h-7 rounded-lg bg-accent-soft flex items-center justify-center text-accent mt-0.5">
                    <Logo size={14} />
                  </div>
                  <div className="min-w-0 flex-1 pt-1">
                    {prefs.showTimestamps && m.content && (
                      <div className="mb-1">
                        <Timestamp date={m.createdAt} />
                      </div>
                    )}
                    {m.content ? (
                      <>
                        <MarkdownMessage content={m.content} />
                        {!streaming && (
                          <MessageActions
                            content={m.content}
                            feedback={m.feedback}
                            canRegenerate={m.id === lastAssistantId}
                            onRegenerate={() => regenerate(m.id)}
                            onFeedback={(type) => giveFeedback(m.id, type)}
                          />
                        )}
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-muted text-sm">
                        <span className="flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" style={{ animationDelay: '300ms' }} />
                        </span>
                        <span className="text-xs">VEYRA is thinking…</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {(searchStatus || voiceError || speech.isListening || fileError || uploading) && (
        <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 pt-3 flex flex-wrap gap-2">
          {speech.isListening && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 text-red-500 text-xs font-medium border border-red-500/20 animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Listening…
            </div>
          )}
          {uploading && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-soft text-accent text-xs font-medium border border-accent/20 animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Uploading…
            </div>
          )}
          {searchStatus && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-soft text-accent text-xs font-medium border border-accent/20 animate-fade-in">
              <Globe size={12} className="animate-pulse" />
              {searchStatus}
            </div>
          )}
          {voiceError && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium border border-amber-500/20 animate-fade-in">
              <MicOff size={12} />
              {voiceError}
            </div>
          )}
          {fileError && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 text-red-500 text-xs font-medium border border-red-500/20 animate-fade-in">
              <AlertCircle size={12} />
              {fileError}
            </div>
          )}
        </div>
      )}

      <div className="border-t border-edge bg-canvas/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <AttachmentPreview
            attachments={pendingAttachments}
            onRemove={removeAttachment}
          />

          <div className="relative rounded-2xl border border-edge bg-surface shadow-sm hover:border-accent/30 focus-within:border-accent/60 focus-within:shadow-md transition-all duration-200">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value.slice(0, MAX_INPUT_CHARS));
                autoResize();
              }}
              onKeyDown={onKeyDown}
              placeholder={speech.isListening ? 'Listening…' : 'Message VEYRA...'}
              disabled={streaming}
              maxLength={MAX_INPUT_CHARS}
              className="w-full resize-none bg-transparent px-5 py-4 pr-32 text-sm placeholder:text-muted/70 focus:outline-none disabled:opacity-60 max-h-52"
            />

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.txt,.doc,.docx,.csv"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={handleAttachClick}
              disabled={streaming || uploading}
              aria-label="Attach file"
              title="Attach file"
              className="absolute right-[88px] bottom-2.5 w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-ink hover:bg-edge/60 transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Paperclip size={15} />
            </button>

            <button
              type="button"
              onClick={handleMicClick}
              disabled={micDisabled}
              aria-label={speech.isListening ? 'Stop voice input' : 'Start voice input'}
              title={speech.isListening ? 'Stop voice input' : 'Start voice input'}
              className={`absolute right-12 bottom-2.5 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                speech.isListening
                  ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                  : 'text-muted hover:text-ink hover:bg-edge/60'
              }`}
            >
              <Mic size={15} />
            </button>

            {streaming ? (
              <button
                onClick={stop}
                aria-label="Stop generating"
                className="absolute right-2.5 bottom-2.5 w-8 h-8 rounded-lg bg-ink text-canvas flex items-center justify-center transition-all duration-200 active:scale-95 shadow-sm hover:opacity-90"
              >
                <Square size={12} fill="currentColor" />
              </button>
            ) : (
              <button
                onClick={() => send(input)}
                disabled={!canSend}
                aria-label="Send"
                className="absolute right-2.5 bottom-2.5 w-8 h-8 rounded-lg bg-accent hover:bg-accent-hover text-white flex items-center justify-center transition-all duration-200 active:scale-95 shadow-sm hover:shadow disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowUp size={15} strokeWidth={2.5} />
              </button>
            )}
          </div>

          <div className="flex items-center justify-center mt-3 gap-3">
            {showCounter && (
              <span
                className={`text-[11px] tabular-nums ${
                  input.length >= MAX_INPUT_CHARS
                    ? 'text-red-500'
                    : 'text-muted/70'
                }`}
              >
                {input.length.toLocaleString()} / {MAX_INPUT_CHARS.toLocaleString()}
              </span>
            )}
            <p className="text-[11px] text-muted/70 text-center">
              VEYRA can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
