'use client';

import { ReactNode } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Header } from '@/components/header';
import { SectionCard } from '@/components/ui';

type Props = {
  title: string;
  subtitle: string;
  children?: ReactNode;
};

export function VideoRoutePage({ title, subtitle, children }: Props) {
  return (
    <DashboardShell>
      <Header title={title} subtitle={subtitle} />
      <SectionCard title={title} subtitle="Mapped from the menu structure visible in the source video.">
        <div className="space-y-3 text-sm leading-7 text-muted">
          {children ?? <p>This route is now in the correct location in the sidebar and ready for dedicated business logic wiring.</p>}
        </div>
      </SectionCard>
    </DashboardShell>
  );
}
