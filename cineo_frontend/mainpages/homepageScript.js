const initSlider = () => {
    const imageList = document.querySelector(".sliding-wrapper .image-list");
    const slideButtons = document.querySelectorAll(".sliding-wrapper .slide-button");

    // Funktion zum Scrollen der Bildliste
    const scrollImages = (direction) => {
        const scrollAmount = imageList.clientWidth * direction;
        imageList.scrollBy({ left: scrollAmount, behavior: "smooth" });
    };

    // Slide images according to the slide button clicks
    slideButtons.forEach(button => {
        button.addEventListener("click", () => {
            const direction = button.id === "prev-slide" ? -1 : 1;
            scrollImages(direction);
        });
    });

    // Reset scroll position to create endless loop effect
    imageList.addEventListener("scroll", () => {
        // Überprüfen, ob die rechte Scrollposition erreicht ist
        if (imageList.scrollLeft >= imageList.scrollWidth / 2) {
            imageList.scrollLeft = 0;  // Zurücksetzen der Scrollposition
        } else if (imageList.scrollLeft === 0) {
            imageList.scrollLeft = imageList.scrollWidth / 2;  // Scrollen zum Ende der Liste
        }
    });
};

// Funktion zum Abrufen und Rendern der Filme
async function fetchMovies() {
    try {
        const response = await fetch('http://localhost:4000/api/filme');
        const movies = await response.json();
        renderCarousel(movies); // Rendering der Carousel-Bilder nach Abruf der Daten
        initSlider();  // Slider initialisieren, nachdem die Bilder geladen wurden
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
}

// Funktion zum Rendern der dynamischen Bilder im Carousel
function renderCarousel(movies) {
    const carouselContainer = document.querySelector(".sliding-wrapper .image-list");
    carouselContainer.innerHTML = ''; // Clear existing content

    movies.forEach(movie => {
        const imageContainer = document.createElement('div');
        imageContainer.classList.add('image-container');

        // Link zum Movie
        const link = document.createElement('a');
        link.href = `/mainpages/programpageStructure.html`; // oder mit spezifischer Movie-ID: `/movie/${movie.movie_id}`
        link.classList.add('image-link');

        // Movie Image
        const movieImage = document.createElement('img');
        movieImage.src = movie.image; // Dynamisches Bild von der API
        movieImage.alt = movie.title;
        movieImage.classList.add('image-item');

        // Play Button
        const playButton = document.createElement('img');
        playButton.src = '../images/IconPlaybuttonHomepage.png';
        playButton.alt = 'Play Button';
        playButton.classList.add('play-button');

        // Anhängen der Elemente
        link.appendChild(movieImage);
        link.appendChild(playButton);
        imageContainer.appendChild(link);
        carouselContainer.appendChild(imageContainer);
    });

    // Klone die Bilderliste, um eine Endlosschleife zu simulieren
    const imageItems = carouselContainer.innerHTML;
    carouselContainer.innerHTML += imageItems;  // Bildliste duplizieren
}

// Initialisierung der Filme und des Sliders
window.addEventListener("load", fetchMovies);

