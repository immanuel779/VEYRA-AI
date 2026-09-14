import { Link } from 'react-router-dom';
import { useState } from 'react';
import {
  ArrowRight, MessageSquare, Code2, Image as ImageIcon, FileText,
  Globe, Mic, Sparkles, Check, Menu, X,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { BrandLogo } from '../components/ui/BrandLogo';
import { Logo } from '../components/ui/Logo';
import { useTheme } from '../context/ThemeContext';

export function LandingPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-full bg-canvas text-ink overflow-x-hidden">
      <Nav mobileOpen={mobileNavOpen} setMobileOpen={setMobileNavOpen} />
      <Hero />
      <Capabilities />
      <ExampleSessions />
      <FinalCTA />
      <Footer />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// NAV
// ═══════════════════════════════════════════════════════════════
function Nav({
  mobileOpen,
  setMobileOpen,
}: {
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}) {
  const { resolved, setTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-40 border-b border-edge bg-canvas/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-ink">
          <Logo size={22} className="text-accent" />
          <span className="font-semibold tracking-tight text-[16px]">
            VEYRA<span className="text-muted font-normal"> AI</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <a href="#capabilities" className="text-sm text-muted hover:text-ink transition-colors">
            Features
          </a>
          <a href="#examples" className="text-sm text-muted hover:text-ink transition-colors">
            Examples
          </a>
          <button
            onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
            className="text-sm text-muted hover:text-ink transition-colors"
            aria-label="Toggle theme"
          >
            {resolved === 'dark' ? 'Light' : 'Dark'}
          </button>
          <Link to="/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm">
              Get started <ArrowRight size={13} />
            </Button>
          </Link>
        </div>

        <button
          className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-muted hover:text-ink hover:bg-edge/60"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-edge bg-canvas px-5 py-4 space-y-3 animate-fade-in">
          <a href="#capabilities" className="block text-sm text-muted" onClick={() => setMobileOpen(false)}>Features</a>
          <a href="#examples" className="block text-sm text-muted" onClick={() => setMobileOpen(false)}>Examples</a>
          <div className="pt-3 border-t border-edge flex gap-2">
            <Link to="/login" className="flex-1">
              <Button variant="outline" size="md" className="w-full">Sign in</Button>
            </Link>
            <Link to="/register" className="flex-1">
              <Button variant="primary" size="md" className="w-full">Get started</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════════
// HERO
// ═══════════════════════════════════════════════════════════════
function Hero() {
  return (
    <section className="relative overflow-hidden grain">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-20 sm:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: copy */}
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-edge bg-surface/60 text-xs text-muted mb-6">
              <Sparkles size={12} className="text-accent" />
              <span>Think. Ask. Explore.</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05] text-balance mb-6">
              Your AI assistant,
              <br />
              <span className="text-accent">built to actually think.</span>
            </h1>
            <p className="text-muted text-base sm:text-lg mb-8 max-w-lg leading-relaxed">
              Chat naturally, debug code, understand images, read documents,
              and search the web — all in one place. Free to start, no credit card.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/register">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  Start for free <ArrowRight size={15} />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  I already have an account
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-5 text-xs text-muted">
              <div className="flex items-center gap-1.5">
                <Check size={13} className="text-accent" /> No setup
              </div>
              <div className="flex items-center gap-1.5">
                <Check size={13} className="text-accent" /> Works on mobile
              </div>
              <div className="flex items-center gap-1.5">
                <Check size={13} className="text-accent" /> 3 AI models
              </div>
            </div>
          </div>

          {/* Right: chat mockup */}
          <div className="animate-fade-up" style={{ animationDelay: '200ms' }}>
            <HeroChatMockup />
          </div>
        </div>
      </div>

      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-40 right-0 w-[500px] h-[500px] rounded-full bg-accent/5 blur-3xl" />
    </section>
  );
}

function HeroChatMockup() {
  return (
    <div className="relative rounded-2xl border border-edge bg-surface shadow-xl overflow-hidden">
      {/* Top bar */}
      <div className="h-10 flex items-center px-4 border-b border-edge bg-canvas/60">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
        </div>
        <div className="ml-4 text-xs text-muted flex items-center gap-1.5">
          <Logo size={12} className="text-accent" />
          VEYRA AI
        </div>
      </div>

      {/* Messages */}
      <div className="p-4 sm:p-6 space-y-4">
        {/* User message */}
        <div className="flex justify-end">
          <div className="max-w-[75%] rounded-2xl rounded-br-md bg-accent text-white px-4 py-2.5 text-sm">
            What's the latest in AI this week?
          </div>
        </div>

        {/* AI thinking */}
        <div className="flex gap-3">
          <div className="shrink-0 w-7 h-7 rounded-lg bg-accent-soft flex items-center justify-center text-accent">
            <Logo size={14} />
          </div>
          <div className="min-w-0 flex-1 pt-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-accent-soft text-accent text-[10px] font-medium mb-2">
              <Globe size={10} />
              Searching the web…
            </div>
          </div>
        </div>

        {/* AI response */}
        <div className="flex gap-3">
          <div className="shrink-0 w-7 h-7 rounded-lg bg-accent-soft flex items-center justify-center text-accent">
            <Logo size={14} />
          </div>
          <div className="min-w-0 flex-1 pt-1">
            <div className="text-sm leading-relaxed space-y-2">
              <p className="font-medium">Here's what's happening in AI this week:</p>
              <ul className="list-disc pl-5 space-y-1 text-[13px]">
                <li><span className="text-accent font-medium">Anthropic</span> released a new reasoning model</li>
                <li><span className="text-accent font-medium">Google</span> expanded Gemini's free tier</li>
                <li><span className="text-accent font-medium">Meta</span> open-sourced a new vision model</li>
              </ul>
              <p className="text-[12px] text-muted italic">Sources: multiple outlets</p>
            </div>
          </div>
        </div>

        {/* User follow-up */}
        <div className="flex justify-end">
          <div className="max-w-[75%] rounded-2xl rounded-br-md bg-accent text-white px-4 py-2.5 text-sm">
            Can you explain the Anthropic one?
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CAPABILITIES
// ═══════════════════════════════════════════════════════════════
function Capabilities() {
  const features = [
    {
      icon: MessageSquare,
      title: 'Natural conversation',
      desc: 'Ask anything. Get clear, thoughtful answers that actually address what you meant.',
    },
    {
      icon: Code2,
      title: 'Expert coding mode',
      desc: 'Debug real code, catch logic bugs, refactor, and get complete working fixes.',
    },
    {
      icon: ImageIcon,
      title: 'Vision understanding',
      desc: 'Upload screenshots, photos, or diagrams. VEYRA reads and analyzes what it sees.',
    },
    {
      icon: FileText,
      title: 'File reading',
      desc: 'Drop in a PDF, DOCX, or CSV. Ask questions. Get answers from the document.',
    },
    {
      icon: Globe,
      title: 'Real-time web search',
      desc: 'Current events, prices, releases — VEYRA searches the web when you need live info.',
    },
    {
      icon: Mic,
      title: 'Voice input',
      desc: 'Tap the mic and speak. Your words become text, live, in the input box.',
    },
  ];

  return (
    <section id="capabilities" className="py-20 sm:py-28 border-t border-edge">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="max-w-2xl mb-14">
          <div className="text-xs uppercase tracking-[0.15em] text-accent mb-3 font-medium">
            Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight mb-4">
            Everything you need,
            <br />
            <span className="text-muted">nothing you don't.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="group p-5 rounded-xl border border-edge bg-surface/60 hover:border-accent/40 hover:bg-accent-soft/20 transition-all duration-200 animate-fade-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="w-9 h-9 rounded-lg bg-accent-soft flex items-center justify-center text-accent mb-4 transition-colors group-hover:bg-accent group-hover:text-white">
                  <Icon size={16} />
                </div>
                <h3 className="font-medium tracking-tight mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// EXAMPLE SESSIONS
// ═══════════════════════════════════════════════════════════════
type Tab = 'chat' | 'code' | 'vision' | 'file';

function ExampleSessions() {
  const [tab, setTab] = useState<Tab>('code');

  const tabs: { id: Tab; label: string; icon: typeof Code2 }[] = [
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'code', label: 'Code', icon: Code2 },
    { id: 'vision', label: 'Vision', icon: ImageIcon },
    { id: 'file', label: 'Files', icon: FileText },
  ];

  return (
    <section id="examples" className="py-20 sm:py-28 border-t border-edge bg-surface/30">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="max-w-2xl mb-12">
          <div className="text-xs uppercase tracking-[0.15em] text-accent mb-3 font-medium">
            Example sessions
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight mb-4">
            See VEYRA in action.
          </h2>
          <p className="text-muted text-base">
            Real conversations, real answers. Pick a mode to see how it works.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-accent text-white shadow-sm'
                    : 'bg-surface border border-edge text-muted hover:text-ink hover:border-accent/40'
                }`}
              >
                <Icon size={14} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Panel */}
        <div className="rounded-2xl border border-edge bg-canvas overflow-hidden shadow-sm">
          {tab === 'chat' && <ChatExample />}
          {tab === 'code' && <CodeExample />}
          {tab === 'vision' && <VisionExample />}
          {tab === 'file' && <FileExample />}
        </div>
      </div>
    </section>
  );
}

// ── Chat example ──
function ChatExample() {
  return (
    <div className="p-6 sm:p-8 space-y-5 max-h-[600px] overflow-y-auto">
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-accent text-white px-4 py-2.5 text-sm">
          Help me plan a business
        </div>
      </div>
      <AssistantBubble>
        <p className="mb-3">Tell me a bit more — what's the business idea, and where are you starting from?</p>
        <p className="text-muted text-[13px]">Even a rough idea is enough to begin.</p>
      </AssistantBubble>

      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-accent text-white px-4 py-2.5 text-sm">
          Selling handmade leather bags online, starting from scratch
        </div>
      </div>
      <AssistantBubble>
        <p className="font-medium mb-3">Here's a starting plan:</p>
        <ol className="list-decimal pl-5 space-y-1.5 text-[13px]">
          <li><span className="font-medium">Validate demand</span> — sell 5 to friends first, learn pricing</li>
          <li><span className="font-medium">Set up one channel</span> — Instagram + a simple landing page</li>
          <li><span className="font-medium">Price for margin</span> — materials + time + 40% minimum</li>
          <li><span className="font-medium">Reinvest first profits</span> — better leather, better photos</li>
        </ol>
        <p className="mt-3 text-muted text-[13px]">
          Want me to go deeper on any of these steps?
        </p>
      </AssistantBubble>
    </div>
  );
}

// ── Code example ──
function CodeExample() {
  return (
    <div className="p-6 sm:p-8 space-y-5 max-h-[600px] overflow-y-auto">
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-accent text-white px-4 py-2.5 text-sm">
          Why does this throw? <span className="opacity-80">{`api.users[2]`}</span> is undefined
        </div>
      </div>
      <AssistantBubble>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-accent-soft text-accent text-[10px] font-medium mb-3">
          <Code2 size={10} />
          Engaging expert coding mode…
        </div>
        <p className="mb-3">
          You called <code className="px-1.5 py-0.5 rounded bg-edge/60 text-[12px] font-mono">fetchUser(1)</code> which
          only caches user 1. When you then read <code className="px-1.5 py-0.5 rounded bg-edge/60 text-[12px] font-mono">getUserName(2)</code>,
          <code className="px-1.5 py-0.5 rounded bg-edge/60 text-[12px] font-mono ml-1">this.users[2]</code> is <code className="px-1.5 py-0.5 rounded bg-edge/60 text-[12px] font-mono">undefined</code>,
          so accessing <code className="px-1.5 py-0.5 rounded bg-edge/60 text-[12px] font-mono">.name</code> throws.
        </p>
        <p className="font-medium text-[13px] mb-2">Fix — guard against missing data:</p>
        <pre className="rounded-lg bg-edge/40 border border-edge p-3 text-[12px] font-mono overflow-x-auto leading-relaxed">
{`getUserName(id) {
  const user = this.users[id];
  return user ? user.name : null;
}`}
        </pre>
        <p className="mt-3 text-muted text-[13px]">
          Or fetch the missing user first with <code className="px-1.5 py-0.5 rounded bg-edge/60 text-[12px] font-mono">await api.fetchUser(2)</code>.
        </p>
      </AssistantBubble>
    </div>
  );
}

// ── Vision example ──
function VisionExample() {
  return (
    <div className="p-6 sm:p-8 space-y-5 max-h-[600px] overflow-y-auto">
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-accent text-white px-4 py-2.5 text-sm">
          <div className="mb-3 rounded-lg overflow-hidden border border-white/20 bg-gradient-to-br from-slate-700 to-slate-900 p-6 text-center">
            <ImageIcon size={28} className="mx-auto mb-2 opacity-70" />
            <div className="text-[11px] opacity-70">product-photo.jpg</div>
          </div>
          <div>What's wrong with this product photo?</div>
        </div>
      </div>
      <AssistantBubble>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-accent-soft text-accent text-[10px] font-medium mb-3">
          <ImageIcon size={10} />
          Looking at 1 image…
        </div>
        <p className="mb-3 font-medium">Three things stand out:</p>
        <ul className="list-disc pl-5 space-y-1.5 text-[13px]">
          <li><span className="font-medium">Lighting</span> — the product is underexposed on the left side, which makes the leather look darker than it is</li>
          <li><span className="font-medium">Background</span> — the table is cluttered, which distracts from the bag</li>
          <li><span className="font-medium">Angle</span> — you can't see the strap or the inside, which are key selling points</li>
        </ul>
        <p className="mt-3 text-muted text-[13px]">
          Want me to suggest a photography setup for this?
        </p>
      </AssistantBubble>
    </div>
  );
}

// ── File example ──
function FileExample() {
  return (
    <div className="p-6 sm:p-8 space-y-5 max-h-[600px] overflow-y-auto">
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-accent text-white px-4 py-2.5 text-sm">
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-white/15 mb-3">
            <FileText size={14} className="shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-medium truncate">Q3-Report.pdf</div>
              <div className="text-[10px] opacity-70">124 KB</div>
            </div>
          </div>
          <div>Summarize the key takeaways</div>
        </div>
      </div>
      <AssistantBubble>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-accent-soft text-accent text-[10px] font-medium mb-3">
          <FileText size={10} />
          Reading 1 file…
        </div>
        <p className="mb-3 font-medium">Main points from the report:</p>
        <ul className="list-disc pl-5 space-y-1.5 text-[13px]">
          <li>Revenue up <span className="font-medium text-accent">18% QoQ</span>, driven by the enterprise segment</li>
          <li>Customer churn dropped from 4.2% to 3.1%</li>
          <li>Two new hires planned for Q4 — one in sales, one in support</li>
          <li>Recommendation: increase marketing spend by 15% next quarter</li>
        </ul>
      </AssistantBubble>
    </div>
  );
}

function AssistantBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="shrink-0 w-7 h-7 rounded-lg bg-accent-soft flex items-center justify-center text-accent mt-0.5">
        <Logo size={14} />
      </div>
      <div className="min-w-0 flex-1 pt-1 text-sm leading-relaxed">
        {children}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// FINAL CTA
// ═══════════════════════════════════════════════════════════════
function FinalCTA() {
  return (
    <section className="py-20 sm:py-28 border-t border-edge">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
        <BrandLogo size={72} className="mb-6 inline-flex" />
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight mb-4 text-balance">
          Start asking better questions.
        </h2>
        <p className="text-muted text-base mb-8 max-w-lg mx-auto">
          Free to use. No credit card. Works on any device.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/register">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              Create your account <ArrowRight size={15} />
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Sign in
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════════
function Footer() {
  return (
    <footer className="border-t border-edge bg-surface/30">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          <div className="sm:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <Logo size={18} className="text-accent" />
              <span className="font-semibold tracking-tight">
                VEYRA<span className="text-muted font-normal"> AI</span>
              </span>
            </div>
            <p className="text-xs text-muted leading-relaxed max-w-xs">
              A modern conversational AI assistant. Built by
              {' '}
              <span className="text-ink">Oluwadamilare Opeyemi Emmanuel</span>.
            </p>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.1em] text-muted mb-3">Product</div>
            <ul className="space-y-2 text-sm">
              <li><a href="#capabilities" className="text-muted hover:text-ink transition-colors">Features</a></li>
              <li><a href="#examples" className="text-muted hover:text-ink transition-colors">Examples</a></li>
              <li><Link to="/register" className="text-muted hover:text-ink transition-colors">Get started</Link></li>
            </ul>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.1em] text-muted mb-3">Company</div>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://codecraft-tech.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-ink transition-colors"
                >
                  CodeCraft Technologies
                </a>
              </li>
              <li>
                <a
                  href="https://portfolio-psi-ten-i7xo664p2l.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-ink transition-colors"
                >
                  Founder's portfolio
                </a>
              </li>
              <li>
                <a
                  href="mailto:officialcodecrafttech@gmail.com"
                  className="text-muted hover:text-ink transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-edge flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
          <div>© {new Date().getFullYear()} VEYRA AI. All rights reserved.</div>
          <div className="flex items-center gap-1.5">
            <span>Think. Ask. Explore.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
