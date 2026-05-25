const OLD_SHOWS_KEY = "shows";
const OLD_MOVIES_KEY = "movies";

const PROFILES_KEY = "kevsflix:profiles";
const ACTIVE_PROFILE_KEY = "kevsflix:activeProfileId";

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

const profileSelect = document.getElementById("profileSelect");
const addProfileBtn = document.getElementById("addProfileBtn");
const profileForm = document.getElementById("profileForm");
const profileNameInput = document.getElementById("profileNameInput");
const profilePinInput = document.getElementById("profilePinInput");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const showsTitle = document.getElementById("showsTitle");
const moviesTitle = document.getElementById("moviesTitle");

toggleFormBtn.addEventListener("click", () => {
  addShowForm.classList.toggle("hidden");
  addMovieForm.classList.add("hidden");
  profileForm.classList.add("hidden");
});

toggleFormBtnM.addEventListener("click", () => {
  addMovieForm.classList.toggle("hidden");
  addShowForm.classList.add("hidden");
  profileForm.classList.add("hidden");
});

addProfileBtn.addEventListener("click", () => {
  profileForm.classList.toggle("hidden");
  addShowForm.classList.add("hidden");
  addMovieForm.classList.add("hidden");
  profileNameInput.focus();
});

saveProfileBtn.addEventListener("click", createProfileFromForm);

profileNameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    createProfileFromForm();
  }
});

profileSelect.addEventListener("change", () => {
  const profileId = profileSelect.value;
  const profile = getProfileById(profileId);

  if (!profile) return;

  if (profile.pin) {
    const pinAttempt = prompt(`Enter PIN for ${profile.name}:`);

    if (pinAttempt !== profile.pin) {
      alert("Wrong PIN.");
      profileSelect.value = getActiveProfileId();
      return;
    }
  }

  setActiveProfileId(profileId);
  renderApp();
});

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

function makeId() {
  return crypto.randomUUID();
}

function safeParse(value, fallback) {
  try {
    return JSON.parse(value) || fallback;
  } catch {
    return fallback;
  }
}

function storageKey(type) {
  return `kevsflix:${getActiveProfileId()}:${type}`;
}

function getProfiles() {
  return safeParse(localStorage.getItem(PROFILES_KEY), []);
}

function saveProfiles(profiles) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

function getProfileById(profileId) {
  return getProfiles().find((profile) => profile.id === profileId);
}

function getActiveProfileId() {
  return localStorage.getItem(ACTIVE_PROFILE_KEY);
}

function setActiveProfileId(profileId) {
  localStorage.setItem(ACTIVE_PROFILE_KEY, profileId);
}

function getActiveProfile() {
  return getProfileById(getActiveProfileId());
}

function createDefaultProfileIfNeeded() {
  let profiles = getProfiles();

  if (profiles.length > 0) {
    if (!getActiveProfileId() || !getProfileById(getActiveProfileId())) {
      setActiveProfileId(profiles[0].id);
    }

    return;
  }

  const defaultProfile = {
    id: makeId(),
    name: "Kevin",
    pin: "",
    createdAt: new Date().toISOString()
  };

  profiles = [defaultProfile];
  saveProfiles(profiles);
  setActiveProfileId(defaultProfile.id);

  migrateOldLibraryToProfile(defaultProfile.id);
}

function migrateOldLibraryToProfile(profileId) {
  const oldShows = safeParse(localStorage.getItem(OLD_SHOWS_KEY), []);
  const oldMovies = safeParse(localStorage.getItem(OLD_MOVIES_KEY), []);

  if (oldShows.length > 0) {
    localStorage.setItem(`kevsflix:${profileId}:shows`, JSON.stringify(oldShows));
  }

  if (oldMovies.length > 0) {
    localStorage.setItem(`kevsflix:${profileId}:movies`, JSON.stringify(oldMovies));
  }

  [...oldShows, ...oldMovies].forEach((item) => {
    const oldProgressKey = `progress:${item.url}`;
    const oldProgress = localStorage.getItem(oldProgressKey);

    if (oldProgress !== null) {
      localStorage.setItem(`kevsflix:${profileId}:progress:${item.url}`, oldProgress);
    }
  });
}

function createProfileFromForm() {
  const name = profileNameInput.value.trim();
  const pin = profilePinInput.value.trim();

  if (!name) {
    alert("Type a profile name first.");
    return;
  }

  const profiles = getProfiles();

  const newProfile = {
    id: makeId(),
    name,
    pin,
    createdAt: new Date().toISOString()
  };

  profiles.push(newProfile);
  saveProfiles(profiles);
  setActiveProfileId(newProfile.id);

  profileNameInput.value = "";
  profilePinInput.value = "";
  profileForm.classList.add("hidden");

  renderApp();
}

function getShows() {
  return safeParse(localStorage.getItem(storageKey("shows")), []);
}

function getMovies() {
  return safeParse(localStorage.getItem(storageKey("movies")), []);
}

function saveShows(shows) {
  localStorage.setItem(storageKey("shows"), JSON.stringify(shows));
}

function saveMovies(movies) {
  localStorage.setItem(storageKey("movies"), JSON.stringify(movies));
}

function getProgressForUrl(url) {
  const key = `${storageKey("progress")}:${url}`;
  return Number(localStorage.getItem(key)) || 0;
}

// Temporary manual progress saver.
// Later, this should be replaced by real player progress events.
function saveProgressForUrl(url, seconds) {
  const key = `${storageKey("progress")}:${url}`;
  localStorage.setItem(key, String(seconds));
}

function renderProfileSelect() {
  const profiles = getProfiles();
  const activeProfileId = getActiveProfileId();

  profileSelect.innerHTML = "";

  profiles.forEach((profile) => {
    const option = document.createElement("option");
    option.value = profile.id;
    option.textContent = profile.pin ? `${profile.name} 🔒` : profile.name;
    profileSelect.appendChild(option);
  });

  profileSelect.value = activeProfileId;
}

function renderTitles() {
  const profile = getActiveProfile();
  const name = profile ? profile.name : "Your";

  showsTitle.textContent = `${name}'s Shows`;
  moviesTitle.textContent = `${name}'s Movies`;
}

function renderShows() {
  const shows = getShows();

  showsGrid.innerHTML = "";

  if (shows.length === 0) {
    showsGrid.innerHTML = "<p>No shows added yet. Click + Add Show.</p>";
    return;
  }

  for (const show of shows) {
    const progress = getProgressForUrl(show.url);

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <button class="delete-btn">X</button>

      <div
        class="poster"
        style="background-image: url('${show.posterUrl || ""}')"
      ></div>

      <div class="card-info">
        <h3>${show.title}</h3>
        <p>S${show.season}E${show.episode}</p>
        <p>Last saved: ${formatTime(progress)}</p>

        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress ? "35%" : "0%"}"></div>
        </div>
      </div>
    `;

    card.addEventListener("click", () => {
      window.open(show.url, "_blank");
    });

    const deleteBtn = card.querySelector(".delete-btn");

    deleteBtn.addEventListener("click", (event) => {
      event.stopPropagation();

      const updatedShows = shows.filter((item) => item.id !== show.id);
      saveShows(updatedShows);
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
    const progress = getProgressForUrl(movie.url);

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <button class="delete-btn">X</button>

      <div
        class="poster"
        style="background-image: url('${movie.posterUrl || ""}')"
      ></div>

      <div class="card-info">
        <h3>${movie.title}</h3>
        <p>Last saved: ${formatTime(progress)}</p>

        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress ? "35%" : "0%"}"></div>
        </div>
      </div>
    `;

    card.addEventListener("click", () => {
      window.open(movie.url, "_blank");
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

function addShowToLibrary(show, posterUrl, season, episode) {
  if (!season || !episode || season < 1 || episode < 1) {
    alert("Season and episode must be 1 or higher.");
    return;
  }

  const shows = getShows();

  shows.push({
    id: makeId(),
    tmdbId: show.id,
    title: show.name,
    posterUrl,
    url: `https://mappl.tv/watch/tv/${show.id}-${season}-${episode}`,
    season,
    episode,
    addedAt: new Date().toISOString()
  });

  saveShows(shows);

  searchInput.value = "";
  searchResults.innerHTML = "";
  addShowForm.classList.add("hidden");

  renderShows();
}

function addMoviesToLibrary(movie, posterUrl) {
  const movies = getMovies();

  movies.push({
    id: makeId(),
    tmdbId: movie.id,
    title: movie.title,
    posterUrl,
    url: `https://mappl.tv/watch/movie/${movie.id}`,
    addedAt: new Date().toISOString()
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
    const url =
      `https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`;

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
    const url =
      `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`;

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

function renderApp() {
  renderProfileSelect();
  renderTitles();
  renderShows();
  renderMovies();
}

searchShowBtn.addEventListener("click", searchShows);
searchMovieBtn.addEventListener("click", searchMovies);

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

createDefaultProfileIfNeeded();
renderApp();
