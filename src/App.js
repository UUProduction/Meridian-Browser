import React, { useState, useEffect, useRef, useCallback } from 'react';

// ── Icons (inline SVG components, zero dependencies) ──────────────────────────
const Icon = ({ d, size = 16, strokeWidth = 1.8, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const icons = {
  back:    'M15 18l-6-6 6-6',
  forward: 'M9 18l6-6-6-6',
  reload:  'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15',
  stop:    'M18 6L6 18M6 6l12 12',
  home:    'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',
  lock:    'M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM17 11V7a5 5 0 00-10 0v4',
  unlock:  'M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM17 11V7a5 5 0 00-9.9-1',
  tab:     'M12 5v14M5 12h14',
  close:   'M18 6L6 18M6 6l12 12',
  moon:    'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z',
  wake:    'M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 6a6 6 0 100 12A6 6 0 0012 6z',
  menu:    'M3 12h18M3 6h18M3 18h18',
  star:    'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  download:'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3',
  settings:'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z',
};

// ── Tab Component ─────────────────────────────────────────────────────────────
const Tab = ({ tab, isActive, onActivate, onClose }) => (
  <div
    onClick={onActivate}
    className={`
      flex items-center gap-2 px-3 py-1.5 rounded-t-md cursor-pointer
      min-w-[120px] max-w-[200px] group relative select-none
      ${isActive ? 'tab-active text-blue-300' : 'text-slate-400 hover:bg-white/5 hover:text-slate-300'}
    `}
    style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 500 }}
  >
    <span className="w-3 h-3 rounded-full bg-blue-400/40 flex-shrink-0" />
    <span className="truncate flex-1">{tab.title}</span>
    <button
      onClick={e => { e.stopPropagation(); onClose(); }}
      className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all p-0.5 rounded"
    >
      <Icon d={icons.close} size={11} strokeWidth={2.5} />
    </button>
  </div>
);

// ── URL Bar ───────────────────────────────────────────────────────────────────
const URLBar = ({ url, isLoading, onNavigate }) => {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(url);
  const inputRef = useRef(null);

  useEffect(() => { if (!editing) setInput(url); }, [url, editing]);

  const handleFocus = () => { setEditing(true); setTimeout(() => inputRef.current?.select(), 10); };
  const handleBlur = () => { setEditing(false); setInput(url); };
  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      let nav = input.trim();
      if (!nav.startsWith('http') && !nav.startsWith('about:')) {
        nav = nav.includes('.') ? `https://${nav}` : `https://www.google.com/search?q=${encodeURIComponent(nav)}`;
      }
      onNavigate(nav);
      inputRef.current?.blur();
    }
    if (e.key === 'Escape') { setEditing(false); setInput(url); inputRef.current?.blur(); }
  };

  const isSecure = url.startsWith('https://');
  const displayUrl = editing ? input : url;

  return (
    <div className="url-bar-glow flex items-center gap-2 bg-[#0f1117] border border-[#2a2f47] rounded-lg px-3 py-1.5 flex-1 mx-2 transition-all">
      <button className={`flex-shrink-0 ${isSecure ? 'text-emerald-400' : 'text-amber-400'}`}>
        <Icon d={isSecure ? icons.lock : icons.unlock} size={13} strokeWidth={2} />
      </button>
      <input
        ref={inputRef}
        value={displayUrl}
        onChange={e => setInput(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-transparent text-slate-200 text-xs outline-none min-w-0"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
        spellCheck={false}
      />
      {isLoading && (
        <div className="flex-shrink-0 w-3 h-3 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
      )}
    </div>
  );
};

// ── Deep Sleep Overlay ────────────────────────────────────────────────────────
const DeepSleepOverlay = ({ secondsLeft, onWake }) => (
  <div
    className="deep-sleep-overlay fixed inset-0 z-50 flex flex-col items-center justify-center"
    style={{ background: 'rgba(10, 11, 18, 0.92)', backdropFilter: 'blur(12px)' }}
    onMouseMove={onWake}
    onClick={onWake}
  >
    {/* Pulsing orb */}
    <div className="relative mb-8">
      <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center"
        style={{ animation: 'pulse-ring 3s ease-in-out infinite' }}>
        <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
          <Icon d={icons.moon} size={32} className="text-blue-300" strokeWidth={1.2} />
        </div>
      </div>
    </div>

    <p className="text-slate-300 text-lg font-light mb-1" style={{ fontFamily: "'DM Sans'" }}>
      Deep Sleep Mode
    </p>
    <p className="text-slate-500 text-sm mb-8" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      No activity detected
    </p>

    {/* Countdown */}
    {secondsLeft !== null && (
      <div className="mb-6 text-center">
        <p className="text-slate-400 text-xs mb-2">Auto-closing in</p>
        <div className="text-5xl font-thin text-blue-400 tabular-nums"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {secondsLeft}s
        </div>
      </div>
    )}

    {/* Drain bar */}
    <div className="w-64 h-0.5 bg-slate-800 rounded-full overflow-hidden mb-8">
      <div
        className="countdown-bar h-full bg-gradient-to-r from-blue-500 to-blue-300 rounded-full"
        style={{ animationDuration: `${secondsLeft}s` }}
      />
    </div>

    <button
      onClick={onWake}
      className="flex items-center gap-2 px-5 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded-lg text-blue-300 text-sm transition-all"
    >
      <Icon d={icons.wake} size={15} />
      Move mouse or click to wake
    </button>

    <p className="mt-4 text-slate-600 text-xs">
      window.close() will be called if not dismissed
    </p>
  </div>
);

// ── Main App ──────────────────────────────────────────────────────────────────
const STALE_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes
const SLEEP_COUNTDOWN_S = 30;           // show overlay, then close after 30s

const HOME_URL = 'about:newtab';

const makeTab = (id, url = HOME_URL) => ({
  id,
  url,
  title: url === HOME_URL ? 'New Tab' : new URL(url.startsWith('http') ? url : `https://x.com`).hostname,
  canBack: false,
  canForward: false,
});

export default function App() {
  const [tabs, setTabs] = useState([makeTab(1)]);
  const [activeTab, setActiveTab] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [iframeUrl, setIframeUrl] = useState(HOME_URL);
  const [deepSleep, setDeepSleep] = useState(false);
  const [countdown, setCountdown] = useState(null);

  const staleTimer   = useRef(null);
  const closeTimer   = useRef(null);
  const countdownRef = useRef(null);
  const nextTabId    = useRef(2);
  const iframeRef    = useRef(null);

  // ── Active tab data ─────────────────────────────────────────────────────────
  const currentTab = tabs.find(t => t.id === activeTab) || tabs[0];

  // ── Stale / Deep Sleep logic ────────────────────────────────────────────────
  const triggerClose = useCallback(() => {
    // window.close() only works for windows opened by script.
    // As a PWA standalone, this gracefully shows a final message then tries.
    try { window.close(); } catch (_) {}
    // Fallback: blank the page (user sees the shell is "closed")
    document.title = 'Closed — Meridian';
    setIframeUrl('about:blank');
    setTabs([]);
  }, []);

  const startCloseCountdown = useCallback(() => {
    let s = SLEEP_COUNTDOWN_S;
    setCountdown(s);
    countdownRef.current = setInterval(() => {
      s--;
      setCountdown(s);
      if (s <= 0) {
        clearInterval(countdownRef.current);
        triggerClose();
      }
    }, 1000);
  }, [triggerClose]);

  const enterDeepSleep = useCallback(() => {
    setDeepSleep(true);
    startCloseCountdown();
  }, [startCloseCountdown]);

  const resetStaleTimer = useCallback(() => {
    clearTimeout(staleTimer.current);
    clearTimeout(closeTimer.current);
    clearInterval(countdownRef.current);

    if (deepSleep) {
      setDeepSleep(false);
      setCountdown(null);
    }

    staleTimer.current = setTimeout(enterDeepSleep, STALE_TIMEOUT_MS);
  }, [deepSleep, enterDeepSleep]);

  // Boot the timer once
  useEffect(() => {
    staleTimer.current = setTimeout(enterDeepSleep, STALE_TIMEOUT_MS);
    return () => {
      clearTimeout(staleTimer.current);
      clearInterval(countdownRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Tab actions ─────────────────────────────────────────────────────────────
  const addTab = () => {
    const id = nextTabId.current++;
    setTabs(prev => [...prev, makeTab(id)]);
    setActiveTab(id);
    setIframeUrl(HOME_URL);
  };

  const closeTab = id => {
    setTabs(prev => {
      const remaining = prev.filter(t => t.id !== id);
      if (remaining.length === 0) { triggerClose(); return prev; }
      if (activeTab === id) {
        const idx = prev.findIndex(t => t.id === id);
        const next = remaining[Math.max(0, idx - 1)];
        setActiveTab(next.id);
        setIframeUrl(next.url);
      }
      return remaining;
    });
  };

  const activateTab = id => {
    const tab = tabs.find(t => t.id === id);
    if (tab) { setActiveTab(id); setIframeUrl(tab.url); }
  };

  // ── Navigation ──────────────────────────────────────────────────────────────
  const navigate = url => {
    resetStaleTimer();
    setIframeUrl(url);
    setIsLoading(true);
    setTabs(prev => prev.map(t =>
      t.id === activeTab
        ? { ...t, url, title: url === HOME_URL ? 'New Tab' : (url.replace(/^https?:\/\//, '').split('/')[0]) }
        : t
    ));
    // Simulate load (iframes from external domains block onLoad events)
    setTimeout(() => setIsLoading(false), 1200);
  };

  const handleHome = () => navigate(HOME_URL);
  const handleReload = () => { navigate(iframeUrl); };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen w-screen bg-[#0f1117]"
      onMouseMove={deepSleep ? resetStaleTimer : undefined}
      onClick={deepSleep ? resetStaleTimer : undefined}>

      {/* ── Deep Sleep Overlay ───────────────────────────────────────────── */}
      {deepSleep && (
        <DeepSleepOverlay
          secondsLeft={countdown}
          onWake={resetStaleTimer}
        />
      )}

      {/* ── Tab Bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-end gap-0.5 px-2 pt-2 bg-[#12141f] border-b border-[#1e2235] select-none">
        {tabs.map(tab => (
          <Tab
            key={tab.id}
            tab={tab}
            isActive={tab.id === activeTab}
            onActivate={() => activateTab(tab.id)}
            onClose={() => closeTab(tab.id)}
          />
        ))}
        <button
          onClick={addTab}
          className="mb-0.5 ml-1 p-1.5 rounded text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all"
        >
          <Icon d={icons.tab} size={14} strokeWidth={2} />
        </button>

        {/* Spacer + window controls (cosmetic for standalone PWA feel) */}
        <div className="flex-1" />
        <div className="flex items-center gap-3 mb-1.5 mr-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57] hover:opacity-80 cursor-pointer transition-opacity" onClick={triggerClose} title="Close" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e] hover:opacity-80 cursor-pointer transition-opacity" title="Minimize" />
          <div className="w-3 h-3 rounded-full bg-[#28c840] hover:opacity-80 cursor-pointer transition-opacity" title="Maximize" />
        </div>
      </div>

      {/* ── Navigation Bar ───────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-1 px-3 py-2 bg-[#1a1d27] border-b border-[#1e2235]"
        onMouseMove={resetStaleTimer}
      >
        {/* Back */}
        <button className="nav-btn p-1.5 rounded-md text-slate-400" disabled title="Back">
          <Icon d={icons.back} size={16} />
        </button>
        {/* Forward */}
        <button className="nav-btn p-1.5 rounded-md text-slate-400" disabled title="Forward">
          <Icon d={icons.forward} size={16} />
        </button>
        {/* Reload / Stop */}
        <button className="nav-btn p-1.5 rounded-md text-slate-400" onClick={handleReload} title="Reload">
          <Icon d={isLoading ? icons.stop : icons.reload} size={16} />
        </button>
        {/* Home */}
        <button className="nav-btn p-1.5 rounded-md text-slate-400" onClick={handleHome} title="Home">
          <Icon d={icons.home} size={16} />
        </button>

        {/* URL Bar */}
        <URLBar
          url={iframeUrl}
          isLoading={isLoading}
          onNavigate={navigate}
        />

        {/* Right actions */}
        <button className="nav-btn p-1.5 rounded-md text-slate-400" title="Bookmark">
          <Icon d={icons.star} size={16} />
        </button>
        <button className="nav-btn p-1.5 rounded-md text-slate-400" title="Downloads">
          <Icon d={icons.download} size={16} />
        </button>
        <button className="nav-btn p-1.5 rounded-md text-slate-400" title="Settings">
          <Icon d={icons.settings} size={16} />
        </button>
        <button className="nav-btn p-1.5 rounded-md text-slate-400 ml-1" title="Menu">
          <Icon d={icons.menu} size={16} />
        </button>
      </div>

      {/* ── Viewport ─────────────────────────────────────────────────────── */}
      <div className="flex-1 relative bg-[#0f1117]" onMouseMove={resetStaleTimer}>
        {iframeUrl === HOME_URL ? (
          // ── New Tab Page ──────────────────────────────────────────────────
          <div className="h-full flex flex-col items-center justify-center gap-6 select-none">
            <div className="text-center">
              <div className="text-5xl font-thin text-slate-200 mb-1"
                style={{ fontFamily: "'DM Sans'", letterSpacing: '-0.03em' }}>
                Meridian
              </div>
              <div className="text-slate-500 text-sm" style={{ fontFamily: "'JetBrains Mono'" }}>
                PWA Browser Shell · v1.0
              </div>
            </div>

            {/* Search shortcut */}
            <div
              className="flex items-center gap-3 bg-[#1a1d27] border border-[#2a2f47] rounded-xl px-5 py-3 w-96 cursor-text hover:border-blue-500/40 transition-all"
              onClick={() => document.querySelector('input')?.focus()}
            >
              <Icon d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"} size={18} className="text-slate-500" />
              <span className="text-slate-500 text-sm">Search or enter address</span>
            </div>

            {/* Quick links */}
            <div className="flex gap-4 mt-2">
              {[
                { label: 'GitHub', url: 'https://github.com' },
                { label: 'Google', url: 'https://google.com' },
                { label: 'MDN',    url: 'https://developer.mozilla.org' },
                { label: 'HN',     url: 'https://news.ycombinator.com' },
              ].map(({ label, url }) => (
                <button
                  key={label}
                  onClick={() => navigate(url)}
                  className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl bg-[#1a1d27] border border-[#2a2f47] hover:border-blue-500/40 hover:bg-[#1e2235] transition-all text-slate-400 hover:text-slate-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-xs font-bold text-slate-300">
                    {label[0]}
                  </div>
                  <span className="text-xs">{label}</span>
                </button>
              ))}
            </div>

            {/* Sleep status */}
            <div className="mt-4 flex items-center gap-2 text-slate-600 text-xs"
              style={{ fontFamily: "'JetBrains Mono'" }}>
              <Icon d={icons.moon} size={12} />
              Auto-sleep in 2 min of inactivity
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={iframeUrl}
            title="browser-viewport"
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-navigation"
            onLoad={() => setIsLoading(false)}
          />
        )}
      </div>

      {/* ── Status Bar ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-0.5 bg-[#12141f] border-t border-[#1e2235]">
        <span className="text-slate-600 text-xs" style={{ fontFamily: "'JetBrains Mono'" }}>
          {isLoading ? '● Loading...' : '● Ready'}
        </span>
        <span className="text-slate-700 text-xs" style={{ fontFamily: "'JetBrains Mono'" }}>
          Meridian PWA · Stale-close: 2min
        </span>
      </div>
    </div>
  );
}
