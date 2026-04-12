const mcNames = [
    "Technoblade", "Stonks-", "Trophy-", "clutch-", "V-", "Fruitberries", "luz-", "Dodge-", "P-", "BOZ-", "Sapnap",
    "Dream", "GeorgeNotFound", "Sapnap", "Quig", "Illumina", "Krtzyy", "PunZ", "TapL", "Purpled", "Hannahxxrose",
    "Wallibear", "Nestor", "Calvin", "Xulu", "Renzoh", "Luvic", "Speardish", "Melted", "Frosty", "Ignite",
    "Shadow", "Lunar", "Solar", "Nova", "Cosmos", "Void", "Ether", "Flux", "Nexus", "Prism",
    "Stealth", "Hunter", "Warrior", "Knight", "Rogue", "Mage", "Archer", "Slayer", "Titan", "Colossus",
    "Rampage", "Havoc", "Chaos", "Zenith", "Apex", "Summit", "Peak", "Vertigo", "Zephyr", "Gale",
    "Breeze", "Storm", "Thunder", "Bolt", "Shock", "Spark", "Ember", "Ash", "Dust", "Mist",
    "Gloom", "Abyss", "Dread", "Fear", "Panic", "Rage", "Fury", "Wrath", "Malice", "Bane",
    "Scourge", "Plague", "Venom", "Toxic", "Acid", "Blight", "Corruption", "Decay", "Bones", "Spirit",
    "Ghost", "Phantom", "Wraith", "Specter", "Shade", "Echo", "Whisper", "Murmur", "Silence", "Drift"
];

function generate100Players() {
    const data = [];
    const usedNames = new Set();
    const primary = ["Technoblade", "Stonks-", "Trophy-", "clutch-", "V-", "Fruitberries"];
    
    primary.forEach(name => {
        data.push({
            username: name,
            sword: 2000 + Math.floor(Math.random() * 150),
            pot: 2000 + Math.floor(Math.random() * 150),
            axe: 2000 + Math.floor(Math.random() * 150),
            overall: 2000 + Math.floor(Math.random() * 150),
            change: Math.floor(Math.random() * 30) - 15,
            uuid: crypto.randomUUID ? crypto.randomUUID() : (Math.random().toString(36).substring(2, 10) + "-uuid")
        });
        usedNames.add(name);
    });

    while (data.length < 100) {
        const nameIdx = Math.floor(Math.random() * mcNames.length);
        const name = mcNames[nameIdx] + (Math.random() > 0.7 ? Math.floor(Math.random() * 100) : "");
        if (!usedNames.has(name)) {
            data.push({
                username: name,
                sword: 1500 + Math.floor(Math.random() * 600),
                pot: 1500 + Math.floor(Math.random() * 600),
                axe: 1500 + Math.floor(Math.random() * 600),
                overall: 1500 + Math.floor(Math.random() * 600),
                change: Math.floor(Math.random() * 20) - 10,
                uuid: crypto.randomUUID ? crypto.randomUUID() : (Math.random().toString(36).substring(2, 10) + "-uuid")
            });
            usedNames.add(name);
        }
    }
    return data;
}

let playersData = [];

async function loadPlayerData() {
    try {
        // Añadimos un timestamp para evitar que el navegador cargue una versión vieja (Cache Busting)
        const response = await fetch('assets/players.json?t=' + Date.now());
        const data = await response.json();
        
        if (data && data.length > 0) {
            playersData = data.map(p => ({
                ...p,
                username: p.username,
                sword: (p.rankings && p.rankings.sword) || 0,
                pot: (p.rankings && p.rankings.pot) || 0,
                axe: (p.rankings && p.rankings.axe) || 0,
                mace: (p.rankings && p.rankings.mace) || 0,
                netherop: (p.rankings && p.rankings.netherop) || 0,
                smp: (p.rankings && p.rankings.smp) || 0,
                uhc: (p.rankings && p.rankings.uhc) || 0,
                vanilla: (p.rankings && p.rankings.vanilla) || 0,
                crystal: (p.rankings && p.rankings.crystal) || 0,
                overall: p.points || 0,
                change: 0,
                uuid: p.uuid
            }));
        } else {
            playersData = generate100Players();
        }
        
        renderLeaderboard();
        initCounters();
    } catch (error) {
        console.error("Error loading player data:", error);
        // Fallback a generación aleatoria si no hay archivo
        playersData = generate100Players();
        renderLeaderboard();
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    loadPlayerData();
    
    // Polling cada 60 segundos (GitHub Pages tarda un poco en actualizar)
    setInterval(loadPlayerData, 60000);
});

const i18n = {
    en: {
        page_title: "FLOWTIERS – THE TRUE COMPETITIVE RANKING",
        nav_rankings: "RANKINGS",
        nav_history: "HISTORY",
        nav_discord: "DISCORD",
        search_placeholder: "Search player...",
        hero_title: "FLOWTIERS – THE TRUE <span class='text-gradient'>COMPETITIVE</span> <br> RANKING SYSTEM",
        hero_subtitle: "Real-time ELO, updated rankings, dominate every modality.",
        btn_view_rankings: "VIEW RANKINGS",
        btn_search_player: "SEARCH PLAYER",
        label_ranked_players: "RANKED PLAYERS",
        label_matches: "MATCHES REGISTERED",
        label_top_global: "CURRENT TOP GLOBAL",
        leaderboard_title: "LEADERBOARD",
        tab_overall: "Overall",
        tab_sword: "Sword",
        tab_pot: "Pot",
        tab_axe: "Axe",
        header_rank: "RANK",
        header_player: "PLAYER",
        header_modality_stats: "MODALITY STATISTICS",
        label_global_rank: "Global Rank",
        label_overall_elo: "OVERALL ELO",
        label_winrate: "Winrate",
        label_matches_played: "Matches",
        footer_text: "&copy; 2026 FLOWTIERS. Inspired by the competitive spirit.",
        tab_sword_label: "SWORD",
        tab_pot_label: "POT",
        tab_axe_label: "AXE"
    },
    es: {
        page_title: "FLOWTIERS – EL VERDADERO RANKING COMPETITIVO",
        nav_rankings: "RANKINGS",
        nav_history: "HISTORIAL",
        nav_discord: "DISCORD",
        search_placeholder: "Buscar jugador...",
        hero_title: "FLOWTIERS – EL VERDADERO <span class='text-gradient'>RANKING</span> <br> COMPETITIVO",
        hero_subtitle: "ELO real, rankings actualizados, domina cada modalidad.",
        btn_view_rankings: "VER RANKINGS",
        btn_search_player: "BUSCAR JUGADOR",
        label_ranked_players: "JUGADORES RANKEADOS",
        label_matches: "PARTIDAS REGISTRADAS",
        label_top_global: "ACTUAL TOP GLOBAL",
        leaderboard_title: "TABLA DE POSICIONES",
        tab_overall: "General",
        tab_sword: "Espada",
        tab_pot: "Pot",
        tab_axe: "Hacha",
        header_rank: "POS",
        header_player: "JUGADOR",
        header_modality_stats: "ESTADÍSTICAS POR MODALIDAD",
        label_global_rank: "Rango Global",
        label_overall_elo: "ELO GENERAL",
        label_winrate: "Winrate",
        label_matches_played: "Partidas",
        footer_text: "&copy; 2026 FLOWTIERS. Inspirado por el espíritu competitivo.",
        tab_sword_label: "ESPADA",
        tab_pot_label: "POT",
        tab_axe_label: "HACHA"
    }
};

let currentLang = 'en';
let currentMode = 'overall';
let currentFilter = '';
let ongoingFights = [];

document.addEventListener('DOMContentLoaded', () => {
    initCounters();
    lucide.createIcons();

    document.getElementById('player-search').addEventListener('input', (e) => {
        currentFilter = e.target.value.toLowerCase();
        renderLeaderboard();
    });

    document.getElementById('lang-toggle').addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'es' : 'en';
        updateTranslations();
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderLeaderboard();
        });
    });

    window.addEventListener('mousemove', (e) => {
        const bubble = document.getElementById('search-bubble');
        if (bubble) {
            bubble.style.left = e.clientX + 'px';
            bubble.style.top = e.clientY + 'px';
        }
    });

    for (let i = 0; i < 4; i++) {
        spawnNewFight();
    }
    
    setInterval(spawnNewFight, 3000);
    setInterval(processArenaTick, 1000);

    toggleView('arena');
});

function spawnNewFight() {
    if (ongoingFights.length >= 10) return;

    const available = playersData.filter(p => !ongoingFights.some(f => f.p1.username === p.username || f.p2.username === p.username));
    if (available.length < 2) return;

    const p1 = available.splice(Math.floor(Math.random() * available.length), 1)[0];
    const p2 = available.splice(Math.floor(Math.random() * available.length), 1)[0];
    const modes = ['sword', 'pot', 'axe'];
    const mode = modes[Math.floor(Math.random() * modes.length)];

    const fight = {
        id: Math.random().toString(36).substring(2, 9),
        p1: p1,
        p2: p2,
        p1Hp: 20,
        p2Hp: 20,
        mode: mode,
        startTime: Date.now()
    };

    ongoingFights.push(fight);
    renderArena();
}

function processArenaTick() {
    ongoingFights.forEach(fight => {
        const card = document.querySelector(`.fight-card[data-id="${fight.id}"]`);
        if (!card) return;

        if (Math.random() < 0.4) return; 

        const target = Math.random() < 0.5 ? 1 : 2;
        const isHeal = fight.mode === 'pot' && Math.random() < 0.15; 
        const val = 2; 
        
        if (isHeal) {
            if (target === 1 && fight.p1Hp < 20) fight.p1Hp = Math.min(20, fight.p1Hp + val);
            else if (target === 2 && fight.p2Hp < 20) fight.p2Hp = Math.min(20, fight.p2Hp + val);
            
            const receiver = card.querySelector(`.fighter-${target}`);
            receiver.classList.add('healing-pulse');
            setTimeout(() => receiver.classList.remove('healing-pulse'), 600);
        } else {
            if (target === 1) fight.p1Hp -= val;
            else fight.p2Hp -= val;

            const victim = card.querySelector(`.fighter-${target}`);
            victim.classList.add('taking-hit');
            setTimeout(() => victim.classList.remove('taking-hit'), 400);
        }

        if (fight.p1Hp <= 0 || fight.p2Hp <= 0) {
            const winner = fight.p1Hp > 0 ? fight.p1 : fight.p2;
            const loser = fight.p1Hp > 0 ? fight.p2 : fight.p1;
            
            card.classList.add('exiting');
            
            setTimeout(() => {
                ongoingFights = ongoingFights.filter(f => f.id !== fight.id);
                card.remove();
                if (ongoingFights.length === 0) {
                    document.getElementById('arena-empty').style.display = 'block';
                }
            }, 600);
        } else {
            const h1 = card.querySelector('.fighter-1 .hp-container');
            const h2 = card.querySelector('.fighter-2 .hp-container');
            if (h1) h1.innerHTML = renderHearts(fight.p1Hp);
            if (h2) h2.innerHTML = renderHearts(fight.p2Hp);
        }
    });
}

function renderArena() {
    const grid = document.getElementById('arena-grid');
    const empty = document.getElementById('arena-empty');
    if (!grid) return;

    if (ongoingFights.length > 0) empty.style.display = 'none';

    ongoingFights.forEach(f => {
        let card = document.querySelector(`.fight-card[data-id="${f.id}"]`);
        if (!card) {
            card = document.createElement('div');
            card.className = 'fight-card';
            card.setAttribute('data-id', f.id);
            card.innerHTML = `
                <div class="fighter fighter-1">
                    <img class="fighter-bust" src="https://mc-heads.net/body/${f.p1.username}" onerror="this.src='https://mc-heads.net/body/MHF_Steve'" alt="${f.p1.username}">
                    <span class="fighter-name">${f.p1.username}</span>
                    <div class="hp-container">${renderHearts(f.p1Hp)}</div>
                </div>
                <div class="fight-meta">
                    <div class="mode-badge">${getModeIcon(f.mode)}</div>
                    <div class="vs-text">VS</div>
                </div>
                <div class="fighter fighter-2">
                    <img class="fighter-bust" src="https://mc-heads.net/body/${f.p2.username}" onerror="this.src='https://mc-heads.net/body/MHF_Steve'" alt="${f.p2.username}">
                    <span class="fighter-name">${f.p2.username}</span>
                    <div class="hp-container">${renderHearts(f.p2Hp)}</div>
                </div>
            `;
            grid.appendChild(card);
        }
    });
}

function renderHearts(hp) {
    const isFull = hp > 0;
    const color = isFull ? (hp <= 6 ? '#FF4545' : '#FF0000') : 'rgba(255,255,255,0.1)';
    const borderColor = isFull ? '#5D0000' : 'rgba(100,100,100,0.3)';
    
    return `
        <div class="hp-indicator">
            <div class="heart-icon-big ${hp <= 6 ? 'critical' : ''}">
                <svg viewBox="0 0 32 32" width="24" height="24">
                    <path d="M16,28.2 L13.7,26.1 C5.5,18.7 0,13.7 0,7.6 C0,3.3 3.3,0 7.6,0 C10.1,0 12.4,1.1 14,2.9 C15.6,1.1 17.9,0 20.4,0 C24.7,0 28,3.3 28,7.6 C28,13.7 22.5,18.7 14.3,26.1 L16,28.2 Z" 
                          fill="${color}" stroke="${borderColor}" stroke-width="2"/>
                </svg>
            </div>
            <span class="hp-number" style="color: ${color}">${Math.max(0, hp)}</span>
            <span class="hp-max">/20</span>
        </div>
    `;
}

function getModeIcon(mode) {
    switch(mode) {
        case 'sword': return '<i data-lucide="sword"></i>';
        case 'pot': return '<i data-lucide="flask-conical"></i>';
        case 'axe': return '<i data-lucide="axe"></i>';
        default: return '';
    }
}

function openDiscord() {
    const overlay = document.getElementById('discord-overlay');
    const progress = document.getElementById('discord-progress');
    overlay.classList.add('active');
    setTimeout(() => { progress.style.width = '100%'; }, 50);
    setTimeout(() => {
        window.open('https://discord.gg/WTSWZ2UBF', '_blank');
        overlay.classList.remove('active');
        progress.style.width = '0%';
    }, 2500);
}

function toggleView(view) {
    const rankings = document.getElementById('rankings');
    const arena = document.getElementById('arena-section');
    const hero = document.getElementById('hero-section');
    const navRankings = document.getElementById('nav-rankings');
    const navArena = document.getElementById('nav-arena');

    if (view === 'rankings') {
        rankings.style.display = 'block';
        arena.style.display = 'none';
        hero.style.display = 'block';
        navRankings.classList.add('active');
        navArena.classList.remove('active');
        renderLeaderboard();
    } else {
        rankings.style.display = 'none';
        arena.style.display = 'block';
        hero.style.display = 'none';
        navRankings.classList.remove('active');
        navArena.classList.add('active');
        renderArena();
    }
}

function setMode(mode, btn) {
    currentMode = mode;
    document.querySelectorAll('.mode-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderLeaderboard();
}

function updateTranslations() {
    const strings = i18n[currentLang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (strings[key]) el.innerHTML = strings[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (strings[key]) el.placeholder = strings[key];
    });
    document.getElementById('lang-toggle').innerText = currentLang.toUpperCase();
    lucide.createIcons();
}

function initCounters() {
    if (playersData.length === 0) return;
    animateValue("stat-players", 0, playersData.length, 2000);
    animateValue("stat-matches", 0, 45200, 2500);
    const top = playersData.reduce((prev, current) => (prev.sword > current.sword) ? prev : current);
    document.getElementById('stat-top-player').innerText = top.username;
}

function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const val = Math.floor(progress * (end - start) + start);
        obj.innerHTML = val >= 1000 ? (val/1000).toFixed(1) + 'k' : val;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function renderLeaderboard() {
    const list = document.getElementById('leaderboard-list');
    if (!list) return;

    list.classList.add('transitioning');

    setTimeout(() => {
        const activeCards = new Set();
        
        const sorted = [...playersData].sort((a, b) => b[currentMode === 'overall' ? 'overall' : currentMode] - a[currentMode === 'overall' ? 'overall' : currentMode]);
        const filtered = sorted.filter(p => p.username.toLowerCase().includes(currentFilter));
        
        const CARD_HEIGHT = 160; 

        filtered.forEach((player, index) => {
            const id = `player-${player.username}`;
            activeCards.add(id);
            let card = document.getElementById(id);
            
            if (!card) {
                card = document.createElement('div');
                card.id = id;
                card.className = 'player-card fade-in';
                list.appendChild(card);
            }

            card.style.top = (index * CARD_HEIGHT) + 'px';

            const elo = currentMode === 'overall' ? player.overall : player[currentMode];
            const changeColor = player.change >= 0 ? '#10b981' : '#ef4444';
            const changeSign = player.change >= 0 ? '+' : '';

            card.innerHTML = `
                <div class="player-rank">#${index + 1}</div>
                <div class="player-info">
                    <img class="player-bust-img" src="https://mc-heads.net/body/${player.username}" onerror="this.src='https://mc-heads.net/body/MHF_Steve'" alt="${player.username}">
                    <div class="player-name-wrap">
                        <span class="player-name">${player.username}</span>
                        <span class="player-modality-rank" style="color: ${changeColor}">
                            ${getModeIcon(currentMode === 'overall' ? 'sword' : currentMode)} RANK ${index + 1}
                        </span>
                    </div>
                </div>
                <div class="player-stats">
                    <div class="stat-group">
                        <span class="stat-label">${currentMode.toUpperCase()} ELO</span>
                        <span class="stat-value elo-value">${elo}</span>
                    </div>
                    <div class="stat-change" style="color: ${changeColor}">
                        ${changeSign}${player.change}
                    </div>
                </div>
            `;
        });

        Array.from(list.children).forEach(child => {
            if (!activeCards.has(child.id)) {
                child.style.opacity = '0';
                child.style.transform = 'scale(0.9)';
                setTimeout(() => child.remove(), 300);
            }
        });

        list.style.height = (filtered.length * CARD_HEIGHT) + 'px';
        list.classList.remove('transitioning');
    }, 50);
}
