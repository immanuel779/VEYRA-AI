import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { BrandLogo } from '../components/ui/BrandLogo';
import { Field } from './LoginPage';

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not send reset email';
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
          <BrandLogo size={72} />
          <div className="text-center">
            <div className="text-xl font-semibold tracking-tight text-ink">
              VEYRA<span className="text-muted font-normal"> AI</span>
            </div>
            <p className="text-xs text-muted tracking-wide mt-0.5">
              Password reset
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-edge bg-surface p-6 shadow-sm">
          {sent ? (
            <>
              <div className="flex items-center justify-center mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                  <Check size={18} strokeWidth={2.5} />
                </div>
              </div>
              <h1 className="text-lg font-semibold tracking-tight text-center mb-1">
                Check your email
              </h1>
              <p className="text-xs text-muted text-center mb-6">
                We sent a reset link to <span className="text-ink font-medium">{email}</span>.
                It expires in 1 hour.
              </p>

              <div className="rounded-lg bg-canvas border border-edge p-3 text-[11px] text-muted leading-relaxed mb-4">
                <p className="mb-1.5 font-medium text-ink">Didn't get it?</p>
                <ul className="space-y-1 list-disc pl-4">
                  <li>Check your spam or promotions folder</li>
                  <li>Make sure the email address is correct</li>
                  <li>Wait a minute, then try again if needed</li>
                </ul>
              </div>

              <Link
                to="/login"
                className="flex items-center justify-center gap-1.5 text-xs text-accent hover:underline font-medium"
              >
                <ArrowLeft size={12} />
                Back to sign in
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-lg font-semibold tracking-tight mb-1">
                Forgot your password?
              </h1>
              <p className="text-xs text-muted mb-6">
                Enter your email and we'll send you a link to reset it.
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
                  {submitting ? 'Sending…' : 'Send reset link'}
                  {!submitting && <ArrowRight size={15} />}
                </Button>
              </form>

              <p className="text-xs text-muted text-center mt-5">
                Remembered it?{' '}
                <Link
                  to="/login"
                  className="text-accent hover:underline font-medium"
                >
                  Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}