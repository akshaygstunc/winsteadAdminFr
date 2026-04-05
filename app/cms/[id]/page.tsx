"use client";
import { CmsRoute } from '@/components/cms-route';
import { useParams } from 'next/navigation';

type PageProps = {
  params: {
    id: string;
  };
};

export default function Page() {
  const params = useParams();
  return <CmsRoute id={params.id as any} />;
}