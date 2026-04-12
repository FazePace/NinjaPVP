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

let currentLang = 'es';
const t = (key) => translations[currentLang][key] || key;

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
    // Usamos el máximo para asegurar que el Overall no sea inferior a una categoría específica
    return Math.max(player.points || 0, sum);
}

function getEloByMode(player, mode) {
    if (mode === 'overall') return getOverallELO(player);
    return player.rankings ? (player.rankings[mode] || 0) : 0;
}

function getRank(mode, elo, targetPlayer) {
    if (playersData.length === 0) return 0;
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
    const tbody = document.getElementById('leaderboard-body');
    if (!tbody) return;

    if (playersData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 40px; color: #666;">No player data found. Syncing with server...</td></tr>';
        return;
    }

    let filtered = playersData.filter(p => p.username.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Sort logic
    filtered.sort((a, b) => {
        const bElo = getEloByMode(b, currentMode);
        const aElo = getEloByMode(a, currentMode);
        if (bElo !== aElo) return bElo - aElo;
        return a.username.localeCompare(b.username);
    });

    tbody.innerHTML = '';
    
    filtered.forEach((player, index) => {
        const row = document.createElement('tr');
        row.className = 'leaderboard-row';
        
        const elo = getEloByMode(player, currentMode);
        const rank = index + 1;
        
        let rankHtml = `<span class="rank-number">#${rank}</span>`;
        if (rank === 1) rankHtml = `<img class="rank-banner" src="./assets/rank1.png" alt="#1">`;
        else if (rank === 2) rankHtml = `<img class="rank-banner" src="./assets/rank2.png" alt="#2">`;
        else if (rank === 3) rankHtml = `<img class="rank-banner" src="./assets/rank3.png" alt="#3">`;

        // Modalities Column
        const modes = ['sword', 'pot', 'axe', 'mace', 'netherop', 'smp', 'uhc', 'vanilla'];
        const modalitiesHtml = modes.map(m => {
            const mElo = player.rankings ? (player.rankings[m] || 0) : 0;
            const mRank = getRank(m, mElo, player);
            let icon = m === 'pot' ? 'potion.png' : m === 'smp' ? 'smp.png' : `${m}.png`;
            const isActive = currentMode === m;
            
            return `
                <div class="modality-group ${isActive ? 'active' : ''}" data-modality="${m}">
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
                        <span class="player-elo-info"><span class="player-elo-highlight">ELO ${elo.toLocaleString()}</span> &nbsp;•&nbsp; Global Rank #${rank}</span>
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
    if (!playersData || playersData.length === 0) {
        document.getElementById('stat-top-player').textContent = "-";
        document.getElementById('stat-active-players').textContent = "0";
        document.getElementById('stat-matches').textContent = "0";
        document.getElementById('stat-avg-elo').textContent = "0";
        return;
    }

    const topPlayer = [...playersData].sort((a, b) => getOverallELO(b) - getOverallELO(a))[0];
    document.getElementById('stat-top-player').textContent = topPlayer.username;
    document.getElementById('stat-active-players').textContent = playersData.length;

    // Matches calc
    let totalW = 0, totalL = 0;
    playersData.forEach(p => {
        totalW += (p.wins || 0);
        totalL += (p.losses || 0);
        if (p.rankings) {
            const modes = ['sword', 'pot', 'axe', 'mace', 'netherop', 'smp', 'uhc', 'vanilla'];
            modes.forEach(m => {
                totalW += (p.rankings[`${m}_w`] || 0);
                totalL += (p.rankings[`${m}_l`] || 0);
            });
        }
    });
    
    // Average ELO
    const avgElo = Math.floor(playersData.reduce((acc, p) => acc + getOverallELO(p), 0) / playersData.length);
    document.getElementById('stat-avg-elo').textContent = avgElo;

    const matches = Math.floor((totalW + totalL) / 2);
    document.getElementById('stat-matches').textContent = matches >= 1000 ? (matches/1000).toFixed(1) + 'k' : matches;
}

// --- PLAYER PROFILE MODAL ---
function showPlayerProfile(player) {
    const modal = document.getElementById('player-modal');
    if (!modal) return;

    // Header Info
    document.getElementById('modal-skin').src = getSkinUrl(player).replace('/body/', '/avatar/');
    document.getElementById('modal-username').textContent = player.username.toUpperCase();
    document.getElementById('modal-elo').textContent = `ELO: ${getOverallELO(player)}`;
    document.getElementById('modal-rank').textContent = `Global Rank: #${getRank('overall', getOverallELO(player), player)}`;

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
            <div class="modality-card">
                <div class="modality-header">
                    <span class="modality-title">${m.toUpperCase()}</span>
                    <img src="./assets/${icon}" class="modality-symbol">
                </div>
                <div class="modality-body">
                    <div class="modality-elo-value">${elo} ELO</div>
                    <div class="modality-winrate-value ${winrate >= 50 ? 'high' : 'low'}">${winrate}% Winrate</div>
                    <div class="mini-stat"><span>${w}</span> <label>WINS</label></div>
                    <div class="mini-stat"><span>${l}</span> <label>LOSSES</label></div>
                </div>
            </div>
        `;
    });

    // Update Modal Totals
    document.getElementById('modal-total-wins').textContent = totalW || player.wins || 0;
    document.getElementById('modal-total-losses').textContent = totalL || player.losses || 0;
    document.getElementById('modal-total-winrate').textContent = getWinrate(totalW || player.wins || 0, totalL || player.losses || 0) + '%';
    document.getElementById('modal-total-games').textContent = (totalW || player.wins || 0) + (totalL || player.losses || 0);
    document.getElementById('modalities-grid').innerHTML = modalStatsHtml;

    modal.classList.add('active');
    
    window.onclick = (e) => {
        if (e.target === modal) closeModal();
    };
}

function closeModal() {
    document.getElementById('player-modal').classList.remove('active');
}

// --- UTILS & HANDLERS ---
function initSearch() {
    const searchInput = document.getElementById('player-search');
    if (!searchInput) return;
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderRanking();
    });
}

function initModeFilters() {
    const filters = document.querySelectorAll('.mode-filter');
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
        span.style.animationDelay = `${index * 0.1}s`;
        titleElement.appendChild(span);
    });
}

function initLanguage() {
    // Placeholder para futuro sistema de idiomas dinámico
}
