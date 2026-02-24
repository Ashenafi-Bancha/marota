// src/components/Register.jsx
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  FaEye,
  FaEyeSlash,
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaGoogle,
  FaLinkedinIn,
  FaGithub,
} from "react-icons/fa";

export default function Register({ onRegisterSuccess, onSwitchToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoadingProvider, setOauthLoadingProvider] = useState(null);

  const trimmedPassword = password.trim();
  const hasMinLength = trimmedPassword.length >= 6;
  const hasLetter = /[A-Za-z]/.test(trimmedPassword);
  const hasNumber = /\d/.test(trimmedPassword);
  const hasSymbol = /[^A-Za-z0-9\s]/.test(trimmedPassword);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const strengthScore = [hasMinLength, hasLetter, hasNumber, hasSymbol].filter(Boolean).length;
  const strengthPercent = (strengthScore / 4) * 100;

  const strengthLabel =
    trimmedPassword.length === 0
      ? "Not set"
      : strengthScore <= 1
        ? "Weak"
        : strengthScore <= 3
          ? "Medium"
          : "Strong";

  const strengthColorClass =
    trimmedPassword.length === 0
      ? "bg-slate-600"
      : strengthScore <= 1
        ? "bg-red-500"
        : strengthScore <= 3
          ? "bg-amber-400"
          : "bg-emerald-500";

  const strengthTextClass =
    trimmedPassword.length === 0
      ? "text-slate-400"
      : strengthScore <= 1
        ? "text-red-300"
        : strengthScore <= 3
          ? "text-amber-300"
          : "text-emerald-300";

  const successRedirectDelayMs = 2500;
  const oauthProviders = [
    {
      key: "google",
      label: "Continue with Google",
      icon: FaGoogle,
      iconClassName:
        "bg-[conic-gradient(from_210deg,_#ea4335_0deg,_#ea4335_90deg,_#fbbc05_90deg,_#fbbc05_180deg,_#34a853_180deg,_#34a853_270deg,_#4285f4_270deg,_#4285f4_360deg)] bg-clip-text text-transparent",
    },
    {
      key: "github",
      label: "Continue with GitHub",
      icon: FaGithub,
      iconClassName: "text-slate-200",
    },
    {
      key: "linkedin_oidc",
      label: "Continue with LinkedIn",
      icon: FaLinkedinIn,
      iconClassName: "text-[#0a66c2]",
    },
  ];

  const validateForm = () => {
    const newErrors = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedPassword = password.trim();

    if (!trimmedName) newErrors.name = "Name is required";

    if (!trimmedEmail) {
      newErrors.email = "Email is required";
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(trimmedEmail)) {
      newErrors.email = "Invalid email format";
    }

    if (trimmedPhone && !/^[+\d][\d\s()-]{6,}$/.test(trimmedPhone)) {
      newErrors.phone = "Invalid phone number";
    }

    if (!trimmedPassword) {
      newErrors.password = "Password is required";
    } else if (trimmedPassword.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm Password is required";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setStatusMessage(null);
    if (!validateForm()) return;

    setLoading(true);

    try {
      console.log("Starting signup...");

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            full_name: name.trim(),
            ...(phone.trim() ? { phone: phone.trim() } : {}),
          },
        },
      });

      console.log("SignUp response:", data);
      console.log("SignUp error:", error);

      if (error) {
        setStatusMessage({ type: "error", text: error.message });
        return;
      }

      if (!data?.user) {
        setStatusMessage({
          type: "error",
          text: "User was not created. Please try again.",
        });
        return;
      }

      const profilePayloads = [
        {
          id: data.user.id,
          full_name: name.trim(),
          ...(phone.trim() ? { phone: phone.trim() } : {}),
          role: "student",
        },
        {
          id: data.user.id,
          full_name: name.trim(),
          ...(phone.trim() ? { phone: phone.trim() } : {}),
        },
        {
          id: data.user.id,
          full_name: name.trim(),
        },
      ];

      let profileInsertError = null;

      for (const payload of profilePayloads) {
        const { error: insertError } = await supabase.from("profiles").insert([payload]);
        if (!insertError) {
          profileInsertError = null;
          break;
        }
        profileInsertError = insertError;
      }

      if (profileInsertError) {
        console.error("Profile insert error:", profileInsertError);
        setStatusMessage({
          type: "error",
          text: "Account created, but profile setup failed. Please contact support.",
        });
        return;
      }

      setStatusMessage({
        type: "success",
        text: "Registration successful!",
      });

      console.log("User & profile created successfully");

      if (onRegisterSuccess) onRegisterSuccess(data.user);

      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setConfirmPassword("");
      setErrors({});

      setTimeout(() => {
        onSwitchToLogin();
      }, successRedirectDelayMs);

    } catch (err) {
      console.error("Unexpected error:", err);
      setStatusMessage({
        type: "error",
        text: err.message || "Registration failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider) => {
    setErrors({});
    setStatusMessage(null);
    setOauthLoadingProvider(provider);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        setStatusMessage({ type: "error", text: error.message });
      }
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.message || "Unable to start social sign in.",
      });
    } finally {
      setOauthLoadingProvider(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold text-white">Sign Up</h2>
        <p className="text-sm text-[var(--text-lighter)]">Create your account to get started.</p>
      </div>

      {statusMessage && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            statusMessage.type === "success"
              ? "border-green-500/40 bg-green-500/10 text-green-300"
              : "border-red-500/40 bg-red-500/10 text-red-300"
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      <div className="space-y-2">
        {oauthProviders.map((provider) => {
          const Icon = provider.icon;
          const isLoading = oauthLoadingProvider === provider.key;
          const iconClassName = provider.iconClassName || "text-slate-100";

          return (
            <button
              key={provider.key}
              type="button"
              onClick={() => handleOAuthSignIn(provider.key)}
              disabled={loading || Boolean(oauthLoadingProvider)}
              className="btn-oauth flex w-full items-center justify-center gap-2 rounded-xl border border-[#355678] bg-[rgba(10,25,47,0.8)] px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-[var(--accent-blue)]/60 hover:bg-[rgba(20,44,75,0.92)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/95 shadow-sm">
                <Icon className={`text-base ${iconClassName}`} />
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
        <label className="mb-2 block text-sm font-medium text-[var(--text-light)]">Full Name</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--text-lighter)]">
            <FaUser />
          </span>
          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full rounded-xl border bg-[var(--primary-dark)] py-3 pl-10 pr-4 text-white placeholder:text-[var(--text-lighter)] focus:outline-none focus:ring-2 transition ${
              errors.name
                ? "border-red-500/60 focus:ring-red-500/50"
                : "border-[#28476b] focus:ring-[var(--accent-blue)]/50"
            }`}
            required
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "register-name-error" : undefined}
          />
        </div>
        {errors.name && <p id="register-name-error" className="text-red-500 text-sm mt-1">{errors.name}</p>}
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
            aria-describedby={errors.email ? "register-email-error" : undefined}
          />
        </div>
        {errors.email && <p id="register-email-error" className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[var(--text-light)]">
          Phone Number <span className="text-[var(--text-lighter)]">(optional)</span>
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--text-lighter)]">
            <FaPhone />
          </span>
          <input
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={`w-full rounded-xl border bg-[var(--primary-dark)] py-3 pl-10 pr-4 text-white placeholder:text-[var(--text-lighter)] focus:outline-none focus:ring-2 transition ${
              errors.phone
                ? "border-red-500/60 focus:ring-red-500/50"
                : "border-[#28476b] focus:ring-[var(--accent-blue)]/50"
            }`}
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "register-phone-error" : undefined}
          />
        </div>
        {errors.phone && <p id="register-phone-error" className="text-red-500 text-sm mt-1">{errors.phone}</p>}
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
            autoComplete="new-password"
            minLength={6}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "register-password-error" : "register-password-hint"}
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
        {errors.password && <p id="register-password-error" className="text-red-500 text-sm mt-1">{errors.password}</p>}
        <div id="register-password-hint" className="mt-2 rounded-lg border border-white/10 bg-[var(--primary-dark)]/45 px-3 py-2 text-xs text-slate-300">
          <div className="mb-2">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-slate-300">Strength</span>
              <span className={`font-semibold ${strengthTextClass}`}>{strengthLabel}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700/80">
              <div
                className={`h-full rounded-full transition-all duration-300 ${strengthColorClass}`}
                style={{ width: `${strengthPercent}%` }}
              />
            </div>
          </div>
          <p className="mb-1 font-medium text-slate-200">Password guidance:</p>
          <ul className="space-y-1">
            <li className={hasMinLength ? "text-emerald-300" : "text-slate-400"}>• Minimum 6 characters</li>
            <li className={hasLetter ? "text-emerald-300" : "text-slate-400"}>• Include at least one letter</li>
            <li className={hasNumber ? "text-emerald-300" : "text-slate-400"}>• Include at least one number (recommended)</li>
            <li className={hasSymbol ? "text-emerald-300" : "text-slate-400"}>• Include at least one symbol (recommended)</li>
          </ul>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[var(--text-light)]">Confirm Password</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--text-lighter)]">
            <FaLock />
          </span>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full rounded-xl border bg-[var(--primary-dark)] py-3 pl-10 pr-4 text-white placeholder:text-[var(--text-lighter)] focus:outline-none focus:ring-2 transition ${
              errors.confirmPassword
                ? "border-red-500/60 focus:ring-red-500/50"
                : "border-[#28476b] focus:ring-[var(--accent-blue)]/50"
            }`}
            required
            autoComplete="new-password"
            minLength={6}
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={errors.confirmPassword ? "register-confirm-error" : "register-confirm-hint"}
          />
        </div>
        {errors.confirmPassword ? (
          <p id="register-confirm-error" className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
        ) : (
          <p id="register-confirm-hint" className={`mt-1 text-xs ${password.length === 0 || passwordsMatch ? "text-slate-400" : "text-amber-300"}`}>
            {password.length === 0
              ? "Confirm password must match and be at least 6 characters."
              : passwordsMatch
                ? "Passwords match."
                : "Passwords do not match yet."}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-auth w-full py-3 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Creating account..." : "Create account"}
      </button>

      <div className="text-center text-sm text-[var(--text-lighter)]">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="btn-link font-medium transition"
        >
          Sign in
        </button>
      </div>
    </form>
  );
}
