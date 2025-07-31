import { gameState } from './state.js';
import { rectsCollide } from './utils.js';
import { playSound } from './audio.js';

const types = ['heal', 'shield', 'multi'];

export function maybeDropPowerup(x, y) {
  if (Math.random() < 0.25) {
    const type = types[Math.floor(Math.random() * types.length)];
    gameState.powerups.push({
      x, y,
      width: 16, height: 16,
      type,
      vy: 2
    });
  }
}

export function updatePowerups() {
  const p = gameState.player;

  for (const pu of gameState.powerups) {
    pu.y += pu.vy;

    if (rectsCollide(p, pu)) {
      playSound("powerup");

      if (pu.type === 'heal') {
        p.hp = Math.min(p.hp + 1, 5);
      } else if (pu.type === 'shield') {
        p.shield = 1;
      } else if (pu.type === 'multi') {
        p.multiShot = true;
        setTimeout(() => p.multiShot = false, 5000);
      }

      pu.y = 9999;
    }
  }

  gameState.powerups = gameState.powerups.filter(p => p.y < 900);
}

export function drawPowerups(ctx) {
  for (const pu of gameState.powerups) {
    ctx.fillStyle = pu.type === 'heal' ? 'lime' : pu.type === 'shield' ? 'cyan' : 'yellow';
    ctx.fillRect(pu.x, pu.y, pu.width, pu.height);
  }
}