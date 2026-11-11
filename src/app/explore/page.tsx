"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, Play, BookOpen, GraduationCap, Sprout, Laptop, Stethoscope, Wrench, PawPrint, Languages, BriefcaseBusiness, Palette, Trophy, Music, Leaf, Video, ChevronRight, Sparkles, History, ChefHat, House, Briefcase, Scale, Baby } from "lucide-react";
import { MonetagPlacement } from "@/components/ads/MonetagPlacement";

type Category = { id: string; name: string; description: string; icon: React.ComponentType<{size?: number; className?: string}>; topics: string[] };
const categories: Category[] = [
 {id:"school",name:"School",description:"Nursery se Class 12 tak",icon:GraduationCap,topics:["Classes & Boards","Schools","Books","Subjects","Chapters","Questions & Solutions","Teachers","Tests & Homework"]},
 {id:"agriculture",name:"कृषि",description:"खेती और किसान शिक्षा",icon:Sprout,topics:["फसल और बीज","जैविक खेती","खाद और मिट्टी","सिंचाई","कृषि मशीनें","सरकारी योजनाएँ"]},
 {id:"college",name:"College",description:"Graduation, PG aur Diploma",icon:BookOpen,topics:["Courses","Subjects","Semester","Study Notes","Lectures","Exams"]},
 {id:"competitive",name:"Competitive Exams",description:"प्रतियोगी परीक्षा की तैयारी",icon:Trophy,topics:["JEE & NEET","SSC & Railway","UPSC & State PSC","Banking","CUET","Mock Tests"]},
 {id:"technology",name:"Computer & AI",description:"Digital aur technology skills",icon:Laptop,topics:["Basic Computer","Coding","AI Tools","Web Development","Cyber Safety"]},
 {id:"skills",name:"Skill Training",description:"काम सीखें और हुनर बढ़ाएँ",icon:Wrench,topics:["Electrician","Plumbing","Mobile Repair","Graphic Design","Digital Marketing"]},
 {id:"animal",name:"पशुपालन",description:"डेयरी और पशु देखभाल",icon:PawPrint,topics:["गाय-भैंस","बकरी पालन","मुर्गी पालन","डेयरी प्रबंधन","पशु पोषण"]},
 {id:"health",name:"Health Education",description:"सामान्य स्वास्थ्य जागरूकता",icon:Stethoscope,topics:["स्वास्थ्य जागरूकता","प्राथमिक उपचार","पोषण","स्वच्छता"]},
 {id:"languages",name:"Languages",description:"भाषाएँ सीखें",icon:Languages,topics:["Spoken English","Hindi Grammar","Reading","Writing","अन्य भाषाएँ"]},
 {id:"business",name:"Business",description:"व्यवसाय और उद्यमिता",icon:BriefcaseBusiness,topics:["Business Basics","Accounting","Marketing","Entrepreneurship"]},
 {id:"arts",name:"Art & Craft",description:"रचनात्मक कला और डिजाइन",icon:Palette,topics:["Drawing","Painting","Craft","Fashion Design"]},
 {id:"sports",name:"Sports & Fitness",description:"खेल, योग और फिटनेस",icon:Trophy,topics:["Cricket","Football","Yoga","Fitness","Sports Skills"]},
 {id:"music",name:"Music & Dance",description:"संगीत और नृत्य सीखें",icon:Music,topics:["Singing","Instruments","Dance","Music Theory"]},
 {id:"environment",name:"Environment & Gardening",description:"प्रकृति, पर्यावरण और बागवानी",icon:Leaf,topics:["पेड़-पौधे","जल संरक्षण","कचरा प्रबंधन","जलवायु","Kitchen Garden"]},
 {id:"general-knowledge",name:"General Knowledge & History",description:"सामान्य ज्ञान और इतिहास",icon:History,topics:["भारत का इतिहास","विश्व इतिहास","Current Affairs","General Knowledge"]},
 {id:"cooking",name:"Cooking & Nutrition",description:"खाना बनाना और पोषण",icon:ChefHat,topics:["Home Cooking","Healthy Food","Food Safety","Nutrition Basics"]},
 {id:"home-diy",name:"Home Skills & DIY",description:"घर के काम और DIY कौशल",icon:House,topics:["Home Repair","Cleaning","Basic Tools","DIY Projects"]},
 {id:"career",name:"Career & Job Preparation",description:"करियर और नौकरी की तैयारी",icon:Briefcase,topics:["Interview Skills","Resume Writing","Job Search","Workplace Skills"]},
 {id:"legal-civic",name:"Legal & Civic Awareness",description:"कानूनी और नागरिक जागरूकता",icon:Scale,topics:["Citizen Rights","Public Services","Digital Safety","Basic Legal Awareness"]},
 {id:"kids-learning",name:"Kids Learning",description:"बच्चों के लिए सुरक्षित सीखने की सामग्री",icon:Baby,topics:["Early Learning","Stories","Basic Maths","Reading & Writing"]},
];

export default function ExplorePage(){
 const [query,setQuery]=useState("");
 const [selected,setSelected]=useState<string|null>(null);
 const filtered=useMemo(()=>categories.filter(c=>(c.name+" "+c.description+" "+c.topics.join(" ")).toLowerCase().includes(query.toLowerCase())),[query]);
 const active=categories.find(c=>c.id===selected);
 return <main className="min-h-screen bg-[#080d18] text-white">
  <header className="sticky top-0 z-20 border-b border-white/10 bg-[#080d18]/95 px-4 py-3 backdrop-blur">
   <div className="mx-auto flex max-w-6xl items-center justify-between gap-3"><div><p className="text-xl font-black tracking-tight">JEMBEE <span className="text-cyan-400">PLAY</span></p><p className="text-xs text-slate-400">Explore • Watch • Learn</p></div><Link href="/shorts" className="flex items-center gap-2 rounded-full bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950"><Play size={16}/> Shorts</Link></div>
  </header>
  <section className="mx-auto max-w-6xl px-4 pb-10 pt-7">
   <div className="mb-6"><p className="mb-2 flex items-center gap-2 text-sm font-semibold text-cyan-300"><Sparkles size={16}/> Explore Jembee</p><h1 className="text-3xl font-black leading-tight sm:text-4xl">हर रुचि, हर हुनर के लिए <span className="text-cyan-300">एक जगह</span></h1><p className="mt-2 max-w-2xl text-sm text-slate-400">Short videos dekhein, nayi skills seekhein aur apna knowledge share karein.</p></div>
   <label className="mb-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"><Search className="text-slate-400" size={20}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="School, krishi, computer, teacher ya topic khojein..." className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"/></label>
   <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold">Explore Categories</h2><span className="text-xs text-slate-500">Swipe karein →</span></div>
   <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:thin]">{filtered.map(c=>{const Icon=c.icon;return <button key={c.id} onClick={()=>setSelected(selected===c.id?null:c.id)} className={`group flex w-[104px] shrink-0 snap-start flex-col items-center gap-2 rounded-2xl p-2 text-center transition ${selected===c.id?"bg-cyan-400/15":"hover:bg-white/5"}`}><span className={`grid h-[76px] w-[76px] place-items-center rounded-full border bg-gradient-to-br from-white/10 to-white/[0.02] shadow-lg transition group-hover:-translate-y-1 ${selected===c.id?"border-cyan-300 ring-2 ring-cyan-300/30":"border-white/10"}`}><Icon size={30} className={selected===c.id?"text-cyan-300":"text-slate-100"}/></span><span className="text-xs font-semibold">{c.name}</span></button>})}</div>
   {active&&<section className="mb-7 rounded-3xl border border-cyan-300/20 bg-cyan-300/5 p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-cyan-300">Selected category</p><h3 className="mt-1 text-2xl font-black">{active.name}</h3><p className="mt-1 text-sm text-slate-400">{active.description}</p></div><button onClick={()=>setSelected(null)} className="rounded-full border border-white/15 px-3 py-1 text-xs">Close</button></div><div className="mt-4 flex flex-wrap gap-2">{active.topics.map(t=><span key={t} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200">{t}</span>)}</div><p className="mt-4 text-xs text-slate-500">Category ke andar verified teachers, approved videos, notes aur free/paid lessons dikhaye jayenge. Is build mein topic navigation UI scaffold hai; live catalog Firestore integration agle implementation step mein hoga.</p></section>}
   <section className="mb-7 grid gap-3 sm:grid-cols-2"><Link href="/shorts" className="flex items-center justify-between rounded-3xl border border-white/10 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/10 p-5"><div><p className="text-xs font-bold text-violet-200">ENTERTAINMENT & LEARNING</p><h3 className="mt-1 text-xl font-black">Watch Shorts</h3><p className="mt-1 text-xs text-slate-400">Vertical video feed</p></div><Video size={34} className="text-violet-200"/></Link><div className="flex items-center justify-between rounded-3xl border border-white/10 bg-gradient-to-r from-emerald-500/15 to-cyan-500/10 p-5"><div><p className="text-xs font-bold text-emerald-200">CREATE & TEACH</p><h3 className="mt-1 text-xl font-black">Share Knowledge</h3><p className="mt-1 text-xs text-slate-400">Teacher upload workflow planned</p></div><GraduationCap size={36} className="text-emerald-200"/></div></section>
   <MonetagPlacement placement="explore-bottom" />
   <div className="mt-8 flex items-center justify-between text-xs text-slate-500"><span>JEMBEE PLAY • Explore</span><span className="flex items-center gap-1">More categories <ChevronRight size={14}/></span></div>
  </section>
 </main>
}
