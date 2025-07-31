import { gameState } from './state.js';
import { rectsCollide, keyState, clamp } from './utils.js';
import { spawnExplosion, updateFX, drawFX } from './fx.js';
import { updateBossBar } from './ui.js';
import { updatePowerups, drawPowerups, maybeDropPowerup } from './powerups.js';
import { playSound } from './audio.js';

let canvas, ctx, hud;
let animationId;
let shootCooldown = 0;

document.addEventListener('keydown', e => keyState[e.code] = true);
document.addEventListener('keyup', e => keyState[e.code] = false);

export function initGame(onGameOver) {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  hud = document.getElementById('hud');
  spawnWave();
  animationId = requestAnimationFrame(() => loop(onGameOver));
}

export function stopGame() {
  cancelAnimationFrame(animationId);
  gameState.running = false;
}

function spawnWave() {
  const wave = gameState.wave;
  if (wave % 5 === 0) {
    spawnBoss();
  } else {
    const rows = 3 + Math.floor(wave / 2);
    const cols = 6 + (wave % 3);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        gameState.enemies.push({
          x: 60 + c * 50,
          y: 40 + r * 40,
          width: 30,
          height: 30,
          alive: true,
          dx: 1,
          col: c
        });
      }
    }
  }
}

function spawnBoss() {
  gameState.boss = {
    x: 150,
    y: 80,
    width: 300,
    height: 60,
    hp: 100,
    maxHp: 100,
    dx: 2
  };
}

function shootPlayer() {
  const p = gameState.player;
  if (p.shotCooldown > 0) return;
  playSound("shoot");

  gameState.bullets.push({
    x: p.x + p.width / 2 - 2,
    y: p.y,
    width: 4,
    height: 10,
    speed: 8
  });

  if (p.multiShot) {
    gameState.bullets.push({
      x: p.x + p.width / 2 - 10,
      y: p.y,
      width: 4,
      height: 10,
      speed: 8
    });
    gameState.bullets.push({
      x: p.x + p.width / 2 + 6,
      y: p.y,
      width: 4,
      height: 10,
      speed: 8
    });
  }

  p.shotCooldown = 10;
}

function moveEnemies() {
  let hitEdge = false;
  for (const e of gameState.enemies) {
    if (!e.alive) continue;
    e.x += e.dx;
    if (e.x < 0 || e.x + e.width > canvas.width) hitEdge = true;
  }
  if (hitEdge) {
    for (const e of gameState.enemies) {
      e.dx *= -1;
      e.y += 20;
    }
  }

  if (Math.random() < 0.02) {
    const shooters = gameState.enemies.filter(e => e.alive);
    if (shooters.length > 0) {
      const s = shooters[Math.floor(Math.random() * shooters.length)];
      gameState.enemyBullets.push({
        x: s.x + s.width / 2 - 2,
        y: s.y + s.height,
        width: 4,
        height: 10,
        speed: 4
      });
    }
  }
}

function moveBoss(onGameOver) {
  const b = gameState.boss;
  if (!b) return;
  b.x += b.dx;
  if (b.x < 0 || b.x + b.width > canvas.width) b.dx *= -1;

  if (Math.random() < 0.02) {
    gameState.enemyBullets.push({
      x: b.x + Math.random() * b.width,
      y: b.y + b.height,
      width: 6,
      height: 12,
      speed: 5
    });
  }

  updateBossBar((b.hp / b.maxHp) * 100);
}

function handleCollisions(onGameOver) {
  const p = gameState.player;

  for (const b of gameState.enemyBullets) {
    if (rectsCollide(b, p)) {
      b.y = 9999;
      if (p.shield > 0) {
        p.shield--;
      } else {
        p.hp--;
        if (p.hp <= 0) {
          return onGameOver();
        }
      }
    }
  }

  for (const bullet of gameState.bullets) {
    for (const e of gameState.enemies) {
      if (e.alive && rectsCollide(bullet, e)) {
        e.alive = false;
        bullet.y = -999;
        gameState.score += 10;
        spawnExplosion(e.x + e.width / 2, e.y + e.height / 2);
        maybeDropPowerup(e.x, e.y);
      }
    }

    const boss = gameState.boss;
    if (boss && rectsCollide(bullet, boss)) {
      bullet.y = -999;
      boss.hp -= 5;
      spawnExplosion(bullet.x, bullet.y, 'red');
      if (boss.hp <= 0) {
        gameState.score += 200;
        gameState.boss = null;
        updateBossBar(0);
      }
    }
  }

  const activeEnemies = gameState.enemies.filter(e => e.alive);
  if (activeEnemies.length === 0 && !gameState.boss) {
    gameState.wave++;
    spawnWave();
  }

  for (const e of gameState.enemies) {
    if (e.alive && e.y + e.height >= p.y) {
      onGameOver();
    }
  }
}

function updatePositions() {
  const p = gameState.player;
  p.shotCooldown = Math.max(0, p.shotCooldown - 1);

  if (keyState['ArrowLeft']) p.dx = -p.speed;
  else if (keyState['ArrowRight']) p.dx = p.speed;
  else p.dx = 0;

  if (keyState['Space'] && !keyState._shot) {
    shootPlayer();
    keyState._shot = true;
  }
  if (!keyState['Space']) keyState._shot = false;

  p.x += p.dx;
  p.x = clamp(p.x, 0, canvas.width - p.width);

  gameState.bullets.forEach(b => b.y -= b.speed);
  gameState.enemyBullets.forEach(b => b.y += b.speed);

  gameState.bullets = gameState.bullets.filter(b => b.y > -20);
  gameState.enemyBullets = gameState.enemyBullets.filter(b => b.y < canvas.height + 20);
}

function updateHUD() {
  hud.innerText = `Wynik: ${gameState.score}  |  Życia: ${gameState.player.hp}`;
}

function drawPlayer() {
  const p = gameState.player;
  ctx.fillStyle = p.shield ? 'cyan' : '#0f0';
  ctx.fillRect(p.x, p.y, p.width, p.height);
}

function drawEnemies() {
  for (const e of gameState.enemies) {
    if (!e.alive) continue;
    ctx.fillStyle = '#f00';
    ctx.fillRect(e.x, e.y, e.width, e.height);
    ctx.fillStyle = '#000';
    ctx.fillRect(e.x + 6, e.y + 6, 6, 6);
    ctx.fillRect(e.x + 18, e.y + 6, 6, 6);
  }
}

function drawBoss() {
  const b = gameState.boss;
  if (!b) return;
  ctx.fillStyle = 'darkred';
  ctx.fillRect(b.x, b.y, b.width, b.height);
}

function drawBullets() {
  ctx.fillStyle = '#0f0';
  gameState.bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));
  ctx.fillStyle = 'orange';
  gameState.enemyBullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));
}

function loop(onGameOver) {
  if (!gameState.running) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updatePositions();
  moveEnemies();
  moveBoss(onGameOver);
  handleCollisions(onGameOver);
  updatePowerups();
  updateFX();
  drawPlayer();
  drawEnemies();
  drawBoss();
  drawBullets();
  drawPowerups(ctx);
  drawFX(ctx);
  updateHUD();
  animationId = requestAnimationFrame(() => loop(onGameOver));
}