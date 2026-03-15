import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaHome, FaUserCircle } from "react-icons/fa";
import { supabase } from "../shared/lib/supabaseClient";
import { useAuth } from "../features/auth/context/AuthProvider";

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [role, setRole] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
  });
  const [initialData, setInitialData] = useState({
    fullName: "",
    phone: "",
  });

  const isProfilesRlsError = (error) => {
    if (!error) return false;
    const message = String(error.message || "").toLowerCase();
    return (
      message.includes("row-level security") ||
      message.includes("permission denied") ||
      message.includes("policy")
    );
  };

  const profileTitle = useMemo(() => {
    if (formData.fullName.trim()) return formData.fullName.trim();
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.email) {
      return user.email
        .split("@")[0]
        .replace(/[._-]+/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
    }
    return "User";
  }, [formData.fullName, user]);

  const hasChanges =
    formData.fullName !== initialData.fullName ||
    formData.phone !== initialData.phone;

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      setLoading(true);
      setStatusMessage(null);

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone, role")
        .eq("id", user.id)
        .maybeSingle();

      if (error && !isProfilesRlsError(error)) {
        setStatusMessage({ type: "error", text: error.message });
      }

      const fullName = data?.full_name || user?.user_metadata?.full_name || "";
      const phone = data?.phone || user?.user_metadata?.phone || "";

      setFormData({ fullName, phone });
      setInitialData({ fullName, phone });
      setRole(data?.role || "");
      setLoading(false);
    };

    loadProfile();
  }, [user]);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReset = () => {
    setFormData(initialData);
    setStatusMessage(null);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!user) return;

    setSaving(true);
    setStatusMessage(null);

    const trimmedFullName = formData.fullName.trim();
    const trimmedPhone = formData.phone.trim();

    const payload = {
      id: user.id,
      full_name: trimmedFullName || null,
      phone: trimmedPhone || null,
    };

    if (role) {
      payload.role = role;
    }

    const { error: authError } = await supabase.auth.updateUser({
      data: {
        full_name: trimmedFullName,
        phone: trimmedPhone,
      },
    });

    if (authError) {
      setStatusMessage({ type: "error", text: authError.message });
      setSaving(false);
      return;
    }

    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: "id" });

    if (upsertError && !isProfilesRlsError(upsertError)) {
      setStatusMessage({ type: "error", text: upsertError.message });
      setSaving(false);
      return;
    }

    setInitialData({
      fullName: trimmedFullName,
      phone: trimmedPhone,
    });

    setStatusMessage({
      type: "success",
      text: "Profile updated successfully.",
    });
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-200">
        Loading profile...
      </div>
    );
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-10 text-white">
      <div className="flex flex-col gap-3 mb-8">
        <nav className="text-sm text-gray-400">
          <Link to="/" className="hover:text-cyan-300">
            Home
          </Link>
          <span className="px-2">/</span>
          <Link to="/dashboard" className="hover:text-cyan-300">
            Dashboard
          </Link>
          <span className="px-2">/</span>
          <span className="text-gray-200">Profile</span>
        </nav>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-gray-300">Manage your account information and keep your details up to date.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="w-20 h-20 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-4xl mb-4">
            <FaUserCircle />
          </div>
          <h2 className="text-xl font-semibold text-white">{profileTitle}</h2>
          <p className="text-sm text-gray-400 mt-1">{user?.email}</p>
          <div className="mt-6 space-y-2 text-sm">
            <p className="text-gray-300">
              <span className="text-gray-400">Role:</span> {role || "Student"}
            </p>
            <p className="text-gray-300">
              <span className="text-gray-400">Account ID:</span> {user?.id?.slice(0, 8)}...
            </p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full bg-gray-700 text-gray-100 hover:bg-gray-600"
          >
            <FaHome />
            Back to Dashboard
          </Link>
        </div>

        <div className="lg:col-span-2 bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-6">Edit Information</h2>

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleFieldChange}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleFieldChange}
                placeholder="Enter your phone number"
                className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full px-4 py-3 rounded-lg bg-gray-700/70 text-gray-300 cursor-not-allowed"
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={saving || !hasChanges}
                className="px-5 py-2.5 rounded-full bg-cyan-500 text-white font-semibold hover:bg-cyan-400 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={saving || !hasChanges}
                className="px-5 py-2.5 rounded-full bg-gray-700 text-gray-100 font-semibold hover:bg-gray-600 disabled:opacity-50"
              >
                Reset
              </button>
            </div>
          </form>

          {statusMessage && (
            <p
              className={`text-sm mt-4 ${
                statusMessage.type === "error" ? "text-red-400" : "text-green-400"
              }`}
            >
              {statusMessage.text}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
