async function fetchMoviesForCarousel() {
    try {
        // API-Aufruf, um Filme zu holen
        const response = await fetch('/api/filme');
        const movies = await response.json();

        // Nur die ersten 10 Filme auswählen
        const top10Movies = movies.slice(0, 10);

        renderCarouselItems(top10Movies);
    } catch (error) {
        console.error('Error fetching movies for carousel:', error);
    }
}

function renderCarouselItems(movies) {
    const slider = document.querySelector('.banner .slider');
    slider.innerHTML = ''; // Bestehende Items löschen

    movies.forEach((movie, index) => {
        const item = document.createElement('div');
        item.classList.add('item');
        item.style.setProperty('--position', index + 1);
        item.style.setProperty('--quantity', movies.length);

        const img = document.createElement('img');
        img.src = movie.image; // Erwartet, dass das Feld "image" die Bild-URL enthält
        img.alt = movie.title || 'Filmplakat';

        item.appendChild(img);
        slider.appendChild(item);
    });
}

// Initialisierung
fetchMoviesForCarousel();
