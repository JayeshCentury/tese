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

})();
