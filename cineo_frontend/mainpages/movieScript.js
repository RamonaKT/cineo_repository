// Funktion zum Abrufen der Filmdetails
async function fetchMovieDetails() {
    const movieId = window.location.pathname.split('/')[2]; // Die ID aus der URL extrahieren
    try {
      // API-Anfrage für die Filmdetails
      const response = await fetch(`http://localhost:4000/api/filme/${movieId}`);
      const movie = await response.json();
      
      // Movie-Details in die HTML-Elemente einfügen
      document.getElementById('movie-title').textContent = movie.title;
      document.getElementById('movie-image').src = movie.image;
      document.getElementById('movie-year').textContent = `${movie.year}`;
      document.getElementById('movie-genre').textContent = `${movie.genre}`;
      document.getElementById('movie-length').textContent = `${movie.length} minutes`;
    } catch (error) {
      console.error('Error fetching movie details:', error);
    }
  }
  
  // Ruft die Funktion beim Laden der Seite auf
  document.addEventListener('DOMContentLoaded', fetchMovieDetails);



/*async function fetchMovieDetails() {
    const movieId = window.location.pathname.split('/')[2]; // Die ID aus der URL extrahieren
    try {
      const response = await fetch(`http://localhost:4000/api/filme/${movieId}`);
      const movie = await response.json();
      document.getElementById('movie-title').textContent = movie.title;
      document.getElementById('movie-image').src = movie.image;
      document.getElementById('movie-year').textContent = `Year: ${movie.year}`;
      document.getElementById('movie-genre').textContent = `Genre: ${movie.genre}`;
      document.getElementById('movie-length').textContent = `Length: ${movie.length} minutes`;
    } catch (error) {
      console.error('Error fetching movie details:', error);
    }
  }

  fetchMovieDetails();*/