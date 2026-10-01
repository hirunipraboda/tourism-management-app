import React, { useState } from 'react';
import {
  Palette,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Compass,
  MessageSquare,
  Eye,
  Bell,
  Layers,
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { IconButton } from '../components/ui/IconButton';
import { Badge } from '../components/ui/Badge';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { Input } from '../components/ui/Input';
import { SearchInput } from '../components/ui/SearchInput';
import { Select } from '../components/ui/Select';
import { Tabs } from '../components/ui/Tabs';
import { Modal } from '../components/ui/Modal';
import { Drawer } from '../components/ui/Drawer';
import { ToastContainer } from '../components/ui/Toast';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { AIBadge } from '../components/ai/AIBadge';
import { WorkflowTimeline } from '../components/ai/WorkflowTimeline';
import { ProcessingState } from '../components/ai/ProcessingState';
import { DestinationCard } from '../components/travel/DestinationCard';
import { MOCK_DESTINATIONS } from '../mock/destinations';
import { useToast } from '../hooks/useToast';
import { BRAND } from '../constants/brand';

export const ComponentShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState('buttons');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const { toasts, addToast, removeToast } = useToast();

  const showcaseTabs = [
    { id: 'buttons', label: 'Buttons & Inputs' },
    { id: 'badges', label: 'Badges & Statuses' },
    { id: 'cards', label: 'Cards & Metrics' },
    { id: 'ai', label: 'AI Language' },
    { id: 'travel', label: 'Travel Cards' },
    { id: 'dialogs', label: 'Modals & Toasts' },
  ];

  return (
    <PageContainer>
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <PageHeader
        title="NOVA Design System & UI Component Showcase"
        subtitle="Official component architecture, color tokens & typography standards"
        breadcrumbs={[{ label: 'Design System' }]}
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#16A6A1]/10 text-[#138D89] border border-[#16A6A1]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#16A6A1]" />
            <span>Design Tokens Live</span>
          </span>
        }
      />

      {/* Brand Palette Overview Card */}
      <Card className="nova-gradient-primary text-white space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#16A6A1]">
              Brand Identity
            </span>
            <h2 className="text-2xl font-black">{BRAND.name}</h2>
            <p className="text-xs text-slate-200 mt-0.5">{BRAND.tagline}</p>
          </div>
          <Compass className="w-12 h-12 text-[#16A6A1]" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-white/10 text-xs">
          <div className="p-3 bg-[#0B3A53] rounded-xl border border-white/20">
            <span className="font-bold block">Primary</span>
            <span className="text-[10px] text-slate-300">#0B3A53 (Navy)</span>
          </div>
          <div className="p-3 bg-[#146C86] rounded-xl border border-white/20">
            <span className="font-bold block">Secondary</span>
            <span className="text-[10px] text-slate-300">#146C86 (Teal)</span>
          </div>
          <div className="p-3 bg-[#16A6A1] rounded-xl border border-white/20">
            <span className="font-bold block">Accent</span>
            <span className="text-[10px] text-white font-bold">#16A6A1 (Electric)</span>
          </div>
          <div className="p-3 bg-[#F59E0B] rounded-xl border border-white/20 text-slate-950">
            <span className="font-bold block">Sunset Amber</span>
            <span className="text-[10px]">#F59E0B</span>
          </div>
          <div className="p-3 bg-[#767779] rounded-xl border border-white/20">
            <span className="font-bold block">Neutral</span>
            <span className="text-[10px] text-slate-200">#767779</span>
          </div>
        </div>
      </Card>

      {/* Interactive Tabs */}
      <Tabs tabs={showcaseTabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Buttons & Inputs */}
      {activeTab === 'buttons' && (
        <div className="space-y-6">
          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-[#0B3A53]">Button Variants</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary Navy</Button>
              <Button variant="secondary">Secondary Ocean</Button>
              <Button variant="accent">Electric Accent</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="danger">Danger Action</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button variant="primary" size="sm">Small</Button>
              <Button variant="primary" size="md">Medium</Button>
              <Button variant="primary" size="lg">Large</Button>
              <Button variant="accent" isLoading>Processing</Button>
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-[#0B3A53]">Icon Buttons</h3>
            <div className="flex items-center gap-3">
              <IconButton ariaLabel="Bell" variant="primary"><Bell className="w-4 h-4" /></IconButton>
              <IconButton ariaLabel="Eye" variant="secondary"><Eye className="w-4 h-4" /></IconButton>
              <IconButton ariaLabel="Sparkles" variant="accent"><Sparkles className="w-4 h-4" /></IconButton>
              <IconButton ariaLabel="Layers" variant="outline"><Layers className="w-4 h-4" /></IconButton>
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-[#0B3A53]">Form Controls</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Destination Title" placeholder="e.g. Kyoto Sanctuary" />
              <SearchInput placeholder="Search catalog..." />
              <Select
                label="Filter Region"
                options={[
                  { value: 'all', label: 'All Regions' },
                  { value: 'asia', label: 'East Asia' },
                  { value: 'europe', label: 'Europe' },
                ]}
              />
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Badges & Statuses */}
      {activeTab === 'badges' && (
        <div className="space-y-6">
          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-[#0B3A53]">Badge System</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="primary">Primary Navy</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="accent">Electric Accent</Badge>
              <Badge variant="amber">Sunset Amber</Badge>
              <Badge variant="outline">Outline</Badge>
              <AIBadge label="AI Agent Validated" />
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-[#0B3A53]">Status Badge Indicators</h3>
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status="Active" />
              <StatusBadge status="Confirmed" />
              <StatusBadge status="Pending" />
              <StatusBadge status="Approval Required" />
              <StatusBadge status="Validating" />
              <StatusBadge status="Cancelled" />
            </div>
          </Card>
        </div>
      )}

      {/* Tab 3: Cards & Metrics */}
      {activeTab === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Destinations"
            value="18"
            change="+4 new"
            changeType="positive"
            icon={<Compass className="w-5 h-5 text-[#0B3A53]" />}
          />
          <StatCard
            title="Active AI Tasks"
            value="34"
            change="100% active"
            changeType="positive"
            icon={<Sparkles className="w-5 h-5 text-[#16A6A1]" />}
            accentBorder
          />
          <StatCard
            title="Pending Approvals"
            value="3"
            change="Requires action"
            changeType="negative"
            icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
          />
        </div>
      )}

      {/* Tab 4: AI Language */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-[#0B3A53]">AI Workflow Pipeline Stepper</h3>
            <WorkflowTimeline currentStep="Building Itinerary" />
          </Card>
          <ProcessingState
            taskName="NOVA Route Optimization v4.2"
            stepDescription="Computing optimal rail connections & crowd density curves..."
            progress={78}
          />
        </div>
      )}

      {/* Tab 5: Travel Cards */}
      {activeTab === 'travel' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DestinationCard destination={MOCK_DESTINATIONS[0]} />
          <DestinationCard destination={MOCK_DESTINATIONS[2]} />
        </div>
      )}

      {/* Tab 6: Modals & Toasts */}
      {activeTab === 'dialogs' && (
        <Card className="space-y-4">
          <h3 className="text-sm font-bold text-[#0B3A53]">Interactive Overlays</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              Open Sample Modal
            </Button>
            <Button variant="secondary" onClick={() => setIsDrawerOpen(true)}>
              Open Side Drawer
            </Button>
            <Button variant="danger" onClick={() => setIsConfirmOpen(true)}>
              Open Confirmation
            </Button>
            <Button
              variant="accent"
              onClick={() =>
                addToast({
                  type: 'success',
                  title: 'AI Optimization Complete',
                  message: 'Itinerary route efficiency increased by +24%.',
                })
              }
            >
              Trigger Success Toast
            </Button>
          </div>
        </Card>
      )}

      {/* Sample Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="NOVA Trip Specification Modal"
        subtitle="Example interactive overlay modal component"
        footer={<Button variant="primary" onClick={() => setIsModalOpen(false)}>Done</Button>}
      >
        <p className="text-xs text-slate-600 leading-relaxed">
          This modal component follows accessibility guidelines, listens for keypress events, and locks body scrolling automatically.
        </p>
      </Modal>

      {/* Sample Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Filter Destinations Drawer"
        subtitle="Side panel drawer component"
      >
        <div className="space-y-4 text-xs">
          <Input label="Search query" placeholder="Type here..." />
          <Select
            label="Category"
            options={[
              { value: 'all', label: 'All Categories' },
              { value: 'cultural', label: 'Cultural' },
            ]}
          />
        </div>
      </Drawer>

      {/* Sample Confirmation */}
      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          setIsConfirmOpen(false);
          addToast({ type: 'info', title: 'Action confirmed successfully.' });
        }}
        title="Confirm Cancellation"
        message="Are you sure you want to cancel this trip itinerary?"
        variant="danger"
      />
    </PageContainer>
  );
};
