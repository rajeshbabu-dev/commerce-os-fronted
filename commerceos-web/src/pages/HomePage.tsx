/* =============================================================================
   CommerceOS — Authenticated Home Page
   =============================================================================
   Centralized workspace hub with personalized greeting, role-based quick actions,
   interactive operational lifecycle flowchart, and feature discovery cards.
   ============================================================================= */

import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  Users,
  Zap,
  FileText,
  CheckSquare,
  BarChart3,
  ArrowRight,
  Sparkles,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import Badge from '../components/ui/Badge';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const rawName = user?.username || user?.email || '';
  const displayName = rawName.includes('@') ? rawName.split('@')[0] : rawName;
  const userRole = user?.roles?.[0] ?? 'OPERATOR';

  const featureCards = [
    {
      title: 'Inventory Management',
      icon: <Boxes className="w-4 h-4 text-indigo-600" />,
      description: 'Real-time SKU tracking, reorder point alerts, and stock movements.',
      action: () => navigate('/inventory'),
    },
    {
      title: 'Supplier Network',
      icon: <Users className="w-4 h-4 text-amber-600" />,
      description: 'Vendor ratings, lead times, payment terms, and catalog mappings.',
      action: () => navigate('/suppliers'),
    },
    {
      title: 'AI Recommendations',
      icon: <Zap className="w-4 h-4 text-purple-600" />,
      description: 'Autonomous reorder suggestions powered by Claude LLM risk reasoning.',
      action: () => navigate('/recommendations'),
    },
    {
      title: 'Purchase Orders',
      icon: <FileText className="w-4 h-4 text-cyan-600" />,
      description: 'Multi-line item procurement, submission, and status tracking.',
      action: () => navigate('/purchase-orders'),
    },
    {
      title: 'Approval Queue',
      icon: <CheckSquare className="w-4 h-4 text-rose-600" />,
      description: 'Multi-tier authorization workflows with self-approval policy guardrails.',
      action: () => navigate('/approvals'),
    },
    {
      title: 'Reports & Analytics',
      icon: <BarChart3 className="w-4 h-4 text-indigo-600" />,
      description: 'Procurement funnel metrics, trend charts, and event stream CSV export.',
      action: () => navigate('/analytics'),
    },
  ];

  const workflowSteps = [
    { stage: '1. Inventory Alerts', desc: 'Stock falls below threshold triggering replenishment' },
    { stage: '2. Requisition', desc: 'Optimal order quantity calculated automatically' },
    { stage: '3. Purchase Order', desc: 'PO generated with supplier terms & line items' },
    { stage: '4. Multi-Tier Approval', desc: 'Policy-based authorization with audit logging' },
    { stage: '5. Supplier Dispatch', desc: 'PO fulfilled with dynamic lead-time tracking' },
    { stage: '6. Insights & Analytics', desc: 'AI recommendations and event reconciliation' },
  ];

  const benefits = [
    'Automated replenishment triggers based on lead-time',
    'Real-time stock reservation and safety buffer tracking',
    'Multi-tier policy guardrails preventing rogue spend',
    'AI-assisted procurement recommendations with reasoning',
    'Immutable audit log across all 8 microservices',
  ];

  return (
    <div className="page-container">
      {/* 1. Welcome Hero Banner */}
      <div className="rounded-xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-card relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-200 border border-indigo-500/30">
                <Sparkles className="w-3 h-3 text-indigo-300" /> Enterprise Workspace
              </span>
              <span className="text-xs text-indigo-200/80 font-mono">
                {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {getGreeting()}{displayName ? `, ${displayName}` : ''}
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100/80 max-w-xl leading-relaxed">
              Welcome back to CommerceOS. Centralized inventory, automated purchase orders, vendor intelligence, and AI-powered recommendations.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="primary"
              size="md"
              leftIcon={<LayoutDashboard className="w-4 h-4" />}
              onClick={() => navigate('/dashboard')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs"
            >
              Go to Dashboard
            </Button>
            <Button
              variant="secondary"
              size="md"
              leftIcon={<Boxes className="w-4 h-4" />}
              onClick={() => navigate('/inventory')}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:text-white"
            >
              View Inventory
            </Button>
          </div>
        </div>
      </div>

      {/* 2. End-to-End Operational Lifecycle */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Operational Lifecycle
            </h2>
            <p className="text-xs text-slate-500">
              Synchronous event-driven commerce pipeline across all domain modules
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {workflowSteps.map((step, idx) => (
            <Card key={idx} className="p-4 hover:border-indigo-300 transition-all">
              <span className="text-xs font-bold text-primary-600 block mb-1">{step.stage}</span>
              <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* 3. Core Operational Modules Discovery Grid */}
      <div className="space-y-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Core Modules
          </h2>
          <p className="text-xs text-slate-500">
            Select a workspace domain to inspect items, trigger workflows, or review activity
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featureCards.map((card, idx) => (
            <Card
              key={idx}
              className="p-5 hover:shadow-card hover:border-slate-300 transition-all cursor-pointer group"
              onClick={card.action}
            >
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-md bg-slate-50 border border-slate-100 group-hover:bg-indigo-50 transition-colors">
                  {card.icon}
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mt-4 group-hover:text-primary-600 transition-colors">
                {card.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {card.description}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* 4. Quick Actions & Benefits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" /> Quick Actions
            </h3>
            <Badge variant="neutral">{userRole}</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="secondary"
              size="md"
              leftIcon={<Boxes className="w-4 h-4 text-indigo-600" />}
              onClick={() => navigate('/inventory')}
              className="justify-start text-xs text-slate-700"
            >
              Check Stock Levels
            </Button>
            <Button
              variant="secondary"
              size="md"
              leftIcon={<FileText className="w-4 h-4 text-cyan-600" />}
              onClick={() => navigate('/purchase-orders')}
              className="justify-start text-xs text-slate-700"
            >
              Create Purchase Order
            </Button>
            <Button
              variant="secondary"
              size="md"
              leftIcon={<CheckSquare className="w-4 h-4 text-rose-600" />}
              onClick={() => navigate('/approvals')}
              className="justify-start text-xs text-slate-700"
            >
              Review Pending Approvals
            </Button>
            <Button
              variant="secondary"
              size="md"
              leftIcon={<Zap className="w-4 h-4 text-purple-600" />}
              onClick={() => navigate('/recommendations')}
              className="justify-start text-xs text-purple-900 bg-purple-50/40 border-purple-200 hover:bg-purple-50"
            >
              Review AI Recommendations
            </Button>
          </div>
        </Card>

        {/* Enterprise Advantages */}
        <Card className="p-5 space-y-3 bg-slate-50/60 border-slate-200/80">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> System Governance
          </h3>
          <ul className="space-y-2.5 pt-1">
            {benefits.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-600 mt-1.5 shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
