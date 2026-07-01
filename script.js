(() => {
  const surprise = document.getElementById('surprise');
  const themeToggle = document.getElementById('themeToggle');
  const confettiRoot = document.getElementById('confetti');

  function createConfettiBurst(xRatio = Math.random(), count = 40) {
    const colors = ['#ff6b6b','#ffd166','#06d6a0','#4d96ff','#b388ff','#ff9de2'];
    const w = window.innerWidth;
    const h = window.innerHeight;
    const x = Math.max(20, Math.min(w - 20, xRatio * w));

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      el.style.left = `${x}px`;
      el.style.top = `${h * 0.15 + Math.random() * 40}px`;
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.transform = `translate3d(0,0,0) rotate(${Math.random()*360}deg)`;
      confettiRoot.appendChild(el);

      // animate
      const dx = (Math.random() - 0.5) * 600;
      const dy = 600 + Math.random() * 200;
      const rotate = (Math.random() - 0.5) * 720;
      el.animate([
        { transform: `translate3d(0,0,0) rotate(${Math.random()*360}deg)`, opacity: 1 },
        { transform: `translate3d(${dx}px, ${dy}px, 0) rotate(${rotate}deg)`, opacity: 0.1 }
      ], { duration: 1100 + Math.random() * 800, easing: 'cubic-bezier(.2,.7,.3,1)' });

      // cleanup
      setTimeout(() => { try { el.remove() } catch (e) {} }, 2200);
    }
  }

  surprise.addEventListener('click', (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xRatio = (rect.left + rect.width / 2) / window.innerWidth;
    createConfettiBurst(xRatio, 48);
  });

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    if (current === 'light') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme','light');
  });

  // Clock
  const clockEl = document.getElementById('clock');
  function updateClock(){
    const d = new Date();
    const hh = String(d.getHours()).padStart(2,'0');
    const mm = String(d.getMinutes()).padStart(2,'0');
    clockEl.textContent = `${hh}:${mm}`;
  }
  updateClock();
  setInterval(updateClock, 1000 * 30);

  // Quotes
  const quotes = [
    "Simplicity is the soul of efficiency.",
    "Small steps every day lead to big results.",
    "Creativity loves constraints.",
    "Ship often. Learn fast.",
    "Good design is obvious. Great design is transparent.",
  ];
  const inspireBtn = document.getElementById('inspire');
  const quoteEl = document.getElementById('quote');
  function showQuote(){
    const q = quotes[Math.floor(Math.random()*quotes.length)];
    quoteEl.textContent = q;
    showToast('New thought ✨');
  }
  inspireBtn.addEventListener('click', showQuote);

  // Accent color picker
  const accentPicker = document.getElementById('accentPicker');
  const savedAccent = localStorage.getItem('accentColor');
  if (savedAccent) document.documentElement.style.setProperty('--accent', savedAccent), accentPicker.value = savedAccent;
  accentPicker.addEventListener('input', (e)=>{
    const v = e.target.value;
    document.documentElement.style.setProperty('--accent', v);
    localStorage.setItem('accentColor', v);
    showToast('Accent color updated');
  });

  // Animated background toggle when clicking the page
  document.querySelector('.page').addEventListener('dblclick', ()=>{
    document.querySelector('.page').classList.toggle('animated');
    showToast('Background animation toggled');
  });

  // small toast helper
  function showToast(text, ms = 2000){
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = text;
    document.body.appendChild(t);
    setTimeout(()=>{ t.style.opacity = '0'; try{t.remove()}catch(e){} }, ms);
  }

  // keyboard shortcut: press 's' for surprise
  window.addEventListener('keydown', (ev) => {
    if (ev.key === 's' || ev.key === 'S') {
      createConfettiBurst(Math.random(), 36);
    }
  });

  // Mystery Box modal
  const mysteryBtn = document.getElementById('mysteryBtn');
  const mysteryModal = document.getElementById('mysteryModal');
  const closeMystery = document.getElementById('closeMystery');
  const tabArt = document.getElementById('tabArt');
  const tabRiddle = document.getElementById('tabRiddle');
  const tabDot = document.getElementById('tabDot');
  const panelArt = document.getElementById('panelArt');
  const panelRiddle = document.getElementById('panelRiddle');
  const panelDot = document.getElementById('panelDot');

  function openMystery(){
    mysteryModal.removeAttribute('aria-hidden');
    mysteryModal.style.display = 'flex';
    showPanel('art');
  }
  function closeMyst(){
    mysteryModal.setAttribute('aria-hidden','true');
    mysteryModal.style.display = 'none';
  }

  mysteryBtn.addEventListener('click', openMystery);
  closeMystery.addEventListener('click', closeMyst);
  window.addEventListener('keydown', (e)=>{ if(e.key==='m' || e.key==='M') openMystery(); if(e.key==='Escape') closeMyst(); });

  function showPanel(name){
    panelArt.hidden = panelRiddle.hidden = panelDot.hidden = true;
    if(name === 'art') panelArt.hidden = false;
    if(name === 'riddle') panelRiddle.hidden = false;
    if(name === 'dot') panelDot.hidden = false;
  }
  tabArt.addEventListener('click', ()=>showPanel('art'));
  tabRiddle.addEventListener('click', ()=>showPanel('riddle'));
  tabDot.addEventListener('click', ()=>showPanel('dot'));

  // Generative art on canvas
  const artCanvas = document.getElementById('artCanvas');
  const seedInput = document.getElementById('seedInput');
  const artCtx = artCanvas.getContext && artCanvas.getContext('2d');
  function hashString(s){ let h=0; for(let i=0;i<s.length;i++){h = ((h<<5)-h) + s.charCodeAt(i); h |= 0;} return Math.abs(h);
  }
  function drawArt(seed){
    if(!artCtx) return;
    const w = artCanvas.width; const h = artCanvas.height;
    artCtx.clearRect(0,0,w,h);
    const base = seed || String(Date.now());
    const s = hashString(base);
    const cols = 6 + (s % 6);
    for(let i=0;i<cols;i++){
      const t = (s + i*31) % 360;
      artCtx.fillStyle = `hsl(${t},60%,55%)`;
      artCtx.beginPath();
      const cx = w * (0.2 + 0.6 * Math.abs(Math.sin((s+i)*0.001)));
      const cy = h * (0.3 + 0.4 * Math.abs(Math.cos((s+i)*0.001)));
      const r = 30 + ((s >> i) & 127);
      artCtx.arc(cx + (i-cols/2)*40, cy + Math.sin(i+ s*0.0001)*30, r, 0, Math.PI*2);
      artCtx.fill();
    }
    // overlay lines
    artCtx.strokeStyle = 'rgba(255,255,255,0.08)'; artCtx.lineWidth = 1;
    for(let i=0;i<60;i++){
      artCtx.beginPath(); artCtx.moveTo(0, h*(i/60)); artCtx.lineTo(w, h*(i/60)); artCtx.stroke();
    }
  }
  artCanvas.addEventListener('click', ()=> drawArt(seedInput.value || String(Math.random())));
  // initial draw
  drawArt(seedInput.value || 'curiosity');

  // Riddle reveal
  const revealRiddle = document.getElementById('revealRiddle');
  const riddleAnswer = document.getElementById('riddleAnswer');
  revealRiddle.addEventListener('click', ()=>{ riddleAnswer.hidden = false; showToast('You found the answer!'); createConfettiBurst(Math.random(), 32); });

  // Hidden dot game
  const dotGame = document.getElementById('dotGame');
  function makeDotGame(cols = 12, rows = 8){
    dotGame.innerHTML = '';
    const total = cols * rows;
    const hiddenIndex = Math.floor(Math.random() * total);
    for(let i=0;i<total;i++){
      const d = document.createElement('div'); d.className = 'dot';
      if(i === hiddenIndex){ d.classList.add('hiddenDot'); d.addEventListener('click', ()=>{ showToast('You found the tiny dot!'); createConfettiBurst(Math.random(), 40); closeMyst(); }); }
      else d.addEventListener('click', ()=>{ d.style.transform = 'scale(0.95)'; setTimeout(()=>d.style.transform='scale(1)',200); });
      dotGame.appendChild(d);
    }
  }
  makeDotGame();


})();
