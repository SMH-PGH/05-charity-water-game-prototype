document.addEventListener('DOMContentLoaded', function () {
  var emojis = ['🍎', '🚀', '🌈', '🐼', '🍩', '🎈', '🌻', '🦊'];
  var gameBoard = document.getElementById('gameBoard');
  var movesElement = document.getElementById('moves');
  var timerElement = document.getElementById('timer');
  var bestScoreElement = document.getElementById('bestScore');
  var restartButton = document.getElementById('restartButton');
  var statusMessage = document.getElementById('statusMessage');
  var confettiLayer = document.getElementById('confettiLayer');
  var storageKey = 'emoji-memory-match-best-score';

  var cards = [];
  var firstCard = null;
  var secondCard = null;
  var lockBoard = false;
  var moves = 0;
  var matchedPairs = 0;
  var timerId = null;
  var timerStarted = false;
  var elapsedSeconds = 0;
  var bestScore = null;

  function loadBestScore() {
    var savedScore = localStorage.getItem(storageKey);

    if (savedScore !== null) {
      bestScore = Number(savedScore);
    }

    renderBestScore();
  }

  function renderBestScore() {
    if (bestScore === null || Number.isNaN(bestScore)) {
      bestScoreElement.textContent = '--';
      return;
    }

    bestScoreElement.textContent = bestScore + ' moves';
  }

  function shuffle(array) {
    var shuffledArray = array.slice();

    for (var index = shuffledArray.length - 1; index > 0; index--) {
      var randomIndex = Math.floor(Math.random() * (index + 1));
      var temporaryValue = shuffledArray[index];
      shuffledArray[index] = shuffledArray[randomIndex];
      shuffledArray[randomIndex] = temporaryValue;
    }

    return shuffledArray;
  }

  function formatTime(totalSeconds) {
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;
    var minuteText = String(minutes).padStart(2, '0');
    var secondText = String(seconds).padStart(2, '0');

    return minuteText + ':' + secondText;
  }

  function updateTimerDisplay() {
    timerElement.textContent = formatTime(elapsedSeconds);
  }

  function startTimer() {
    if (timerStarted) {
      return;
    }

    timerStarted = true;
    timerId = setInterval(function () {
      elapsedSeconds += 1;
      updateTimerDisplay();
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerId);
    timerId = null;
    timerStarted = false;
  }

  function resetGameState() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    moves = 0;
    matchedPairs = 0;
    elapsedSeconds = 0;
    timerElement.textContent = '00:00';
    movesElement.textContent = '0';
    statusMessage.textContent = 'Find all 8 pairs to win.';
    statusMessage.classList.remove('win');
  }

  function createCard(emoji, index) {
    var card = document.createElement('button');
    var inner = document.createElement('span');
    var frontFace = document.createElement('span');
    var backFace = document.createElement('span');

    card.type = 'button';
    card.className = 'card';
    card.setAttribute('aria-label', 'Hidden card');
    card.dataset.emoji = emoji;
    card.dataset.index = String(index);

    inner.className = 'card-inner';
    frontFace.className = 'card-face card-front';
    backFace.className = 'card-face card-back';
    backFace.textContent = emoji;

    inner.appendChild(frontFace);
    inner.appendChild(backFace);
    card.appendChild(inner);

    card.addEventListener('click', handleCardClick);

    return card;
  }

  function buildBoard() {
    var cardValues = shuffle(emojis.concat(emojis));

    gameBoard.innerHTML = '';
    cards = [];

    for (var index = 0; index < cardValues.length; index++) {
      var cardElement = createCard(cardValues[index], index);
      cards.push(cardElement);
      gameBoard.appendChild(cardElement);
    }
  }

  function disableMatchedCards() {
    for (var index = 0; index < cards.length; index++) {
      if (cards[index].classList.contains('matched')) {
        cards[index].disabled = true;
        cards[index].setAttribute('aria-label', 'Matched card');
      }
    }
  }

  function markMatchedCards() {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    firstCard.disabled = true;
    secondCard.disabled = true;
    firstCard.setAttribute('aria-label', 'Matched card ' + firstCard.dataset.emoji);
    secondCard.setAttribute('aria-label', 'Matched card ' + secondCard.dataset.emoji);
    matchedPairs += 1;
    disableMatchedCards();

    if (matchedPairs === emojis.length) {
      endGame();
    }

    clearSelectedCards();
  }

  function clearSelectedCards() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
  }

  function unflipCards() {
    setTimeout(function () {
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
      clearSelectedCards();
    }, 1000);
  }

  function checkForMatch() {
    moves += 1;
    movesElement.textContent = String(moves);

    if (firstCard.dataset.emoji === secondCard.dataset.emoji) {
      markMatchedCards();
      return;
    }

    lockBoard = true;
    unflipCards();
  }

  function handleCardClick(event) {
    var clickedCard = event.currentTarget;

    if (lockBoard || clickedCard === firstCard || clickedCard.classList.contains('matched')) {
      return;
    }

    if (!timerStarted) {
      startTimer();
    }

    clickedCard.classList.add('flipped');

    if (firstCard === null) {
      firstCard = clickedCard;
      return;
    }

    secondCard = clickedCard;
    checkForMatch();
  }

  function createConfetti() {
    var colors = ['#f28f3b', '#ffcc4d', '#5b8def', '#68bb7f', '#f45b69'];

    confettiLayer.innerHTML = '';

    for (var index = 0; index < 28; index++) {
      var piece = document.createElement('span');
      var leftOffset = Math.random() * 100;
      var delay = Math.random() * 0.3;
      var duration = 1.2 + Math.random() * 0.9;

      piece.className = 'confetti-piece';
      piece.style.left = leftOffset + 'vw';
      piece.style.backgroundColor = colors[index % colors.length];
      piece.style.animationDelay = delay + 's';
      piece.style.animationDuration = duration + 's';
      piece.style.transform = 'rotate(' + Math.floor(Math.random() * 360) + 'deg)';

      confettiLayer.appendChild(piece);
    }

    setTimeout(function () {
      confettiLayer.innerHTML = '';
    }, 2600);
  }

  function updateBestScore() {
    if (bestScore === null || moves < bestScore) {
      bestScore = moves;
      localStorage.setItem(storageKey, String(bestScore));
      renderBestScore();
    }
  }

  function endGame() {
    stopTimer();
    updateBestScore();
    statusMessage.classList.add('win');
    statusMessage.textContent = 'You won in ' + moves + ' moves and ' + formatTime(elapsedSeconds) + '!';
    createConfetti();
  }

  function restartGame() {
    stopTimer();
    resetGameState();
    buildBoard();
  }

  restartButton.addEventListener('click', restartGame);

  loadBestScore();
  resetGameState();
  buildBoard();
});// Log a message to the console to ensure the script is linked correctly
console.log('JavaScript file is linked correctly.');
