'use client';

import { EditorCmsPage } from '@/components/editor-cms-page';
import { GenericCmsPage } from '@/components/generic-cms-page';
import { cmsConfigs } from '@/lib/cms';
import { CrmCmsPage } from '@/components/crm-cms-page';
import { LocationsCmsPage } from '@/components/locations-cms-page';

export function CmsRoute({ id }: { id: keyof typeof cmsConfigs }) {
  const config = cmsConfigs[id];
  if (config.layout === 'editor') return <EditorCmsPage config={config} />;
  if (config.layout === 'crm') return <CrmCmsPage config={config} />;
  if (config.layout === 'locations') return <LocationsCmsPage config={config} />;
  return <GenericCmsPage config={config} />;
}
