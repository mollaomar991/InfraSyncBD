import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoadingButton from '../components/LoadingButton';
import { useApp } from '../context/AppContext';
import styles from './AuthPages.module.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, showToast } = useApp();
  const navigate = useNavigate();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);

    window.setTimeout(async () => {
      const result = await login(email, password);

      if (result.success) {
        showToast(`Welcome back, ${result.user?.name}.`);
        navigate('/');
      } else {
        setError(result.message);
        setLoading(false);
      }
    }, 1100);
  }

  return (
    <div className={styles.screen}>
      <section className={styles.showcase}>
        <div className={styles.brand}>
          <img src="/InfraSync.png" alt="InfraSync Logo" style={{ height: '54px', width: 'auto' }} />
          <div>
            <strong>
              InfraSync <span>BD</span>
            </strong>
            <small>National infrastructure coordination</small>
          </div>
        </div>

        <div className={styles.hero}>
          <div className={styles.badge}>
            <span /> Live road coordination portal
          </div>
          <h1>
            Coordinate first.
            <br />
            <em>Build once.</em>
          </h1>
          <p>
            A shared GIS, approval, inspection, and complaint workflow for
            road, water, gas, electricity, drainage, and fiber projects.
          </p>

          <div className={styles.metrics}>
            <div className={styles.metric}>
              <strong>06</strong>
              <span>Utility departments</span>
            </div>
            <div className={styles.metric}>
              <strong>24/7</strong>
              <span>Project visibility</span>
            </div>
            <div className={styles.metric}>
              <strong>01</strong>
              <span>Shared road plan</span>
            </div>
          </div>

          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>⌖</span>
              <div>
                <strong>Live GIS project map</strong>
                <small>View locations, categories, progress, and road status.</small>
              </div>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>!</span>
              <div>
                <strong>Conflict detection</strong>
                <small>Identify overlapping work before road excavation.</small>
              </div>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✓</span>
              <div>
                <strong>Controlled project approval</strong>
                <small>Construction begins only after required decisions.</small>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.road} aria-hidden="true" />
        <div className={styles.cone} aria-hidden="true" />
        <div className={styles.coneSmall} aria-hidden="true" />


      </section>

      <section className={styles.formSide}>
        <form className={styles.card} onSubmit={handleSubmit}>
          <div className={styles.hazardBar} />
          <div className={styles.systemStatus}>

          </div>

          <div className={styles.heading}>
            <span>Secure access</span>
            <h2>Welcome back</h2>
            <p>Sign in with your official account credentials.</p>
          </div>

          <div className={styles.form}>
            <label className={styles.field}>
              <span>Email address</span>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}>@</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your official email"
                  autoComplete="email"
                />
              </div>
            </label>

            <label className={styles.field}>
              <span>Password</span>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}>●</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </label>

            {error && (
              <div className={`${styles.alert} ${styles.alertError}`}>
                <strong>!</strong>
                <span>{error}</span>
              </div>
            )}

            <div className={styles.options}>
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                Remember me
              </label>
              <button
                className={styles.linkButton}
                type="button"
                onClick={() =>
                  showToast(
                    'Password reset is simulated in this frontend demo.',
                    'warning',
                  )
                }
              >
                Forgot password?
              </button>
            </div>

            <LoadingButton
              type="submit"
              fullWidth
              loading={loading}
              loadingText="Verifying role & permissions…"
            >
              Sign in to dashboard
            </LoadingButton>

            {loading && (
              <div className={styles.process}>
                <div className={styles.processTrack}>
                  <span />
                </div>
                <p>Checking account status and dashboard permissions…</p>
              </div>
            )}
          </div>

          <p className={styles.switch}>
            No account yet? <Link to="/signup">Create an account</Link>
          </p>

          <div className={styles.demo}>
            <strong>Demo: demo123</strong>
            <span>admin@infrasync.bd | officer@roads.gov.bd | contractor@demo.bd | citizen@demo.bd</span>
          </div>
        </form>
      </section>
    </div>
  );
}

export default LoginPage;
