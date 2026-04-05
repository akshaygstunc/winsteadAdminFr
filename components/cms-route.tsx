'use client';

import { EditorCmsPage } from '@/components/editor-cms-page';
import { GenericCmsPage } from '@/components/generic-cms-page';
import { CrmCmsPage } from '@/components/crm-cms-page';
import { LocationsCmsPage } from '@/components/locations-cms-page';
import { pagesCmsConfig } from '@/configs/cms/page.config';
import { projectsCmsConfig } from "@/configs/cms/project.config";
type CmsRouteProps = {
  id: keyof typeof pagesCmsConfig;
};

export function CmsRoute({ id }: CmsRouteProps) {
  const config = id === "pages" ? pagesCmsConfig : projectsCmsConfig;
  console.log('CMS Route config for id:', id, config);
  if (!config || typeof config === 'string' || Array.isArray(config)) {
    return (
      <div className="rounded-3xl border border-dashed border-line p-8 text-sm text-muted">
        CMS configuration not found for: <strong>{String(id)}</strong>
      </div>
    );
  }

  switch (config.layout) {
    case 'editor':
      return <EditorCmsPage config={config} />;

    case 'crm':
      return <CrmCmsPage config={config} />;

    case 'locations':
      return <LocationsCmsPage config={config} />;

    case 'generic':
    default:
      return <GenericCmsPage config={config} />;
  }
}