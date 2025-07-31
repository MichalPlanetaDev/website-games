export const keyState = [];

export function rectsCollide(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

export function clamp(x, min, max) {
    return Math.max(min, Math.min(max, x));
}