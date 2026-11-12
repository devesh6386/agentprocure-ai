
"use client";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Shield,
  User,
  CheckCircle,
  AlertTriangle,
  Package,
  BookOpen,
  RotateCcw,
  MessageSquare,
  LogOut,
} from "lucide-react";
import CheckoutButton from "@/components/CheckoutButton";

export default function ProcurementDashboard() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [role, setRole] = useState("employee");
  const [userName, setUserName] = useState("");
  const [authReady, setAuthReady] = useState(false);

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  // Memory State
  const [sessionId, setSessionId] = useState("session_default");
  const [turnHistory, setTurnHistory] = useState([]);

  // Procurement Data State
  const [requestId, setRequestId] = useState(null);
  const [summary, setSummary] = useState("");
  const [options, setOptions] = useState([]);
  const [stockStatus, setStockStatus] = useState("");
  const [policyContext, setPolicyContext] = useState("");

  useEffect(() => {
    const savedToken = localStorage.getItem("ap_token");
    const savedRole = localStorage.getItem("ap_role");
    const savedName = localStorage.getItem("ap_name");

    if (!savedToken) {
      router.push("/login");
      return;
    }

    setToken(savedToken);
    setRole(savedRole || "employee");
    setUserName(savedName || "Authenticated User");
    setSessionId(`session_${Date.now()}`);
    setAuthReady(true);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("ap_token");
    localStorage.removeItem("ap_role");
    localStorage.removeItem("ap_name");
    router.push("/login");
  };

  const handleNewSession = () => {
    setSessionId(`session_${Date.now()}`);
    setTurnHistory([]);
    setRequestId(null);
    setSummary("");
    setOptions([]);
    setStockStatus("");
    setPolicyContext("");
    setPrompt("");
  };

  const handleResearch = async () => {
    if (!prompt.trim() || !token) return;
    const currentPrompt = prompt;
    setPrompt("");
    setLoading(true);
    setOptions([]);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: currentPrompt, session_id: sessionId }),
      });

      if (res.status === 401) {
        handleLogout();
        return;
      }

      const data = await res.json();
      setRequestId(data.request_id);
      setSummary(data.summary);
      setOptions(data.options || []);
      setStockStatus(data.stock_status);
      setPolicyContext(data.policy_context);
      setTurnHistory((prev) => [
        ...prev,
        { user: currentPrompt, agent: data.summary },
      ]);
    } catch (err) {
      console.error("Failed to connect to backend", err);
      setPrompt(currentPrompt);
    }
    setLoading(false);
  };

  if (!authReady) {
    return <div className="min-h-screen bg-slate-950" />;
  }

  return (
    <div className="min-h-screen bg-slate-950 bg-gradient-to-br from-slate-950 via-indigo-950/20 to-slate-900 text-slate-100 p-8 font-sans selection:bg-amber-500/30">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Navigation */}
        <div className="flex flex-wrap justify-between items-center gap-4 bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 shadow-[0_0_15px_rgba(251,191,36,0.4)]" />
            <h1 className="text-2xl font-bold tracking-tight text-white">
              AgentProcure <span className="text-amber-400">AI</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Reset Short-Term Memory Button */}
            <button
              onClick={handleNewSession}
              title="Clear short-term conversation memory"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all"
            >
              <RotateCcw size={15} />
              New Session
            </button>

            {/* Verified JWT Role Badge */}
            <div
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border ${
                role === "finance_manager"
                  ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                  : "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
              }`}
            >
              {role === "finance_manager" ? <Shield size={16} /> : <User size={16} />}
              <span>{userName}</span>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleLogout}
              title="Sign out"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-black/40 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-white/10 transition-all"
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Command Center */}
        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-slate-200 uppercase tracking-widest text-sm">
              Initialize AI Agent
            </h2>
            <span className="flex items-center gap-1.5 text-xs font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
              <MessageSquare size={12} />
              Memory Active ({turnHistory.length}{" "}
              {turnHistory.length === 1 ? "turn" : "turns"})
            </span>
          </div>

          {/* Active Session Turn History */}
          {turnHistory.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 border-l-2 border-indigo-500/40 pl-4">
              {turnHistory.map((turn, idx) => (
                <div key={idx} className="text-xs space-y-0.5">
                  <p className="text-slate-300 font-medium">
                    <span className="text-amber-400">You:</span> {turn.user}
                  </p>
                  <p className="text-slate-400 truncate">
                    <span className="text-indigo-400">Agent:</span> {turn.agent}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-4">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                turnHistory.length > 0
                  ? "Ask a follow-up (e.g., 'Increase to 5 units' or 'Fastest shipping')..."
                  : "e.g., 3 Dell 4K monitors under $1,500..."
              }
              className="flex-1 px-6 py-4 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 text-lg transition-all"
              onKeyDown={(e) => e.key === "Enter" && handleResearch()}
            />
            <button
              onClick={handleResearch}
              disabled={loading || !prompt.trim()}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold rounded-xl flex items-center gap-3 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]"
            >
              {loading ? (
                <span className="animate-pulse flex items-center gap-2">
                  <Search size={20} /> Researching...
                </span>
              ) : (
                <>
                  <Search size={20} /> Execute
                </>
              )}
            </button>
          </div>
        </div>

        {/* Agent Logs & Exec Summary */}
        {options.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 space-y-4">
              <div className="bg-emerald-950/30 border border-emerald-500/20 p-5 rounded-2xl backdrop-blur-md">
                <h3 className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
                  <Package size={18} /> MCP Inventory Sync
                </h3>
                <p className="text-sm text-emerald-200/80 leading-relaxed">
                  {stockStatus || "Checking local warehouse stock..."}
                </p>
              </div>
              <div className="bg-blue-950/30 border border-blue-500/20 p-5 rounded-2xl backdrop-blur-md">
                <h3 className="flex items-center gap-2 text-blue-400 font-semibold mb-2">
                  <BookOpen size={18} /> RAG Policy Rules
                </h3>
                <p className="text-sm text-blue-200/80 leading-relaxed italic">
                  &ldquo;{policyContext || "No specific policies flagged."}&rdquo;
                </p>
              </div>
            </div>

            <div className="col-span-2 bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 flex flex-col justify-center">
              <h3 className="text-slate-400 uppercase tracking-widest text-xs font-bold mb-3">
                Executive Summary
              </h3>
              <p className="text-lg text-slate-200 leading-relaxed">{summary}</p>
            </div>
          </div>
        )}

        {/* 3D Vendor Cards Grid */}
        {options.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
            {options.map((opt) => (
              <div
                key={opt.id}
                className={`group relative bg-slate-900/80 backdrop-blur-xl rounded-2xl flex flex-col transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] border-2 ${
                  opt.is_recommended
                    ? "border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.15)] hover:shadow-[0_0_40px_rgba(251,191,36,0.3)]"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                {opt.is_recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 text-xs font-bold uppercase tracking-widest py-1.5 px-4 rounded-full shadow-lg">
                    Top Choice
                  </div>
                )}

                <div className="p-6 flex-1 space-y-5 mt-2">
                  <div>
                    <p className="text-amber-400 text-sm font-semibold tracking-wide uppercase mb-1">
                      {opt.vendor_name}
                    </p>
                    <a
                      href={
                        !opt.url || !opt.url.startsWith("http")
                          ? `https://www.google.com/search?q=${encodeURIComponent(
                              opt.vendor_name + " " + opt.item_name
                            )}`
                          : opt.url
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline decoration-amber-400 decoration-2 underline-offset-4 cursor-pointer inline-block"
                    >
                      <h3 className="font-bold text-xl leading-tight text-white hover:text-amber-50 transition-colors flex items-center gap-1">
                        {opt.item_name}{" "}
                        <span className="text-xs text-amber-400">↗</span>
                      </h3>
                    </a>
                  </div>

                  <div className="text-4xl font-extrabold text-white tracking-tight">
                    ${opt.price}{" "}
                    <span className="text-base font-medium text-slate-500">
                      USD
                    </span>
                  </div>

                  <div className="space-y-3 text-sm text-slate-300">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span>Delivery Time</span>
                      <span className="font-semibold text-white">
                        {opt.delivery_days} days
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span>Vendor Rating</span>
                      <span className="font-semibold text-white">
                        {opt.rating} / 5.0
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>AI Confidence</span>
                      <span className="font-bold text-indigo-400">
                        {opt.score}/100
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-black/20">
                  {opt.is_compliant ? (
                    <div className="flex items-center gap-2 text-sm text-emerald-400 font-medium">
                      <CheckCircle size={16} /> Fully Compliant
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 text-sm text-rose-400 font-medium">
                      <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                      <span className="leading-tight">
                        {opt.compliance_violations}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-black/40 border-t border-white/5 rounded-b-2xl">
                  {requestId && (
                    <CheckoutButton
                      requestId={requestId}
                      price={opt.price}
                      role={role}
                      token={token}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}