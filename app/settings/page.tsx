'use client';
import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Header } from '@/components/header';
import { api } from '@/lib/api';
import { PlatformSettings } from '@/lib/types';
import { ActionButton, SectionCard, SimpleField } from '@/components/ui';
import { Modal } from '@/components/modal';
import { CheckboxInput, FormActions, FormGrid, SectionNotice, TextInput } from '@/components/crud-kit';

const emptyForm: PlatformSettings = { theme: 'dark-luxury', currency: 'USD', timezone: 'Asia/Dubai', notifications: true, brandName: 'Luxury Estate Command' };

export default function SettingsPage() {
  const [form, setForm] = useState<PlatformSettings>(emptyForm);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = async () => { try { setForm(await api.get<PlatformSettings>('/settings')); } catch { setError('Failed to load settings.'); } };
  useEffect(() => { load(); }, []);
  const submit = async () => {
    try { setForm(await api.patch<PlatformSettings>('/settings', form)); setMessage('Settings updated.'); setOpen(false); }
    catch { setError('Unable to update settings.'); }
  };
  return (
    <DashboardShell>
      <Header title="Settings" subtitle="Persisted platform settings with a working edit modal." />
      <SectionNotice message={message} error={error} />
      <SectionCard title="Current Snapshot" subtitle="Live preview of the saved settings." action={<ActionButton onClick={() => setOpen(true)}>Edit Settings</ActionButton>}>
          <div className="grid gap-4 md:grid-cols-2">
            <SimpleField label="Theme" value={form.theme} />
            <SimpleField label="Brand" value={form.brandName} />
            <SimpleField label="Currency" value={form.currency} />
            <SimpleField label="Timezone" value={form.timezone} />
          </div>
      </SectionCard>
      <Modal open={open} onClose={() => setOpen(false)} title="Edit Settings" subtitle="These values are saved in MongoDB." size="lg">
        <div className="space-y-4">
          <FormGrid columns={2}>
            <TextInput label="Theme" value={form.theme} onChange={(value) => setForm({ ...form, theme: value })} />
            <TextInput label="Brand Name" value={form.brandName} onChange={(value) => setForm({ ...form, brandName: value })} />
            <TextInput label="Currency" value={form.currency} onChange={(value) => setForm({ ...form, currency: value })} />
            <TextInput label="Timezone" value={form.timezone} onChange={(value) => setForm({ ...form, timezone: value })} />
            <div className="md:col-span-2"><CheckboxInput label="Notifications enabled" checked={form.notifications} onChange={(value) => setForm({ ...form, notifications: value })} /></div>
          </FormGrid>
          <FormActions onSubmit={submit} onCancel={() => setOpen(false)} submitLabel="Save Settings" />
        </div>
      </Modal>
    </DashboardShell>
  );
}
