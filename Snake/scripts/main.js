const canvas = document.getElementById("game-board");
const ctx = canvas.getContext("2d");

const TILE_SIZE = 20;
const TILES_X = canvas.width / TILE_SIZE;
const TILES_Y = canvas.height / TILE_SIZE;

let game = null;
let lastDifficulty = "medium";

class Game {
  constructor({ difficulty }) {
    this.snake = [{ x: 10, y: 10 }];
    this.food = null;
    this.velocity = { x: 0, y: 0 };
    this.score = 0;
    this.active = false;
    this.difficulty = difficulty;
    this.speed = 100;
    this.wrap = true;
    this.digestActive = false;
    this.frame = 0;

    this.setDifficulty(difficulty);
    this.spawnFood();
    this.drawInitial();
  }

  setDifficulty(d) {
    if (d === "easy") {
      this.speed = 160;
      this.wrap = true;
    } else if (d === "medium") {
      this.speed = 100;
      this.wrap = false;
    } else if (d === "hard") {
      this.speed = 50;
      this.wrap = false;
    }
  }

  spawnFood() {
    const free = [];
    for (let x = 0; x < TILES_X; x++) {
      for (let y = 0; y < TILES_Y; y++) {
        if (!this.snake.some((p) => p.x === x && p.y === y))
          free.push({ x, y });
      }
    }
    this.food = free[Math.floor(Math.random() * free.length)];
  }

  drawInitial() {
    ctx.fillStyle = "#101010";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.drawTile(this.snake[0], "#00ffcc");
    this.drawTile(this.food, "#ff00aa");
  }

  drawTile({ x, y }, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    ctx.strokeStyle = "#111";
    ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }

  draw = (timestamp) => {
    if (!this.active) return;
    if (timestamp - this.lastFrame < this.speed)
      return requestAnimationFrame(this.draw);
    this.lastFrame = timestamp;

    ctx.fillStyle = "#101010";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const head = {
      x: this.snake[0].x + this.velocity.x,
      y: this.snake[0].y + this.velocity.y,
    };
    if (this.wrap) {
      head.x = (head.x + TILES_X) % TILES_X;
      head.y = (head.y + TILES_Y) % TILES_Y;
    } else {
      if (head.x < 0 || head.y < 0 || head.x >= TILES_X || head.y >= TILES_Y)
        return this.end();
    }

    if (this.snake.some((p) => p.x === head.x && p.y === head.y))
      return this.end();
    this.snake.unshift(head);

    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      updateScore(this.score);
      this.spawnFood();
      this.digestActive = true;
      this.frame = 0;
    } else {
      this.snake.pop();
    }

    this.drawTile(this.food, "#ff00aa");

    this.snake.forEach((part, i) => {
      const t = i / this.snake.length;
      const hue = (this.frame + i * 10) % 360;
      const color = this.digestActive
        ? `hsl(${hue}, 100%, ${50 - t * 20}%)`
        : i === 0
        ? "#00ffcc"
        : "#007777";
      this.drawTile(part, color);
    });

    if (this.digestActive) this.frame += 20;
    if (this.frame > 360) this.digestActive = false;

    requestAnimationFrame(this.draw);
  };

  end() {
    this.active = false;
    document.getElementById("final-score").textContent = this.score;
    const record = Number(localStorage.getItem("highScore") || 0);
    if (this.score > record) localStorage.setItem("highScore", this.score);
    document.getElementById("high-score").textContent = Math.max(
      record,
      this.score
    );
    document.getElementById("game-over-screen").classList.remove("hidden");
  }

  onKey(key) {
    const map = {
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
    };
    const next = map[key];
    if (!next) return;
    if (next.x === -this.velocity.x && next.y === -this.velocity.y) return;
    this.velocity = next;
    if (!this.active) {
      this.active = true;
      this.lastFrame = performance.now();
      requestAnimationFrame(this.draw);
    }
  }
}

const updateScore = (v) => (document.getElementById("score").textContent = v);

const startGame = (difficulty = "medium") => {
  lastDifficulty = difficulty;
  document.getElementById("game-over-screen").classList.add("hidden");
  game = new Game({ difficulty });
};

window.addEventListener("keydown", (e) => game?.onKey(e.key));

window.addEventListener("load", () => {
  document.getElementById("preloader")?.remove();

  const theme = localStorage.getItem("theme");
  const font = localStorage.getItem("font");

  if (theme === "light")
    document.getElementById("themeSwitcher").checked = true;
  if (font) document.body.style.fontFamily = font;

  document.getElementById("themeSwitcher").addEventListener("change", (e) => {
    const r = document.documentElement;
    if (e.target.checked) {
      r.style.setProperty("--color-bg", "#f0f0f0");
      r.style.setProperty("--color-panel", "#ffffff");
      r.style.setProperty("--color-text", "#222");
      r.style.setProperty("--color-subtext", "#666");
      r.style.setProperty("--color-glow", "#49bfbf");
      r.style.setProperty("--color-glow-muted", "#2b8c8c");
      localStorage.setItem("theme", "light");
    } else {
      r.style.setProperty("--color-bg", "#0f0f0f");
      r.style.setProperty("--color-panel", "#161616");
      r.style.setProperty("--color-text", "#e0fdf9");
      r.style.setProperty("--color-subtext", "#aaa");
      r.style.setProperty("--color-glow", "#00ffcc");
      r.style.setProperty("--color-glow-muted", "#007777");
      localStorage.setItem("theme", "dark");
    }
  });

  document.getElementById("fontSwitcher").addEventListener("change", (e) => {
    document.body.style.fontFamily = e.target.value;
    localStorage.setItem("font", e.target.value);
  });
});