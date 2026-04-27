// Configuración y Estado Global
let playersData = [];
let currentMode = 'overall'; // 'overall', 'sword', 'pot', etc.
let searchQuery = '';

// Traducciones
const translations = {
    es: {
        all_matches: "Partidas totales",
        title: "NinjaPVP",
        overall: "General",
        sword: "Espada",
        pot: "Pociones",
        axe: "Hacha",
        mace: "Maza",
        netherop: "Nether OP",
        smp: "SMP",
        uhc: "UHC",
        vanilla: "Vanilla",
        all_time: "De todos los tiempos",
        stat_matches: "All time",
        active_players: "Currently online",
        avg_elo: "Overall",
        top_player: "Top Player",
        placeholder: "Buscar jugador...",
        no_data: "No player data found. Syncing with server...",
        modal_elo: "ELO",
        modal_rank: "Global Rank",
        modal_wins: "TOTAL WINS",
        modal_losses: "TOTAL LOSSES",
        modal_winrate: "WINRATE",
        modal_games: "TOTAL GAMES",
        modal_stats: "MODALITY STATISTICS",
        modal_wins_small: "WINS",
        modal_losses_small: "LOSSES"
    }
};

let currentLang = 'en'; // Default to EN as per HTML
const t = (key) => (translations[currentLang] && translations[currentLang][key]) || key;

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initSearch();
    initModeFilters();
    initLanguage();
    loadPlayerData();
    createAnimatedTitle();
});

async function loadPlayerData() {
    try {
        console.log("Fetching player data...");
        const response = await fetch('./assets/players.json?t=' + Date.now());
        if (!response.ok) throw new Error("File not found");
        const data = await response.json();
        
        if (data && data.length > 0) {
            playersData = data;
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
    if (!player.rankings) return player.points || 0;
    const modes = ['sword', 'pot', 'axe', 'mace', 'netherop', 'smp', 'uhc', 'vanilla'];
    const sum = modes.reduce((acc, mode) => acc + (player.rankings[mode] || 0), 0);
    return Math.max(player.points || 0, sum);
}

function getEloByMode(player, mode) {
    if (mode === 'overall') return getOverallELO(player);
    return player.rankings ? (player.rankings[mode] || 0) : 0;
}

function getRank(mode, elo, targetPlayer) {
    if (playersData.length === 0) return 0;
    // Cache sorted ranking for the mode to avoid O(N log N) per row
    const sorted = [...playersData].sort((a, b) => {
        const bElo = getEloByMode(b, mode);
        const aElo = getEloByMode(a, mode);
        if (bElo !== aElo) return bElo - aElo;
        return a.username.localeCompare(b.username);
    });
    return sorted.findIndex(p => p.username === targetPlayer.username) + 1;
}

function getWinrate(wins, losses) {
    if (wins + losses === 0) return "0.0";
    return ((wins / (wins + losses)) * 100).toFixed(1);
}

function getSkinUrl(player) {
    const identifier = player.username || 'Steve';
    return `https://mc-heads.net/body/${identifier}`;
}

// --- UI RENDERING ---
function renderRanking() {
    const tbody = document.getElementById('ranking-body');
    if (!tbody) return;

    if (playersData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 40px; color: #666;">No player data found. Syncing with server...</td></tr>';
        return;
    }

    let filtered = playersData.filter(p => p.username.toLowerCase().includes(searchQuery.toLowerCase()));

    filtered.sort((a, b) => {
        const bElo = getEloByMode(b, currentMode);
        const aElo = getEloByMode(a, currentMode);
        if (bElo !== aElo) return bElo - aElo;
        return a.username.localeCompare(b.username);
    });

    tbody.innerHTML = '';

    filtered.forEach((player, index) => {
        const row = document.createElement('tr');

        const elo = getEloByMode(player, currentMode);
        const rank = getRank(currentMode, elo, player);

        let rankHtml = `<span class="rank-standard">#${rank}</span>`;
        if (rank === 1) rankHtml = `<div class="rank-banner gold">#1</div>`;
        else if (rank === 2) rankHtml = `<div class="rank-banner silver">#2</div>`;
        else if (rank === 3) rankHtml = `<div class="rank-banner bronze">#3</div>`;

        row.className = `leaderboard-row${rank <= 3 ? ' top-' + rank : ''}`;
        // Taller rows for top 3 to accommodate bigger skins
        row.style.height = rank <= 3 ? '140px' : '110px';

        const modes = ['sword', 'pot', 'axe', 'mace', 'netherop', 'smp', 'uhc', 'vanilla'];
        const modalitiesHtml = modes.map(m => {
            const mElo = player.rankings ? (player.rankings[m] || 0) : 0;
            const mRank = getRank(m, mElo, player);
            const icon = m === 'pot' ? 'potion.png' : `${m}.png`;
            const rankClass = mRank <= 1 ? 'top-1' : mRank <= 2 ? 'top-2' : mRank <= 3 ? 'top-3' : '';

            return `
                <div class="modality-group" data-modality="${m}">
                    <div class="modality-circle-wrap">
                        <img class="modality-icon" src="./assets/${icon}" alt="${m}">
                    </div>
                    <div class="modality-badge-chip">
                        <span class="modality-rank ${rankClass}">#${mRank}</span>
                    </div>
                </div>
            `;
        }).join('');

        row.innerHTML = `
            <td class="col-rank">${rankHtml}</td>
            <td>
                <div class="player-info">
                    <div class="player-skin"><img src="${getSkinUrl(player)}" alt="${player.username}" loading="lazy"></div>
                    <div class="player-details">
                        <span class="player-name">${player.username}</span>
                        <span class="player-elo-info"><span class="player-elo-highlight">ELO ${elo.toLocaleString()}</span> &nbsp;•&nbsp; Global #${getRank('overall', getOverallELO(player), player)}</span>
                    </div>
                </div>
            </td>
            <td class="col-modalities">${modalitiesHtml}</td>
        `;

        row.addEventListener('click', () => showPlayerProfile(player));
        tbody.appendChild(row);
    });
}

function updateStats() {
    if (!playersData || playersData.length === 0) return;

    const topPlayer = [...playersData].sort((a, b) => getOverallELO(b) - getOverallELO(a))[0];
    const topPlayerEl = document.getElementById('stat-top-player');
    if (topPlayerEl) topPlayerEl.textContent = topPlayer.username;
    
    const activePlayersEl = document.getElementById('stat-active-players');
    if (activePlayersEl) activePlayersEl.textContent = playersData.length;

    // Matches calc
    let totalW = 0;
    playersData.forEach(p => {
        if (p.rankings) {
            const modes = ['sword', 'pot', 'axe', 'mace', 'netherop', 'smp', 'uhc', 'vanilla'];
            modes.forEach(m => {
                totalW += (p.rankings[`${m}_w`] || 0);
            });
        } else {
            totalW += (p.wins || 0);
        }
    });
    
    const matchesEl = document.getElementById('stat-matches');
    if (matchesEl) {
        matchesEl.textContent = totalW >= 1000 ? (totalW/1000).toFixed(1) + 'k' : totalW;
    }

    // Average ELO
    const avgElo = Math.floor(playersData.reduce((acc, p) => acc + getOverallELO(p), 0) / playersData.length);
    const avgEloEl = document.getElementById('stat-avg-elo');
    if (avgEloEl) avgEloEl.textContent = avgElo;
}

// --- PLAYER PROFILE MODAL ---
function showPlayerProfile(player) {
    const modal = document.getElementById('player-modal');
    if (!modal) return;

    // Header Info
    const modalSkin = document.getElementById('modal-player-skin');
    if (modalSkin) modalSkin.src = getSkinUrl(player).replace('/body/', '/avatar/');
    
    const modalName = document.getElementById('modal-player-name');
    if (modalName) modalName.textContent = player.username.toUpperCase();
    
    const modalElo = document.getElementById('modal-player-elo');
    if (modalElo) modalElo.textContent = `ELO: ${getOverallELO(player)}`;
    
    const modalRank = document.getElementById('modal-player-global-rank');
    if (modalRank) modalRank.textContent = `Global Rank: #${getRank('overall', getOverallELO(player), player)}`;

    // Top Stats Calculation
    let totalW = 0, totalL = 0;
    const modes = ['sword', 'pot', 'axe', 'mace', 'netherop', 'smp', 'uhc', 'vanilla'];
    
    let modalStatsHtml = '';
    modes.forEach(m => {
        const elo = player.rankings ? (player.rankings[m] || 0) : 0;
        const w = player.rankings ? (player.rankings[`${m}_w`] || 0) : 0;
        const l = player.rankings ? (player.rankings[`${m}_l`] || 0) : 0;
        totalW += w; totalL += l;
        const winrate = getWinrate(w, l);
        
        let icon = m === 'pot' ? 'potion.png' : m === 'smp' ? 'smp.png' : `${m}.png`;

        modalStatsHtml += `
            <div class="modality-stat-card">
                <div class="modality-stat-header">
                    <span class="modality-stat-name">${m}</span>
                    <img src="./assets/${icon}" class="modality-stat-icon">
                </div>
                <div class="modality-stat-elo">${elo} ELO</div>
                <div class="modality-stat-winrate" style="color: ${winrate >= 50 ? '#4ade80' : '#f87171'}">${winrate}% Winrate</div>
                <div class="modality-stat-details">
                    <div class="modality-stat-detail">
                        <div class="modality-stat-value-small">${w}</div>
                        <div class="modality-stat-label-small">WINS</div>
                    </div>
                    <div class="modality-stat-detail">
                        <div class="modality-stat-value-small">${l}</div>
                        <div class="modality-stat-label-small">LOSSES</div>
                    </div>
                </div>
            </div>
        `;
    });

    // Update Modal Totals
    const totalWinsEl = document.getElementById('modal-total-wins');
    if (totalWinsEl) totalWinsEl.textContent = totalW || player.wins || 0;
    
    const totalLossesEl = document.getElementById('modal-total-losses');
    if (totalLossesEl) totalLossesEl.textContent = totalL || player.losses || 0;
    
    const totalWinrateEl = document.getElementById('modal-total-winrate');
    if (totalWinrateEl) totalWinrateEl.textContent = getWinrate(totalW || player.wins || 0, totalL || player.losses || 0) + '%';
    
    const totalGamesEl = document.getElementById('modal-total-games');
    if (totalGamesEl) totalGamesEl.textContent = (totalW || player.wins || 0) + (totalL || player.losses || 0);
    
    const modalitiesGrid = document.getElementById('modal-modality-grid');
    if (modalitiesGrid) modalitiesGrid.innerHTML = modalStatsHtml;

    modal.classList.add('active');
}

function closePlayerModal() {
    const modal = document.getElementById('player-modal');
    if (modal) modal.classList.remove('active');
}

// --- UTILS & HANDLERS ---
function initSearch() {
    const searchInput = document.getElementById('search-input'); // FIXED ID
    if (!searchInput) return;
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderRanking();
    });
}

function initModeFilters() {
    const filters = document.querySelectorAll('.tab-btn'); // FIXED SELECTOR
    filters.forEach(filter => {
        filter.addEventListener('click', () => {
            filters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
            currentMode = filter.getAttribute('data-mode');
            renderRanking();
        });
    });
}

function createAnimatedTitle() {
    const titleElement = document.getElementById('title');
    if (!titleElement) return;
    const titleText = 'NinjaPVP';
    titleElement.innerHTML = '';
    titleText.split('').forEach((letter, index) => {
        const span = document.createElement('span');
        span.textContent = letter;
        span.className = 'title-letter'; // ADDED CLASS FOR CSS ANIMATION
        span.style.animationDelay = `${index * 0.1}s`;
        titleElement.appendChild(span);
    });
}

function initLanguage() {
    const langBtn = document.getElementById('lang-btn');
    const langSelectorWrapper = document.getElementById('lang-selector-wrapper');
    const langOptions = document.querySelectorAll('.lang-option');
    const langCurrent = document.getElementById('lang-current');

    if (langBtn && langSelectorWrapper) {
        langBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            langSelectorWrapper.classList.toggle('open');
        });
    }

    langOptions.forEach(option => {
        option.addEventListener('click', () => {
            currentLang = option.getAttribute('data-value');
            langOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            if (langCurrent) langCurrent.textContent = currentLang.toUpperCase();
            if (langSelectorWrapper) langSelectorWrapper.classList.remove('open');
            // Re-render strings if necessary
            renderRanking();
        });
    });

    document.addEventListener('click', () => {
        if (langSelectorWrapper) langSelectorWrapper.classList.remove('open');
    });
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
