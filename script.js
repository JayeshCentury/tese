(() => {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const colorPicker = document.getElementById('colorPicker');
  const brushSizeSlider = document.getElementById('brushSize');
  const sizeLabel = document.getElementById('sizeLabel');
  const opacitySlider = document.getElementById('opacity');
  const opacityLabel = document.getElementById('opacityLabel');
  const blendModeSelect = document.getElementById('blendMode');
  const clearBtn = document.getElementById('clearBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const particleToggle = document.getElementById('particleToggle');
  const smoothToggle = document.getElementById('smoothToggle');
  const gridToggle = document.getElementById('gridToggle');
  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');
  const shortcutsBtn = document.getElementById('shortcutsBtn');
  const shortcutsModal = document.getElementById('shortcutsModal');
  const closeShortcuts = document.getElementById('closeShortcuts');
  const galleryBtn = document.getElementById('galleryBtn');
  const galleryModal = document.getElementById('galleryModal');
  const closeGallery = document.getElementById('closeGallery');
  const galleryGrid = document.getElementById('galleryGrid');
  const gridOverlay = document.getElementById('gridOverlay');
  const overlayHint = document.querySelector('.overlay-hint');
  const brushBtns = document.querySelectorAll('.brush-btn');
  const colorBtns = document.querySelectorAll('.color-btn');
  const harmonyBtn = document.getElementById('harmonyBtn');
  const harmonyPalette = document.getElementById('harmonyPalette');

  let isDrawing = false;
  let lastX = 0, lastY = 0;
  let currentBrush = 'pen';
  let currentColor = '#ff6b6b';
  let brushSize = 8;
  let opacity = 1;
  let particlesEnabled = true;
  let smoothEnabled = true;
  let particles = [];
  let history = [];
  let historyStep = -1;

  // Color harmony generator
  function generateHarmony(hex) {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const colors = [];

    colors.push(hex); // Original

    // Complementary
    colors.push(hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l));

    // Analogous
    colors.push(hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l));
    colors.push(hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l));

    // Triadic
    colors.push(hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l));

    return colors;
  }

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; } 
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  // History management
  function saveHistory() {
    historyStep++;
    if (historyStep < history.length) history.length = historyStep;
    history.push(canvas.toDataURL());
    undoBtn.disabled = historyStep === 0;
    redoBtn.disabled = true;
  }

  function undo() {
    if (historyStep > 0) {
      historyStep--;
      loadHistory(historyStep);
    }
  }

  function redo() {
    if (historyStep < history.length - 1) {
      historyStep++;
      loadHistory(historyStep);
    }
  }

  function loadHistory(step) {
    const img = new Image();
    img.src = history[step];
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    undoBtn.disabled = step === 0;
    redoBtn.disabled = step === history.length - 1;
  }

  // Resize canvas
  function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width - 40;
    canvas.height = rect.height - 40;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Design gallery generators
  const designTemplates = [
    {
      name: 'Geometric Grid',
      draw: (canvas) => {
        const c = canvas.getContext('2d');
        const w = canvas.width, h = canvas.height;
        c.fillStyle = '#0f0c29';
        c.fillRect(0, 0, w, h);
        c.strokeStyle = '#ff6b6b';
        c.lineWidth = 2;
        for (let i = 0; i <= w; i += 40) {
          for (let j = 0; j <= h; j += 40) {
            c.strokeRect(i, j, 40, 40);
          }
        }
        c.fillStyle = '#4d96ff';
        for (let i = 0; i < 5; i++) {
          c.beginPath();
          c.arc(Math.random() * w, Math.random() * h, Math.random() * 15 + 5, 0, Math.PI * 2);
          c.fill();
        }
      }
    },
    {
      name: 'Gradient Wave',
      draw: (canvas) => {
        const c = canvas.getContext('2d');
        const w = canvas.width, h = canvas.height;
        const grad = c.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, '#ff6b6b');
        grad.addColorStop(0.5, '#4d96ff');
        grad.addColorStop(1, '#06d6a0');
        c.fillStyle = grad;
        c.fillRect(0, 0, w, h);
        c.strokeStyle = 'rgba(255,255,255,0.2)';
        c.lineWidth = 3;
        for (let i = 0; i < 5; i++) {
          c.beginPath();
          c.moveTo(0, h / 5 * i);
          for (let x = 0; x < w; x += 20) {
            const y = h / 5 * i + Math.sin(x * 0.01 + i) * 20;
            c.lineTo(x, y);
          }
          c.stroke();
        }
      }
    },
    {
      name: 'Circle Burst',
      draw: (canvas) => {
        const c = canvas.getContext('2d');
        const w = canvas.width, h = canvas.height;
        c.fillStyle = '#0f0c29';
        c.fillRect(0, 0, w, h);
        const cx = w / 2, cy = h / 2;
        const colors = ['#ff6b6b', '#ffd166', '#06d6a0', '#4d96ff', '#b388ff'];
        for (let i = 0; i < 20; i++) {
          const r = (i * 15);
          c.strokeStyle = colors[i % colors.length];
          c.lineWidth = 3;
          c.globalAlpha = 0.7 - i * 0.03;
          c.beginPath();
          c.arc(cx, cy, r, 0, Math.PI * 2);
          c.stroke();
        }
        c.globalAlpha = 1;
      }
    },
    {
      name: 'Triangular Art',
      draw: (canvas) => {
        const c = canvas.getContext('2d');
        const w = canvas.width, h = canvas.height;
        c.fillStyle = '#0b1220';
        c.fillRect(0, 0, w, h);
        const colors = ['#ff6b6b', '#ffd166', '#06d6a0', '#4d96ff', '#b388ff', '#ff9de2'];
        for (let i = 0; i < 15; i++) {
          c.fillStyle = colors[i % colors.length];
          c.globalAlpha = 0.6;
          const x = Math.random() * w;
          const y = Math.random() * h;
          const size = Math.random() * 50 + 20;
          c.beginPath();
          c.moveTo(x, y - size);
          c.lineTo(x - size, y + size);
          c.lineTo(x + size, y + size);
          c.closePath();
          c.fill();
        }
        c.globalAlpha = 1;
      }
    },
    {
      name: 'Cosmic Dots',
      draw: (canvas) => {
        const c = canvas.getContext('2d');
        const w = canvas.width, h = canvas.height;
        const grad = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.hypot(w, h));
        grad.addColorStop(0, '#1a1a3e');
        grad.addColorStop(1, '#0f0c29');
        c.fillStyle = grad;
        c.fillRect(0, 0, w, h);
        const colors = ['#ffff00', '#ff6b6b', '#4d96ff', '#06d6a0'];
        for (let i = 0; i < 100; i++) {
          c.fillStyle = colors[Math.floor(Math.random() * colors.length)];
          c.globalAlpha = Math.random() * 0.8 + 0.2;
          const x = Math.random() * w;
          const y = Math.random() * h;
          const r = Math.random() * 3 + 1;
          c.beginPath();
          c.arc(x, y, r, 0, Math.PI * 2);
          c.fill();
        }
        c.globalAlpha = 1;
      }
    },
    {
      name: 'Nature Inspired',
      draw: (canvas) => {
        const c = canvas.getContext('2d');
        const w = canvas.width, h = canvas.height;
        c.fillStyle = '#06d6a0';
        c.fillRect(0, 0, w, h);
        c.fillStyle = '#0f0c29';
        c.fillRect(0, h * 0.6, w, h * 0.4);
        c.fillStyle = '#06d6a0';
        for (let i = 0; i < 30; i++) {
          const x = Math.random() * w;
          const y = h * 0.6 + Math.random() * h * 0.4;
          c.fillRect(x, y, 8, Math.random() * 30 + 10);
        }
        c.fillStyle = 'rgba(255, 255, 255, 0.3)';
        for (let i = 0; i < 50; i++) {
          const x = Math.random() * w;
          const y = Math.random() * h * 0.6;
          c.beginPath();
          c.arc(x, y, Math.random() * 4 + 1, 0, Math.PI * 2);
          c.fill();
        }
      }
    }
  ];

  // Render gallery
  function renderGallery() {
    galleryGrid.innerHTML = '';
    designTemplates.forEach((template, idx) => {
      const container = document.createElement('div');
      container.className = 'gallery-item';
      const thumbCanvas = document.createElement('canvas');
      thumbCanvas.width = 120;
      thumbCanvas.height = 120;
      template.draw(thumbCanvas);
      const label = document.createElement('div');
      label.className = 'gallery-label';
      label.textContent = template.name;
      container.appendChild(thumbCanvas);
      container.appendChild(label);
      container.addEventListener('click', () => {
        loadDesign(template);
        galleryModal.setAttribute('hidden', '');
      });
      galleryGrid.appendChild(container);
    });
  }

  function loadDesign(template) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    template.draw(canvas);
    saveHistory();
  }

  // Particle system
  class Particle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.vx = (Math.random() - 0.5) * 3;
      this.vy = Math.random() * -2;
      this.life = 1;
      this.decay = Math.random() * 0.01 + 0.008;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.08;
      this.life -= this.decay;
    }
    draw(ctx) {
      ctx.globalAlpha = this.life * 0.5;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  // Brush types
  const brushes = {
    pen: (x, y, color, size) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.globalAlpha = opacity;
      ctx.stroke();
      ctx.globalAlpha = 1;
      if (particlesEnabled && Math.random() > 0.4) {
        particles.push(new Particle(x, y, color));
      }
    },
    glow: (x, y, color, size) => {
      ctx.shadowColor = color;
      ctx.shadowBlur = size * 2;
      ctx.strokeStyle = color;
      ctx.lineWidth = size * 0.7;
      ctx.globalAlpha = opacity;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      if (particlesEnabled) {
        particles.push(new Particle(x, y, color));
        particles.push(new Particle(x, y, color));
      }
    },
    watercolor: (x, y, color, size) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.globalAlpha = opacity * 0.4;
      ctx.stroke();
      ctx.globalAlpha = 1;
      // Watercolor edges
      for (let i = 0; i < 3; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * size * 0.5;
        ctx.globalAlpha = opacity * 0.15;
        ctx.beginPath();
        ctx.arc(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      if (particlesEnabled && Math.random() > 0.5) {
        particles.push(new Particle(x, y, color));
      }
    },
    calligraphy: (x, y, color, size) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = size * 1.5;
      ctx.globalAlpha = opacity;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.globalAlpha = 1;
      if (particlesEnabled && Math.random() > 0.6) {
        particles.push(new Particle(x, y, color));
      }
    },
    spray: (x, y, color, size) => {
      for (let i = 0; i < 5; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * size * 0.8;
        const px = x + Math.cos(angle) * distance;
        const py = y + Math.sin(angle) * distance;
        ctx.fillStyle = color;
        ctx.globalAlpha = opacity * 0.7;
        ctx.beginPath();
        ctx.arc(px, py, Math.random() * 2 + 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      if (particlesEnabled && Math.random() > 0.6) {
        particles.push(new Particle(x, y, color));
      }
    },
    eraser: (x, y, color, size) => {
      ctx.clearRect(x - size / 2, y - size / 2, size, size);
    }
  };

  function drawLine(fromX, fromY, toX, toY) {
    if (smoothEnabled) {
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.bezierCurveTo(fromX, fromY, toX, toY, toX, toY);
    } else {
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
    }
    
    ctx.globalCompositeOperation = blendModeSelect.value;
    const brush = brushes[currentBrush];
    if (brush) {
      brush(toX, toY, currentColor, brushSize);
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  // Canvas events
  canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
    overlayHint.classList.remove('show');
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    drawLine(lastX, lastY, x, y);
    lastX = x;
    lastY = y;
  });

  canvas.addEventListener('mouseup', () => {
    if (isDrawing) {
      isDrawing = false;
      saveHistory();
    }
  });

  canvas.addEventListener('mouseleave', () => {
    isDrawing = false;
  });

  // Controls
  colorPicker.addEventListener('input', (e) => {
    currentColor = e.target.value;
  });

  colorBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      currentColor = e.target.dataset.color;
      colorPicker.value = currentColor;
    });
  });

  brushBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      brushBtns.forEach((b) => b.classList.remove('active'));
      e.target.classList.add('active');
      currentBrush = e.target.dataset.brush;
    });
  });

  brushSizeSlider.addEventListener('input', (e) => {
    brushSize = parseInt(e.target.value);
    sizeLabel.textContent = `${brushSize}px`;
  });

  opacitySlider.addEventListener('input', (e) => {
    opacity = parseInt(e.target.value) / 100;
    opacityLabel.textContent = `${e.target.value}%`;
  });

  particleToggle.addEventListener('click', () => {
    particlesEnabled = !particlesEnabled;
    particleToggle.textContent = `Particles: ${particlesEnabled ? 'ON' : 'OFF'}`;
    particleToggle.classList.toggle('active');
  });

  smoothToggle.addEventListener('click', () => {
    smoothEnabled = !smoothEnabled;
    smoothToggle.textContent = `Smooth: ${smoothEnabled ? 'ON' : 'OFF'}`;
    smoothToggle.classList.toggle('active');
  });

  gridToggle.addEventListener('click', () => {
    const show = gridOverlay.hidden;
    gridOverlay.hidden = !show;
    gridToggle.textContent = `Grid: ${show ? 'ON' : 'OFF'}`;
    gridToggle.classList.toggle('active', show);
  });

  undoBtn.addEventListener('click', undo);
  redoBtn.addEventListener('click', redo);

  clearBtn.addEventListener('click', () => {
    if (confirm('Clear canvas? This cannot be undone.')) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      history = [];
      historyStep = -1;
      saveHistory();
    }
  });

  downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `creativity-${Date.now()}.png`;
    link.click();
  });

  // Harmony suggestions
  harmonyBtn.addEventListener('click', () => {
    const colors = generateHarmony(currentColor);
    harmonyPalette.innerHTML = '';
    colors.forEach((color) => {
      const btn = document.createElement('button');
      btn.className = 'harmony-color';
      btn.style.background = color;
      btn.addEventListener('click', () => {
        currentColor = color;
        colorPicker.value = color;
      });
      harmonyPalette.appendChild(btn);
    });
    harmonyPalette.hidden = !harmonyPalette.hidden;
  });

  // Shortcuts modal
  shortcutsBtn.addEventListener('click', () => {
    shortcutsModal.removeAttribute('hidden');
  });

  closeShortcuts.addEventListener('click', () => {
    shortcutsModal.setAttribute('hidden', '');
  });

  shortcutsModal.addEventListener('click', (e) => {
    if (e.target === shortcutsModal) {
      shortcutsModal.setAttribute('hidden', '');
    }
  });

  // Gallery modal
  galleryBtn.addEventListener('click', () => {
    renderGallery();
    galleryModal.removeAttribute('hidden');
  });

  closeGallery.addEventListener('click', () => {
    galleryModal.setAttribute('hidden', '');
  });

  galleryModal.addEventListener('click', (e) => {
    if (e.target === galleryModal) {
      galleryModal.setAttribute('hidden', '');
    }
  });

  // Keyboard shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'z' && e.ctrlKey) {
      e.preventDefault();
      e.shiftKey ? redo() : undo();
    }
    if (e.key.toLowerCase() === 'c' && e.ctrlKey) {
      e.preventDefault();
      clearBtn.click();
    }
    if (e.key.toLowerCase() === 'g') {
      e.preventDefault();
      gridToggle.click();
    }
    if (e.key.toLowerCase() === 'p') {
      document.querySelector('[data-brush="pen"]').click();
    }
    if (e.key.toLowerCase() === 'e') {
      document.querySelector('[data-brush="eraser"]').click();
    }
    if (e.key === '[') {
      brushSize = Math.max(2, brushSize - 2);
      brushSizeSlider.value = brushSize;
      sizeLabel.textContent = `${brushSize}px`;
    }
    if (e.key === ']') {
      brushSize = Math.min(50, brushSize + 2);
      brushSizeSlider.value = brushSize;
      sizeLabel.textContent = `${brushSize}px`;
    }
    if (e.key.toLowerCase() === 'd' && e.ctrlKey) {
      e.preventDefault();
      downloadBtn.click();
    }
    if (e.key === 'Escape') {
      shortcutsModal.setAttribute('hidden', '');
    }
  });

  // Animation loop for particles
  function animate() {
    particles = particles.filter((p) => p.life > 0);
    particles.forEach((p) => {
      p.update();
      p.draw(ctx);
    });
    requestAnimationFrame(animate);
  }
  animate();

  // Show hint when hovering
  canvas.addEventListener('mouseenter', () => {
    if (particles.length === 0) overlayHint.classList.add('show');
  });

  canvas.addEventListener('mouseleave', () => {
    overlayHint.classList.remove('show');
  });

  // Clear hint and initialize history after first stroke
  let firstStroke = true;
  canvas.addEventListener('mousedown', () => {
    if (firstStroke) {
      overlayHint.classList.remove('show');
      saveHistory();
      firstStroke = false;
    }
  });
})();
