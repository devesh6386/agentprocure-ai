"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bot, Lock, User, Shield, ArrowRight, ArrowLeft, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("manager1");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fillCredentials = (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Invalid credentials");
      }

      localStorage.setItem("ap_token", data.access_token);
      localStorage.setItem("ap_role", data.role);
      localStorage.setItem("ap_name", data.name);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Unable to connect to authentication server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-indigo-500/30 relative overflow-hidden flex flex-col justify-between">
      {/* Ambient Royal Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[450px] h-[450px] bg-violet-600/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Top Bar */}
      <nav className="relative z-10 max-w-7xl w-full mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            AgentProcure <span className="text-indigo-400">AI</span>
          </span>
        </Link>

        <Link
          href="/"
          className="text-sm font-medium text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Overview
        </Link>
      </nav>

      {/* Center Auth Card */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] space-y-6">
          <div className="space-y-2 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide mb-2">
              <Lock size={12} /> Enterprise SSO & JWT Gateway
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Sign in to Workspace
            </h1>
            <p className="text-sm text-slate-400">
              Roles and PayPal approval privileges are cryptographically verified from your session token.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                User ID
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_25px_rgba(79,70,229,0.35)] disabled:opacity-50 mt-2"
            >
              {loading ? "Verifying Credentials..." : "Authenticate & Launch"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Quick Demo Credentials Selector */}
          <div className="pt-5 border-t border-white/10 space-y-3">
            <p className="text-xs font-medium text-slate-400 text-center">
              Demo Sandbox Credentials (Click to Autofill)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => fillCredentials("employee1", "password123")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  username === "employee1"
                    ? "bg-indigo-500/15 border-indigo-400/50 text-white"
                    : "bg-black/30 border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 mb-0.5">
                  <User size={13} /> Employee
                </div>
                <div className="text-[11px] font-mono text-slate-400">employee1 / password123</div>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials("manager1", "admin123")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  username === "manager1"
                    ? "bg-amber-500/15 border-amber-400/50 text-white"
                    : "bg-black/30 border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-0.5">
                  <Shield size={13} /> Finance Mgr
                </div>
                <div className="text-[11px] font-mono text-slate-400">manager1 / admin123</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="relative z-10 py-6 text-center text-xs text-slate-500">
        © 2026 AgentProcure AI • Protected by Role-Based JWT Governance
      </footer>
    </div>
  );
}