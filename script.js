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

  // keyboard shortcut: press 's' for surprise
  window.addEventListener('keydown', (ev) => {
    if (ev.key === 's' || ev.key === 'S') {
      createConfettiBurst(Math.random(), 36);
    }
  });

})();
