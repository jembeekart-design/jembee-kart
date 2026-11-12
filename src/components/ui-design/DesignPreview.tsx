'use client';

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Bell, BookOpen, CheckCircle2, ChevronRight, Download, FileText,
  Film, GraduationCap, Heart, Home, ListVideo, MessageCircle, Monitor, Play,
  Search, Share2, Smartphone, Star, Tv, UserRound, ThumbsUp, Bookmark,
} from 'lucide-react';
import type { DesignPage } from '@/lib/ui-design/catalog';

type Device = 'mobile' | 'desktop' | 'tv';
const art = ['/ui-design/art-01.svg','/ui-design/art-02.svg','/ui-design/art-03.svg','/ui-design/art-04.svg'];
const demoVideos = ['Class 8 Science – Crop Production', 'Study Motivation for Students', 'Mathematics – Linear Equations', 'English Grammar – Tenses'];

function ActionButton({ children, primary = false, onClick }: { children: ReactNode; primary?: boolean; onClick?: () => void }) {
  return <button type="button" className={primary ? 'jp-primary' : 'jp-secondary'} onClick={onClick}>{children}</button>;
}
function SectionTitle({ children, trailing }: { children: ReactNode; trailing?: string }) {
  return <div className="jp-section-title"><b>{children}</b>{trailing && <span>{trailing}</span>}</div>;
}
function VideoCard({ index, title, compact = false }: { index: number; title?: string; compact?: boolean }) {
  return <article className={`jp-video-card ${compact ? 'compact' : ''}`}>
    <div className="jp-video-art"><img src={art[index % art.length]} alt="" /><span><Play size={15} fill="currentColor"/></span><small>{['12:30','10:45','18:20','14:36'][index % 4]}</small></div>
    <div className="jp-video-meta"><b>{title || demoVideos[index % demoVideos.length]}</b><small>Jembee Edu · {['1.2M','860K','420K','350K'][index % 4]} views</small></div>
  </article>;
}
function DataRows({ rows, icon = '•' }: { rows: string[]; icon?: string }) {
  return <div className="jp-data-rows">{rows.map((r,i)=><div className="jp-data-row" key={r}><span className="jp-row-icon">{icon === '•' ? i + 1 : icon}</span><b>{r}</b><ChevronRight size={15}/></div>)}</div>;
}
function FormPanel({ page, query, setQuery }: { page: DesignPage; query: string; setQuery: (v:string)=>void }) {
  const [confirmed,setConfirmed] = useState(false);
  const isSearch = page.slug.includes('search') || page.slug === 'explore';
  return <section className={`jp-form-panel ${page.slug==='upload-video'?'jp-upload-panel':''} ${page.slug==='account-deletion'?'jp-delete-panel':''}`}>
    {page.slug==='upload-video' && <div className="jp-upload-drop"><span>↑</span><b>Select or drag a video file</b><small>MP4, MOV or MKV · Maximum size according to upload policy</small><input type="file" accept="video/*" aria-label="Choose video file"/></div>}
    {page.slug==='account-deletion' && <div className="jp-delete-warning"><b>Before you continue</b><p>Account deletion is a serious action. Review your videos, profile, messages and available account records before submitting a request. This preview does not delete data.</p></div>}
    {page.sections.map((field,i)=><label key={field}>{field}
      {isSearch && i===0 ? <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search videos, creators, courses…"/> :
      /details|message|description|reason|summary|outcomes/i.test(field) ? <textarea rows={3} placeholder={`Enter ${field.toLowerCase()}`}/> :
      page.slug==='privacy-settings' ? <select defaultValue="Everyone"><option>Everyone</option><option>Followers</option><option>Only me</option></select> :
      page.slug==='report-block' && i===0 ? <select defaultValue=""><option value="" disabled>Select a reason</option><option>Spam or misleading</option><option>Harassment</option><option>Copyright concern</option><option>Unsafe content</option><option>Other</option></select> :
      <input type={/password/i.test(field)?'password':'text'} placeholder={`Enter ${field.toLowerCase()}`}/> }
    </label>)}
    {page.slug==='upload-video' && <label>Visibility<select defaultValue="Free"><option>Free</option><option>Private draft</option></select></label>}
    {page.slug==='account-deletion' && <label className="jp-confirm-check"><input type="checkbox"/> I understand the consequences and want to request account deletion.</label>}
    <div className="jp-form-actions"><ActionButton primary onClick={()=>setConfirmed(true)}>{confirmed ? 'Saved in preview' : page.actions[0] || 'Continue'}</ActionButton>{confirmed && <small><CheckCircle2 size={14}/> Preview interaction only; no account data was changed.</small>}</div>
  </section>;
}
function ScreenContent({ page, device }: { page: DesignPage; device: Device }) {
  const isTv = device === 'tv';
  const [selected,setSelected] = useState(0);
  const [query,setQuery] = useState('');
  const [tab,setTab] = useState(0);
  const [liked,setLiked] = useState(false);
  const rows = useMemo(()=>page.sections.map((label,i)=>({label,count:[12,8,24,6,15][i%5]})),[page.sections]);
  const slug = page.slug;
  const isPlayer = ['video-watch','tv-player'].includes(slug);
  const isShorts = ['shorts','tv-shorts'].includes(slug);
  const isDashboard = slug.includes('dashboard') || slug === 'earnings' || slug === 'payment-history' || slug === 'student-progress';
  const isForm = ['login','register','email-verification','forgot-password','upload-video','edit-profile','account-security','privacy-settings','messages-support','account-deletion','report-block'].includes(slug);
  const isLearning = page.category === 'School Learning' || slug === 'tv-learning';
  const isProfile = slug.includes('profile');
  const isQuiz = ['quiz','practice-questions'].includes(slug);
  const isList = ['comments','watch-history','following-followers','subscriptions','playlists','watch-later','saved-liked','downloads','manage-videos','notifications','help-center','referral-share','rewards-points'].includes(slug);
  const isReview = slug === 'rating-reviews';
  return <div className={`jp-screen jp-${device}`}>
    {device === 'mobile' && <div className="jp-phone-status"><span>10:30</span><span>● ● ▰</span></div>}
    <header className="jp-screen-head"><div className="jp-brand"><span className="jp-brand-mark"><Play size={isTv?22:17} fill="currentColor"/></span><b>Jembee Play</b></div><div className="jp-head-tools"><Search size={17}/><Bell size={17}/><span className="jp-avatar">A</span></div></header>
    {device !== 'mobile' && <nav className="jp-topnav"><span>Home</span><span>Videos</span><span>Shorts</span><span>Learning</span><span>Creators</span><span>Teachers</span><span>Explore</span></nav>}
    <div className="jp-screen-body">
      {device === 'desktop' && <aside className="jp-sidebar">{['Home','Shorts','Learning','My Library','Watch History','Creators','Teachers','Settings'].map((x,i)=><div key={x} className={i===0?'active':''}><ChevronRight size={14}/>{x}</div>)}</aside>}
      {isTv && <aside className="jp-tv-sidebar">{['Home','Shorts','Learning','My List','Search','Settings'].map((x,i)=><div key={x} className={i===0?'active':''}>{x}</div>)}</aside>}
      <main className="jp-main-content">
        <div className="jp-page-title"><div><small>{page.category}</small><h2>{page.title}</h2><p>{page.description}</p></div>{!isForm && <span className="jp-page-symbol"><Film size={22}/></span>}</div>
        {slug === 'home' || slug === 'tv-home' ? <>
          <div className="jp-hero"><img src={art[0]} alt="Featured learning"/><div><b>Study, Learn & Grow with Jembee Play</b><p>Videos · Learning · Shorts</p><ActionButton primary>Watch now</ActionButton></div></div>
          <SectionTitle trailing="See all">Continue watching</SectionTitle><div className="jp-video-grid">{[0,1,2].map(i=><VideoCard key={i} index={i}/>)}</div>
          <SectionTitle trailing="Explore">Learning by class</SectionTitle><div className="jp-chip-grid">{Array.from({length:7},(_,i)=><button key={i} onClick={()=>setSelected(i)} className={selected===i?'selected':''}>Class {i+6}</button>)}</div>
        </> : null}
        {isPlayer && <>
          <div className="jp-player"><img src={art[0]} alt="Video preview"/><span><Play fill="white" size={isTv?48:36}/></span><small>▶  12:30 / 20:16　 ▬▬▬▬▬</small></div>
          <div className="jp-player-title"><b>Class 8 Science – Crop Production</b><small>1.2M views · 4 days ago · Free learning video</small></div>
          <div className="jp-action-grid"><button onClick={()=>setLiked(!liked)}><ThumbsUp size={15}/>{liked?'Liked':'Like'}</button><button><Share2 size={15}/>Share</button><button><Bookmark size={15}/>Save</button><button><Download size={15}/>Download</button></div>
          <SectionTitle>About this video</SectionTitle><p className="jp-muted-copy">Learn the chapter with clear explanations, related lessons and study resources.</p>
          <SectionTitle trailing="See all">Up next</SectionTitle><div className="jp-video-grid">{[1,2,3].map(i=><VideoCard key={i} index={i}/>)}</div>
        </>}
        {isShorts && <div className="jp-shorts-layout"><div className="jp-shorts-video"><img src={art[selected%art.length]} alt="Short video preview"/><span><Play fill="white" size={38}/></span><b>{demoVideos[selected%4]}</b></div><div className="jp-shorts-actions"><button onClick={()=>setLiked(!liked)}><Heart fill={liked?'currentColor':'none'}/>Like</button><button><MessageCircle/>Comment</button><button><Share2/>Share</button><button><Bookmark/>Save</button><button onClick={()=>setSelected((selected+1)%4)}>Next short</button></div></div>}
        {isLearning && <>
          <div className="jp-learning-path"><span>Board</span><ChevronRight/><span>Class 8</span><ChevronRight/><span>Science</span><ChevronRight/><b>{page.title}</b></div>
          {['board-selection','school-selection','class-selection','subject-selection','book-selection'].includes(slug) ? <>
            <div className="jp-selection-intro"><b>{slug==='board-selection'?'Choose your education board':slug==='school-selection'?'Find your school':slug==='class-selection'?'Select your class':slug==='subject-selection'?'Choose a subject':'Select a textbook'}</b><small>Choose one option to continue. Your selection will shape the learning catalog.</small></div>
            {slug==='school-selection' && <div className="jp-search-line"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search school name, city or code"/></div>}
            <div className="jp-learning-grid">{rows.map((r,i)=><button key={r.label} onClick={()=>setSelected(i)} className={selected===i?'selected':''}><span>{slug==='class-selection'?`0${i+1}`:i+1}</span><b>{r.label}</b><small>{slug==='board-selection'?'Curriculum':slug==='school-selection'?'Verified school directory':slug==='class-selection'?'Academic class':slug==='subject-selection'?'Available subject':'Textbook and reference'}</small></button>)}</div>
            <div className="jp-selection-footer"><small>{selected>=0?`${rows[selected]?.label || 'Option'} selected`: 'No selection'}</small><ActionButton primary>Continue</ActionButton></div>
          </> : slug==='chapter-details' || slug==='course-detail' ? <>
            <div className="jp-course-banner"><div><small>{slug==='course-detail'?'COURSE OVERVIEW':'SCIENCE · CLASS 8'}</small><b>{slug==='course-detail'?'Class 8 Science – Complete Course':'Crop Production and Management'}</b><p>Teacher-led lessons · Notes · Practice questions</p></div><span><BookOpen size={32}/></span></div>
            <SectionTitle>Course content</SectionTitle><div className="jp-chapter-list">{['Introduction and learning outcomes','Nutrition in Plants','Crop Production','Irrigation and Soil','Harvesting and Storage'].map((x,i)=><button key={x} onClick={()=>setSelected(i)} className={selected===i?'selected':''}><span>{String(i+1).padStart(2,'0')}</span><div><b>{x}</b><small>{i+2} lessons · Video, notes and quiz</small></div><Play size={17}/></button>)}</div>
            <div className="jp-resource-grid"><span><Play/>Lessons</span><span><FileText/>Notes</span><span><BookOpen/>Resources</span><span><Star/>Practice</span></div>
          </> : <>
            <div className="jp-learning-grid">{rows.map((r,i)=><button key={r.label} onClick={()=>setSelected(i)} className={selected===i?'selected':''}><span>{isQuiz?'✓':i+1}</span><b>{r.label}</b><small>{isQuiz?'Practice set':`${r.count} lessons / resources`}</small></button>)}</div>
            {slug==='quiz' && <div className="jp-question-card"><div className="jp-quiz-progress"><b>Question 1 of 10</b><span>10 marks · 15 min</span></div><b>Which of these is a Kharif crop?</b>{['Wheat','Rice','Gram','Pea'].map((x,i)=><button key={x} onClick={()=>setSelected(i)} className={selected===i?'selected':''}>{x}</button>)}<ActionButton primary>Check answer</ActionButton></div>}
            <SectionTitle>Learning resources</SectionTitle><div className="jp-resource-grid"><span><Play/>Videos</span><span><FileText/>Notes / PDF</span><span><BookOpen/>Chapter</span><span><Star/>Practice</span></div>
          </>}
        </>}
        {isDashboard && <>
          <div className="jp-stat-grid">{(slug==='teacher-dashboard'||slug==='teacher-courses'?['Courses','Chapters','Students','Rating']:slug==='sharer-dashboard'?['Shares','Referrals','Reward points','Available rewards']:slug==='payment-history'?['Paid records','Pending records','Failed records','Last payment']:slug==='earnings'?['Total earnings','Available','Pending','Reward points']:['Videos','Total views','Followers','Earnings']).map((x,i)=><div key={x}><small>{x}</small><b>{(slug==='teacher-dashboard'||slug==='teacher-courses'?['12','56','12.6K','4.8★']:slug==='sharer-dashboard'?['1,420','820','1,250','₹860']:slug==='payment-history'?['8','2','0','₹2,000']:slug==='earnings'?['₹4,320','₹2,500','₹1,820','1,250']:['248','1.2M','86.2K','₹4,320'])[i]}</b><span>{slug==='teacher-dashboard'?'Illustrative course data':slug==='sharer-dashboard'?'Sample referral data':'Illustrative preview data'}</span></div>)}</div>
          <div className="jp-chart-card"><SectionTitle>{slug==='teacher-dashboard'?'Course engagement':slug==='sharer-dashboard'?'Share activity':slug==='payment-history'?'Payment activity':'Performance overview'}</SectionTitle><div className="jp-chart-bars">{[35,52,44,68,58,82,72,94,65,78,88,100].map((v,i)=><i key={i} style={{height:`${v}%`}}/>)}</div></div>
          <SectionTitle>{slug==='teacher-dashboard'?'My courses':slug==='sharer-dashboard'?'Recent shares':slug==='payment-history'?'Recent payment records':'Recent activity'}</SectionTitle><DataRows rows={page.sections}/>
        </>}
        {isProfile && <>
          <div className="jp-profile-hero"><div className="jp-profile-avatar">JE</div><div><b>{slug==='teacher-profile'?'Verified Teacher':'Jembee Creator'}</b><small>86.2K followers · 248 videos</small><div className="jp-profile-actions"><ActionButton primary>Follow</ActionButton><ActionButton>Message</ActionButton></div></div></div>
          <div className="jp-tabs">{['Videos','Shorts','Playlists','About','Reviews'].map((x,i)=><button key={x} onClick={()=>setTab(i)} className={tab===i?'active':''}>{x}</button>)}</div>
          <div className="jp-video-grid">{[0,1,2,3].map(i=><VideoCard key={i} index={i}/>)}</div>
        </>}
        {isReview && <>
          <div className="jp-rating-summary"><strong>4.7</strong><span><Star fill="currentColor"/> Average rating · Illustrative preview</span></div>
          <div className="jp-rating-bars">{[78,12,6,3,1].map((n,i)=><div key={n}><b>{5-i} ★</b><i><span style={{width:`${n}%`}}/></i><small>{n}%</small></div>)}</div>
          <SectionTitle>Write a review</SectionTitle><div className="jp-review-stars">{[1,2,3,4,5].map(n=><button key={n} onClick={()=>setSelected(n)} className={n<=selected?'selected':''}><Star fill="currentColor"/></button>)}</div><textarea className="jp-review-input" placeholder="Share your experience…"/><ActionButton primary>Submit review (preview)</ActionButton>
        </>}
        {slug==='tv-search' && <div className="jp-tv-search-panel"><div className="jp-tv-search-box"><Search/><span>{query || 'Search videos, creators and lessons'}</span><ActionButton primary>Search</ActionButton></div><SectionTitle>On-screen keyboard</SectionTitle><div className="jp-tv-keyboard">{'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('').map(k=><button key={k} onClick={()=>setQuery(query+k)}>{k}</button>)}<button onClick={()=>setQuery('')}>Clear</button></div><SectionTitle>Suggested searches</SectionTitle><div className="jp-chip-grid">{['Class 8 Science','Maths Chapter 2','Study Motivation','English Grammar'].map(x=><button key={x} onClick={()=>setQuery(x)}>{x}</button>)}</div></div>}
        {slug==='tv-settings' && <div className="jp-tv-settings-list">{['Account & profile','Playback quality','Autoplay next video','Language','Captions and accessibility','Privacy','About Jembee Play'].map((x,i)=><button key={x} onClick={()=>setSelected(i)} className={selected===i?'selected':''}><span>{['♙','▶','↻','文','CC','◇','ⓘ'][i]}</span><b>{x}</b><small>{['Signed in','Auto','On','English','Enabled','Manage preferences','Version information'][i]}</small><ChevronRight/></button>)}</div>}
        {slug==='tv-login' && <div className="jp-tv-login-panel"><div className="jp-tv-login-mark"><Play fill="currentColor"/></div><h3>Sign in to Jembee Play</h3><p>Use your account to continue watching and sync your learning progress.</p><div className="jp-tv-pair-card"><b>Sign in with a pairing code</b><strong>J B 7 K 2 P</strong><small>On your phone, open jembeeplay.app/tv and enter this code.</small></div><ActionButton primary>Continue with email</ActionButton></div>}
        {slug==='tv-my-list' && <div className="jp-tv-mylist"><div className="jp-tabs">{['Watch Later','Saved videos','Playlists'].map((x,i)=><button key={x} onClick={()=>setTab(i)} className={tab===i?'active':''}>{x}</button>)}</div><SectionTitle>{['Continue your queue','Saved for later','Your playlists'][tab]}</SectionTitle><div className="jp-video-grid">{[0,1,2,3].map(i=><VideoCard key={`${tab}-${i}`} index={i}/>)}</div><div className="jp-tv-focus-hint">Select a title with your remote · Press OK to play · Long-press for options</div></div>}
        {isForm && <FormPanel page={page} query={query} setQuery={setQuery}/>}
        {isQuiz && !isLearning && <div className="jp-question-card"><b>Practice question</b>{rows.map((r,i)=><button key={r.label} onClick={()=>setSelected(i)} className={selected===i?'selected':''}>{r.label}</button>)}<ActionButton primary>Check answer</ActionButton></div>}
        {isList && <>
          {['following-followers','saved-liked'].includes(slug) && <div className="jp-tabs">{(slug==='following-followers'?['Following','Followers']:['Saved videos','Liked videos']).map((x,i)=><button key={x} onClick={()=>setTab(i)} className={tab===i?'active':''}>{x}</button>)}</div>}
          {slug==='comments' ? <>
            <div className="jp-comment-compose"><span className="jp-avatar">A</span><input className="jp-wide-input" placeholder="Add a thoughtful comment…"/><ActionButton primary>Post</ActionButton></div>
            <div className="jp-comment-list">{['Rohit Kumar','Priya Sharma','Jembee Edu','Anita Verma'].map((name,i)=><article key={name}><span className="jp-comment-avatar">{name[0]}</span><div><b>{name}<small> · {i+1} days ago</small></b><p>{['Very helpful video! Clear explanation.','Please explain the next chapter too.','Thank you for learning with Jembee Play.','This made the topic easy to understand.'][i]}</p><footer><button>♡ {256-i*37}</button><button>Reply</button><button>•••</button></footer></div></article>)}</div>
          </> : slug==='watch-history' ? <>
            <div className="jp-history-toolbar"><span>Recently watched · Sorted by date</span><ActionButton>Clear history</ActionButton></div>
            {['Today','Yesterday','Earlier this week'].map((day,d)=><section className="jp-history-group" key={day}><SectionTitle>{day}</SectionTitle>{[0,1].map(i=><VideoCard key={`${day}-${i}`} index={d*2+i} compact/>)}</section>)}
          </> : slug==='following-followers' || slug==='subscriptions' ? <>
            <div className="jp-filter-row"><button className="selected">All creators</button><button>Recently active</button><button>Courses</button></div>
            <div className="jp-channel-list">{['Jembee Edu','Science Hub','Maths Easy','Study IQ','English Zone'].map((name,i)=><article key={name}><span className="jp-channel-avatar">{name[0]}</span><div><b>{name}</b><small>{['1.8M','860K','420K','350K','120K'][i]} followers · Videos and lessons</small></div><ActionButton>{slug==='subscriptions'?'Subscribed':tab===0?'Following':'Follow'}</ActionButton></article>)}</div>
          </> : slug==='playlists' ? <>
            <div className="jp-playlist-toolbar"><span>4 playlists · Your collections</span><ActionButton primary>Create playlist +</ActionButton></div>
            <div className="jp-playlist-grid">{['My Learning','Revision','Exam Preparation','Favorites'].map((x,i)=><article key={x}><div className={`jp-playlist-cover cover-${i}`}><Play fill="currentColor"/></div><b>{x}</b><small>{[12,8,24,6][i]} videos · Updated recently</small><button>Open playlist →</button></article>)}</div>
          </> : slug==='watch-later' || slug==='saved-liked' || slug==='manage-videos' || slug==='downloads' ? <>
            {slug==='downloads' && <div className="jp-storage-card"><b>Offline storage</b><span>1.4 GB of 4 GB used</span><i><span/></i></div>}
            {slug==='manage-videos' && <div className="jp-tabs">{['All videos','Published','Drafts','In review'].map((x,i)=><button key={x} onClick={()=>setTab(i)} className={tab===i?'active':''}>{x}</button>)}</div>}
            <div className="jp-library-list">{[0,1,2,3].map(i=><article key={i}><VideoCard index={i} compact/><div className="jp-library-status"><b>{slug==='downloads'?'Downloaded':slug==='manage-videos'?['Published','In review','Draft','Published'][i]:'Saved'}</b><small>{slug==='downloads'?'120 MB · Available offline':slug==='manage-videos'?'Updated recently':'Added '+(i+1)+' days ago'}</small></div><button aria-label="More options">•••</button></article>)}</div>
          </> : slug==='notifications' ? <div className="jp-notification-list">{['Your video is approved','New comment on your video','You have a new follower','Reward points added','New lesson is available'].map((x,i)=><article key={x}><span>{['✓','✉','♙','★','▶'][i]}</span><div><b>{x}</b><small>{i+1} hour ago · Jembee Play</small></div><i/></article>)}</div> : slug==='help-center' ? <>
            <div className="jp-search-line"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search help articles and FAQs"/></div>
            <div className="jp-help-grid">{['Account & login','Uploading videos','Earnings & payments','Learning / School','Privacy & safety','App & device support'].map((x,i)=><button key={x}><span>{['♙','↑','₹','▤','✓','▣'][i]}</span><b>{x}</b><small>Browse help articles</small></button>)}</div>
            <SectionTitle>Popular questions</SectionTitle><DataRows rows={['How do I upload a video?','How can I update my profile?','Where can I see my earnings?']} icon="?"/>
          </> : slug==='referral-share' || slug==='rewards-points' ? <>
            <div className="jp-referral-card"><small>{slug==='referral-share'?'YOUR REFERRAL LINK':'AVAILABLE REWARD POINTS'}</small><b>{slug==='referral-share'?'jembeeplay.app/ref/AB12':'1,250 points'}</b><ActionButton primary>{slug==='referral-share'?'Copy link':'View reward rules'}</ActionButton></div>
            <SectionTitle>{slug==='referral-share'?'Recent share activity':'Points ledger'}</SectionTitle><DataRows rows={slug==='referral-share'?['Class 7 Maths shared','Science in Daily Life shared','English Tenses shared']:['Learning activity +100','Approved referral +250','Weekly learning streak +50']} icon="✓"/>
          </> : <DataRows rows={page.sections.concat(page.sections).slice(0,8)} icon="›"/>}
        </>}
        {!isPlayer && !isShorts && !isLearning && !isDashboard && !isProfile && !isReview && !isForm && !isList && !['tv-search','tv-settings','tv-login','tv-my-list'].includes(slug) && <>
          <SectionTitle>{page.sections[0] || 'Overview'}</SectionTitle><div className="jp-card-grid">{rows.map((r,i)=><article className="jp-content-card" key={r.label}><div className="jp-card-art"><img src={art[i%4]} alt=""/><span className="jp-card-play"><Play size={16}/></span></div><div className="jp-card-copy"><b>{r.label}</b><small>{r.count} items · Preview content</small></div><ChevronRight size={16}/></article>)}</div>
        </>}
        {page.actions.length>0 && <section className="jp-section jp-action-section"><SectionTitle>Quick actions</SectionTitle><div className="jp-action-grid">{page.actions.map((action,i)=><button key={action} onClick={()=>setSelected(i)} className={selected===i?'chosen':''}>{action}</button>)}</div></section>}
      </main>
    </div>
    {device==='mobile' && <footer className="jp-bottomnav">{([{label:'Home',Icon:Home},{label:'Explore',Icon:Search},{label:'Learning',Icon:GraduationCap},{label:'My List',Icon:ListVideo},{label:'Profile',Icon:UserRound}] as const).map(({label,Icon})=><span key={label}><Icon size={17}/><small>{label}</small></span>)}</footer>}
    {isTv && <div className="jp-tv-hint">Use remote: ↑ ↓ ← → to navigate · OK to select · Back to return</div>}
  </div>;
}

export default function DesignPreview({ page, allPages }: { page: DesignPage; allPages: DesignPage[] }) {
  const [device,setDevice] = useState<Device>('desktop');
  const siblings = allPages.filter(p=>p.category===page.category);
  const devices: Device[] = page.tv ? ['mobile','desktop','tv'] : ['mobile','desktop'];
  return <div className="jp-design-wrap">
    <div className="jp-design-top"><Link href="/ui-design"><ArrowLeft size={16}/> All UI pages</Link><span>DESIGN PREVIEW · SAMPLE DATA ONLY</span></div>
    <div className="jp-design-heading"><div><div className="jp-eyebrow">{page.category}</div><h1>{page.title}</h1><p>{page.description}</p></div><div className="jp-device-switch">{devices.map(d=><button key={d} className={device===d?'active':''} onClick={()=>setDevice(d)}>{d==='mobile'?<Smartphone size={16}/>:d==='desktop'?<Monitor size={16}/>:<Tv size={16}/>}<span>{d==='mobile'?'Mobile':d==='desktop'?'Desktop':'Android TV'}</span></button>)}</div></div>
    <div className={`jp-preview-stage stage-${device}`}><ScreenContent key={`${page.slug}-${device}`} page={page} device={device}/></div>
    <div className="jp-design-foot"><div><b>Other {page.category} screens</b><span>Switch to another page in this design set.</span></div><div className="jp-sibling-links">{siblings.filter(p=>p.slug!==page.slug).slice(0,8).map(p=><Link key={p.slug} href={`/ui-design/${p.slug}`}>{p.title}<ChevronRight size={14}/></Link>)}</div></div>
  </div>;
}
