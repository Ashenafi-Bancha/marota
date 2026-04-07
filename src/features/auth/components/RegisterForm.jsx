// src/components/Register.jsx
import { useState } from "react";
import { supabase } from "../../../shared/lib/supabaseClient";
import {
  FaEye,
  FaEyeSlash,
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
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

  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const successRedirectDelayMs = 2500;

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

  const isProfilesPermissionError = (error) => {
    if (!error) return false;
    const message = String(error.message || "").toLowerCase();
    const details = String(error.details || "").toLowerCase();
    return (
      error.code === "42501" ||
      message.includes("row-level security") ||
      message.includes("permission denied") ||
      message.includes("policy") ||
      details.includes("row-level security")
    );
  };

  const isDuplicateProfileError = (error) => {
    if (!error) return false;
    const message = String(error.message || "").toLowerCase();
    return error.code === "23505" || message.includes("duplicate key");
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

      // With email confirmation enabled, Supabase may return no active session here.
      if (!data.session) {
        setStatusMessage({
          type: "success",
          text: "Account created successfully. Please verify your email, then sign in.",
        });

        setName("");
        setEmail("");
        setPhone("");
        setPassword("");
        setConfirmPassword("");
        setErrors({});

        setTimeout(() => {
          if (onSwitchToLogin) onSwitchToLogin();
        }, successRedirectDelayMs);
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
        if (!insertError || isDuplicateProfileError(insertError)) {
          profileInsertError = null;
          break;
        }
        profileInsertError = insertError;
      }

      if (isProfilesPermissionError(profileInsertError)) {
        console.warn("Profile insert skipped due to policy restrictions:", profileInsertError);
        profileInsertError = null;
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
        if (onSwitchToLogin) onSwitchToLogin();
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
        {!errors.password && (
          <p id="register-password-hint" className="mt-1 text-xs text-slate-400">
            Password must be at least 6 characters.
          </p>
        )}
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
