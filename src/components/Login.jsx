// src/components/Login.jsx
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
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
      key: "facebook",
      label: "Continue with Facebook",
      hoverClassName:
        "hover:border-[#1877f2]/70 hover:shadow-[0_0_0_1px_rgba(24,119,242,0.2),0_0_14px_rgba(24,119,242,0.2)]",
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
      hoverClassName:
        "hover:border-[#0a66c2]/70 hover:shadow-[0_0_0_1px_rgba(10,102,194,0.18),0_0_14px_rgba(10,102,194,0.2)]",
    },
  ];

  const renderOAuthIcon = (provider) => {
    if (provider.key === "google") {
      return (
        <svg viewBox="0 0 18 18" aria-hidden="true" className="h-4 w-4">
          <path
            fill="#4285F4"
            d="M17.64 9.2045c0-.638-.0573-1.2518-.1636-1.8409H9v3.4818h4.8436c-.2086 1.125-.8427 2.0782-1.7968 2.715v2.2582h2.9086c1.7027-1.5673 2.6846-3.874 2.6846-6.6141z"
          />
          <path
            fill="#34A853"
            d="M9 18c2.43 0 4.4673-.806 5.9564-2.1818l-2.9086-2.2582c-.806.54-1.8377.8591-3.0478.8591-2.3441 0-4.3282-1.5832-5.0364-3.7105H.9573v2.3318C2.4382 15.9832 5.4818 18 9 18z"
          />
          <path
            fill="#FBBC05"
            d="M3.9636 10.7086C3.7832 10.1686 3.6818 9.5918 3.6818 9s.1014-1.1686.2818-1.7086V4.9595H.9573C.3477 6.1732 0 7.5505 0 9s.3477 2.8268.9573 4.0405l3.0063-2.3319z"
          />
          <path
            fill="#EA4335"
            d="M9 3.5809c1.3214 0 2.5077.4541 3.4405 1.3459l2.5813-2.5814C13.4632.8918 11.4268 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9595l3.0063 2.3318C4.6718 5.1641 6.6559 3.5809 9 3.5809z"
          />
        </svg>
      );
    }

    if (provider.key === "facebook") {
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
          <path
            fill="#1877F2"
            d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073c0 6.025 4.388 11.02 10.125 11.927v-8.438H7.078v-3.49h3.047V9.413c0-3.017 1.792-4.687 4.533-4.687 1.313 0 2.686.236 2.686.236v2.961h-1.514c-1.491 0-1.956.93-1.956 1.885v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.093 24 18.098 24 12.073z"
          />
          <path
            fill="#FFFFFF"
            d="M16.671 15.562l.532-3.49h-3.328V9.808c0-.955.465-1.885 1.956-1.885h1.514V4.962s-1.373-.236-2.686-.236c-2.741 0-4.533 1.67-4.533 4.687v2.659H7.078v3.49h3.047V24a12.18 12.18 0 003.75 0v-8.438h2.796z"
          />
        </svg>
      );
    }

    if (provider.key === "linkedin_oidc") {
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
          <rect x="2" y="2" width="20" height="20" rx="3" fill="#0A66C2" />
          <circle cx="8" cy="8" r="1.9" fill="#FFFFFF" />
          <rect x="6.4" y="10" width="3.2" height="8.6" fill="#FFFFFF" />
          <path
            fill="#FFFFFF"
            d="M10.8 10h2.7v1.26h.04c.38-.72 1.32-1.48 2.72-1.48 2.9 0 3.44 1.92 3.44 4.41v4.73h-2.84v-4.58c0-1.09-.02-2.5-1.53-2.5-1.53 0-1.76 1.18-1.76 2.4v4.68h-2.77V10z"
          />
        </svg>
      );
    }

    const Icon = provider.icon;
    return <Icon className={`text-base ${provider.iconClassName || "text-slate-100"}`} />;
  };

  const getOAuthIconBadgeClass = () =>
    "inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/95 shadow-sm";

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
              <span className={getOAuthIconBadgeClass(provider.key)}>
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
