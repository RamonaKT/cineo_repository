document.addEventListener("DOMContentLoaded", async () => {
    // 1. Extrahiere die movie_id aus der URL
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get("movie_id");

    if (!movieId) {
        console.error("Keine movie_id in der URL gefunden");
        return;
    }

    try {
        // 2. API-Call, um die Filmdetails abzurufen
        const response = await fetch(`http://localhost:4000/api/filme/${movieId}`);
        if (!response.ok) {
            throw new Error("Fehler beim Abrufen der Filmdetails");
        }

        const movie = await response.json();

        // 3. Titel des Films in die Seite einfügen
        const movieTitleElement = document.getElementById("movie-title");
        movieTitleElement.textContent = movie.title;
    } catch (error) {
        console.error("Fehler beim Abrufen des Filmtitels:", error);
    }
});





async function fetchAllMovies() {
    try {
        const response = await fetch('http://localhost:4000/api/filme');
        if (!response.ok) {
            throw new Error("Fehler beim Abrufen der Filme");
        }
        const movies = await response.json();
        renderMovies(movies);
    } catch (error) {
        console.error("Fehler beim Abrufen der Filme:", error);
    }
}

function renderMovies(movies) {
    const moviesGrid = document.getElementById("movies-grid");
    moviesGrid.innerHTML = ""; // Vorherige Inhalte entfernen

    movies.forEach(movie => {
        const gridItem = document.createElement("div");
        gridItem.classList.add("movie-grid-item");
        gridItem.innerHTML = `
            <div class="movie-details">
                <h3>${movie.title}</h3>
                <p><strong>Genre:</strong> ${movie.genre}</p>
                <p><strong>Regisseur:</strong> ${movie.director}</p>
            </div>
            <button class="select-movie-button" data-movie-id="${movie.id}">
                Details anzeigen
            </button>
        `;
        moviesGrid.appendChild(gridItem);
    });

    // Event Listener für Buttons
    document.querySelectorAll(".select-movie-button").forEach(button => {
        button.addEventListener("click", (event) => {
            const movieId = event.target.getAttribute("data-movie-id");
            window.location.href = `/mainpages/moviedetails.html?movie_id=${movieId}`;
        });
    });
}

// Abrufen der Filme, wenn die Seite geladen ist
document.addEventListener("DOMContentLoaded", fetchAllMovies);


// movie_id aus der URL holen
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get("movie_id");

if (movieId) {
    fetchShowtimes(movieId);
}

