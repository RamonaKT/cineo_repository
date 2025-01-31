// Fetchen der Filme aus dem Backend und Rendern im Grid
async function fetchMovies() {
  try {
    const response = await fetch('/api/filme');
    const movies = await response.json();
    renderMovies(movies);
  } catch (error) {
    console.error('Error fetching movies:', error);
  }
}
// Rendern der Filme im Grid
function renderMovies(movies) {
  const grid = document.getElementById('movie-grid');
  grid.innerHTML = ''; 
  movies.forEach((movie, index) => {
    const cardWrapper = document.createElement('div');
    cardWrapper.classList.add('movie-card-wrapper');
    const card = document.createElement('div');
    card.classList.add('movie-card');
    console.log("movie.movie_id", movie.movie_id);
    card.addEventListener('click', () => {
      console.log("Navigating to:", `/movie/${movie.movie_id}`); 
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

    details.appendChild(title);
  
    card.appendChild(cover);
    card.appendChild(details);

    cardWrapper.style.animationDelay = `${index * 0.2}s`; // Delay für jedes Element

    cardWrapper.appendChild(card);

    grid.appendChild(cardWrapper);
  });
}

// Initialize
fetchMovies();