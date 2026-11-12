"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Bot, ShieldCheck, Network, Zap, Lock, CreditCard, Layers } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      
      {/* 1. Premium Glassmorphic Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#020617]/70 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center justify-center">
              <Bot size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              AgentProcure <span className="text-indigo-400">AI</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Capabilities</a>
            <a href="#workflow" className="hover:text-white transition-colors">How It Works</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
          </div>

          <div className="flex items-center gap-4">
            {/* Updated Sign In Link routing to your login page */}
            <Link href="/login" className="hidden md:block text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link 
              href="/dashboard" 
              className="px-5 py-2.5 bg-white text-slate-950 text-sm font-bold rounded-full hover:bg-indigo-50 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)] flex items-center gap-2"
            >
              Launch Platform <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. Cinematic Hero Section */}
      <section className="relative pt-40 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-40 -right-20 w-[500px] h-[500px] bg-violet-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          
          {/* Hero Copy */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-semibold tracking-wide">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              v2.0 Autonomous Engine Live
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
              Procurement, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                Reimagined Through AI.
              </span>
            </h1>
            
            <p className="text-lg text-slate-400 leading-relaxed max-w-xl">
              An intelligent ecosystem where autonomous AI agents orchestrate purchasing, enforce company policies, validate inventory, and execute workflows with absolute precision.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <Link 
                href="/dashboard" 
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:shadow-[0_0_40px_rgba(79,70,229,0.5)]"
              >
                Explore Platform <ArrowRight size={18} />
              </Link>
              <a 
                href="#workflow" 
                className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-semibold flex items-center justify-center transition-all"
              >
                Discover How It Works
              </a>
            </div>
          </motion.div>

          {/* Hero 3D Abstract Visualization */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative h-[500px] w-full hidden lg:flex items-center justify-center"
          >
            {/* Core Orb */}
            <div className="absolute w-32 h-32 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-full blur-[2px] shadow-[0_0_80px_rgba(99,102,241,0.6)] animate-pulse flex items-center justify-center z-20">
              <Bot size={40} className="text-white drop-shadow-lg" />
            </div>
            
            {/* Orbiting Rings */}
            <div className="absolute w-[300px] h-[300px] border border-indigo-500/30 rounded-full animate-[spin_10s_linear_infinite]" />
            <div className="absolute w-[450px] h-[450px] border border-violet-500/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
            
            {/* Floating Nodes */}
            <div className="absolute top-10 left-10 w-16 h-16 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center z-10 shadow-2xl animate-[bounce_4s_infinite]">
              <Database size={24} className="text-emerald-400" />
            </div>
            <div className="absolute bottom-20 right-10 w-16 h-16 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center z-10 shadow-2xl animate-[bounce_5s_infinite_reverse]">
              <ShieldCheck size={24} className="text-amber-400" />
            </div>
            <div className="absolute top-32 right-0 w-16 h-16 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center z-10 shadow-2xl animate-[bounce_6s_infinite]">
              <CreditCard size={24} className="text-blue-400" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Platform Capabilities */}
      <section id="features" className="py-24 bg-[#01040f] border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Enterprise Capabilities</h2>
            <p className="text-slate-400">Architected from the ground up to replace manual bottlenecks with autonomous execution.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Network className="text-indigo-400" size={24} />}
              title="Autonomous AI Agents"
              description="Multi-agent orchestration using LangGraph. Intelligent task distribution and coordinated procurement decisions."
            />
            <FeatureCard 
              icon={<Layers className="text-violet-400" size={24} />}
              title="Policy Intelligence"
              description="Retrieval-Augmented Generation (RAG) fetches live company policy to ensure context-aware compliance."
            />
            <FeatureCard 
              icon={<Database className="text-emerald-400" size={24} />}
              title="MCP Inventory Sync"
              description="Model Context Protocol tools verify internal stock availability in real-time before external purchasing."
            />
            <FeatureCard 
              icon={<Zap className="text-amber-400" size={24} />}
              title="Intelligent Procurement"
              description="Automated request analysis, dynamic market pricing, and predictive decision support logic."
            />
            <FeatureCard 
              icon={<CreditCard className="text-blue-400" size={24} />}
              title="Secure Payments"
              description="Native PayPal integration for automated order generation, manager capture, and real-time ledger updates."
            />
            <FeatureCard 
              icon={<Lock className="text-rose-400" size={24} />}
              title="Enterprise Security"
              description="Strict Role-Based Access Control (RBAC), immutable audit logs, and secure API isolation."
            />
          </div>
        </div>
      </section>

      {/* 4. How It Works (Workflow) */}
      <section id="workflow" className="py-32 relative px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-16 text-center">The Autonomous Workflow</h2>
          
          <div className="space-y-12">
            <WorkflowStep num="01" title="Request Initiation" desc="Employee submits a natural language procurement request via the dashboard." />
            <WorkflowStep num="02" title="AI Intelligence" desc="LangGraph agents intercept the prompt and analyze the requirements." />
            <WorkflowStep num="03" title="Policy Validation" desc="RAG retrieves and enforces company purchasing and budget policies." />
            <WorkflowStep num="04" title="Inventory Verification" desc="MCP tools check the internal warehouse to prevent duplicate spending." />
            <WorkflowStep num="05" title="Approval Orchestration" desc="Compliant requests are surfaced to Finance Managers for RBAC approval." />
            <WorkflowStep num="06" title="Payment Execution" desc="Sandbox PayPal Smart Buttons handle secure checkout and capture." />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#01040f] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Bot size={20} className="text-indigo-400" />
            <span className="font-bold text-white tracking-tight">AgentProcure AI</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 AgentProcure AI. Enterprise Procurement Ecosystem.</p>
        </div>
      </footer>
    </div>
  );
}

// --- Helper Components ---

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all group">
      <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed text-sm">{description}</p>
    </div>
  );
}

function WorkflowStep({ num, title, desc }) {
  return (
    <div className="flex gap-6 items-start group">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-indigo-950 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold font-mono group-hover:bg-indigo-600 group-hover:text-white transition-colors">
          {num}
        </div>
        {num !== "06" && <div className="w-[1px] h-16 bg-white/10 mt-4 group-hover:bg-indigo-500/50 transition-colors" />}
      </div>
      <div className="pt-2">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400">{desc}</p>
      </div>
    </div>
  );
}

function Database(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
    </svg>
  );
}