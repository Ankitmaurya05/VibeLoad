import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowDownToLine, ArrowRight, CheckCircle2, ChevronDown, Download, Infinity, Link2, Menu, Moon, Rocket, ShieldCheck, Sparkles, Sun, Zap } from 'lucide-react';
import { classifyLink } from './media';
import './style.css';

type MediaItem = { url: string; label: string; type: string; quality?: string };
type Preview = { title?: string; thumbnail?: string; creator?: string; duration?: string };
const platforms = [
  { name:'YouTube', glyph:'▶', color:'#ff0033' },
  { name:'Instagram', glyph:'◎', color:'#df28b9' },
  { name:'TikTok', glyph:'♪', color:'#171322' },
  { name:'Facebook', glyph:'f', color:'#1877f2' },
  { name:'X (Twitter)', glyph:'𝕏', color:'#15151d' },
  { name:'Vimeo', glyph:'v', color:'#00adef' }
];

function App() {
  const [dark,setDark] = useState(false);
  const [input,setInput] = useState('');
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState('');
  const [message,setMessage] = useState('');
  const [items,setItems] = useState<MediaItem[]>([]);
  const [preview,setPreview] = useState<Preview | null>(null);
  const [chosen,setChosen] = useState(0);
  const [source,setSource] = useState('');
  const [menu,setMenu] = useState(false);
  const [openFaq,setOpenFaq] = useState(0);

  async function inspect(event?: React.FormEvent) {
    event?.preventDefault();
    setError(''); setMessage(''); setItems([]); setPreview(null); setChosen(0);
    let url: string;
    try { url = classifyLink(input).url.href; }
    catch(e) { setError(e instanceof Error ? e.message : 'Enter a valid URL.'); return; }
    setSource(url);
    setLoading(true);
    try {
      const response = await fetch('/api/inspect', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({url})});
      const data = await response.json() as {items?:MediaItem[]; preview?:Preview; message?:string; error?:string};
      if (!response.ok) throw new Error(data.error || 'Could not inspect the link.');
      setItems(data.items || []);
      setPreview(data.preview || null);
      setMessage(data.message || (data.items?.length ? 'Choose a downloadable format.' : 'No downloadable file was found.'));
    } catch(e) { setError(e instanceof Error ? e.message : 'The request failed.'); }
    finally { setLoading(false); }
  }

  function download() {
    const item = items[chosen];
    if (!item) return;
    const a = document.createElement('a');
    a.href = '/api/download?url=' + encodeURIComponent(item.url);
    a.download = '';
    document.body.appendChild(a); a.click(); a.remove();
  }

  return <div className={'vibeload '+(dark?'dark':'')}>
    <div className="glass-shell">
      <header className="site-header">
        <a href="/" className="logo"><span className="logo-gem">▶</span><span>Vibe<span>Load</span><sup>™</sup></span></a>
        <nav className={menu?'navigation expanded':'navigation'}><a href="#home">⌂ Home</a><a href="#features">Features</a><a href="#platforms">Supported Sites</a><a href="#how">How it works</a><a href="#faq">FAQ</a></nav>
        <div className="header-actions"><button className="theme-toggle" onClick={()=>setDark(!dark)} aria-label={dark?'Switch to light theme':'Switch to dark theme'}>{dark?<Sun size={18}/>:<Moon size={18}/>}<span>{dark?'Light':'Dark'}</span></button><a className="header-download" href="#download"><Download size={16}/> Download</a><button className="mobile-menu" onClick={()=>setMenu(!menu)} aria-label="Toggle menu"><Menu size={20}/></button></div>
      </header>

      <main id="home">
        <section className="hero-vibe">
          <div className="deco deco-one" aria-hidden="true">✦</div><div className="deco deco-two" aria-hidden="true">💎</div><div className="deco deco-three" aria-hidden="true">✧</div>
          <div className="floating-social left-social" aria-hidden="true"><span className="social-crown">👑</span><span className="cube youtube">▶</span><span className="orbit"/></div>
          <div className="floating-social insta-social" aria-hidden="true"><span className="cube instagram">◎</span></div>
          <div className="floating-social tiktok-social" aria-hidden="true"><span className="cube tiktok">♪</span></div>
          <div className="floating-social fb-social" aria-hidden="true"><span className="cube facebook">f</span></div>
          <div className="floating-social x-social" aria-hidden="true"><span className="cube twitter">𝕏</span></div>
          <div className="hero-center"><span className="hero-pill">🔥 All-in-One Video Downloader <Sparkles size={15}/></span>
            <h1>Download Videos<br/><span>from Anywhere</span></h1>
            <div className="hero-underline"/><h2>Fast <b>•</b> Free <b>•</b> HD Quality</h2>
            <p>Paste a public video link, choose an available format, and save the file in seconds.</p>
          </div>
          <form className="main-download-form" id="download" onSubmit={inspect}><label className="url-input"><Link2 size={25}/><input value={input} onChange={e=>setInput(e.target.value)} placeholder="Paste your video URL here..." aria-label="Video URL" required/></label><button type="submit" disabled={loading}><Rocket size={19}/>{loading?'Checking…':'Download'}<ArrowRight size={19}/></button></form>
          <div className="platform-pills" id="platforms">{platforms.map(p=><button key={p.name} onClick={()=>{document.getElementById('download')?.scrollIntoView({behavior:'smooth'});document.querySelector<HTMLInputElement>('.url-input input')?.focus()}}><span style={{background:p.color}}>{p.glyph}</span>{p.name}<ArrowRight size={14}/></button>)}</div>
          {(error || source) && <section className="download-result" aria-live="polite">
            {error && <p className="error-line" role="alert">{error}</p>}
            {source && !error && <>
              <div className="result-heading"><CheckCircle2 size={22}/><strong>{loading?'Checking video…':items.length?'Video ready — select quality':'Video inspection result'}</strong></div>
              {preview && <div className="result-preview">{preview.thumbnail && <img src={preview.thumbnail} alt="Video thumbnail" referrerPolicy="no-referrer"/>}<div><h3>{preview.title || 'Video preview'}</h3>{preview.creator && <p>{preview.creator}</p>}{preview.duration && <p>Duration: {preview.duration}</p>}</div></div>}
              {items.length>0 && <div className="quality-controls"><label htmlFor="quality">Choose an available video quality</label><select id="quality" value={chosen} onChange={e=>setChosen(Number(e.target.value))}>{items.map((item,i)=><option key={item.url+i} value={i}>{item.quality || 'Original'} · {item.label}</option>)}</select><button onClick={download} type="button"><ArrowDownToLine size={18}/> Download media file</button></div>}
              {message && <p className="result-message">{message}</p>}
            </>}
          </section>}
        </section>

        <section className="feature-grid" id="features"><article><span className="feature-icon lightning">⚡</span><h3>Fast Downloads</h3><p>Stream supported public media files directly to your device.</p></article><article><span className="feature-icon secure">🛡️</span><h3>No Registration</h3><p>Paste a link and download. No account is needed.</p></article><article><span className="feature-icon hd">HD</span><h3>Available Quality</h3><p>Choose from real media resolutions when the source provides them.</p></article><article><span className="feature-icon infinity"><Infinity size={42}/></span><h3>Free to Use</h3><p>No paid plan required. Hosting and source limits still apply.</p></article></section>

        <section className="why-panel" id="how"><h2>Why Choose VibeLoad?</h2><div className="panel-underline"/><div className="why-grid"><article><Rocket/><strong>Simple & Fast</strong><small>Paste, choose, download</small></article><article><ShieldCheck/><strong>Secure & Private</strong><small>No visitor account</small></article><article><Infinity/><strong>Multiple Sources</strong><small>Public downloadable files</small></article><article><Sparkles/><strong>Premium Design</strong><small>Easy on desktop and mobile</small></article></div></section>
        <section className="how-to"><h2>Download in 3 steps</h2><div><article><span>01</span><h3>Paste a link</h3><p>Enter a public video or direct MP4/WebM URL.</p></article><article><span>02</span><h3>Choose a format</h3><p>See verified media files and available qualities.</p></article><article><span>03</span><h3>Save the file</h3><p>Download the original file without redirecting to the source page.</p></article></div></section>
        <section className="faq-vibe" id="faq"><h2>Frequently asked questions</h2>{[
          ['Can I download every YouTube or social-media video?','No. Some platforms restrict media access or use protected streaming. VibeLoad downloads public, authorized files when a direct media URL is available.'],
          ['Can I select 1080p or 4K?','Only if the source provides that quality as a downloadable file. VibeLoad does not upscale or invent formats.'],
          ['Does the Download button redirect me?','For supported files, VibeLoad streams the media through its Cloudflare Worker with a download attachment header.'],
          ['Is it really free?','Yes, no account or payment is required. Free Cloudflare hosting has operational limits.']
        ].map(([q,a],i)=><article key={q}><button onClick={()=>setOpenFaq(openFaq===i?-1:i)}>{q}<ChevronDown size={18}/></button>{openFaq===i&&<p>{a}</p>}</article>)}</section>
      </main>
      <footer><div className="footer-row"><span>💜 VibeLoad · Download. Watch. Enjoy!</span><span>Independent video utility</span></div><div className="footer-bottom"><span>© {new Date().getFullYear()} VibeLoad. All rights reserved.</span><div><a href="/privacy.html">Privacy Policy</a><a href="/terms.html">Terms of Service</a><a href="/copyright.html">Copyright</a></div></div></footer>
    </div>
    <div className="theme-caption"><Sun size={17}/> Light Theme (Default) <span>│</span> <Moon size={17}/> Dark Theme (Optional)</div>
  </div>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
