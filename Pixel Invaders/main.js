import { initGame, stopGame } from './game.js';
import { resetGameState, gameState } from './state.js';
import { showOverlay, hideOverlay } from './ui.js';
import { playMusic, toggleMute, setMuted } from './audio.js';

const app = document.getElementById('app');

function renderCanvasView() {
  app.innerHTML = `
    <canvas id="gameCanvas" width="600" height="800"></canvas>
    <div id="hud">Wynik: 0</div>
    <div id="bossbar"><div class="fill"></div></div>
    <button id="mute">🔊</button>
  `;
  document.getElementById('mute').onclick = toggleMute;
}

function showMenu() {
  app.innerHTML = '';
  const menu = document.createElement('div');
  menu.className = 'screen';
  menu.innerHTML = `
    <h1>PixelInvaders Ultra X</h1>
    <button id="startBtn">Zagraj</button>
    <button id="scoreBtn">Najlepszy Wynik</button>
    <button id="muteBtn">🔇 Wyłącz muzykę</button>
  `;
  app.appendChild(menu);

  document.getElementById('startBtn').onclick = startGame;
  document.getElementById('scoreBtn').onclick = showHighScore;
  document.getElementById('muteBtn').onclick = () => {
    toggleMute();
    alert("Muzyka przełączona.");
  };
}

function showHighScore() {
  const score = localStorage.getItem('pixel_highscore') || 0;
  const screen = document.createElement('div');
  screen.className = 'screen';
  screen.innerHTML = `
    <h2>Najlepszy wynik:</h2>
    <h3>${score}</h3>
    <button onclick="location.reload()">Powrót</button>
  `;
  app.appendChild(screen);
}

function startGame() {
  renderCanvasView();
  resetGameState();
  hideOverlay();
  playMusic();
  initGame(onGameOver);
}

function onGameOver() {
  stopGame();
  const hs = parseInt(localStorage.getItem('pixel_highscore') || 0, 10);
  if (gameState.score > hs) {
    localStorage.setItem('pixel_highscore', gameState.score);
  }

  showOverlay(`
    <h2>KONIEC GRY</h2>
    <h3>Wynik: ${gameState.score}</h3>
    <button onclick="location.reload()">Zagraj ponownie</button>
  `);
}

setMuted(localStorage.getItem("pixel_auto") === "1");
showMenu();