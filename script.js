// NinjaPVP Ranking Engine v2.0 - Consolidated & Fixed
let playersData = [];
let currentMode = 'overall';
let searchQuery = '';
let currentLang = 'en';

// Translations
const translations = {
    en: {
        subtitle: "The most competitive PvP server, featuring a fully custom and exclusive ELO ranking system.",
        searchPlaceholder: "Search player...",
        pos: "POS",
        player: "PLAYER",
        modalities: "MODALITIES",
        topPlayer: "Top Player",
        activePlayers: "Active Players",
        totalMatches: "Total Matches",
        avgElo: "Average ELO",
        currentlyOnline: "Currently online",
        allTime: "All time"
    },
    es: {
        subtitle: "El servidor de PvP más competitivo, con un sistema de ranking ELO personalizado y exclusivo.",
        searchPlaceholder: "Buscar jugador...",
        pos: "POS",
        player: "JUGADOR",
        modalities: "MODALIDADES",
        topPlayer: "Top Jugador",
        activePlayers: "Jugadores Activos",
        totalMatches: "Partidas Totales",
        avgElo: "ELO Promedio",
        currentlyOnline: "Actualmente online",
        allTime: "Total"
    }
};

// --- DATA LOADING ---
async function loadPlayerData() {
    try {
        console.log("Fetching player data...");
        // Cache busting con timestamp para evitar versiones viejas de GitHub
        const response = await fetch('assets/players.json?t=' + Date.now());
        if (!response.ok) throw new Error("File not found");
        const data = await response.json();
        
        // El formato del JSON que genera el plugin es una lista directa de jugadores
        if (data && data.length > 0) {
            playersData = data;
        } else {
            console.warn("Empty data received, using fallback.");
            playersData = [];
        }
        
        renderRanking();
        updateStats();
    } catch (error) {
        console.error("Error loading player data:", error);
        playersData = []; 
        renderRanking();
    }
}

// --- CORE LOGIC ---
function getOverallELO(player) {
    if (typeof player.points === 'number') return player.points;
    if (!player.rankings) return 0;
    // Suma de las modalidades principales
    const modes = ['sword', 'pot', 'axe', 'mace', 'netherop', 'smp', 'uhc', 'vanilla'];
    return modes.reduce((acc, mode) => acc + (player.rankings[mode] || 0), 0);
}

function getPlayerELO(player) {
    if (currentMode === 'overall') return getOverallELO(player);
    return player.rankings ? (player.rankings[currentMode] || 0) : 0;
}

function getRank(mode, elo) {
    if (playersData.length === 0) return 0;
    const sorted = [...playersData].sort((a, b) => {
        const aElo = mode === 'overall' ? getOverallELO(a) : (a.rankings ? a.rankings[mode] || 0 : 0);
        const bElo = mode === 'overall' ? getOverallELO(b) : (b.rankings ? b.rankings[mode] || 0 : 0);
        return bElo - aElo;
    });
    return sorted.findIndex(p => {
        const pElo = mode === 'overall' ? getOverallELO(p) : (p.rankings ? p.rankings[mode] || 0 : 0);
        return pElo === elo;
    }) + 1;
}

function getWinrate(wins, losses) {
    if (wins + losses === 0) return 0;
    return ((wins / (wins + losses)) * 100).toFixed(1);
}

function getSkinUrl(player) {
    const identifier = player.username || 'Steve';
    return `https://mc-heads.net/body/${identifier}`;
}

// --- UI RENDERING ---
function createAnimatedTitle() {
    const titleElement = document.getElementById('title');
    if (!titleElement) return;
    const titleText = 'NinjaPVP';
    titleElement.innerHTML = '';

    titleText.split('').forEach((letter, index) => {
        const span = document.createElement('span');
        span.className = 'title-letter';
        span.textContent = letter === ' ' ? '\u00A0' : letter;
        span.setAttribute('data-letter', letter);
        span.style.animationDelay = `${index * 0.1}s`;
        titleElement.appendChild(span);
    });
}

function renderRanking() {
    const tbody = document.getElementById('ranking-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (playersData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 50px; color: rgba(255,255,255,0.5);">No player data found. Syncing with server...</td></tr>';
        return;
    }

    // Filter & Sort
    let filtered = playersData.filter(p => p.username.toLowerCase().includes(searchQuery.toLowerCase()));
    filtered.sort((a, b) => getPlayerELO(b) - getPlayerELO(a));

    filtered.forEach((player, index) => {
        const elo = getPlayerELO(player);
        const isTop1 = index === 0 && searchQuery === '';
        const isTop2 = index === 1 && searchQuery === '';
        const isTop3 = index === 2 && searchQuery === '';

        const row = document.createElement('tr');
        row.className = 'ranking-row';
        if (player.uuid) row.setAttribute('data-uuid', player.uuid);

        // Rank Column
        let rankHtml;
        if (isTop1 || isTop2 || isTop3) {
            const variant = isTop1 ? 'gold' : isTop2 ? 'silver' : 'bronze';
            rankHtml = `<div class="rank-banner ${variant}"><span class="rank-number">${index + 1}</span></div>`;
        } else {
            rankHtml = `<span class="rank-standard">${index + 1}</span>`;
        }

        // Modalities Column
        const modes = ['sword', 'pot', 'axe', 'mace', 'netherop', 'smp', 'uhc', 'vanilla'];
        const modalitiesHtml = modes.map(m => {
            const mElo = player.rankings ? (player.rankings[m] || 0) : 0;
            const mRank = getRank(m, mElo);
            let icon = m === 'pot' ? 'potion.png' : m === 'smp' ? 'smp.png' : `${m}.png`;
            
            return `
                <div class="modality-group" data-modality="${m}">
                    <div class="modality-circle"><img class="modality-icon" src="./assets/${icon}" alt="${m}"></div>
                    <div class="modality-badge">
                        <span class="modality-rank ${mRank <= 1 ? 'top-1' : mRank <= 3 ? 'top-3' : mRank <= 5 ? 'top-5' : ''}">#${mRank}</span>
                    </div>
                </div>
            `;
        }).join('');

        row.innerHTML = `
            <td class="col-rank">${rankHtml}</td>
            <td class="col-player clickable-row">
                <div class="player-info">
                    <div class="player-skin"><img src="${getSkinUrl(player)}" alt="${player.username}"></div>
                    <div class="player-details">
                        <span class="player-name">${player.username}</span>
                        <span class="player-elo-info"><span class="player-elo-highlight">ELO ${elo.toLocaleString()}</span> &nbsp;•&nbsp; Global Rank #${index + 1}</span>
                    </div>
                </div>
            </td>
            <td class="col-modalities">${modalalitiesHtml}</td>
        `;

        row.addEventListener('click', () => showPlayerProfile(player));
        tbody.appendChild(row);
    });
}

function updateStats() {
    if (!playersData || playersData.length === 0) {
        document.getElementById('stat-top-player').textContent = "-";
        document.getElementById('stat-active-players').textContent = "0";
        document.getElementById('stat-matches').textContent = "0";
        document.getElementById('stat-avg-elo').textContent = "0";
        return;
    }

    // Top Player
    const top = playersData.reduce((prev, curr) => getPlayerELO(curr) > getPlayerELO(prev) ? curr : prev, playersData[0]);
    document.getElementById('stat-top-player').textContent = top.username || "Unknown";
    document.getElementById('stat-top-mode').textContent = currentMode.charAt(0).toUpperCase() + currentMode.slice(1);

    // Active
    document.getElementById('stat-active-players').textContent = playersData.length;

    // Total Matches (Real calc from rankings)
    let totalW = 0, totalL = 0;
    playersData.forEach(p => {
        if (p.rankings) {
            ['sword','pot','axe','mace','netherop','smp','uhc','vanilla'].forEach(m => {
                totalW += (parseInt(p.rankings[`${m}_w`]) || 0);
                totalL += (parseInt(p.rankings[`${m}_l`]) || 0);
            });
        }
    });
    const matches = Math.floor((totalW + totalL) / 2);
    document.getElementById('stat-matches').textContent = matches >= 1000 ? (matches/1000).toFixed(1) + 'k' : matches;

    // Avg ELO
    const avg = Math.round(playersData.reduce((acc, p) => acc + getPlayerELO(p), 0) / playersData.length);
    document.getElementById('stat-avg-elo').textContent = avg.toLocaleString();
    document.getElementById('stat-avg-mode').textContent = currentMode.charAt(0).toUpperCase() + currentMode.slice(1);
}

// --- MODAL ---
function showPlayerProfile(player) {
    const modal = document.getElementById('player-modal');
    if (!modal) return;

    document.getElementById('modal-player-skin').src = getSkinUrl(player);
    document.getElementById('modal-player-name').textContent = player.username;
    
    const overall = getOverallELO(player);
    document.getElementById('modal-player-elo').textContent = `ELO: ${overall.toLocaleString()}`;
    document.getElementById('modal-player-global-rank').textContent = `Global Rank: #${getRank('overall', overall)}`;

    const modes = ['sword', 'pot', 'axe', 'mace', 'netherop', 'smp', 'uhc', 'vanilla'];
    let totalW = 0, totalL = 0;
    
    const grid = document.getElementById('modal-modality-grid');
    grid.innerHTML = '';

    modes.forEach(m => {
        const elo = player.rankings ? (player.rankings[m] || 0) : 0;
        const w = player.rankings ? (player.rankings[`${m}_w`] || 0) : 0;
        const l = player.rankings ? (player.rankings[`${m}_l`] || 0) : 0;
        totalW += w; totalL += l;

        let icon = m === 'pot' ? 'potion.png' : m === 'smp' ? 'smp.png' : `${m}.png`;
        const card = document.createElement('div');
        card.className = 'modality-stat-card';
        card.innerHTML = `
            <div class="modality-stat-header">
                <span class="modality-stat-name">${m.toUpperCase()}</span>
                <img class="modality-stat-icon" src="./assets/${icon}" alt="${m}">
            </div>
            <div class="modality-stat-elo">${elo.toLocaleString()} ELO</div>
            <div class="modality-stat-winrate">${getWinrate(w, l)}% Winrate</div>
            <div class="modality-stat-details">
                <div class="modality-stat-detail">
                    <div class="modality-stat-value-small">${w}</div>
                    <div class="modality-stat-label-small">Wins</div>
                </div>
                <div class="modality-stat-detail">
                    <div class="modality-stat-value-small">${l}</div>
                    <div class="modality-stat-label-small">Losses</div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    document.getElementById('modal-total-wins').textContent = totalW;
    document.getElementById('modal-total-losses').textContent = totalL;
    document.getElementById('modal-total-games').textContent = totalW + totalL;
    document.getElementById('modal-total-winrate').textContent = getWinrate(totalW, totalL) + '%';

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePlayerModal() {
    const modal = document.getElementById('player-modal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    loadPlayerData();
    createAnimatedTitle();

    // Event Listeners
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderRanking();
        });
    }

    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.getAttribute('data-mode');
            renderRanking();
            updateStats();
        });
    });

    const langBtn = document.getElementById('lang-btn');
    const langWrapper = document.getElementById('lang-selector-wrapper');
    if (langBtn) {
        langBtn.addEventListener('click', () => langWrapper.classList.toggle('open'));
    }

    document.querySelectorAll('.lang-option').forEach(opt => {
        opt.addEventListener('click', () => {
            currentLang = opt.getAttribute('data-value');
            document.getElementById('lang-current').textContent = currentLang.toUpperCase();
            langWrapper.classList.remove('open');
            updateTranslations();
        });
    });

    // Modal behavior
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('dynamic-island');
        if (window.scrollY > 50) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
    });

    // Auto-update every 60s
    setInterval(loadPlayerData, 60000);
});

function updateTranslations() {
    const t = translations[currentLang];
    document.getElementById('hero-subtitle').textContent = t.subtitle;
    document.getElementById('search-input').placeholder = t.searchPlaceholder;
    document.getElementById('th-pos').textContent = t.pos;
    document.getElementById('th-player').textContent = t.player;
    document.getElementById('th-modalities').textContent = t.modalities;
    
    const labels = document.querySelectorAll('.stat-label');
    labels[0].textContent = t.topPlayer;
    labels[1].textContent = t.activePlayers;
    labels[2].textContent = t.totalMatches;
    labels[3].textContent = t.avgElo;
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
