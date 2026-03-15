import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../components/Login";
import { useAuth } from "../features/auth/context/AuthProvider";
import { FaTimes } from "react-icons/fa";

export default function LoginPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="mx-auto max-w-5xl px-4">
      <div className="min-h-[calc(100vh-8rem)] md:min-h-[calc(100vh-10rem)] flex items-start md:items-center justify-center py-6 md:py-10">
        <div className="relative w-full max-w-md rounded-2xl border border-[#28476b] bg-[var(--primary-light)]/90 p-6 sm:p-8 shadow-xl backdrop-blur-sm">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="btn-modal-close absolute top-3 right-3"
            aria-label="Close sign in form"
          >
            <FaTimes />
          </button>
          <Login
            onLoginSuccess={() => navigate("/dashboard")}
            onSwitchToRegister={() => navigate("/signup")}
          />
        </div>
      </div>
    </div>
  );
}
