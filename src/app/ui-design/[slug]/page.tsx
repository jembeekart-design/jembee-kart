import { notFound } from 'next/navigation';
import DesignPreview from '@/components/ui-design/DesignPreview';
import { designPages, getDesignPage } from '@/lib/ui-design/catalog';
import '../ui-design.css';

export function generateStaticParams() { return designPages.map(page => ({ slug: page.slug })); }
export async function generateMetadata({ params }: { params: Promise<{slug:string}> }) { const {slug}=await params; const page=getDesignPage(slug); return {title:page?.title ?? 'UI Design Preview'}; }
export default async function UiDesignDetail({ params }: { params: Promise<{slug:string}> }) { const {slug}=await params; const page=getDesignPage(slug); if(!page) notFound(); return <DesignPreview page={page} allPages={designPages}/>; }
