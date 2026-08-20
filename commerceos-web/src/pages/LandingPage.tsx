/* =============================================================================
   CommerceOS — Public Enterprise Landing Page
   =============================================================================
   Calm, high-trust, data-focused public marketing & showcase page.
   ============================================================================= */

import { useNavigate } from 'react-router-dom';
import {
  Boxes,
  Users,
  Zap,
  FileText,
  CheckSquare,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  Database,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export default function LandingPage() {
  const navigate = useNavigate();

  const capabilities = [
    {
      title: 'Autonomous Stock Intelligence',
      description: 'Dynamic reorder point computation using historical lead times, buffer margins, and safety stock thresholds.',
      icon: <Boxes className="w-5 h-5 text-indigo-600" />,
    },
    {
      title: 'Vendor Network & Mapping',
      description: 'Centralized catalog mapping with SKU-level vendor costs, dynamic lead times, and fulfillment performance scores.',
      icon: <Users className="w-5 h-5 text-amber-600" />,
    },
    {
      title: 'AI Purchase Recommendations',
      description: 'LLM reasoning engine (Claude) analyzes stock deficits and synthesizes explainable purchase recommendations.',
      icon: <Zap className="w-5 h-5 text-purple-600" />,
    },
    {
      title: 'End-to-End Procurement Orders',
      description: 'One-click conversion of recommendations into structured purchase orders with vendor price validation.',
      icon: <FileText className="w-5 h-5 text-cyan-600" />,
    },
    {
      title: 'Multi-Tier Policy Approval Queue',
      description: 'Role-based authorization tiers with strict self-approval guardrails and separation of duties compliance.',
      icon: <CheckSquare className="w-5 h-5 text-rose-600" />,
    },
    {
      title: 'Domain Event Stream & Analytics',
      description: 'Immutable 30-day domain audit log with real-time KPI aggregations, conversion funnels, and CSV data export.',
      icon: <BarChart3 className="w-5 h-5 text-emerald-600" />,
    },
  ];

  const workflowStages = [
    { stage: '1. Detect', desc: 'Low stock event triggered on inventory deficit' },
    { stage: '2. Analyze', desc: 'AI calculates optimal vendor, quantity, and cost' },
    { stage: '3. Draft PO', desc: 'Auto-generates multi-line procurement order' },
    { stage: '4. Authorize', desc: 'Policy-enforced approvals via multi-tier queue' },
    { stage: '5. Dispatch', desc: 'PO submitted to supplier with tracked lead-time' },
    { stage: '6. Reconcile', desc: 'Stock replenished and KPIs updated in real-time' },
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col antialiased text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              C
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900">
              Commerce<span className="text-primary-600">OS</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/login')}
              className="text-slate-600 hover:text-slate-900"
            >
              Sign In
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/signup')}
              className="shadow-xs"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden border-b border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200/60 shadow-xs">
              <Cpu className="w-3.5 h-3.5 text-primary-600" />
              <span>Next-Gen Enterprise Procurement & Supply Chain OS</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Intelligent supply chains, <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-indigo-700 to-primary-900">
                governed and automated.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              CommerceOS unifies real-time inventory buffers, AI-driven purchase recommendations, supplier catalogs, and multi-tier approval workflows into one calm, audited command center.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => navigate('/signup')}
                className="w-full sm:w-auto shadow-md"
              >
                Start Free Workspace
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto"
              >
                Sign In to Existing Portal
              </Button>
            </div>

            {/* Micro proof points */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-8 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>RBAC & SOC2-Ready IAM</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-primary-600" />
                <span>Synchronous Event Stream</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-purple-600" />
                <span>Claude AI Risk Reasoning</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Operational Lifecycle Flowchart */}
      <section className="py-20 bg-slate-50/50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Closed-Loop Operational Lifecycle
            </h2>
            <p className="text-sm text-slate-500">
              Autonomous end-to-end event choreography from stockout alert to supplier dispatch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {workflowStages.map((step, idx) => (
              <Card key={idx} className="p-4 relative bg-white flex flex-col justify-between">
                <span className="text-xs font-bold text-primary-600 block mb-1">{step.stage}</span>
                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Core Capabilities Grid */}
      <section className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Engineered for Enterprise Reliability
            </h2>
            <p className="text-sm text-slate-500">
              Built on modular microservices with strict separation of concerns, idempotency, and audit trails.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((cap, idx) => (
              <Card key={idx} className="p-6 hover:shadow-card hover:border-slate-300 transition-all">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 inline-block mb-4">
                  {cap.icon}
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">
                  {cap.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {cap.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Ready to streamline your procurement operations?
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
            Experience real-time stock control, automated recommendations, and multi-tier approval governance today.
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/signup')}
              className="bg-primary-600 hover:bg-primary-500 shadow-md text-white"
            >
              Create Account
            </Button>
          </div>
        </div>
      </section>

      {/* Copyright Footer */}
      <footer className="py-8 bg-slate-950 text-slate-500 text-xs text-center border-t border-slate-800">
        <p>&copy; {new Date().getFullYear()} CommerceOS Inc. All rights reserved. Enterprise Supply Chain Platform.</p>
      </footer>
    </div>
  );
}
