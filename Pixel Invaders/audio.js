let music = null;
let muted = false;
let sounds = {};

export function setMuted(m) {
  muted = m;
  localStorage.setItem("pixel_mute", muted ? "1" : "0");
}

export function toggleMute() {
  muted = !muted;
  localStorage.setItem("pixel_mute", muted ? "1" : "0");
  if (music) music.volume = muted ? 0 : 0.2;
}

export function playMusic() {
  if (music) return;
  music = new Audio("https://cdn.pixabay.com/audio/2022/08/10/audio_1b36e74ed2.mp3"); // chiptune loop
  music.loop = true;
  music.volume = muted ? 0 : 0.2;
  music.play().catch(() => {});
}

export function playSound(name) {
  if (muted) return;
  if (!sounds[name]) {
    const urls = {
      shoot: "https://freesound.org/data/previews/320/320181_5260877-lq.mp3",
      hit: "https://freesound.org/data/previews/331/331912_3248244-lq.mp3",
      explode: "https://freesound.org/data/previews/331/331912_3248244-lq.mp3",
      powerup: "https://freesound.org/data/previews/256/256113_4486188-lq.mp3"
    };
    if (!urls[name]) return;
    sounds[name] = new Audio(urls[name]);
  }
  const s = sounds[name].cloneNode();
  s.volume = 0.3;
  s.play().catch(() => {});
}