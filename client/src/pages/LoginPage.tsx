import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { BrandLogo } from '../components/ui/BrandLogo';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(
        msg.replace('Firebase: ', '').replace(/\(auth.*\)\.?/, '').trim()
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-full flex items-center justify-center px-5 py-10 bg-canvas grain">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="flex flex-col items-center gap-3 mb-8">
          <BrandLogo size={80} />
          <div className="text-center">
            <div className="text-xl font-semibold tracking-tight text-ink">
              VEYRA<span className="text-muted font-normal"> AI</span>
            </div>
            <p className="text-xs text-muted tracking-wide mt-0.5">
              Think. Ask. Explore.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-edge bg-surface p-6 shadow-sm">
          <h1 className="text-lg font-semibold tracking-tight mb-1">
            Welcome back
          </h1>
          <p className="text-xs text-muted mb-6">
            Sign in to continue your conversations.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <Field
              icon={Mail}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={setEmail}
              required
              autoFocus
            />
            <Field
              icon={Lock}
              type="password"
              placeholder="Password"
              value={password}
              onChange={setPassword}
              required
            />

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-[11px] text-muted hover:text-accent transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 animate-fade-in">
                {error}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full mt-2"
              disabled={submitting}
            >
              {submitting ? 'Signing in…' : 'Sign in'}
              {!submitting && <ArrowRight size={15} />}
            </Button>
          </form>

          <p className="text-xs text-muted text-center mt-5">
            New to VEYRA?{' '}
            <Link
              to="/register"
              className="text-accent hover:underline font-medium"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

interface FieldProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  autoFocus?: boolean;
}

export function Field({
  icon: Icon,
  type,
  placeholder,
  value,
  onChange,
  required,
  autoFocus,
}: FieldProps) {
  return (
    <div className="relative group">
      <Icon
        size={15}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors"
      />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoFocus={autoFocus}
        className="w-full h-10 pl-9 pr-3 rounded-lg border border-edge bg-canvas text-sm placeholder:text-muted/60 focus:outline-none focus:border-accent/60 transition-colors"
      />
    </div>
  );
}