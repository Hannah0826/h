(() => {
  'use strict';

  const GRAVITY = 0.55;
  const SCROLL = 2.8;
  const GROUND_H = 56;
  const CAT_W = 64;
  const CAT_H = 64;
  const JUMP_BASE = 9;
  const JUMP_VOL = 28;
  const VOL_THRESHOLD = 0.06;

  const catImg = new Image();
  catImg.src = 'assets/cat-nobg.png';

  const fishImg = document.createElement('canvas');
  fishImg.width = 48;
  fishImg.height = 48;
  const fctx = fishImg.getContext('2d');
  fctx.font = '36px serif';
  fctx.textAlign = 'center';
  fctx.fillText('🐟', 24, 36);

  let canvas, ctx, els = {};
  let running = false;
  let won = false;
  let lost = false;
  let micStream = null;
  let micUsesExternal = false;
  let analyser = null;
  let data = null;
  let audioCtx = null;
  let raf = null;
  let volume = 0;
  let onWin = null;
  let onLose = null;

  let cat = { x: 90, y: 0, vy: 0, grounded: true };
  let worldX = 0;
  let obstacles = [];
  let goalX = 0;

  function buildLevel() {
    obstacles = [];
    let x = 480;
    const patterns = [
      { w: 32, h: 36 },
      { w: 34, h: 44 },
      { w: 32, h: 40 },
      { w: 36, h: 48 }
    ];
    patterns.forEach((p, i) => {
      obstacles.push({ x, w: p.w, h: p.h, type: 'block' });
      x += 250 + (i % 2) * 40;
    });
    goalX = x + 100;
  }

  function groundY() {
    return canvas.height - GROUND_H;
  }

  function resetGame() {
    won = false;
    lost = false;
    worldX = 0;
    cat.x = 90;
    cat.y = groundY() - CAT_H;
    cat.vy = 0;
    cat.grounded = true;
    buildLevel();
  }

  function tryJump() {
    if (!cat.grounded || lost || won) return;
    if (volume < VOL_THRESHOLD) return;
    cat.vy = -(JUMP_BASE + volume * JUMP_VOL);
    cat.grounded = false;
  }

  function update() {
    if (won || lost) return;

    cat.vy += GRAVITY;
    cat.y += cat.vy;
    const gy = groundY() - CAT_H;
    if (cat.y >= gy) {
      cat.y = gy;
      cat.vy = 0;
      cat.grounded = true;
    }

    tryJump();
    worldX += SCROLL;

    obstacles.forEach((o) => {
      const ox = o.x - worldX;
      const oy = groundY() - o.h;
      if (
        cat.x + CAT_W - 10 > ox &&
        cat.x + 10 < ox + o.w &&
        cat.y + CAT_H - 8 > oy &&
        cat.y + 8 < oy + o.h
      ) {
        lost = true;
        if (onLose) onLose();
      }
    });

    const gx = goalX - worldX;
    if (gx <= cat.x + CAT_W - 12 && gx + 44 >= cat.x + 8 && !won) {
      won = true;
      if (onWin) onWin();
    }
  }

  function drawCloud(x, y, scale) {
    ctx.fillStyle = 'rgba(255,255,255,0.78)';
    const s = scale || 1;
    ctx.beginPath();
    ctx.ellipse(x, y, 36 * s, 14 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 28 * s, y - 6 * s, 24 * s, 12 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(x - 22 * s, y - 4 * s, 20 * s, 10 * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawBg() {
    const gy = groundY();
    const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
    sky.addColorStop(0, '#fff8fc');
    sky.addColorStop(0.5, '#ffeef7');
    sky.addColorStop(1, '#ffe8d4');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(255, 217, 234, 0.35)';
    for (let i = 0; i < 3; i += 1) {
      const hx = ((i * 340 - worldX * 0.12) % (canvas.width + 340)) - 80;
      ctx.beginPath();
      ctx.ellipse(hx + 170, gy - 55, 180, 42, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = 0; i < 4; i += 1) {
      const cx = ((i * 240 - worldX * 0.06) % (canvas.width + 240)) - 30;
      drawCloud(cx, 36 + (i % 2) * 28, 0.75 + (i % 3) * 0.15);
    }

    ctx.font = '20px serif';
    ctx.globalAlpha = 0.28;
    for (let i = 0; i < 4; i += 1) {
      const fx = ((i * 300 - worldX * 0.18) % (canvas.width + 300)) - 10;
      ctx.fillText('🐟', fx, 72 + (i % 2) * 36);
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = '#9ed88a';
    ctx.fillRect(0, gy, canvas.width, 10);
    ctx.fillStyle = '#f5c98a';
    ctx.fillRect(0, gy + 10, canvas.width, GROUND_H - 10);
    ctx.fillStyle = '#e8b978';
    for (let i = -1; i < 22; i += 1) {
      const px = ((i * 72 - worldX * 0.35) % (canvas.width + 72)) - 20;
      ctx.fillRect(px, gy + 24, 36, 7);
    }

    ctx.fillStyle = 'rgba(255, 176, 122, 0.14)';
    for (let i = 0; i < 8; i += 1) {
      const px = ((i * 110 - worldX * 0.5) % (canvas.width + 110)) - 20;
      ctx.beginPath();
      ctx.arc(px + 8, gy + 38, 5, 0, Math.PI * 2);
      ctx.arc(px + 18, gy + 36, 4, 0, Math.PI * 2);
      ctx.arc(px + 4, gy + 44, 3.5, 0, Math.PI * 2);
      ctx.arc(px + 22, gy + 44, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawObstacles() {
    obstacles.forEach((o) => {
      const ox = o.x - worldX;
      if (ox < -80 || ox > canvas.width + 80) return;
      const oy = groundY() - o.h;
      const grad = ctx.createLinearGradient(ox, oy, ox, oy + o.h);
      grad.addColorStop(0, '#ffb6d9');
      grad.addColorStop(1, '#ff8fcb');
      ctx.fillStyle = grad;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(ox, oy, o.w, o.h, 8);
      else ctx.rect(ox, oy, o.w, o.h);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(ox + 6, oy + 6, o.w - 12, 8);
    });
  }

  function drawGoal() {
    const gx = goalX - worldX;
    if (gx > canvas.width + 60) return;
    ctx.font = '14px Nunito, sans-serif';
    ctx.fillStyle = '#8c7c99';
    ctx.fillText('终点小鱼干', gx - 10, groundY() - 58);
    ctx.drawImage(fishImg, gx, groundY() - CAT_H - 4, 48, 48);
  }

  function drawCat() {
    if (catImg.complete) {
      ctx.drawImage(catImg, cat.x, cat.y, CAT_W, CAT_H);
    } else {
      ctx.font = '48px serif';
      ctx.fillText('🐱', cat.x, cat.y + 48);
    }
  }

  function drawVolumeHint() {
    if (volume < VOL_THRESHOLD) return;
    ctx.fillStyle = `rgba(255, 143, 203, ${0.15 + volume * 0.35})`;
    ctx.beginPath();
    ctx.arc(cat.x + CAT_W / 2, cat.y - 12 - volume * 40, 8 + volume * 18, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    if (!running) return;
    if (analyser && data) {
      analyser.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i += 1) sum += data[i];
      volume = sum / (data.length * 255);
      if (els.volumeFill) els.volumeFill.style.width = `${Math.min(100, volume * 280)}%`;
    }
    update();
    drawBg();
    drawObstacles();
    drawGoal();
    drawVolumeHint();
    drawCat();
    raf = requestAnimationFrame(loop);
  }

  function setMicSource(analyserNode, dataArray) {
    analyser = analyserNode;
    data = dataArray;
    micUsesExternal = true;
  }

  async function ensureMic() {
    if (analyser && data) return true;
    if (micUsesExternal) return false;
    if (micStream) return true;
    try {
      micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const src = audioCtx.createMediaStreamSource(micStream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      data = new Uint8Array(analyser.frequencyBinCount);
      src.connect(analyser);
      return true;
    } catch {
      return false;
    }
  }

  function start() {
    if (running) return;
    resetGame();
    running = true;
    loop();
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  window.JumpGame = {
    init(options = {}) {
      canvas = options.canvas;
      ctx = canvas.getContext('2d');
      els.volumeFill = options.volumeFill;
      onWin = options.onWin;
      onLose = options.onLose;
      resetGame();
      drawBg();
      drawObstacles();
      drawGoal();
      drawCat();
    },
    async prepareMic() {
      return ensureMic();
    },
    setMicSource,
    start,
    stop,
    reset() {
      stop();
      resetGame();
      drawBg();
      drawObstacles();
      drawGoal();
      drawCat();
    },
    isRunning: () => running,
    getVolume: () => volume
  };
})();
