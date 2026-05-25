const SHOWS_KEY = "shows";
const MOVIES_KEY = "movies";
const CURRENT_ACCOUNT_KEY = "currentAccount";
const ACCOUNTS_KEY = "accounts";

const TMDB_API_KEY = "a04a3b6afbc3480a58b0ce9e85c5a10c";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

const toggleFormBtn = document.getElementById("toggleFormBtn");
const toggleFormBtnM = document.getElementById("toggleFormBtnM");
const addShowForm = document.getElementById("addShowForm");
const addMovieForm = document.getElementById("addMovieForm");
const showsGrid = document.getElementById("showsGrid");
const moviesGrid = document.getElementById("moviesGrid");

const searchInput = document.getElementById("searchInput");
const searchInputM = document.getElementById("searchInputM");
const searchShowBtn = document.getElementById("searchShowBtn");
const searchMovieBtn = document.getElementById("searchMovieBtn");
const searchResults = document.getElementById("searchResults");
const searchResultsM = document.getElementById("searchResultsM");

const accountStatus = document.getElementById("accountStatus");
const guestBtn = document.getElementById("guestBtn");
const signInBtn = document.getElementById("signInBtn");
const createAccountBtn = document.getElementById("createAccountBtn");
const signOutBtn = document.getElementById("signOutBtn");

const accountModal = document.getElementById("accountModal");
const modalTitle = document.getElementById("modalTitle");
const modalAccountName = document.getElementById("modalAccountName");
const modalPin = document.getElementById("modalPin");
const modalError = document.getElementById("modalError");
const modalCancelBtn = document.getElementById("modalCancelBtn");
const modalSubmitBtn = document.getElementById("modalSubmitBtn");

const playerModal = document.getElementById("playerModal");
const playerTitle = document.getElementById("playerTitle");
const playerFrame = document.getElementById("playerFrame");
const closePlayerBtn = document.getElementById("closePlayerBtn");
const saveProgressBtn = document.getElementById("saveProgressBtn");
const playerNextEpisodeBtn = document.getElementById("playerNextEpisodeBtn");

const savedProgressText = document.getElementById("savedProgressText");
const progressInputs = document.getElementById("progressInputs");
const hoursInput = document.getElementById("hoursInput");
const minutesInput = document.getElementById("minutesInput");
const secondsInput = document.getElementById("secondsInput");
const confirmProgressBtn = document.getElementById("confirmProgressBtn");
const cancelProgressBtn = document.getElementById("cancelProgressBtn");

function makeId() {
  return crypto.randomUUID();
}

function formatTime(seconds) {
  seconds = Math.floor(seconds || 0);

  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }

  return `${mins}:${secs.toString().padStart(2, "0")}`;
}


let modalMode = null;
let activeMedia = null;

function openAccountModal(mode) {
  modalMode = mode;

  modalTitle.textContent = mode === "create" ? "Create Account" : "Sign In";

  modalAccountName.value = "";
  modalPin.value = "";
  modalError.textContent = "";

  accountModal.classList.remove("hidden");
  modalAccountName.focus();
}

function closeAccountModal() {
  accountModal.classList.add("hidden");
  modalMode = null;
}

function getCurrentAccount() {
  return JSON.parse(localStorage.getItem(CURRENT_ACCOUNT_KEY));
}

function setCurrentAccount(account) {
  localStorage.setItem(CURRENT_ACCOUNT_KEY, JSON.stringify(account));
}

function getAccounts() {
  return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) || [];
}

function saveAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function getAccountPrefix() {
  const account = getCurrentAccount();

  if (!account) {
    return "signedout";
  }

  return account.id;
}

function getShowsKey() {
  return `${getAccountPrefix()}:${SHOWS_KEY}`;
}

function getMoviesKey() {
  return `${getAccountPrefix()}:${MOVIES_KEY}`;
}

function getShows() {
  return JSON.parse(localStorage.getItem(getShowsKey())) || [];
}

function getMovies() {
  return JSON.parse(localStorage.getItem(getMoviesKey())) || [];
}

function saveShows(shows) {
  localStorage.setItem(getShowsKey(), JSON.stringify(shows));
}

function saveMovies(movies) {
  localStorage.setItem(getMoviesKey(), JSON.stringify(movies));
}

function getProgressForUrl(url) {
  const key = `${getAccountPrefix()}:progress:${url}`;
  return Number(localStorage.getItem(key)) || 0;
}

function updateAccountUI() {
  const currentAccount = getCurrentAccount();

  if (currentAccount) {
    accountStatus.textContent = `Signed in as ${currentAccount.name}`;

    guestBtn.classList.add("hidden");
    signInBtn.classList.add("hidden");
    createAccountBtn.classList.add("hidden");
    signOutBtn.classList.remove("hidden");
  } else {
    accountStatus.textContent = "Not signed in";

    guestBtn.classList.remove("hidden");
    signInBtn.classList.remove("hidden");
    createAccountBtn.classList.remove("hidden");
    signOutBtn.classList.add("hidden");
  }
}

function renderApp() {
  renderShows();
  renderMovies();
  updateAccountUI();
}

closePlayerBtn.addEventListener("click", closePlayer);

saveProgressBtn.addEventListener("click", () => {
  const savedProgress = activeMedia?.progress || 0;

  hoursInput.value = "";
  minutesInput.value = "";
  secondsInput.value = "";

  if (savedProgress > 0) {
    const hours = Math.floor(savedProgress / 3600);
    const minutes = Math.floor((savedProgress % 3600) / 60);
    const seconds = savedProgress % 60;

    hoursInput.value = hours > 0 ? hours : "";
    minutesInput.value = minutes;
    secondsInput.value = seconds;
  }

  saveProgressBtn.classList.add("hidden");
  progressInputs.classList.remove("hidden");
});

cancelProgressBtn.addEventListener("click", () => {
  progressInputs.classList.add("hidden");
  saveProgressBtn.classList.remove("hidden");
});

confirmProgressBtn.addEventListener("click", () => {
  if (!activeMedia) return;

  const hours = Number(hoursInput.value) || 0;
  const minutes = Number(minutesInput.value) || 0;
  const seconds = Number(secondsInput.value) || 0;

  const progressSeconds = hours * 3600 + minutes * 60 + seconds;

  activeMedia.progress = progressSeconds;

  const shows = getShows();
  const movies = getMovies();

  const showIndex = shows.findIndex((show) => show.id === activeMedia.id);
  const movieIndex = movies.findIndex((movie) => movie.id === activeMedia.id);

  if (showIndex !== -1) {
    shows[showIndex] = activeMedia;
    saveShows(shows);
  }

  if (movieIndex !== -1) {
    movies[movieIndex] = activeMedia;
    saveMovies(movies);
  }

  savedProgressText.textContent = `Saved at ${formatTime(progressSeconds)}`;
  saveProgressBtn.textContent = "Update Progress";

  progressInputs.classList.add("hidden");
  saveProgressBtn.classList.remove("hidden");

  renderApp();
});


toggleFormBtn.addEventListener("click", () => {
  addShowForm.classList.toggle("hidden");
  addMovieForm.classList.add("hidden");
});

toggleFormBtnM.addEventListener("click", () => {
  addMovieForm.classList.toggle("hidden");
  addShowForm.classList.add("hidden");
});

guestBtn.addEventListener("click", () => {
  const guestAccount = {
    id: "guest",
    name: "Guest",
    isGuest: true
  };

  setCurrentAccount(guestAccount);
  renderApp();
});

signOutBtn.addEventListener("click", () => {
  localStorage.removeItem(CURRENT_ACCOUNT_KEY);
  renderApp();
});

createAccountBtn.addEventListener("click", () => {
  openAccountModal("create");
});

signInBtn.addEventListener("click", () => {
  openAccountModal("signin");
});

modalCancelBtn.addEventListener("click", closeAccountModal);

modalPin.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    modalSubmitBtn.click();
  }
});

modalSubmitBtn.addEventListener("click", () => {
  const name = modalAccountName.value.trim();
  const pin = modalPin.value.trim();

  if (!name || !pin) {
    modalError.textContent = "Account name and PIN are required.";
    return;
  }

  if (modalMode === "create") {
    const accounts = getAccounts();

    const nameAlreadyExists = accounts.some(
      (account) => account.name.toLowerCase() === name.toLowerCase()
    );

    if (nameAlreadyExists) {
      modalError.textContent = "An account with that name already exists.";
      return;
    }

    const newAccount = {
      id: makeId(),
      name,
      pin
    };

    accounts.push(newAccount);
    saveAccounts(accounts);
    setCurrentAccount(newAccount);

    closeAccountModal();
    renderApp();
    return;
  }

  if (modalMode === "signin") {
    const accounts = getAccounts();

    const foundAccount = accounts.find(
      (account) =>
        account.name.toLowerCase() === name.toLowerCase() &&
        account.pin === pin
    );

    if (!foundAccount) {
      modalError.textContent = "No account found with that name and PIN.";
      return;
    }

    setCurrentAccount(foundAccount);

    closeAccountModal();
    renderApp();
  }
});

//Function Called to open media player modal
function openPlayer(title, url, media) {
  activeMedia = media;

  playerTitle.textContent = title;
  playerFrame.src = url;

  const savedProgress = media.progress || 0;

  if (savedProgress > 0){
    savedProgressText.textContent = `Saved at ${formatTime(savedProgress)}`;
    saveProgressBtn.textContent = "Update Progress";
  } else {
    savedProgressText.textContent = "";
    saveProgressBtn.textContent = "Save Progress";
  }

  if (media.season && media.episode){
    playerNextEpisodeBtn.classList.remove("hidden");
  } else {
    playerNextEpisodeBtn.classList.add("hidden");
  }
  
  progressInputs.classList.add("hidden");

  playerModal.classList.remove("hidden");
}

//Function Called to close media player modal
function closePlayer() {
  playerFrame.src = "";
  playerModal.classList.add("hidden");
  activeMedia = null;
}

function renderShows() {
  const shows = getShows();

  showsGrid.innerHTML = "";

  if (shows.length === 0) {
    showsGrid.innerHTML = "<p>No shows added yet. Click + Add Show.</p>";
    return;
  }

  for (const show of shows) {
    const progress = show.progress || 0;

    const card = document.createElement("div");
    card.className = "card";

    const runtimeSeconds = show.runtime ? show.runtime * 60 : 0;
    const progressPercent = runtimeSeconds > 0
      ? Math.min((progress / runtimeSeconds) *100, 100)
      : 0;

    card.innerHTML = `
      <button class="delete-btn">X</button>

      <div
        class="poster"
        style="background-image: url('${show.posterUrl || ""}')"
      ></div>

      <div class="card-info">
        <h3>${show.title}</h3>
        <p>S${show.season}E${show.episode}</p>
        <p>${formatTime(progress)}</p>
        <button class="next-episode-btn">Next Episode</button>

        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progressPercent}%"></div>
        </div>
      </div>
    `;

    card.addEventListener("click", () => {
      openPlayer(`${show.title} - S${show.season}E${show.episode}`, show.url, show);
    });

    const deleteBtn = card.querySelector(".delete-btn");
    const nextEpisodeBtn = card.querySelector(".next-episode-btn");


    deleteBtn.addEventListener("click", (event) => {
      event.stopPropagation();

      const updatedShows = shows.filter((item) => item.id !== show.id);
      saveShows(updatedShows);
      renderShows();
    });

    nextEpisodeBtn.addEventListener("click", (event) => {
      event.stopPropagation();

      const currentSeasonData = show.seasons.find(
        (seasonData) => seasonData.seasonNumber === show.season
      );

      if (!currentSeasonData) {
        return;
      }

      const maxEpisodes = currentSeasonData.episodeCount;

      if (show.episode < maxEpisodes) {
        show.episode += 1;
      } else {
        if (show.season < show.totalSeasons) {
          show.season += 1;
          show.episode = 1;
        } else {
          alert("You finished the show!");
          return;
        }
      }

      show.progress=0;
      show.url = `https://mappl.tv/watch/tv/${show.tmdbId}-${show.season}-${show.episode}`;

      saveShows(shows);
      renderShows();
    });

    showsGrid.appendChild(card);
  }
}

function renderMovies() {
  const movies = getMovies();

  moviesGrid.innerHTML = "";

  if (movies.length === 0) {
    moviesGrid.innerHTML = "<p>No Movies added yet. Click + Add Movie.</p>";
    return;
  }

  for (const movie of movies) {
    const progress = movie.progress || 0;

    const card = document.createElement("div");
    card.className = "card";

    const runtimeSeconds = movie.runtime ? movie.runtime * 60 : 0;

    const progressPercent = runtimeSeconds > 0
    ? Math.min((progress / runtimeSeconds) *100, 100)
    : 0;

    card.innerHTML = `
      <button class="delete-btn">X</button>

      <div
        class="poster"
        style="background-image: url('${movie.posterUrl || ""}')"
      ></div>

      <div class="card-info">
        <h3>${movie.title}</h3>
        <p>${formatTime(progress)}</p>

        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progressPercent}%"></div>
        </div>
      </div>
    `;

    card.addEventListener("click", () => {
      openPlayer(movie.title, movie.url, movie);
    });

    const deleteBtn = card.querySelector(".delete-btn");

    deleteBtn.addEventListener("click", (event) => {
      event.stopPropagation();

      const updatedMovies = movies.filter((item) => item.id !== movie.id);
      saveMovies(updatedMovies);
      renderMovies();
    });

    moviesGrid.appendChild(card);
  }
}

async function addShowToLibrary(show, posterUrl, season, episode) {
  if (!getCurrentAccount()) {
    alert("Sign in, create an account, or continue as Guest first.");
    return;
  }

  if (!season || !episode || season < 1 || episode < 1) {
    alert("Season and episode must be 1 or higher.");
    return;
  }

  const shows = getShows();

  const detailsResponse = await fetch(
    `https://api.themoviedb.org/3/tv/${show.id}?api_key=${TMDB_API_KEY}`
  );

  const details = await detailsResponse.json();

  shows.push({
    id: makeId(),
    tmdbId: show.id,
    title: show.name,
    posterUrl,

    url: `https://mappl.tv/watch/tv/${show.id}-${season}-${episode}`,

    season,
    episode,

    runtime: details.episode_run_time?.[0] || 0,

    totalSeasons: details.number_of_seasons,

    seasons: details.seasons.map((seasonData) => ({
      seasonNumber: seasonData.season_number,
      episodeCount: seasonData.episode_count
    }))
  });

  saveShows(shows);

  searchInput.value = "";
  searchResults.innerHTML = "";
  addShowForm.classList.add("hidden");

  renderShows();
}

async function addMoviesToLibrary(movie, posterUrl) {
  if (!getCurrentAccount()) {
    alert("Sign in, create an account, or continue as Guest first.");
    return;
  }

  const movies = getMovies();

  const detailsResponse = await fetch(
    `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${TMDB_API_KEY}`
  );

  const details = await detailsResponse.json();

  movies.push({
    id: makeId(),
    tmdbId: movie.id,
    title: movie.title,
    runtime: movie.runtime || 0,
    posterUrl,
    url: `https://mappl.tv/watch/movie/${movie.id}`
  });

  saveMovies(movies);

  searchInputM.value = "";
  searchResultsM.innerHTML = "";
  addMovieForm.classList.add("hidden");

  renderMovies();
}

async function searchShows() {
  const query = searchInput.value.trim();

  if (!query) {
    alert("Type a show name first.");
    return;
  }

  searchResults.innerHTML = "<p>Searching...</p>";

  try {
    const url = `https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
      query
    )}`;

    const response = await fetch(url);
    const data = await response.json();

    searchResults.innerHTML = "";

    if (!data.results || data.results.length === 0) {
      searchResults.innerHTML = "<p>No shows found.</p>";
      return;
    }

    data.results.slice(0, 8).forEach((show) => {
      const posterUrl = show.poster_path
        ? `${TMDB_IMAGE_BASE}${show.poster_path}`
        : "";

      const firstAirYear = show.first_air_date
        ? show.first_air_date.slice(0, 4)
        : "Unknown";

      const card = document.createElement("div");
      card.className = "result-card";

      card.innerHTML = `
        <div
          class="result-poster"
          style="background-image: url('${posterUrl}')"
        ></div>

        <h3>${show.name}</h3>
        <p>${firstAirYear}</p>

        <div class="result-actions">
          <button class="add-pilot-btn">Add ${show.name}</button>
          <button class="episodes-btn">Episodes</button>
        </div>

        <div class="episode-box hidden">
          <label>Season</label>
          <input class="season-input" type="number" min="1" value="1">

          <label>Episode</label>
          <input class="episode-input" type="number" min="1" value="1">

          <button class="add-episode-btn">Add This Episode</button>
        </div>
      `;

      const addPilotBtn = card.querySelector(".add-pilot-btn");
      const episodesBtn = card.querySelector(".episodes-btn");
      const episodeBox = card.querySelector(".episode-box");
      const addEpisodeBtn = card.querySelector(".add-episode-btn");
      const seasonInput = card.querySelector(".season-input");
      const episodeInput = card.querySelector(".episode-input");

      addPilotBtn.addEventListener("click", () => {
        addShowToLibrary(show, posterUrl, 1, 1);
      });

      episodesBtn.addEventListener("click", () => {
        episodeBox.classList.toggle("hidden");
      });

      addEpisodeBtn.addEventListener("click", () => {
        const season = Number(seasonInput.value);
        const episode = Number(episodeInput.value);

        addShowToLibrary(show, posterUrl, season, episode);
      });

      searchResults.appendChild(card);
    });
  } catch (error) {
    console.error("TMDB search failed:", error);
    searchResults.innerHTML =
      "<p>Search failed. Check your API key or connection.</p>";
  }
}

async function searchMovies() {
  const query = searchInputM.value.trim();

  if (!query) {
    alert("Type a movie name first.");
    return;
  }

  searchResultsM.innerHTML = "<p>Searching...</p>";

  try {
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
      query
    )}`;

    const response = await fetch(url);
    const data = await response.json();

    searchResultsM.innerHTML = "";

    if (!data.results || data.results.length === 0) {
      searchResultsM.innerHTML = "<p>No movies found.</p>";
      return;
    }

    data.results.slice(0, 8).forEach((movie) => {
      const posterUrl = movie.poster_path
        ? `${TMDB_IMAGE_BASE}${movie.poster_path}`
        : "";

      const releaseYear = movie.release_date
        ? movie.release_date.slice(0, 4)
        : "Unknown";

      const card = document.createElement("div");
      card.className = "result-card";

      card.innerHTML = `
        <div
          class="result-poster"
          style="background-image: url('${posterUrl}')"
        ></div>

        <h3>${movie.title}</h3>
        <p>${releaseYear}</p>

        <div class="result-actions">
          <button class="add-movie-btn">Add ${movie.title}</button>
        </div>
      `;

      const addMovieBtn = card.querySelector(".add-movie-btn");

      addMovieBtn.addEventListener("click", () => {
        addMoviesToLibrary(movie, posterUrl);
      });

      searchResultsM.appendChild(card);
    });
  } catch (error) {
    console.error("TMDB movie search failed:", error);

    searchResultsM.innerHTML =
      "<p>Search failed. Check your API key or connection.</p>";
  }
}

searchShowBtn.addEventListener("click", searchShows);
searchMovieBtn.addEventListener("click", searchMovies);

playerNextEpisodeBtn.addEventListener("click", () => {
  if (!activeMedia || !activeMedia.seasons) return;

  const shows = getShows();

  const showIndex = shows.findIndex((show) => shows.id === activeMedia.id);

  if (showIndex === -1) return;

  const currentSeasonData = show.season.find(
    (seasonData) => seasonData.seasonNumber === show.season
  );

  if (!currentSeasonData) return;

  if (show.episode < currentSeasonData.episodeCount){
    show.episode += 1;
  } else if (show.season < show.totalSeasons){
    show.season += 1;
    show.episode = 1;
  } else {
    alert("You finished the show!");
    return;
  }

  show.progress = 0;
  show.url = `https://mappl.tv/watch/tv/${show.tmdbId}-${show.season}-${show.episode}`;

  shows[showIndex] = show;
  saveShows(shows);

  activeMedia = show;

  openPlayer(`${show.title} - S${show.season}E${show.episode}`, show.url, show);
  renderShows();

});

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchShows();
  }
});

searchInputM.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchMovies();
  }
});

renderApp();