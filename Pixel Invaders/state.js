export const gameState = {
    player: null,
    bullets: [],
    enemies: [],
    enemyBullets: [],
    fx: [],
    powerups: [],
    score: 0,
    wave: 1,
    boss: null,
    running: false
};

export function resetGameState() {
    gameState.player = {
        x: 280,
        y: 740,
        width: 40,
        height: 20,
        dx: 0,
        speed: 5,
        hp: 3,
        shield: 0,
        multiShot: false,
        shotCooldown: 0
    };
    gameState.bullets = [];
    gameState.enemies = [];
    gameState.enemyBullets = [];
    gameState.fx = [];
    gameState.powerups = [];
    gameState.boss = null;
    gameState.wave = 1;
    gameState.score = 0;
    gameState.running = true;
}