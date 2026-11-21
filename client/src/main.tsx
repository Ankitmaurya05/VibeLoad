import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowDownToLine, ArrowRight, Check, ChevronDown, CircleHelp, CloudDownload, FileVideo, Link2, LockKeyhole, Moon, ShieldCheck, Sun, Upload, Zap } from 'lucide-react';
import { classifyLink, type LinkClassification } from './media';
import './style.css';

const platforms = [
  { name: 'YouTube', icon: '▶', color: '#ff0033', note: 'Use the platform’s official download or creator-provided file.' },
  { name: 'Instagram', icon: '◎', color: '#d9469b', note: 'Save your own content using Instagram’s download/export tools.' },
  { name: 'TikTok', icon: '♪', color: '#161616', note: 'Use TikTok’s in-app Save video option when the creator allows it.' },
  { name: 'Facebook', icon: 'f', color: '#1877f2', note: 'Use Facebook’s built-in save or download options where available.' },
  { name: 'X / Twitter', icon: '𝕏', color: '#161616', note: 'Use the post owner’s original media link or authorized export.' },
  { name: 'Vimeo', icon: 'v', color: '#1ab7ea', note: 'Creators can enable downloads on Vimeo video pages.' },
  { name: 'Pinterest', icon: 'p', color: '#bd081c', note: 'Use the pin owner’s source and permitted download options.' },
  { name: 'Threads', icon: '@', color: '#161616', note: 'Use the author’s original file or supported in-app options.' },
];

function App() {
  const [dark, setDark] = useState(false);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<LinkClassification | null>(null);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showFaq, setShowFaq] = useState<number | null>(0);
  const [downloadState, setDownloadState] = useState('');
  const [fallbackHref, setFallbackHref] = useState('');
  const [foundMedia, setFoundMedia] = useState<Array<{url:string;label:string;type:string}>>([]);

  const statusText = useMemo(() => {
    if (!result) return '';
    if (result.kind === 'direct-media') return `Direct ${result.extension.toUpperCase()} media link detected`;
    if (result.kind === 'platform') return `${result.platform} link detected`;
    return 'Webpage link detected. It is not a direct media file.';
  }, [result]);

  function checkLink(value = input) {
    setError(''); setResult(null); setDownloadState(''); setFallbackHref(''); setFoundMedia([]);
    try {
      const classified = classifyLink(value);
      setResult(classified);
      setChecking(true);
      fetch('/api/inspect', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({url:classified.url.href})})
        .then(async response => {
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || 'Source inspection failed.');
          setFoundMedia(data.items || []);
          setDownloadState(data.message || '');
        })
        .catch(e => setDownloadState(e instanceof Error ? e.message : 'Inspection unavailable.'))
        .finally(() => setChecking(false));
    } catch (e) { setError(e instanceof Error ? e.message : 'Please check the link and try again.'); }
  }

  function downloadFile(mediaUrl: string) {
    const a = document.createElement('a');
    a.href = '/api/download?url=' + encodeURIComponent(mediaUrl);
    a.download = '';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setDownloadState('Download requested. The source must allow access to the media.');
  }

  function downloadDirect() {
    if (result?.kind === 'direct-media') downloadFile(result.url.href);
  }

  async function copyLink() {
    try { await navigator.clipboard.writeText(input); setCopied(true); window.setTimeout(() => setCopied(false), 1600); }
    catch { setError('Clipboard access is unavailable in this browser.'); }
  }

  return <div className={dark ? 'app dark' : 'app'}>
    <header className="topbar"><a className="brand" href="/"><span className="brand-mark"><Zap size={20} fill="currentColor" /></span><span>vibe<span>load</span></span></a>
      <nav className="nav"><a href="#how">How it works</a><a href="#platforms">Platforms</a><a href="#faq">FAQ</a></nav>
      <button className="theme-btn" onClick={() => setDark(!dark)} aria-label="Toggle theme">{dark ? <Sun size={18}/> : <Moon size={18}/>}<span>{dark ? 'Light' : 'Dark'} mode</span></button>
    </header>
    <main>
      <section className="hero">
        <div className="hero-copy"><div className="eyebrow"><span className="live-dot"/> SIMPLE. QUICK. NO ACCOUNT.</div>
          <h1>Download a video<br/><span className="gradient-text">from a direct URL.</span></h1>
          <p className="hero-sub">Check a video link and save direct media files when the source allows it. No signup, no clutter, just a clear answer.</p>
          <div className="trust-row"><span><ShieldCheck size={15}/> No account needed</span><span><LockKeyhole size={15}/> No account required</span></div>
        </div>
        <div className="orb-scene" aria-hidden="true"><div className="orb-ring ring-one"/><div className="orb-ring ring-two"/><div className="orb-core"><CloudDownload size={66} strokeWidth={1.4}/></div><span className="float-chip chip-a"><FileVideo size={16}/> MP4</span><span className="float-chip chip-b"><Zap size={15}/> Fast</span><span className="float-chip chip-c"><Check size={15}/> Ready</span></div>
      </section>

      <section className="tool-card" aria-label="Video link checker">
        <div className="tool-head"><div><span className="tool-kicker">THE VIBELOAD TOOL</span><h2>Paste your video link</h2><p>Direct media links and publicly downloadable files exposed by webpages.</p></div><div className="tool-icon"><Link2 size={22}/></div></div>
        <form className="url-form" onSubmit={e => { e.preventDefault(); checkLink(); }}>
          <div className="input-wrap"><Link2 size={19}/><input value={input} onChange={e => setInput(e.target.value)} placeholder="https://example.com/video.mp4" aria-label="Video URL"/><button type="button" className="paste-btn" onClick={async()=>{try{setInput(await navigator.clipboard.readText())}catch{setError('Clipboard access is unavailable. Paste with Ctrl+V instead.')}}}>Paste</button></div>
          <button className="check-btn" type="submit">Check link <ArrowRight size={18}/></button>
        </form>
        {error && <p className="error-msg" role="alert">{error}</p>}
        {result && <div className="result-box" aria-live="polite"><div className="result-title"><span className="result-check"><Check size={17}/></span><div><strong>{statusText}</strong><small>{result.url.hostname}</small></div></div>
          {result.kind === 'direct-media' ? <><p className="result-note">This URL looks like a direct media file. The source must still allow browser access and downloading.</p><button className="download-btn" onClick={downloadDirect} disabled={checking}>{checking ? 'Checking source…' : <><ArrowDownToLine size={18}/> Download {result.extension.toUpperCase()}</>}</button></> : result.kind === 'platform' ? <><p className="result-note">{platforms.find(p => p.name.toLowerCase().startsWith(result.platform.toLowerCase()))?.note || 'Use the platform’s own permitted download options.'}</p><p className="result-note">VibeLoad will list a download button above when the platform publicly exposes a direct media file.</p></> : <><p className="result-note">A webpage URL is different from a direct video file URL. VibeLoad does not scrape protected streams or bypass site restrictions. If you own the video, use the site’s export/download feature or paste its direct media-file URL.</p><p className="result-note">Public downloadable media found on this page will appear above.</p></>}
          {checking && <p className="download-state">Inspecting public media…</p>}
          {foundMedia.length > 0 && <div className="download-results"><strong>Available media files</strong>{foundMedia.map((item,i)=><button key={item.url+i} className="download-btn" onClick={()=>downloadFile(item.url)}><ArrowDownToLine size={18}/> Download {item.label}</button>)}</div>}
          {downloadState && <p className="download-state">{downloadState}</p>}
          {fallbackHref && <a className="source-btn" href={fallbackHref} target="_blank" rel="noreferrer">Open original media URL <ArrowRight size={16}/></a>}
          <button className="copy-link" onClick={copyLink}>{copied ? <Check size={14}/> : <Upload size={14}/>} {copied ? 'Copied' : 'Copy entered link'}</button>
        </div>}
        <div className="tool-foot"><span><ShieldCheck size={15}/> Private by design</span><span><Zap size={15}/> No registration</span><span><CircleHelp size={15}/> Source permissions apply</span></div>
      </section>

      <section className="supported" id="platforms"><div className="section-intro"><span className="section-label">LINK TYPES</span><h2>Know what works.</h2><p>Different sites deliver media in different ways. Here’s what VibeLoad can check and what to do next.</p></div>
        <div className="platform-grid">{platforms.map(p=><article className="platform-card" key={p.name}><span className="platform-logo" style={{'--platform-color':p.color} as React.CSSProperties}>{p.icon}</span><div><strong>{p.name}</strong><small>Official download options</small></div><ArrowRight size={16}/></article>)}</div>
        <p className="platform-disclaimer">Platform logos and names are used only to identify link types. VibeLoad is independent and is not affiliated with these services.</p>
      </section>

      <section className="how-section" id="how"><div className="section-intro"><span className="section-label">THREE QUICK STEPS</span><h2>Keep it simple.</h2></div><div className="steps"><article><span className="step-num">01</span><div className="step-icon"><Link2/></div><h3>Paste a link</h3><p>Drop in a public URL. VibeLoad checks the address format and recognizes common media file types.</p></article><article><span className="step-num">02</span><div className="step-icon"><ShieldCheck/></div><h3>Check the source</h3><p>We explain whether it looks like a direct file or a platform page, and what the source allows.</p></article><article><span className="step-num">03</span><div className="step-icon"><ArrowDownToLine/></div><h3>Save what’s available</h3><p>Save public media files using the download buttons when the source permits access.</p></article></div></section>

      <section className="faq-section" id="faq"><div className="section-intro"><span className="section-label">GOOD TO KNOW</span><h2>Frequently asked.</h2></div><div className="faq-list">{[
        ['Can VibeLoad download every video from every website?','No. A webpage link is not the same as a direct media file. Many platforms use segmented streams, signed URLs, authentication or DRM. VibeLoad only downloads direct files that the source makes accessible and does not bypass protections.'],
        ['Why does my social media link not download?','Social platforms control how their media can be accessed. Use their official save/export features or a direct file supplied by the content owner.'],
        ['Which direct file formats are supported?','VibeLoad recognizes MP4, WebM, MOV, M4V, OGV, MP3, M4A, WAV and OGG links. The actual download still depends on the server response and browser permissions.'],
        ['Are my links stored on a server?','No. URLs are sent to our Cloudflare Worker to inspect public media links and stream downloads. We do not require user accounts.'],
        ['Can I use it on mobile?','Yes. Yes. The responsive website uses a Cloudflare Worker to inspect and stream supported public files.']
      ].map(([q,a],i)=><article className={'faq-item '+(showFaq===i?'open':'')} key={q}><button onClick={()=>setShowFaq(showFaq===i?null:i)}><span>{q}</span><ChevronDown size={18}/></button>{showFaq===i&&<p>{a}</p>}</article>)}</div></section>

      <section className="cta-band"><div><span className="section-label">READY WHEN YOU ARE</span><h2>Got a direct media link?</h2><p>Check it in seconds. No account. No complicated setup.</p></div><a href="#" onClick={e=>{e.preventDefault();window.scrollTo({top:0,behavior:'smooth'})}} className="cta-btn">Check a link <ArrowRight size={17}/></a></section>
    </main>
    <footer><a className="brand footer-brand" href="/"><span className="brand-mark"><Zap size={18} fill="currentColor"/></span><span>vibe<span>load</span></span></a><p>Useful tools. Honest limits. Your media stays yours.</p><div className="footer-links"><a href="/privacy.html">Privacy</a><a href="/terms.html">Terms</a><a href="/copyright.html">Copyright</a><a href="/guides/direct-video-url.html">Direct URL guide</a><a href="/guides/mp4-vs-webm.html">MP4 vs WebM</a><a href="/guides/social-video-downloads.html">Social media guide</a><a href="mailto:hello@YOUR-DOMAIN.example">Contact</a></div><small>© {new Date().getFullYear()} VibeLoad. Independent utility; not affiliated with third-party platforms.</small></footer>
  </div>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
