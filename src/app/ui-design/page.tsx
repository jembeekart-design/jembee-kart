import Link from 'next/link';
import { ArrowUpRight, BookOpen, Clapperboard, GraduationCap, Headphones, ShieldCheck, Smartphone, Tv, Users } from 'lucide-react';
import { designCategories, designPages } from '@/lib/ui-design/catalog';
import './ui-design.css';

const icons = [Clapperboard,GraduationCap,Users,Headphones,ShieldCheck,Tv];
export const metadata = { title: 'UI Design Preview', description: 'Jembee Play responsive UI design preview for mobile, web and Android TV.' };
export default function UiDesignIndex() {
  return <main className="jp-design-index"><header className="jp-index-header"><div className="jp-index-brand"><span>▶</span> Jembee Play</div><div className="jp-index-title"><small>RESPONSIVE UI SYSTEM</small><h1>All Frontend Page Designs</h1><p>Simple blue-and-white layouts for Mobile, Desktop/Web and Android TV.</p></div><div className="jp-device-tags"><span><Smartphone/> Mobile</span><span><BookOpen/> Desktop / Web</span><span><Tv/> Android TV</span></div></header>
    <div className="jp-index-notice"><ShieldCheck size={18}/><span>These are frontend design previews. Live authentication, Firestore data and payment actions remain in the existing application and are not simulated here.</span></div>
    <div className="jp-category-list">{designCategories.map((category,index)=>{const Icon=icons[index];const items=designPages.filter(p=>p.category===category);return <section className="jp-category-block" key={category}><div className="jp-category-head"><span className="jp-category-icon"><Icon/></span><div><h2>{category}</h2><p>{items.length} screens · Responsive layout previews</p></div><b>{String(items.length).padStart(2,'0')}</b></div><div className="jp-design-card-grid">{items.map((page,i)=><Link href={`/ui-design/${page.slug}`} className="jp-design-card" key={page.slug}><span className="jp-design-card-no">{String(i+1).padStart(2,'0')}</span><div><b>{page.title}</b><p>{page.description}</p><small>{page.tv?'Mobile · Web · TV':'Mobile · Web'}</small></div><ArrowUpRight size={18}/></Link>)}</div></section>})}</div>
    <footer className="jp-index-footer">JEMBEE PLAY · FRONTEND DESIGN PREVIEW · {designPages.length} PAGE CONCEPTS</footer></main>
}
