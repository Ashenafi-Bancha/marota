// src/components/Login.jsx
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaGoogle,
  FaLinkedinIn,
  FaGithub,
} from "react-icons/fa";

export default function Login({ onLoginSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [oauthLoadingProvider, setOauthLoadingProvider] = useState(null);

  const oauthProviders = [
    { key: "google", label: "Continue with Google", icon: FaGoogle },
    { key: "github", label: "Continue with GitHub", icon: FaGithub },
    { key: "linkedin_oidc", label: "Continue with LinkedIn", icon: FaLinkedinIn },
  ];

  const validateForm = () => {
    const newErrors = {};
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      newErrors.email = "Email is required";
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(trimmedEmail)) {
      newErrors.email = "Invalid email format";
    }

    if (!trimmedPassword) {
      newErrors.password = "Password is required";
    } else if (trimmedPassword.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!validateForm()) return;

    setLoading(true);
    try {
      console.log("Attempting login with Supabase...");

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      console.log("Login response:", data);
      console.log("Login error:", error);

      if (error) {
        setErrors({ form: error.message });
        return;
      }

      if (!data?.user) {
        setErrors({ form: "Login failed. Please check your credentials." });
        return;
      }

      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }
    } catch (err) {
      console.error("Unexpected login error:", err);
      setErrors({ form: err.message || "Login failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider) => {
    setErrors({});
    setOauthLoadingProvider(provider);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        setErrors({ form: error.message });
      }
    } catch (err) {
      setErrors({ form: err.message || "Unable to start social login." });
    } finally {
      setOauthLoadingProvider(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold text-white">Sign In</h2>
        <p className="text-sm text-[var(--text-lighter)]">
          Welcome back. Enter your account details to continue.
        </p>
      </div>

      {errors.form && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {errors.form}
        </div>
      )}

      <div className="space-y-2">
        {oauthProviders.map((provider) => {
          const Icon = provider.icon;
          const isLoading = oauthLoadingProvider === provider.key;

          return (
            <button
              key={provider.key}
              type="button"
              onClick={() => handleOAuthSignIn(provider.key)}
              disabled={loading || Boolean(oauthLoadingProvider)}
              className="btn-oauth flex w-full items-center justify-center gap-2 rounded-xl border border-[#355678] bg-[rgba(10,25,47,0.8)] px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-[var(--accent-blue)]/60 hover:bg-[rgba(20,44,75,0.92)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Icon className="text-base" />
              <span>{isLoading ? "Redirecting..." : provider.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-white/15" />
        <span className="text-xs uppercase tracking-[0.16em] text-slate-400">or</span>
        <span className="h-px flex-1 bg-white/15" />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[var(--text-light)]">Email</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--text-lighter)]">
            <FaEnvelope />
          </span>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full rounded-xl border bg-[var(--primary-dark)] py-3 pl-10 pr-4 text-white placeholder:text-[var(--text-lighter)] focus:outline-none focus:ring-2 transition ${
              errors.email
                ? "border-red-500/60 focus:ring-red-500/50"
                : "border-[#28476b] focus:ring-[var(--accent-blue)]/50"
            }`}
            required
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "login-email-error" : undefined}
          />
        </div>
        {errors.email && <p id="login-email-error" className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[var(--text-light)]">Password</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--text-lighter)]">
            <FaLock />
          </span>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full rounded-xl border bg-[var(--primary-dark)] py-3 pl-10 pr-10 text-white placeholder:text-[var(--text-lighter)] focus:outline-none focus:ring-2 transition ${
              errors.password
                ? "border-red-500/60 focus:ring-red-500/50"
                : "border-[#28476b] focus:ring-[var(--accent-blue)]/50"
            }`}
            required
            autoComplete="current-password"
            minLength={6}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "login-password-error" : "login-password-hint"}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="btn-icon absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--text-lighter)] hover:text-white"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {errors.password ? (
          <p id="login-password-error" className="text-red-500 text-sm mt-1">{errors.password}</p>
        ) : (
          <p id="login-password-hint" className="mt-1 text-xs text-slate-400">Password must be at least 6 characters.</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-auth w-full py-3 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>

      <div className="text-center text-sm text-[var(--text-lighter)]">
        Don’t have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="btn-link font-medium transition"
        >
          Create account
        </button>
      </div>
    </form>
  );
}
