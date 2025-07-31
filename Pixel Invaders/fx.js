import { gameState } from './state.js';

export function spawnExplosion(x, y, color = 'yellow') {
  for (let i = 0; i < 12; i++) {
    gameState.fx.push({
      x, y,
      color,
      vx: Math.cos(i * 30 * Math.PI / 180) * (2 + Math.random() * 2),
      vy: Math.sin(i * 30 * Math.PI / 180) * (2 + Math.random() * 2),
      life: 20 + Math.random() * 10
    });
  }
}

export function updateFX() {
  for (const fx of gameState.fx) {
    fx.x += fx.vx;
    fx.y += fx.vy;
    fx.life -= 1;
  }
  gameState.fx = gameState.fx.filter(fx => fx.life > 0);
}

export function drawFX(ctx) {
  for (const fx of gameState.fx) {
    ctx.fillStyle = fx.color;
    ctx.fillRect(fx.x, fx.y, 2, 2);
  }
}