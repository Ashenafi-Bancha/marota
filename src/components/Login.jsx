// src/components/Login.jsx
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
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
    {
      key: "google",
      label: "Continue with Google",
      hoverClassName:
        "hover:border-[#4285f4]/70 hover:shadow-[0_0_0_1px_rgba(66,133,244,0.18),0_0_18px_rgba(234,67,53,0.15)]",
    },
    {
      key: "github",
      label: "Continue with GitHub",
      icon: FaGithub,
      iconClassName: "text-[#111827]",
      hoverClassName:
        "hover:border-slate-300/45 hover:shadow-[0_0_0_1px_rgba(226,232,240,0.12)]",
    },
    {
      key: "linkedin_oidc",
      label: "Continue with LinkedIn",
      icon: FaLinkedinIn,
      iconClassName: "text-[#0a66c2]",
      hoverClassName:
        "hover:border-[#0a66c2]/70 hover:shadow-[0_0_0_1px_rgba(10,102,194,0.18),0_0_14px_rgba(10,102,194,0.2)]",
    },
  ];

  const renderOAuthIcon = (provider) => {
    if (provider.key === "google") {
      return (
        <svg viewBox="0 0 13 15" aria-hidden="true" className="h-4 w-4">
          <path
            fill="#EA4335"
            d="M12.545 8.658c0-.576-.052-1.13-.149-1.658H6v3.138h3.663a3.132 3.132 0 0 1-1.358 2.056v1.708h2.194c1.284-1.182 2.046-2.924 2.046-5.244z"
          />
          <path
            fill="#34A853"
            d="M6 15c1.755 0 3.226-.58 4.301-1.57l-2.194-1.708c-.61.408-1.389.65-2.107.65-1.62 0-2.992-1.094-3.482-2.565H.248v1.764A6.5 6.5 0 0 0 6 15z"
          />
          <path
            fill="#4285F4"
            d="M2.518 9.807A3.903 3.903 0 0 1 2.323 8.5c0-.454.079-.894.195-1.307V5.43H.248A6.5 6.5 0 0 0 0 8.5c0 1.045.25 2.033.693 2.929l1.825-1.622z"
          />
          <path
            fill="#FBBC05"
            d="M6 2.628c.954 0 1.81.328 2.484.972l1.863-1.863C9.223.716 7.752 0 6 0A6.5 6.5 0 0 0 .248 3.43l2.27 1.764C3.008 3.722 4.38 2.628 6 2.628z"
          />
        </svg>
      );
    }

    const Icon = provider.icon;
    return <Icon className={`text-base ${provider.iconClassName || "text-slate-100"}`} />;
  };

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
          const isLoading = oauthLoadingProvider === provider.key;
          const hoverClassName = provider.hoverClassName || "hover:border-[var(--accent-blue)]/60";

          return (
            <button
              key={provider.key}
              type="button"
              onClick={() => handleOAuthSignIn(provider.key)}
              disabled={loading || Boolean(oauthLoadingProvider)}
              className={`btn-oauth flex w-full items-center justify-center gap-2 rounded-xl border border-[#355678] bg-[rgba(10,25,47,0.8)] px-4 py-3 text-sm font-medium text-slate-100 transition duration-200 hover:bg-[rgba(20,44,75,0.92)] ${hoverClassName} disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/95 shadow-sm">
                {renderOAuthIcon(provider)}
              </span>
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
