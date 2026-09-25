import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { GuideCard } from '../components/travel/GuideCard';
import { guideService } from '../services/guideService';
import type { Guide } from '../types/travel';
import { Modal } from '../components/ui/Modal';
import { GuideRegistrationForm } from '../components/guide/GuideRegistrationForm';

export const GuidesPlaceholder: React.FC = () => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const fetchGuides = async () => {
    setLoading(true);
    try {
      const data = await guideService.getGuides();
      setGuides(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not load guides. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  return (
    <PageContainer>
      <PageHeader
        title="Tour Guides Directory"
        subtitle="Manage licensed tour guides, language proficiencies & assignments"
        breadcrumbs={[{ label: 'Guides' }]}
        actions={
          <Button
            variant="accent"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsRegisterModalOpen(true)}
          >
            Register Guide
          </Button>
        }
      />

      {loading && <p className="text-slate-500 py-8 text-center">Loading guides…</p>}
      {error && <p className="text-rose-500 py-4 font-medium">{error}</p>}

      {!loading && !error && guides.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 p-8">
          <p className="text-slate-600 font-medium mb-4">No guides registered yet.</p>
          <Button
            variant="accent"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsRegisterModalOpen(true)}
          >
            Register First Guide
          </Button>
        </div>
      )}

      {!loading && !error && guides.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map(guide => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>
      )}

      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Register Tour Guide"
        subtitle="Fill out the details below to add a new licensed tour guide."
        size="lg"
      >
        <GuideRegistrationForm
          onSuccess={() => {
            setIsRegisterModalOpen(false);
            fetchGuides();
          }}
          onCancel={() => setIsRegisterModalOpen(false)}
        />
      </Modal>
    </PageContainer>
  );
};
