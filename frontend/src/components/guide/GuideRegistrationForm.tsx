import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Globe, Award, Sparkles, Image, CheckCircle2, AlertCircle } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { guideService, type CreateGuidePayload } from '../../services/guideService';
import type { Guide } from '../../types/travel';

export interface GuideRegistrationFormProps {
  onSuccess?: (newGuide?: Guide) => void;
  onCancel?: () => void;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  bio: string;
  languages: string;
  specialties: string;
  yearsExperience: string;
  avatarUrl: string;
}

const initialState: FormState = {
  name: '',
  email: '',
  phone: '',
  bio: '',
  languages: '',
  specialties: '',
  yearsExperience: '',
  avatarUrl: '',
};

export const GuideRegistrationForm: React.FC<GuideRegistrationFormProps> = ({ onSuccess, onCancel }) => {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormState]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!form.name.trim()) newErrors.name = 'Full Name is required';
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload: CreateGuidePayload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        bio: form.bio.trim() || null,
        languages: form.languages.split(',').map(l => l.trim()).filter(Boolean),
        specialties: form.specialties.split(',').map(s => s.trim()).filter(Boolean),
        yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : null,
        avatarUrl: form.avatarUrl.trim() || null,
      };

      const createdGuide = await guideService.createGuide(payload);
      setSubmitSuccess('Guide registered successfully!');

      setTimeout(() => {
        if (onSuccess) {
          onSuccess(createdGuide);
        } else {
          navigate('/guides');
        }
      }, 500);
    } catch (err) {
      console.error(err);
      setSubmitError('Something went wrong submitting your registration. Please verify backend connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {submitError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>{submitError}</div>
        </div>
      )}

      {submitSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-start gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div>{submitSuccess}</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Full Name *"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="e.g. Nimal Perera"
          leftIcon={<User className="w-4 h-4" />}
          error={errors.name}
        />

        <Input
          label="Email *"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="e.g. nimal@example.com"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Phone Number"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="e.g. +94 77 123 4567"
          leftIcon={<Phone className="w-4 h-4" />}
        />

        <Input
          label="Years of Experience"
          name="yearsExperience"
          type="number"
          min={0}
          value={form.yearsExperience}
          onChange={handleChange}
          placeholder="e.g. 5"
          leftIcon={<Award className="w-4 h-4" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Languages (comma-separated)"
          name="languages"
          value={form.languages}
          onChange={handleChange}
          placeholder="English, Sinhala, Tamil, German"
          leftIcon={<Globe className="w-4 h-4" />}
        />

        <Input
          label="Specialties (comma-separated)"
          name="specialties"
          value={form.specialties}
          onChange={handleChange}
          placeholder="Hiking, Wildlife, Cultural History"
          leftIcon={<Sparkles className="w-4 h-4" />}
        />
      </div>

      <Input
        label="Avatar Image URL"
        name="avatarUrl"
        value={form.avatarUrl}
        onChange={handleChange}
        placeholder="https://images.unsplash.com/photo-..."
        leftIcon={<Image className="w-4 h-4" />}
      />

      <div className="w-full space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
          Bio / Description
        </label>
        <textarea
          name="bio"
          value={form.bio}
          onChange={handleChange}
          rows={3}
          placeholder="Brief description of experience, certifications, and expertise..."
          className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 transition duration-150 placeholder:text-slate-400 focus:outline-none focus:border-[#16A6A1] focus:ring-2 focus:ring-[#16A6A1]/20"
        />
      </div>

      <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="accent" isLoading={submitting}>
          {submitting ? 'Submitting…' : 'Register Guide'}
        </Button>
      </div>
    </form>
  );
};
