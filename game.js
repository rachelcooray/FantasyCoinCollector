const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI Elements
const scoreEl = document.getElementById('score-board');
const highScoreEl = document.getElementById('high-score');
const levelEl = document.getElementById('level-display');
const healthEl = document.getElementById('health-display');
const comboEl = document.getElementById('combo-display');
const dashBar = document.getElementById('dash-bar');
const fireBar = document.getElementById('fire-bar');
const gameOverScreen = document.getElementById('game-over-screen');
const pauseMenu = document.getElementById('pause-menu');
const audioBtn = document.getElementById('audio-btn');
const goTitle = document.getElementById('go-title');
const finalStatsEl = document.getElementById('final-stats');
const achPopup = document.getElementById('achievement-popup');
const badgesContainer = document.getElementById('badges-container');
const floatingTextContainer = document.getElementById('floating-text-container');
const transitionOverlay = document.getElementById('transition-overlay');
const transitionText = document.getElementById('transition-text');

const statCoins = document.getElementById('stat-coins');
const statDeaths = document.getElementById('stat-deaths');
const statLevel = document.getElementById('stat-level');

// --- Audio ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let audioEnabled = true;

function toggleAudio() {
    audioEnabled = !audioEnabled;
    audioBtn.innerText = "Audio: " + (audioEnabled ? "ON" : "OFF");
    if (audioCtx.state === 'suspended' && audioEnabled) audioCtx.resume();
}

function playSound(type) {
    if (!audioEnabled) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const now = audioCtx.currentTime;

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // SFX Logic
    if (type === 'coin') {
        osc.frequency.setValueAtTime(600 + (combo * 50), now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'goldcoin') {
        osc.frequency.setValueAtTime(1000, now);
        osc.frequency.linearRampToValueAtTime(2000, now + 0.3);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now); osc.stop(now + 0.3);
    } else if (type === 'fire') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now); osc.stop(now + 0.2);
    } else if (type === 'hit') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now); osc.stop(now + 0.3);
    } else if (type === 'gameover') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(50, now + 2);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 2);
        osc.start(now); osc.stop(now + 2);
    } else if (type === 'victory') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(800, now + 0.4);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 1);
        osc.start(now); osc.stop(now + 1);
    } else if (type === 'portal') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(800, now + 1);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 1);
        osc.start(now); osc.stop(now + 1);
    } else if (type === 'powerup') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.2);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.2);
        osc.start(now); osc.stop(now + 0.2);
    } else if (type === 'dash') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.5);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now); osc.stop(now + 0.5);
    }
}

// --- Persistence ---
let gameStats = JSON.parse(localStorage.getItem('fcc_stats')) || {
    highScore: 0, totalCoins: 0, totalDeaths: 0, highestLevel: 1, achievements: []
};
highScoreEl.innerText = "Best: " + gameStats.highScore;

const ACHIEVEMENTS = [
    { id: 'coin_50', title: 'Pocket Money', desc: 'Collect 50 Total Coins', check: (s) => s.totalCoins >= 50 },
    { id: 'coin_500', title: 'Coin Hoarder', desc: 'Collect 500 Total Coins', check: (s) => s.totalCoins >= 500 },
    { id: 'level_5', title: 'Survivor', desc: 'Reach Level 5', check: (s) => s.highestLevel >= 5 },
    { id: 'level_10', title: 'Champion', desc: 'Beat Level 10', check: (s) => s.highestLevel >= 11 }
];

function checkAchievements() {
    let changed = false;
    ACHIEVEMENTS.forEach(ach => {
        if (!gameStats.achievements.includes(ach.id) && ach.check(gameStats)) {
            gameStats.achievements.push(ach.id); showAchievement(ach); changed = true;
        }
    });
    if (changed) localStorage.setItem('fcc_stats', JSON.stringify(gameStats));
}

function showAchievement(ach) {
    document.getElementById('ach-title').innerText = ach.title;
    document.getElementById('ach-desc').innerText = ach.desc;
    achPopup.classList.add('show'); playSound('powerup');
    setTimeout(() => achPopup.classList.remove('show'), 3000);
}

function spawnFloatingText(text, x, y, color = '#fff') {
    const el = document.createElement('div');
    el.className = 'floating-text';
    el.innerText = text;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.color = color;
    floatingTextContainer.appendChild(el);
    setTimeout(() => el.remove(), 1000);
}

// --- Config & Resize ---
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// --- Game State ---
let gameActive = false;
let isPaused = false;
let score = 0;
let level = 1;
const MAX_LEVELS = 10;
let combo = 1;
let comboTimer = 0;
let frameCount = 0;
let shakeTime = 0;

// Input
const keys = { w: false, a: false, s: false, d: false, ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, ' ': false, f: false, Shift: false, Escape: false };
const joyLeft = { active: false, x: 0, y: 0 };
const joyRight = { active: false, x: 0, y: 0 };

// Player
const player = {
    x: 0, y: 0, radius: 15, baseSpeed: 5, speed: 5,
    rotation: 0, color: '#4cc9f0',
    health: 3, invincibleTime: 0,
    trail: [], hasShield: false,

    // Skills
    canDash: true, dashCooldown: 0, isDashing: false,
    canFire: true, fireCooldown: 0
};
const DASH_COOLDOWN_FRAMES = 120; // 2s
const FIRE_COOLDOWN_FRAMES = 30; // 0.5s

// Entities
let coins = [];
let enemies = [];
let particles = [];
let obstacles = [];
let powerups = [];
let projectiles = [];
let respawnQueue = [];
let bgStars = [];
let portal = null;

const COIN_RADIUS = 8;
const ENEMY_RADIUS = 18;
const PATROL_RADIUS = 20;
const GHOST_RADIUS = 15;

function setupJoystick(id, joy) {
    const el = document.getElementById(id);
    const stick = el.querySelector('.joystick-stick');
    const update = (t) => {
        const rect = el.getBoundingClientRect();
        const dist = Math.min(Math.hypot(t.clientX - (rect.left + rect.width / 2), t.clientY - (rect.top + rect.height / 2)), rect.width / 2);
        const ang = Math.atan2(t.clientY - (rect.top + rect.height / 2), t.clientX - (rect.left + rect.width / 2));
        joy.x = (Math.cos(ang) * dist) / (rect.width / 2);
        joy.y = (Math.sin(ang) * dist) / (rect.width / 2);
        stick.style.transform = `translate(calc(-50% + ${Math.cos(ang) * dist}px), calc(-50% + ${Math.sin(ang) * dist}px))`;
    };
    const reset = () => { joy.active = false; joy.x = 0; joy.y = 0; stick.style.transform = `translate(-50%, -50%)`; };
    el.addEventListener('touchstart', e => { e.preventDefault(); joy.active = true; update(e.changedTouches[0]); }, { passive: false });
    el.addEventListener('touchmove', e => { e.preventDefault(); if (joy.active) update(e.changedTouches[0]); }, { passive: false });
    el.addEventListener('touchend', reset);
    el.addEventListener('touchcancel', reset);
}
setupJoystick('joystick-left', joyLeft);
setupJoystick('joystick-right', joyRight);

window.triggerDash = function (e) { if (e) e.preventDefault(); attemptDash(); };
window.triggerFire = function (e) { if (e) e.preventDefault(); attemptFire(); };
window.togglePause = function (e) { if (e) e.preventDefault(); togglePauseMenu(); };

function attemptDash() {
    if (player.canDash && gameActive && !isPaused) {
        player.canDash = false; player.isDashing = true;
        player.dashCooldown = DASH_COOLDOWN_FRAMES; player.speed = player.baseSpeed * 3;
        playSound('dash');
        for (let i = 0; i < 10; i++) particles.push({ x: player.x, y: player.y, vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2, life: 0.5, color: '#fff' });
        setTimeout(() => { player.isDashing = false; player.speed = player.baseSpeed; }, 200);
    }
}

function attemptFire() {
    if (player.canFire && gameActive && !isPaused) {
        player.canFire = false; player.fireCooldown = FIRE_COOLDOWN_FRAMES;
        playSound('fire');
        // Spawn Projectile
        const speed = 10;
        const vx = Math.cos(player.rotation) * speed;
        const vy = Math.sin(player.rotation) * speed;
        projectiles.push({ x: player.x, y: player.y, vx, vy, radius: 6, color: '#ff4500' });
    }
}

function togglePauseMenu() {
    if (!gameActive) return;
    isPaused = !isPaused;
    if (isPaused) {
        pauseMenu.classList.remove('hidden');
    } else {
        pauseMenu.classList.add('hidden');
        loop(); // Resume loop
    }
}
window.resumeGame = function () { togglePauseMenu(); };

// --- Game Logic ---

window.restartGame = function () {
    playSound('coin');
    score = 0; level = 1; combo = 1;
    player.health = 3; player.hasShield = false;
    player.speed = player.baseSpeed; player.invincibleTime = 0;
    player.canDash = true; player.dashCooldown = 0;
    player.canFire = true; player.fireCooldown = 0;

    scoreEl.innerText = "Score: 0";
    healthEl.innerText = "❤️❤️❤️";
    levelEl.innerText = "Level 1";
    gameOverScreen.classList.add('hidden');
    gameOverScreen.classList.remove('victory');
    pauseMenu.classList.add('hidden');
    comboEl.classList.add('hidden');
    floatingTextContainer.innerHTML = '';

    bgStars = [];
    for (let i = 0; i < 50; i++) bgStars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, s: Math.random() * 2 });

    isPaused = false;
    startLevelTransition();
};

function startLevelTransition() {
    gameActive = false;
    transitionText.innerText = `Level ${level}`;
    transitionOverlay.classList.remove('hidden');
    setTimeout(() => {
        loadLevel();
        transitionOverlay.classList.add('hidden');
        gameActive = true;
        loop();
    }, 1000);
}

function loadLevel() {
    coins = []; enemies = []; particles = []; powerups = []; projectiles = []; respawnQueue = []; portal = null;
    player.x = canvas.width / 2; player.y = canvas.height / 2; player.trail = [];
    generateMap(); spawnLevelEntities();
}

function generateMap() {
    obstacles = [];
    const wallCount = 3 + level;
    for (let i = 0; i < wallCount; i++) {
        let w = 50 + Math.random() * 100;
        let h = 50 + Math.random() * 100;
        let x = Math.random() * (canvas.width - w);
        let y = Math.random() * (canvas.height - h);
        if (Math.hypot(x + w / 2 - canvas.width / 2, y + h / 2 - canvas.height / 2) > 200) {
            obstacles.push({ x, y, w, h });
        }
    }
}

function spawnLevelEntities() {
    const coinCount = 5 + Math.min(level, 15);
    for (let i = 0; i < coinCount; i++) trySpawnEntity('coin');
    const chaserCount = Math.floor(level / 2) + 1;
    for (let i = 0; i < chaserCount; i++) trySpawnEntity('chaser');
    if (level >= 3) {
        const ghostCount = Math.floor((level - 1) / 2);
        for (let i = 0; i < ghostCount; i++) trySpawnEntity('ghost');
    }
    if (level >= 4) {
        const patrolCount = Math.floor((level - 2) / 2);
        for (let i = 0; i < patrolCount; i++) trySpawnEntity('patrol');
    }
}

function trySpawnEntity(type) {
    let x, y, valid = false, attempts = 0;
    while (!valid && attempts < 20) {
        attempts++;
        x = Math.random() * canvas.width;
        y = Math.random() * canvas.height;
        if (Math.hypot(x - player.x, y - player.y) > 150 && !checkWallCollision(x, y)) {
            valid = true;
        }
    }
    if (!valid) return;

    if (type === 'coin') {
        if (Math.random() < 0.01) coins.push({ x, y, radius: COIN_RADIUS, isGold: true });
        else coins.push({ x, y, radius: COIN_RADIUS, isGold: false });
    }
    else if (type === 'speed') powerups.push({ x, y, type: 'speed', color: '#00ff00' });
    else if (type === 'shield') powerups.push({ x, y, type: 'shield', color: '#00ffff' });

    else if (type === 'chaser') {
        enemies.push({ x, y, radius: ENEMY_RADIUS, speed: 1.0 + (level * 0.15), type: 'chaser' });
    } else if (type === 'ghost') {
        enemies.push({ x, y, radius: GHOST_RADIUS, speed: 0.8 + (level * 0.1), type: 'ghost' });
    } else if (type === 'patrol') {
        let p2x = Math.random() * canvas.width;
        let p2y = Math.random() * canvas.height;
        enemies.push({
            x, y, radius: PATROL_RADIUS, speed: 2.5 + (level * 0.1), type: 'patrol',
            p1: { x, y }, p2: { x: p2x, y: p2y }, target: 2, wait: 0
        });
    }
}

// --- Update ---
function update() {
    if (!gameActive || isPaused) return;
    frameCount++;

    // Dash
    if (keys[' ']) attemptDash();
    if (!player.canDash) {
        player.dashCooldown--;
        if (player.dashCooldown <= 0) player.canDash = true;
    }
    const pctDash = 1 - (Math.max(0, player.dashCooldown) / DASH_COOLDOWN_FRAMES);
    dashBar.style.transform = `scaleX(${pctDash})`;
    dashBar.style.backgroundColor = player.canDash ? '#00ff00' : '#555';

    // Fire
    if (keys['f'] || keys['F'] || keys['Shift']) attemptFire();
    if (!player.canFire) {
        player.fireCooldown--;
        if (player.fireCooldown <= 0) player.canFire = true;
    }
    const pctFire = 1 - (Math.max(0, player.fireCooldown) / FIRE_COOLDOWN_FRAMES);
    fireBar.style.transform = `scaleX(${pctFire})`;
    fireBar.style.backgroundColor = player.canFire ? '#ff4500' : '#555';

    // Controls
    let dx = 0, dy = 0;
    if (keys['w'] || keys['W']) dy -= 1; if (keys['s'] || keys['S']) dy += 1;
    if (keys['a'] || keys['A']) dx -= 1; if (keys['d'] || keys['D']) dx += 1;
    if (joyLeft.active) { dx = joyLeft.x; dy = joyLeft.y; }

    if (dx !== 0 || dy !== 0) {
        if (!joyLeft.active) { const l = Math.hypot(dx, dy); dx /= l; dy /= l; }
        const nx = player.x + dx * player.speed;
        const ny = player.y + dy * player.speed;
        let hitX = checkWallCollision(nx, player.y);
        let hitY = checkWallCollision(player.x, ny);
        if (!hitX) player.x = nx;
        if (!hitY) player.y = ny;
    }
    player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));

    // Rotate
    let lx = 0, ly = 0;
    if (keys['ArrowUp']) ly -= 1; if (keys['ArrowDown']) ly += 1;
    if (keys['ArrowLeft']) lx -= 1; if (keys['ArrowRight']) lx += 1;
    if (joyRight.active) { lx = joyRight.x; ly = joyRight.y; }
    if (lx !== 0 || ly !== 0) player.rotation = Math.atan2(ly, lx);

    // Trail
    if (frameCount % 4 === 0 || player.isDashing) {
        player.trail.push({ x: player.x, y: player.y, r: player.rotation, a: player.isDashing ? 0.8 : 0.5 });
    }
    if (player.trail.length > 10) player.trail.shift();

    // Combo
    if (comboTimer > 0) {
        comboTimer--;
        if (comboTimer === 0) { combo = 1; comboEl.classList.add('hidden'); }
    }

    // Enemies
    enemies.forEach(e => {
        if (e.type === 'patrol') {
            const t = e.target === 1 ? e.p1 : e.p2;
            if (Math.hypot(t.x - e.x, t.y - e.y) < 5) e.target = e.target === 1 ? 2 : 1;
            else {
                const ang = Math.atan2(t.y - e.y, t.x - e.x);
                const ex = e.x + Math.cos(ang) * e.speed;
                const ey = e.y + Math.sin(ang) * e.speed;
                if (!checkWallCollision(ex, e.y)) e.x = ex; else e.target = e.target === 1 ? 2 : 1;
                if (!checkWallCollision(e.x, ey)) e.y = ey; else e.target = e.target === 1 ? 2 : 1;
            }
        } else {
            const ang = Math.atan2(player.y - e.y, player.x - e.x);
            e.x += Math.cos(ang) * e.speed;
            e.y += Math.sin(ang) * e.speed;
        }
    });

    // Projectile Calc
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Wall Collision
        if (checkWallCollision(p.x, p.y) || p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
            spawnParticles(p.x, p.y, '#ff4500');
            projectiles.splice(i, 1);
            continue;
        }

        // Enemy Collision
        let hit = false;
        for (let j = enemies.length - 1; j >= 0; j--) {
            const e = enemies[j];
            if (Math.hypot(p.x - e.x, p.y - e.y) < p.radius + e.radius) {
                // Kill Enemy
                enemies.splice(j, 1);
                score += 50 * combo; scoreEl.innerText = `Score: ${score}`;
                spawnParticles(e.x, e.y, '#e94560');
                spawnFloatingText("DESTROYED!", e.x, e.y, '#e94560');
                playSound('hit');

                // Queue Respawn (3 seconds = 180 frames)
                respawnQueue.push({ type: e.type, timer: 180 });

                hit = true;
                break;
            }
        }
        if (hit) projectiles.splice(i, 1);
    }

    // Process Respawns
    for (let i = respawnQueue.length - 1; i >= 0; i--) {
        respawnQueue[i].timer--;
        if (respawnQueue[i].timer <= 0) {
            trySpawnEntity(respawnQueue[i].type);
            respawnQueue.splice(i, 1);
        }
    }

    // Process Respawns
    for (let i = respawnQueue.length - 1; i >= 0; i--) {
        respawnQueue[i].timer--;
        if (respawnQueue[i].timer <= 0) {
            trySpawnEntity(respawnQueue[i].type);
            respawnQueue.splice(i, 1);
        }
    }

    // Portal
    if (portal) {
        portal.angle += 0.05;
        if (Math.hypot(portal.x - player.x, portal.y - player.y) < portal.radius + player.radius) {
            nextLevel();
        }
    } else if (coins.length === 0) { spawnPortal(); }

    // Collisions
    for (let i = coins.length - 1; i >= 0; i--) {
        const c = coins[i];
        if (Math.hypot(c.x - player.x, c.y - player.y) < player.radius + c.radius) {
            collectCoin(c); coins.splice(i, 1);
        }
    }
    for (let i = powerups.length - 1; i >= 0; i--) {
        const p = powerups[i];
        if (Math.hypot(p.x - player.x, p.y - player.y) < player.radius + 12) {
            activatePowerup(p.type); powerups.splice(i, 1);
        }
    }

    // Dmg
    if (player.invincibleTime > 0) player.invincibleTime--;
    else if (!player.isDashing) {
        enemies.forEach(e => {
            if (Math.hypot(e.x - player.x, e.y - player.y) < player.radius + e.radius) {
                takeDamage();
            }
        });
    }

    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.life -= 0.05;
        if (p.life <= 0) particles.splice(i, 1);
    }
    if (shakeTime > 0) shakeTime--;
}

function collectCoin(c) {
    combo++; comboTimer = 180;
    if (combo > 1) { comboEl.innerText = "x" + combo + " COMBO!"; comboEl.classList.remove('hidden'); }

    // Golden Coin Logic
    let val = 10;
    let color = '#fca311';
    if (c.isGold) { val = 500; color = '#ffd700'; playSound('goldcoin'); }
    else { playSound('coin'); }

    const points = val * combo;
    score += points;
    scoreEl.innerText = `Score: ${score}`;
    spawnFloatingText(`+${points}`, c.x, c.y - 10, color);

    gameStats.totalCoins++; checkAchievements();
    if (Math.random() < 0.05 + (combo * 0.01)) trySpawnEntity(Math.random() > 0.5 ? 'speed' : 'shield');
    spawnParticles(c.x, c.y, color);
}

function spawnPortal() {
    portal = { x: canvas.width / 2, y: canvas.height / 2, radius: 30, angle: 0 };
    playSound('portal');
    let attempts = 0;
    while (checkWallCollision(portal.x, portal.y) && attempts < 10) {
        portal.x = Math.random() * canvas.width; portal.y = Math.random() * canvas.height; attempts++;
    }
}

function nextLevel() {
    if (level === MAX_LEVELS) { victory(); return; }
    level++;
    if (level > gameStats.highestLevel) { gameStats.highestLevel = level; checkAchievements(); }
    score += 100 * level; scoreEl.innerText = `Score: ${score}`; levelEl.innerText = "Level " + level;
    if (player.health < 3) { player.health++; healthEl.innerText = "❤️".repeat(player.health); }
    playSound('portal');
    startLevelTransition(); // Use transition
}

function activatePowerup(type) {
    spawnParticles(player.x, player.y, '#fff'); playSound('powerup');
    if (type === 'speed') { player.speed = player.baseSpeed * 1.8; setTimeout(() => player.speed = player.baseSpeed, 5000); }
    else if (type === 'shield') player.hasShield = true;
    spawnFloatingText(type.toUpperCase() + "!", player.x, player.y - 20, '#fff');
}

function takeDamage() {
    if (player.hasShield) {
        player.hasShield = false; player.invincibleTime = 60; playSound('hit'); spawnParticles(player.x, player.y, '#00ffff');
        spawnFloatingText("BLOCKED!", player.x, player.y - 20, '#00ffff');
        return;
    }
    player.health--; healthEl.innerText = "❤️".repeat(player.health);
    shakeTime = 20; player.invincibleTime = 60; playSound('hit'); spawnParticles(player.x, player.y, '#ff0000');
    spawnFloatingText("-1 HP", player.x, player.y - 20, '#ff0000');
    combo = 1; comboEl.classList.add('hidden');
    if (player.health <= 0) gameOver();
}

function checkWallCollision(x, y) {
    for (const w of obstacles) {
        const cx = Math.max(w.x, Math.min(x, w.x + w.w));
        const cy = Math.max(w.y, Math.min(y, w.y + w.h));
        if ((x - cx) ** 2 + (y - cy) ** 2 < player.radius ** 2) return true;
    }
    return false;
}

function spawnParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const s = Math.random() * 3 + 1;
        particles.push({ x, y, vx: Math.cos(angle) * s, vy: Math.sin(angle) * s, life: 1, color });
    }
}

function saveStats() {
    if (score > gameStats.highScore) gameStats.highScore = score;
    localStorage.setItem('fcc_stats', JSON.stringify(gameStats));
}
function gameOver() {
    gameActive = false; gameStats.totalDeaths++; saveStats(); playSound('gameover');
    goTitle.innerText = "GAME OVER"; gameOverScreen.classList.remove('victory'); showEndScreen();
}
function victory() {
    gameActive = false; if (gameStats.highestLevel < 11) { gameStats.highestLevel = 11; checkAchievements(); }
    saveStats(); playSound('victory'); goTitle.innerText = "VICTORY!"; gameOverScreen.classList.add('victory'); showEndScreen();
}
function showEndScreen() {
    finalStatsEl.innerText = `Final Score: ${score} | Reached Level: ${level}`;
    statCoins.innerText = gameStats.totalCoins; statDeaths.innerText = gameStats.totalDeaths;
    statLevel.innerText = gameStats.highestLevel > 10 ? "COMPLETED" : gameStats.highestLevel;
    badgesContainer.innerHTML = '';
    ACHIEVEMENTS.forEach(ach => {
        const span = document.createElement('span'); span.className = 'badge';
        if (gameStats.achievements.includes(ach.id)) { span.classList.add('unlocked'); span.innerText = `★ ${ach.title}`; }
        else { span.innerText = `🔒 ${ach.title}`; }
        badgesContainer.appendChild(span);
    });
    gameOverScreen.classList.remove('hidden');
}

// Listeners
window.addEventListener('keydown', e => {
    if (e.key === 'Escape') togglePauseMenu();
    keys[e.key] = true;
});
window.addEventListener('keyup', e => { keys[e.key] = false; });

// Draw
function draw() {
    // If transitioning, handled by HTML overlay opacity.
    ctx.save();
    if (shakeTime > 0) ctx.translate((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
    ctx.fillStyle = '#16213e'; ctx.fillRect(0, 0, canvas.width, canvas.height);

    // BG Stars
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    bgStars.forEach(s => {
        ctx.beginPath(); ctx.arc(s.x, s.y, s.s, 0, Math.PI * 2); ctx.fill();
    });

    // Obstacles
    obstacles.forEach(w => {
        ctx.fillStyle = '#0f3460'; ctx.fillRect(w.x, w.y, w.w, w.h);
        ctx.strokeStyle = '#533483'; ctx.lineWidth = 2; ctx.strokeRect(w.x, w.y, w.w, w.h);
        ctx.fillStyle = '#1a1a2e'; ctx.fillRect(w.x + 4, w.y + 4, w.w - 8, w.h - 8);
    });

    if (portal) {
        ctx.save(); ctx.translate(portal.x, portal.y); ctx.rotate(portal.angle);
        ctx.beginPath(); ctx.arc(0, 0, portal.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ff00ff'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.setLineDash([5, 5]); ctx.stroke();
        ctx.restore();
    }

    powerups.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.setLineDash([]); ctx.stroke();
        ctx.fillStyle = '#000'; ctx.font = '10px Arial'; ctx.textAlign = 'center'; ctx.fillText(p.type === 'speed' ? 'S' : 'H', p.x, p.y + 4);
    });

    // Projectiles
    projectiles.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.fill();
        ctx.shadowBlur = 10; ctx.shadowColor = p.color; ctx.fill(); ctx.shadowBlur = 0;
    });

    player.trail.forEach(t => {
        ctx.save(); ctx.translate(t.x, t.y); ctx.rotate(t.r);
        ctx.globalAlpha = t.a; ctx.fillStyle = player.color;
        ctx.beginPath(); ctx.arc(0, 0, player.radius * 0.8, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    });

    coins.forEach(c => {
        ctx.beginPath(); ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
        ctx.fillStyle = c.isGold ? '#ffd700' : '#fca311';
        ctx.fill(); ctx.strokeStyle = '#fff'; ctx.setLineDash([]); ctx.stroke();
    });

    enemies.forEach(e => {
        ctx.beginPath(); ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        if (e.type === 'ghost') ctx.fillStyle = '#9d4edd'; else if (e.type === 'patrol') ctx.fillStyle = '#ffbe0b'; else ctx.fillStyle = '#e94560';
        ctx.fill();
        ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(e.x - 5, e.y - 3, 3, 0, Math.PI * 2); ctx.arc(e.x + 5, e.y - 3, 3, 0, Math.PI * 2); ctx.fill();
    });

    if (player.invincibleTime % 4 < 2) {
        ctx.save(); ctx.translate(player.x, player.y); ctx.rotate(player.rotation);
        ctx.fillStyle = player.color; ctx.beginPath(); ctx.arc(0, 0, player.radius, 0, Math.PI * 2); ctx.fill();
        if (player.hasShield) { ctx.strokeStyle = '#00ffff'; ctx.lineWidth = 4; ctx.stroke(); }
        else { ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke(); }
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(0, -5); ctx.lineTo(0, 5); ctx.fill();
        ctx.restore();
    }

    particles.forEach(p => {
        ctx.globalAlpha = p.life; ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.restore();
}

function loop() {
    if (!isPaused) { update(); draw(); }
    if (gameActive) requestAnimationFrame(loop);
}
// Start
for (let i = 0; i < 50; i++) bgStars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, s: Math.random() * 2 });
startLevelTransition();
