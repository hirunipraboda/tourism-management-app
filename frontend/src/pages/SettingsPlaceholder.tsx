import React from 'react';
import { Settings, Sliders, Shield, Key } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const SettingsPlaceholder: React.FC = () => {
  return (
    <PageContainer>
      <PageHeader
        title="Platform & AI Settings"
        subtitle="Configure NOVA brand tokens, API keys, and autonomous agent parameters"
        breadcrumbs={[{ label: 'Settings' }]}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="space-y-4">
          <h3 className="text-base font-bold text-[#0B3A53] flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#16A6A1]" /> General Brand Configuration
          </h3>
          <Input label="Brand Name" defaultValue="NOVA" readOnly />
          <Input label="Brand Tagline" defaultValue="Smart Journeys. Unforgettable Memories." readOnly />
          <Button variant="accent" size="sm">Save General Settings</Button>
        </Card>

        <Card className="space-y-4">
          <h3 className="text-base font-bold text-[#0B3A53] flex items-center gap-2">
            <Key className="w-5 h-5 text-[#146C86]" /> AI Engine Credentials
          </h3>
          <Input label="NOVA Agent Endpoint" defaultValue="https://api.nova.ai/v1/orchestrator" />
          <Input label="Model Confidence Threshold" defaultValue="0.85" />
          <Button variant="primary" size="sm">Update AI Engine</Button>
        </Card>
      </div>
    </PageContainer>
  );
};
