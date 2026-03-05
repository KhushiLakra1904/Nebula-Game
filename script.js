const allEmojis = ['🚀', '🪐', '👾', '⭐', '☄️', '🌌', '🛸', '🌙', '👽', '🛰️', '🌞', '🌍', '🔭', '🧪', '🤖', '⚡', '🌈', '💎'];
let gameEmojis = [];
let flippedCards = [];
let matchedCount = 0;
let moves = 0;
let timerStarted = false;
let seconds = 0;
let interval;
let isHinting = false;

const grid = document.getElementById('game-grid');
const moveDisplay = document.getElementById('move-count');
const timerDisplay = document.getElementById('timer');
const difficultySelect = document.getElementById('difficulty');

const config = {
    easy: { pairs: 6, cols: 4, class: '' },
    medium: { pairs: 8, cols: 4, class: '' },
    hard: { pairs: 18, cols: 6, class: 'hard-mode' }
};

function initGame() {
    const level = difficultySelect.value;
    const settings = config[level];
    
    grid.style.gridTemplateColumns = `repeat(${settings.cols}, 1fr)`;
    const selected = allEmojis.slice(0, settings.pairs);
    gameEmojis = [...selected, ...selected].sort(() => Math.random() - 0.5);

    grid.innerHTML = '';
    moves = 0;
    matchedCount = 0;
    seconds = 0;
    timerStarted = false;
    isHinting = false;
    clearInterval(interval);
    moveDisplay.innerText = moves;
    timerDisplay.innerText = "00:00";
    updateLeaderboardUI();
    
    gameEmojis.forEach(emoji => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.value = emoji;
        card.innerHTML = `
            <div class="card-front">?</div>
            <div class="card-back">${emoji}</div>
        `;
        card.addEventListener('click', flipCard);
        grid.appendChild(card);
    });
}

function flipCard() {
    if (isHinting) return;
    if (!timerStarted) { timerStarted = true; startTimer(); }
    
    if (flippedCards.length < 2 && !this.classList.contains('flipped')) {
        this.classList.add('flipped');
        flippedCards.push(this);

        if (flippedCards.length === 2) {
            moves++;
            moveDisplay.innerText = moves;
            checkMatch();
        }
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    if (card1.dataset.value === card2.dataset.value) {
        matchedCount += 2;
        flippedCards = [];
        if (matchedCount === gameEmojis.length) {
            clearInterval(interval);
            saveScore();
            setTimeout(() => alert("Mission Accomplished!"), 500);
        }
    } else {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            flippedCards = [];
        }, 1000);
    }
}

function useHint() {
    if (isHinting || matchedCount === gameEmojis.length) return;
    
    isHinting = true;
    moves += 5; // The penalty
    moveDisplay.innerText = moves;
    
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => card.classList.add('hint-show'));
    
    setTimeout(() => {
        cards.forEach(card => card.classList.remove('hint-show'));
        isHinting = false;
    }, 1500);
}

function startTimer() {
    interval = setInterval(() => {
        seconds++;
        timerDisplay.innerText = formatTime(seconds);
    }, 1000);
}

function formatTime(sec) {
    let m = Math.floor(sec / 60).toString().padStart(2, '0');
    let s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function updateLeaderboardUI() {
    const level = difficultySelect.value;
    document.getElementById('best-moves').innerText = localStorage.getItem(`best-moves-${level}`) || "-";
    const time = localStorage.getItem(`best-time-${level}`);
    document.getElementById('best-time').innerText = time ? formatTime(time) : "-";
}

function saveScore() {
    const level = difficultySelect.value;
    const bMoves = localStorage.getItem(`best-moves-${level}`);
    const bTime = localStorage.getItem(`best-time-${level}`);

    if (!bMoves || moves < parseInt(bMoves)) localStorage.setItem(`best-moves-${level}`, moves);
    if (!bTime || seconds < parseInt(bTime)) localStorage.setItem(`best-time-${level}`, seconds);
    updateLeaderboardUI();
}

difficultySelect.addEventListener('change', initGame);
document.getElementById('restart-btn').addEventListener('click', initGame);
document.getElementById('hint-btn').addEventListener('click', useHint);
document.getElementById('clear-btn').addEventListener('click', () => {
    localStorage.clear();
    updateLeaderboardUI();
});

initGame();