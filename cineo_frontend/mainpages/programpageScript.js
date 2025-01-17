// Fetch movies from the backend and render them in the grid
async function fetchMovies() {
  try {
    const response = await fetch('/api/filme');
    const movies = await response.json();
    renderMovies(movies);
  } catch (error) {
    console.error('Error fetching movies:', error);
  }
}
// Render movies in the grid
function renderMovies(movies) {
  const grid = document.getElementById('movie-grid');
  grid.innerHTML = ''; // Clear the grid
  movies.forEach(movie => {
    const card = document.createElement('div');
    card.classList.add('movie-card');
    console.log("movie.movie_id", movie.movie_id);
    card.addEventListener('click', () => {
      console.log("Navigating to:", `/movie/${movie.movie_id}`); // Sollte die korrekte ID ausgeben
      window.location.href = `/movie/${movie.movie_id}`;
    });
    const cover = document.createElement('img');
    cover.src = movie.image;
    cover.alt = movie.title;
    const details = document.createElement('div');
    details.classList.add('movie-details');
    const title = document.createElement('div');
    title.classList.add('movie-title');
    title.textContent = movie.title;
    /*const info = document.createElement('div');
    info.classList.add('movie-info');
    info.textContent = `${movie.year} • ${movie.genre} • ${movie.length} min`;*/
    details.appendChild(title);
    /* details.appendChild(info);*/
    card.appendChild(cover);
    card.appendChild(details);
    grid.appendChild(card);
  });
}
// Initialize
fetchMovies();