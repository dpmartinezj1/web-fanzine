const artists = [
  {
    name: "Daft Punk",
    album: "Random Access Memories",
    song: "Instant Crush",
    audio: "audio/instant-crush.mp3",
    color: "daft",
    albums: ["Random Access Memories", "Discovery", "Homework"],
    images: [
      "img-albums/random-access-memories.jpeg",
      "img-albums/discovery.jpeg",
      "img-albums/homework.jpeg",
    ],
    confettiColors: ["#d4af37", "#b87333", "#c0c0c0", "#111111", "#f4e3bf"],
  },
  {
    name: "Radiohead",
    album: "OK Computer",
    song: "Let Down",
    audio: "audio/let-down.mp3",
    color: "radiohead",
    albums: ["OK Computer", "In Rainbows", "Kid A"],
    images: [
      "img-albums/ok-computer.jpeg",
      "img-albums/in-rainbows.jpeg",
      "img-albums/kid-a.jpeg",
    ],
    confettiColors: ["#4a6fa5", "#8fa8c8", "#e8e8e8", "#1c1c1c", "#c0392b"],
  },
  {
    name: "The Strokes",
    album: "The New Abnormal",
    song: "Selfless",
    audio: "audio/selfless.mp3",
    color: "strokes",
    albums: ["The New Abnormal", "Is This It", "Room on Fire"],
    images: [
      "img-albums/the-new-abnormal.jpeg",
      "img-albums/is-this-it.jpeg",
      "img-albums/room-on-fire.jpeg",
    ],
    confettiColors: ["#f2c230", "#d6302b", "#2a5db0", "#111111", "#f2efe6"],
  },
];

const otherSongs = [
  "Get Lucky",
  "Around the World",
  "Karma Police",
  "No Surprises",
  "Reptilia",
  "Under Cover of Darkness",
];

const artistList = document.querySelector("#artist-list");
const homeScreen = document.querySelector("#home-screen");
const gameScreen = document.querySelector("#game-screen");
const reels = document.querySelector("#reels");
const gameTitle = document.querySelector("#game-title");
const gameAlbum = document.querySelector("#game-album");
const gameStatus = document.querySelector("#game-status");
const spinButton = document.querySelector("#spin-button");
const quizPanel = document.querySelector("#quiz-panel");
const answers = document.querySelector("#answers");
const answerStatus = document.querySelector("#answer-status");
const songAudio = document.querySelector("#song-audio");
const audioButton = document.querySelector("#audio-button");
const audioStatus = document.querySelector("#audio-status");
const confetti = document.querySelector("#confetti");

let selectedArtist;
let isSpinning = false;
let hasAnsweredCorrectly = false;
let spinIntervals = [];
let spinTimeouts = [];

function coverMarkup(album, artist, index) {
  return `
    <div class="album-cover cover-${artist.color} cover-variant-${index}" role="img" aria-label="${album}, de ${artist.name}">
      <span class="cover-artist">${artist.name}</span>
      <span class="cover-title">${album}</span>
      <span class="cover-index" aria-hidden="true">0${index + 1}</span>
      <span class="cover-stamp" aria-hidden="true">${artist.name === "Daft Punk" ? "D" : artist.name === "Radiohead" ? "R" : "S"}</span>
      <img class="cover-photo" src="${artist.images[index]}" alt="" onerror="this.remove()" />
    </div>`;
}

function renderArtists() {
  artistList.innerHTML = artists
    .map(
      (artist, index) => `
      <button class="artist-card artist-${artist.color}" type="button" data-artist="${index}">
        <span class="artist-number">0${index + 1}</span>
        <span class="artist-info">
          <span class="artist-name">${artist.name}</span>
          <span class="artist-album">${artist.album}</span>
        </span>
        <span class="artist-arrow" aria-hidden="true">↗</span>
      </button>`,
    )
    .join("");
}

function renderReels(albums = [0, 1, 2]) {
  reels.innerHTML = albums
    .map((albumIndex, reelIndex) => {
      const album = selectedArtist.albums[albumIndex];
      const cover = coverMarkup(album, selectedArtist, albumIndex);
      return `
        <div class="reel" aria-label="Portada ${reelIndex + 1}">
          <span class="reel-number">0${reelIndex + 1}</span>
          <div class="reel-window">${cover}</div>
          <span class="reel-caption">${selectedArtist.name}</span>
        </div>`;
    })
    .join("");
}

function openArtist(index) {
  selectedArtist = artists[index];
  homeScreen.hidden = true;
  gameScreen.hidden = false;
  gameTitle.textContent = selectedArtist.name;
  gameAlbum.textContent = `Álbum destacado: ${selectedArtist.album}`;
  document.querySelector("#game-eyebrow").textContent = "BESTIARIO DE ÁLBUMES";
  renderReels();
  resetQuiz();
  gameStatus.textContent = "Gira el bestiario para encontrar una combinación.";
  spinButton.disabled = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeGame() {
  clearSpinTimers();
  songAudio.pause();
  songAudio.removeAttribute("src");
  songAudio.load();
  selectedArtist = undefined;
  gameScreen.hidden = true;
  homeScreen.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetQuiz() {
  quizPanel.hidden = true;
  answers.replaceChildren();
  answerStatus.textContent = "";
  audioStatus.textContent = "";
  audioButton.hidden = true;
  hasAnsweredCorrectly = false;
  confetti.replaceChildren();
  songAudio.pause();
  songAudio.removeAttribute("src");
  songAudio.load();
}

function clearSpinTimers() {
  spinIntervals.forEach(window.clearInterval);
  spinTimeouts.forEach(window.clearTimeout);
  spinIntervals = [];
  spinTimeouts = [];
  isSpinning = false;
}

function randomAlbumIndex() {
  return Math.floor(Math.random() * selectedArtist.albums.length);
}

function spinReels() {
  if (isSpinning || !selectedArtist) return;

  resetQuiz();
  isSpinning = true;
  spinButton.disabled = true;
  spinButton.classList.add("is-spinning");
  gameStatus.textContent = "El bestiario está girando…";

  const reelElements = [...reels.querySelectorAll(".reel")];
  const finalAlbums = reelElements.map(() => randomAlbumIndex());
  const stopDelays = [850, 1250, 1650];

  reelElements.forEach((reel, index) => {
    reel.classList.add("is-spinning");
    const windowElement = reel.querySelector(".reel-window");

    spinIntervals.push(
      window.setInterval(() => {
        const albumIndex = randomAlbumIndex();
        windowElement.innerHTML = coverMarkup(
          selectedArtist.albums[albumIndex],
          selectedArtist,
          albumIndex,
        );
      }, 100),
    );

    spinTimeouts.push(
      window.setTimeout(() => {
        window.clearInterval(spinIntervals[index]);
        windowElement.innerHTML = coverMarkup(
          selectedArtist.albums[finalAlbums[index]],
          selectedArtist,
          finalAlbums[index],
        );
        reel.classList.remove("is-spinning");
        if (index === reelElements.length - 1) finishSpin(finalAlbums);
      }, stopDelays[index]),
    );
  });
}

function finishSpin(finalAlbums) {
  clearSpinTimers();
  spinButton.classList.remove("is-spinning");
  spinButton.disabled = false;

  if (finalAlbums.every((albumIndex) => albumIndex === finalAlbums[0])) {
    gameStatus.textContent = "¡Tres portadas iguales! La pista está desbloqueada.";
    openQuiz();
    return;
  }

  gameStatus.textContent = "Casi. Busca tres portadas iguales y vuelve a girar.";
}

function openQuiz() {
  quizPanel.hidden = false;
  answerStatus.textContent = "";
  audioStatus.textContent = "";
  audioButton.hidden = true;
  songAudio.src = selectedArtist.audio;
  renderAnswers();
  quizPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });

  const playAttempt = songAudio.play();
  if (playAttempt) {
    playAttempt.catch(() => {
      if (songAudio.error) {
        audioStatus.textContent = `Añade ${selectedArtist.audio} para escuchar la pista.`;
      } else {
        audioStatus.textContent = "Pulsa «Escuchar pista» para reproducir el audio.";
        audioButton.hidden = false;
      }
    });
  }
}

function renderAnswers() {
  const options = [selectedArtist.song];
  const distractors = otherSongs.filter((song) => song !== selectedArtist.song);

  while (options.length < 5 && distractors.length) {
    const index = Math.floor(Math.random() * distractors.length);
    options.push(distractors.splice(index, 1)[0]);
  }

  options.sort(() => Math.random() - 0.5);

  answers.innerHTML = options
    .map(
      (song, index) => `
      <button class="answer-button" type="button" data-song="${song}">
        <span class="answer-number">0${index + 1}</span>
        <span>${song}</span>
        <span class="answer-check" aria-hidden="true"></span>
      </button>`,
    )
    .join("");
}

function chooseAnswer(event) {
  const button = event.target.closest(".answer-button");
  if (!button || hasAnsweredCorrectly) return;

  if (button.dataset.song === selectedArtist.song) {
    hasAnsweredCorrectly = true;
    button.classList.add("is-correct");
    answers.querySelectorAll(".answer-button").forEach((answer) => {
      answer.disabled = true;
    });
    answerStatus.textContent = `¡Correcto! ${selectedArtist.song}, de ${selectedArtist.album}.`;
    launchConfetti();
    return;
  }

  button.classList.add("is-incorrect");
  button.disabled = true;
  answerStatus.textContent = "Esa no es. Escucha otra vez e inténtalo de nuevo.";
}

function launchConfetti() {
  const colors = selectedArtist.confettiColors;
  const pieces = Array.from({ length: 42 }, (_, index) => {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.setProperty("--piece-color", colors[index % colors.length]);
    piece.style.setProperty("--piece-x", `${Math.random() * 100}%`);
    piece.style.setProperty("--piece-delay", `${Math.random() * 0.8}s`);
    piece.style.setProperty("--piece-rotation", `${Math.random() * 360}deg`);
    return piece;
  });

  confetti.replaceChildren(...pieces);
  window.setTimeout(() => confetti.replaceChildren(), 2400);
}

artistList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-artist]");
  if (button) openArtist(Number(button.dataset.artist));
});

document.querySelector("#back-button").addEventListener("click", closeGame);

document.querySelector("#home-link").addEventListener("click", (event) => {
  event.preventDefault();
  if (selectedArtist) closeGame();
});

spinButton.addEventListener("click", spinReels);
answers.addEventListener("click", chooseAnswer);

audioButton.addEventListener("click", () => {
  songAudio.play().catch(() => {
    audioStatus.textContent = `No se pudo cargar la pista. Revisa ${selectedArtist.audio}.`;
  });
});

songAudio.addEventListener("error", () => {
  if (selectedArtist && !quizPanel.hidden) {
    audioStatus.textContent = `Añade ${selectedArtist.audio} para escuchar la pista.`;
  }
});

renderArtists();
