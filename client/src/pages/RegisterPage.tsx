import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { BrandLogo } from '../components/ui/BrandLogo';
import { Field } from './LoginPage';

export function RegisterPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await signup(name.trim(), email.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Signup failed';
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
            Create your account
          </h1>
          <p className="text-xs text-muted mb-6">
            Start chatting with VEYRA in seconds.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <Field
              icon={User}
              type="text"
              placeholder="Your name"
              value={name}
              onChange={setName}
              required
              autoFocus
            />
            <Field
              icon={Mail}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={setEmail}
              required
            />
            <Field
              icon={Lock}
              type="password"
              placeholder="Password (min 6 chars)"
              value={password}
              onChange={setPassword}
              required
            />

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
              {submitting ? 'Creating account…' : 'Create account'}
              {!submitting && <ArrowRight size={15} />}
            </Button>
          </form>

          <p className="text-xs text-muted text-center mt-5">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-accent hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}