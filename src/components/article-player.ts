export type PlayerCue = {
  nodeId: string;
  start: number;
  end: number;
  text: string;
  chunks?: string[];
  highlight?: 'block' | 'words';
  blockId?: string;
};

function cueHighlight(cue: PlayerCue): 'block' | 'words' {
  if (cue.highlight === 'block' || cue.highlight === 'words') return cue.highlight;
  const trimmed = cue.text.trim();
  if (
    /^(Start of list\.|End of list\.|Next\.|Quote\.|A table\.|Code listing\b)/i.test(trimmed) ||
    /^Definition of /.test(trimmed)
  ) {
    return 'block';
  }
  return 'words';
}

function cueIndexAt(cues: PlayerCue[], time: number): number {
  if (cues.length === 0) return -1;
  let lo = 0;
  let hi = cues.length - 1;
  let ans = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (cues[mid].start <= time) {
      ans = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return ans;
}

function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  if (!voices.length) return null;
  return (
    voices.find((v) => v.lang.toLowerCase().startsWith('en') && v.default) ||
    voices.find((v) => v.lang.toLowerCase().startsWith('en')) ||
    voices[0]
  );
}

function waitForVoice(): Promise<SpeechSynthesisVoice | null> {
  if (!window.speechSynthesis) return Promise.resolve(null);
  const existing = pickVoice();
  if (existing) return Promise.resolve(existing);
  return new Promise((resolve) => {
    const finish = () => {
      window.speechSynthesis?.removeEventListener('voiceschanged', finish);
      resolve(pickVoice());
    };
    window.speechSynthesis.addEventListener('voiceschanged', finish);
    window.setTimeout(finish, 500);
  });
}

function isBenignSpeechError(error: string): boolean {
  return error === 'canceled' || error === 'interrupted' || error === 'interrupted-by-new-speech';
}

function spokenPrefixLength(text: string, chunks?: string[]): number {
  if (chunks?.length) {
    const body = chunks.join(' ');
    if (text.endsWith(body)) return text.length - body.length;
  }
  const match = text.match(
    /^(Definition of|Start of list\.|End of list\.|Next\.|Quote\.|Section [\d.]+\.|Code listing(?: in \S+)?\.|\d+\.)\s/,
  );
  return match ? match[0].length : 0;
}

function chunkIndexFromChar(chunks: string[], charIndex: number, prefixLen: number): number {
  const rel = Math.max(0, charIndex - prefixLen);
  let pos = 0;
  for (let i = 0; i < chunks.length; i++) {
    const size = chunks[i].length + (i < chunks.length - 1 ? 1 : 0);
    if (rel < pos + size) return i;
    pos += size;
  }
  return Math.max(0, chunks.length - 1);
}

function wordIndexFromChar(text: string, charIndex: number): number {
  const idx = Math.max(0, Math.min(text.length, charIndex));
  const before = text.slice(0, idx);
  if (!before.trim()) return 0;
  return before.trim().split(/\s+/).length - (/\s$/.test(before) ? 0 : 1);
}

function isKatexLayout(el: Element): boolean {
  return [...el.classList].some((cls) =>
    ['strut', 'pstrut', 'vlist-s', 'newline', 'hide-tail', 'mspace'].includes(cls),
  );
}

function markKatexAtoms(root: HTMLElement, belongsHere: (node: Node) => boolean): void {
  root.querySelectorAll<HTMLElement>('.katex-html').forEach((html) => {
    if (html.closest('.katex-mathml') || !belongsHere(html)) return;
    const walker = document.createTreeWalker(html, NodeFilter.SHOW_ELEMENT, {
      acceptNode(node) {
        const el = node as HTMLElement;
        if (el.closest('.katex-mathml')) return NodeFilter.FILTER_REJECT;
        if (isKatexLayout(el)) return NodeFilter.FILTER_REJECT;
        const kids = [...el.children].filter((child) => !isKatexLayout(child));
        if (kids.length) return NodeFilter.FILTER_SKIP;
        const text = (el.textContent ?? '').replace(/[\u200b\u2060]/g, '').trim();
        if (!text) return NodeFilter.FILTER_SKIP;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    while (walker.nextNode()) (walker.currentNode as HTMLElement).classList.add('ir-word');
  });
}

function collectWords(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>('.ir-word')].filter((el) => {
    const owner = el.closest('[data-ir-id]');
    return owner === root;
  });
}

function wrapWords(root: HTMLElement): HTMLElement[] {
  if (root.dataset.irWords === '1') return collectWords(root);

  const belongsHere = (node: Node) => {
    const el = node instanceof Element ? node : node.parentElement;
    if (!el) return false;
    const owner = el.closest('[data-ir-id]');
    return owner === root;
  };

  markKatexAtoms(root, belongsHere);

  root.querySelectorAll('code').forEach((code) => {
    if (code.closest('pre')) return;
    if (!belongsHere(code) || code.classList.contains('ir-word')) return;
    code.classList.add('ir-word');
  });

  const skip = '.katex, .katex-html, .katex-mathml, .katex-display, .katex-error, svg, button, a, .ir-word';
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = (node as Text).parentElement;
      if (!parent || !belongsHere(node)) return NodeFilter.FILTER_REJECT;
      if (parent.closest(skip)) return NodeFilter.FILTER_REJECT;
      if (!node.textContent?.trim()) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const texts: Text[] = [];
  while (walker.nextNode()) texts.push(walker.currentNode as Text);
  for (const textNode of texts) {
    const parts = (textNode.textContent ?? '').split(/(\s+)/);
    const frag = document.createDocumentFragment();
    for (const part of parts) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        frag.append(part);
        continue;
      }
      const span = document.createElement('span');
      span.className = 'ir-word';
      span.textContent = part;
      frag.append(span);
    }
    textNode.parentNode?.replaceChild(frag, textNode);
  }
  root.dataset.irWords = '1';
  return collectWords(root);
}

const RATE = 1;

function scrollRatio(): number {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (max <= 0) return 0;
  return Math.min(1, Math.max(0, window.scrollY / max));
}

export function initArticlePlayer(root: HTMLElement): void {
  const raw = root.querySelector<HTMLTextAreaElement>('[data-player-cues]');
  let cues: PlayerCue[] = [];
  try {
    cues = raw?.value ? (JSON.parse(raw.value) as PlayerCue[]) : [];
  } catch {
    cues = [];
  }
  if (!cues.length) return;

  const audioUrl = root.dataset.audioUrl || '';
  const videoUrl = root.dataset.videoUrl || '';
  const duration = cues[cues.length - 1]?.end ?? 0;

  const playBtn = root.querySelector<HTMLButtonElement>('[data-player-play]')!;
  const videoWrap = root.querySelector<HTMLElement>('[data-player-video]');
  const videoEl = root.querySelector<HTMLVideoElement>('video');
  const audioEl = root.querySelector<HTMLAudioElement>('audio');

  if (audioUrl && audioEl) audioEl.src = audioUrl;
  if (videoUrl && videoEl) videoEl.src = videoUrl;

  let playing = false;
  let programmaticScroll = false;
  let activeId = '';
  let activeKey = '';
  let raf = 0;
  let chosenVoice: SpeechSynthesisVoice | null = null;
  let resumeTimer = 0;
  let speakGen = 0;
  let wordSpans: HTMLElement[] = [];
  let activeWord: HTMLElement | null = null;
  let clockBase = 0;
  let clockStarted = 0;
  let lastSpokenIndex = -1;
  let scrollUnlock = 0;
  let lastScrollAt = 0;
  let holdUntil = -1;
  let cueWatchdog = 0;
  let activeTarget: HTMLElement | null = null;
  let lastScrollCue = -1;
  let scrollSeekQueued = false;

  const useAudio = Boolean(audioUrl && audioEl);

  function setScrollProgress() {
    const ratio = scrollRatio();
    document.documentElement.style.setProperty('--progress', `${ratio * 100}%`);
  }

  function bindMediaSession() {
    if (!('mediaSession' in navigator)) return;
    const title = root.dataset.title || document.title;
    const artist = root.dataset.artist || '';
    try {
      navigator.mediaSession.metadata = new MediaMetadata({ title, artist });
      navigator.mediaSession.setActionHandler('play', () => {
        if (!playing) void play();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        if (playing) pause();
      });
    } catch {
      /* Media Session is optional */
    }
  }

  function setPlayingUi(next: boolean) {
    playing = next;
    playBtn.setAttribute('aria-pressed', String(next));
    playBtn.setAttribute('aria-label', next ? 'Pause' : 'Play');
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.playbackState = next ? 'playing' : 'paused';
      } catch {
        /* ignore */
      }
    }
  }

  function markProgrammaticScroll() {
    programmaticScroll = true;
    if (scrollUnlock) window.clearTimeout(scrollUnlock);
    scrollUnlock = window.setTimeout(() => {
      programmaticScroll = false;
    }, 1800);
  }

  function readingBand(): { top: number; bottom: number } {
    const vh = window.innerHeight;
    return { top: vh * 0.24, bottom: vh * 0.84 };
  }

  function followInView(force = false) {
    const el = activeWord ?? activeTarget;
    if (!el || !playing) return;
    const now = performance.now();
    if (!force && now - lastScrollAt < 500) return;
    const rect = el.getBoundingClientRect();
    const { top, bottom } = readingBand();
    if (rect.top >= top && rect.bottom <= bottom) return;
    lastScrollAt = now;
    markProgrammaticScroll();
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  function clearWord() {
    activeWord?.classList.remove('ir-word-active');
    activeWord = null;
  }

  function setWord(index: number) {
    const el = wordSpans[Math.max(0, Math.min(wordSpans.length - 1, index))];
    if (!el || el === activeWord) return;
    activeWord?.classList.remove('ir-word-active');
    el.classList.add('ir-word-active');
    activeWord = el;
  }

  function highlightSpokenChar(text: string, charIndex: number, chunks?: string[]) {
    if (!wordSpans.length) return;
    const prefix = spokenPrefixLength(text, chunks);
    let index: number;
    if (chunks?.length) index = chunkIndexFromChar(chunks, charIndex, prefix);
    else index = wordIndexFromChar(text.slice(prefix), Math.max(0, charIndex - prefix));
    const count = chunks?.length || Math.max(1, text.slice(prefix).trim().split(/\s+/).filter(Boolean).length);
    if (count !== wordSpans.length && count > 1 && wordSpans.length > 1) {
      index = Math.round((index * (wordSpans.length - 1)) / (count - 1));
    }
    setWord(index);
  }

  function highlightFromCueTime(time: number) {
    const index = cueIndexAt(cues, time);
    if (index < 0) return;
    const cue = cues[index];
    const span = cue.end - cue.start;
    const t = span > 0 ? Math.min(1, Math.max(0, (time - cue.start) / span)) : 0;
    highlightSpokenChar(cue.text, Math.floor(t * Math.max(0, cue.text.length - 1)), cue.chunks);
  }

  function clearBlock() {
    document.querySelectorAll('.ir-block-active').forEach((el) => el.classList.remove('ir-block-active'));
  }

  function activate(index: number) {
    if (index < 0 || index >= cues.length) return;
    const cue = cues[index];
    const mode = cueHighlight(cue);
    const targetId = cue.blockId || cue.nodeId;
    const key = `${cue.nodeId}:${mode}:${targetId}`;
    if (key === activeKey) return;
    if (activeId) {
      document.querySelectorAll(`[data-ir-id="${CSS.escape(activeId)}"].ir-active`).forEach((el) => {
        el.classList.remove('ir-active');
      });
    }
    if (targetId !== activeId) {
      document.querySelectorAll(`[data-ir-id="${CSS.escape(targetId)}"].ir-active`).forEach((el) => {
        el.classList.remove('ir-active');
      });
    }
    clearBlock();
    clearWord();
    activeId = cue.nodeId;
    activeKey = key;
    const blockTarget = document.querySelector<HTMLElement>(`[data-ir-id="${CSS.escape(targetId)}"]`);
    const nodeTarget = document.querySelector<HTMLElement>(`[data-ir-id="${CSS.escape(cue.nodeId)}"]`);
    if (mode === 'block') {
      const target =
        nodeTarget?.tagName === 'DT'
          ? (nodeTarget.closest('dl') ?? blockTarget ?? nodeTarget)
          : (blockTarget ?? nodeTarget);
      target?.classList.add('ir-active', 'ir-block-active');
      activeTarget = target;
      wordSpans = [];
    } else {
      nodeTarget?.classList.add('ir-active');
      activeTarget = nodeTarget;
      wordSpans = nodeTarget ? wrapWords(nodeTarget) : [];
      if (wordSpans.length) setWord(0);
    }
    lastScrollCue = index;
    if (playing) followInView(true);
  }

  function currentTime(): number {
    if (useAudio && audioEl && Number.isFinite(audioEl.currentTime)) return audioEl.currentTime;
    if (playing) {
      const elapsed = ((performance.now() - clockStarted) / 1000) * RATE;
      const t = clockBase + elapsed;
      if (holdUntil >= 0) return Math.min(t, holdUntil);
      return Math.min(duration, t);
    }
    return clockBase;
  }

  function clearWatchdog() {
    if (cueWatchdog) {
      window.clearTimeout(cueWatchdog);
      cueWatchdog = 0;
    }
  }

  function advanceTo(index: number) {
    if (!playing) return;
    if (index >= cues.length) {
      pause();
      syncFromTime(duration, false);
      return;
    }
    clockBase = cues[index].start;
    clockStarted = performance.now();
    holdUntil = useAudio ? -1 : cues[index].end;
    activate(index);
    speakCue(index);
  }

  function speakCue(index: number) {
    if (useAudio || !playing) return;
    lastSpokenIndex = index;
    speakGen += 1;
    const gen = speakGen;
    clearWatchdog();
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* ignore */
    }

    const cue = cues[index];
    const waitMs = Math.max(2500, (cue.end - cue.start) * 2500 + 800);

    const goNext = () => {
      if (gen !== speakGen || !playing) return;
      clearWatchdog();
      holdUntil = -1;
      advanceTo(index + 1);
    };

    if (!window.speechSynthesis || !chosenVoice) {
      cueWatchdog = window.setTimeout(goNext, Math.max(400, (cue.end - cue.start) * 1000));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cue.text);
    utterance.rate = RATE;
    utterance.voice = chosenVoice;
    utterance.lang = chosenVoice.lang || 'en-US';
    utterance.onend = goNext;
    utterance.onerror = (event) => {
      if (gen !== speakGen || !playing) return;
      if (isBenignSpeechError(event.error)) return;
      goNext();
    };
    utterance.onboundary = (event) => {
      if (gen !== speakGen || !playing || lastSpokenIndex !== index) return;
      if (event.name && event.name !== 'word') return;
      highlightSpokenChar(cue.text, event.charIndex, cue.chunks);
    };
    cueWatchdog = window.setTimeout(goNext, waitMs);
    window.setTimeout(() => {
      if (gen !== speakGen || !playing) return;
      try {
        window.speechSynthesis.resume();
        window.speechSynthesis.speak(utterance);
        startResumeKeepalive();
      } catch {
        /* watchdog still advances */
      }
    }, 30);
  }

  function syncFromTime(time: number, scroll: boolean) {
    const index = cueIndexAt(cues, time);
    if (index >= 0) activate(index);
    if (playing) {
      highlightFromCueTime(time);
      if (scroll) followInView(false);
    }
    setScrollProgress();
    if (videoEl && videoWrap && !videoWrap.hidden && Math.abs(videoEl.currentTime - time) > 0.35) {
      videoEl.currentTime = time;
    }
  }

  function stopResumeKeepalive() {
    if (resumeTimer) {
      window.clearInterval(resumeTimer);
      resumeTimer = 0;
    }
  }

  function startResumeKeepalive() {
    stopResumeKeepalive();
    if (!window.speechSynthesis) return;
    resumeTimer = window.setInterval(() => {
      try {
        window.speechSynthesis.resume();
      } catch {
        /* ignore */
      }
    }, 250);
  }

  function tick() {
    if (!playing) return;
    const time = currentTime();
    if (holdUntil < 0 && time >= duration) {
      pause();
      syncFromTime(duration, false);
      return;
    }
    syncFromTime(time, true);
    raf = requestAnimationFrame(tick);
  }

  function cancelSpeech() {
    lastSpokenIndex = -1;
    speakGen += 1;
    holdUntil = -1;
    clearWatchdog();
    stopResumeKeepalive();
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* ignore */
    }
  }

  async function play() {
    setPlayingUi(true);
    clockStarted = performance.now();
    if (useAudio && audioEl) {
      audioEl.playbackRate = RATE;
      try {
        await audioEl.play();
      } catch {
        /* keep UI playing; timeupdate may still fail */
      }
    } else {
      if (!chosenVoice) chosenVoice = await waitForVoice();
      if (!playing) return;
      advanceTo(Math.max(0, cueIndexAt(cues, clockBase)));
    }
    if (videoEl && videoWrap && !videoWrap.hidden) {
      videoEl.playbackRate = RATE;
      void videoEl.play();
    }
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(tick);
  }

  function pause() {
    clockBase = currentTime();
    setPlayingUi(false);
    if (useAudio && audioEl) audioEl.pause();
    cancelSpeech();
    videoEl?.pause();
    cancelAnimationFrame(raf);
  }

  function seekTo(time: number) {
    const t = Math.min(duration, Math.max(0, time));
    clockBase = t;
    clockStarted = performance.now();
    holdUntil = -1;
    if (useAudio && audioEl) audioEl.currentTime = t;
    if (videoEl) videoEl.currentTime = t;
    if (playing && !useAudio) {
      cancelSpeech();
      setPlayingUi(true);
      advanceTo(Math.max(0, cueIndexAt(cues, t)));
    } else {
      activate(Math.max(0, cueIndexAt(cues, t)));
      syncFromTime(t, playing);
    }
  }

  function cueIndexFromViewport(): number {
    const line = window.innerHeight * 0.4;
    const nodes = document.querySelectorAll<HTMLElement>('[data-ir-id]');
    let bestId = '';
    let bestDist = Infinity;
    for (const el of nodes) {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) continue;
      const mid = (rect.top + rect.bottom) / 2;
      const dist = Math.abs(mid - line);
      if (dist < bestDist) {
        bestDist = dist;
        bestId = el.dataset.irId ?? '';
      }
    }
    if (!bestId) return -1;
    return cues.findIndex((cue) => cue.nodeId === bestId);
  }

  function seekFromViewport() {
    const index = cueIndexFromViewport();
    if (index < 0 || index === lastScrollCue) return;
    lastScrollCue = index;
    seekTo(cues[index].start);
  }

  playBtn.addEventListener('click', () => {
    if (playing) pause();
    else void play();
  });

  document.querySelector('nav[aria-label="On this page"]')?.addEventListener('click', (event) => {
    const link = (event.target as HTMLElement | null)?.closest('a');
    const hash = link?.getAttribute('href');
    if (!hash?.startsWith('#')) return;
    const heading = document.getElementById(decodeURIComponent(hash.slice(1)));
    const irId = heading?.dataset.irId;
    if (!irId) return;
    const index = cues.findIndex((cue) => cue.nodeId === irId);
    if (index < 0) return;
    markProgrammaticScroll();
    seekTo(cues[index].start);
  });

  window.addEventListener(
    'wheel',
    () => {
      if (programmaticScroll || !playing) return;
      pause();
    },
    { passive: true },
  );
  window.addEventListener(
    'touchmove',
    () => {
      if (programmaticScroll || !playing) return;
      pause();
    },
    { passive: true },
  );

  window.addEventListener(
    'scroll',
    () => {
      setScrollProgress();
      if (programmaticScroll) return;
      if (scrollSeekQueued) return;
      scrollSeekQueued = true;
      requestAnimationFrame(() => {
        scrollSeekQueued = false;
        if (programmaticScroll) return;
        seekFromViewport();
      });
    },
    { passive: true },
  );

  window.addEventListener('keydown', (event) => {
    const tag = (event.target as HTMLElement | null)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') return;
    if (event.key === ' ' && !event.repeat) {
      event.preventDefault();
      if (playing) pause();
      else void play();
    }
  });

  if (useAudio && audioEl) {
    audioEl.addEventListener('timeupdate', () => {
      if (playing) syncFromTime(audioEl.currentTime, true);
    });
    audioEl.addEventListener('ended', () => {
      pause();
      syncFromTime(duration, false);
    });
  }

  bindMediaSession();
  setScrollProgress();
}
