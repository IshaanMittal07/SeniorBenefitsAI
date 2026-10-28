import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/ui/Alert';
import { EyeIcon, EyeOffIcon, HeartIcon } from '../components/ui/Icons';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login, signup } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  // Only redirect visitors who were already signed in when they opened this page
  const [alreadySignedIn] = useState(isAuthenticated);
  const from = (location.state as { from?: string } | null)?.from;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // The URL is the source of truth for the mode, so header links and the back button stay in sync
  const isSignup = searchParams.get('mode') === 'signup';
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        await signup(email, password, firstName, lastName);
      } else {
        await login(email, password);
      }
      // New accounts fill in their profile first; returning users go where they were headed
      navigate(isSignup ? '/profile' : from || '/recommendations', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error || 'We couldn’t sign you in. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (alreadySignedIn) {
    return <Navigate to={from || '/recommendations'} replace />;
  }

  const toggleMode = () => {
    // Keep location.state so the page the user was heading to isn't forgotten
    setSearchParams(isSignup ? {} : { mode: 'signup' }, { replace: true, state: location.state });
    setError('');
  };

  return (
    <div className="container-page flex justify-center py-12 sm:py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-800 text-accent-400">
            <HeartIcon size={30} />
          </span>
          <h1 className="mt-5 text-3xl">{isSignup ? 'Create your account' : 'Welcome back'}</h1>
          <p className="mt-2 text-lg text-ink-muted">
            {isSignup
              ? 'It’s free and takes less than a minute.'
              : 'Sign in to see the benefits you may qualify for.'}
          </p>
        </div>

        <div className="card p-6 sm:p-8">
          {error ? (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          ) : (
            from && (
              <Alert variant="info" className="mb-6">
                Please sign in to continue.
              </Alert>
            )
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignup && (
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="label">
                    First name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="input"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="label">
                    Last name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="input"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="label">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={isSignup ? 8 : undefined}
                  aria-describedby={isSignup ? 'password-hint' : undefined}
                  className="input pr-24"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-pressed={showPassword}
                  className="absolute inset-y-1 right-1 flex items-center gap-1.5 rounded-lg px-3 text-sm font-bold text-brand-800 hover:bg-brand-50"
                >
                  {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {isSignup && (
                <p id="password-hint" className="hint">
                  Use at least 8 characters.
                </p>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full text-lg">
              {loading ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-lg text-ink-muted">
          {isSignup ? 'Already have an account?' : 'New here?'}{' '}
          <button type="button" onClick={toggleMode} className="link">
            {isSignup ? 'Sign in instead' : 'Create a free account'}
          </button>
        </p>
      </div>
    </div>
  );
};
