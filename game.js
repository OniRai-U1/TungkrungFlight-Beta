// game.js

// ==== [🎮 TUNGRKUNG FLIGHT GAME by OniRai] ====

// == [🖼️ LOAD SEMUA GAMBAR] ==
let imagesLoaded = 0;
let totalImages = 4;

function imageLoaded() {
  imagesLoaded++;
  if (imagesLoaded === totalImages) {
    document.getElementById('menu').classList.remove('hidden');
  }
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let bgImg = new Image(); bgImg.src = 'assets/bg.png'; bgImg.onload = imageLoaded;
let birdImg = new Image(); birdImg.src = 'assets/bird.png'; birdImg.onload = imageLoaded;
let pipeImg = new Image(); pipeImg.src = 'assets/pole.png'; pipeImg.onload = imageLoaded;
let levelIcon = new Image(); levelIcon.src = 'assets/level1.png'; levelIcon.onload = imageLoaded;

let enableSfx = true;
let easyMode = false;
let graphicsQuality = 'high';

let bird, pipes = [], score = 0, gameOver = false, gameStarted = false;
let pipeSpeed = 2, maxPipeSpeed = 6, speedTimer = 0;
let pipeGapX = 0, pipeGapY = 0, safeMargin = 20;

// == [📌 UI CONTROL] ==
document.getElementById('startBtn').onclick = () => startGame();
document.getElementById('settingsBtn').onclick = () => showSettings();
document.getElementById('backBtn').onclick = () => backToMenu();
document.getElementById('gfxQuality').onchange = (e) => graphicsQuality = e.target.value;

document.addEventListener('keydown', flap);
document.addEventListener('touchstart', flap);

function flap() {
  if (gameStarted && !gameOver) bird.velocity = bird.lift;
  if (gameOver) {
    document.getElementById('menu').classList.remove('hidden');
    canvas.classList.add('hidden');
    gameStarted = false;
  }
}

function startGame() {
  enableSfx = document.getElementById('enableSfx').checked;
  easyMode = document.getElementById('easyMode').checked;
  document.getElementById('menu').classList.add('hidden');
  document.getElementById('settings').classList.add('hidden');
  canvas.classList.remove('hidden');
  initGame();
}

function showSettings() {
  document.getElementById('menu').classList.add('hidden');
  document.getElementById('settings').classList.remove('hidden');
}

function backToMenu() {
  document.getElementById('settings').classList.add('hidden');
  document.getElementById('menu').classList.remove('hidden');
}

function initGame() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  pipeGapX = Math.max(canvas.width / 2, 250);
  pipeGapY = Math.max(canvas.height * 0.25, 160);

  bird = {
    x: canvas.width / 4,
    y: canvas.height / 2,
    width: 80,
    height: 80,
    gravity: 0.5,
    lift: -13,
    velocity: 0
  };

  pipes = [];
  score = 0;
  pipeSpeed = 2;
  speedTimer = 0;
  gameOver = false;
  gameStarted = true;
  requestAnimationFrame(gameLoop);
}

function gameLoop() {
  if (!gameStarted) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
  ctx.drawImage(levelIcon, canvas.width - 80, 10, 60, 60);

  speedTimer++;
  if (speedTimer % 300 === 0 && pipeSpeed < maxPipeSpeed) pipeSpeed += 0.5;
  bird.velocity += bird.gravity;
  bird.y += bird.velocity;
  drawBird();

  updatePipes();
  drawPipes();
  drawScore();

  if (bird.y + bird.height > canvas.height || bird.y < 0) triggerGameOver();

  if (!gameOver) requestAnimationFrame(gameLoop);
}

// == [🐤 BURUNG] ==
function drawBird() {
  const angle = Math.min(Math.max(bird.velocity * 0.05, -0.6), 0.6);
  ctx.save();
  ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
  ctx.rotate(angle);
  ctx.drawImage(birdImg, -bird.width / 2, -bird.height / 2, bird.width, bird.height);
  ctx.restore();
}

// == [🪵 TIANG RINTANGAN] ==
function updatePipes() {
  for (let i = 0; i < pipes.length; i++) {
    let p = pipes[i];
    p.x -= pipeSpeed;

    const birdTop = bird.y + 10;
    const birdBottom = bird.y + bird.height - 10;
    const birdLeft = bird.x + 10;
    const birdRight = bird.x + bird.width - 10;

    const pipeLeft = p.x;
    const pipeRight = p.x + p.width;
    const gapTop = p.top;
    const gapBottom = canvas.height - p.bottom;

    const hitHorizontal = birdRight > pipeLeft && birdLeft < pipeRight;
    const hitTop = birdTop < gapTop;
    const hitBottom = birdBottom > gapBottom;

    if (hitHorizontal && (hitTop || hitBottom)) {
      triggerGameOver();
    }

    if (p.x + p.width < 0) {
      pipes.splice(i, 1);
      score++;
    }
  }

  if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - pipeGapX) {
    const top = Math.random() * (canvas.height - pipeGapY - safeMargin * 2) + safeMargin;
    const bottom = canvas.height - top - pipeGapY;
    pipes.push({ x: canvas.width, top: top, bottom: bottom, width: 100 });
  }
}

function drawPipes() {
  pipes.forEach(pipe => {
    const targetWidth = pipe.width;
    const fullPipeHeight = canvas.height;

    ctx.save();
    ctx.translate(pipe.x + targetWidth / 2, pipe.top);
    ctx.scale(1, -1);
    ctx.drawImage(pipeImg, -targetWidth / 2, 0, targetWidth, fullPipeHeight);
    ctx.restore();

    ctx.drawImage(pipeImg, pipe.x, canvas.height - pipe.bottom - fullPipeHeight, targetWidth, fullPipeHeight);
  });
}

function drawScore() {
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 26px monospace';
  ctx.fillText(`🔥 Score: ${score} | 💡 Level 1`, 20, 40);
}

function triggerGameOver() {
  gameOver = true;
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText('Game Over 💔', canvas.width / 2 - 110, canvas.height / 2 - 20);
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(`Score kamu: ${score}`, canvas.width / 2 - 70, canvas.height / 2 + 20);
  ctx.fillText('Tap untuk kembali ke menu', canvas.width / 2 - 130, canvas.height / 2 + 60);
}
