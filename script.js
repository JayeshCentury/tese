(() => {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const colorPicker = document.getElementById('colorPicker');
  const brushSizeSlider = document.getElementById('brushSize');
  const sizeLabel = document.getElementById('sizeLabel');
  const clearBtn = document.getElementById('clearBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const particleToggle = document.getElementById('particleToggle');
  const smoothToggle = document.getElementById('smoothToggle');
  const overlayHint = document.querySelector('.overlay-hint');
  const brushBtns = document.querySelectorAll('.brush-btn');
  const colorBtns = document.querySelectorAll('.color-btn');

  let isDrawing = false;
  let lastX = 0, lastY = 0;
  let currentBrush = 'pen';
  let currentColor = '#ff6b6b';
  let brushSize = 8;
  let particlesEnabled = true;
  let smoothEnabled = true;
  let particles = [];

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
      ctx.stroke();
      if (particlesEnabled && Math.random() > 0.4) {
        particles.push(new Particle(x, y, color));
      }
    },
    glow: (x, y, color, size) => {
      ctx.shadowColor = color;
      ctx.shadowBlur = size * 2;
      ctx.strokeStyle = color;
      ctx.lineWidth = size * 0.7;
      ctx.stroke();
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      if (particlesEnabled) {
        particles.push(new Particle(x, y, color));
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
        ctx.globalAlpha = 0.7;
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
    
    const brush = brushes[currentBrush];
    if (brush) {
      brush(toX, toY, currentColor, brushSize);
    }
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
    isDrawing = false;
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

  clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = [];
  });

  downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `canvas-${Date.now()}.png`;
    link.click();
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

  // Clear hint after first stroke
  let firstStroke = true;
  canvas.addEventListener('mousedown', () => {
    if (firstStroke) {
      overlayHint.classList.remove('show');
      firstStroke = false;
    }
  });
})();
