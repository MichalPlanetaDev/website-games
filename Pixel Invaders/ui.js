export function showOverlay(innerHTML) {
  const overlay = document.createElement('div');
  overlay.className = 'screen';
  overlay.innerHTML = innerHTML;
  document.getElementById('app').appendChild(overlay);
}

export function hideOverlay() {
  const existing = document.querySelector('.screen');
  if (existing) existing.remove();
}

export function updateBossBar(percent) {
  const bar = document.querySelector('#bossbar');
  if (!bar) return;
  if (percent <= 0 || isNaN(percent)) {
    bar.style.display = 'none';
  } else {
    bar.style.display = 'block';
    bar.querySelector('.fill').style.width = `${percent}%`;
  }
}