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
        const response = await fetch(`/api/filme/${movieId}`);
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



// Funktion, um die Vorstellungen abzurufen
async function fetchShowtimes(movieId) {
    try {
        const response = await fetch(`/api/vorstellungen/${movieId}`);
        if (!response.ok) {
            throw new Error("Fehler beim Abrufen der Vorstellungen");
        }
        const showtimes = await response.json();

        // Filtere die Vorstellungen ab dem heutigen Datum
        const filteredShowtimes = filterFutureShowtimes(showtimes);

        renderShowtimes(filteredShowtimes);
    } catch (error) {
        console.error("Fehler beim Abrufen der Vorstellungen:", error);
    }
}


// Funktion zum Filtern der Vorstellungen ab dem heutigen Datum
function filterFutureShowtimes(showtimes) {
    const now = new Date(); // Aktuelles Datum und Uhrzeit
    return showtimes.filter(showtime => {
        const showDateTime = new Date(`${showtime.date}T${showtime.time}`);
        return showDateTime >= now; // Nur zukünftige Vorstellungen
    });
}

    // Funktion, um die Vorstellungen auf der Seite darzustellen
function renderShowtimes(showtimes) {
    const showtimesGrid = document.getElementById("showtimes-grid");
    showtimesGrid.innerHTML = ""; // Vorherige Inhalte entfernen

    if (showtimes.length === 0) {
        showtimesGrid.innerHTML = "<p>Keine zukünftigen Vorstellungen verfügbar.</p>";
        return;
    }

     // Sortiere die Vorstellungen nach Datum und Uhrzeit
     showtimes.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA - dateB; // Aufsteigende Reihenfolge
    });


    showtimes.forEach((showtime, index) => {
        const formattedDate = formatDate(showtime.date); // Datum formatieren
        const formattedTime = formatTime(showtime.time); // Uhrzeit formatieren

        const gridItem = document.createElement("div");
        gridItem.classList.add("showtime-grid-item");
        gridItem.innerHTML = `
            <div class="showtime-details">
                <p><strong>Datum:</strong> ${formattedDate}</p>
                <p><strong>Uhrzeit:</strong> ${formattedTime}Uhr</p>
                <p><strong>Kino:</strong> ${showtime.room_id}</p>
            </div>
            <button class="select-ticket-button" data-show-id="${showtime.show_id}">
                Tickets auswählen
            </button>
        `;

         // Verzögerung basierend auf dem Index hinzufügen
         gridItem.style.animationDelay = `${index * 0.2}s`; // Delay für jedes Element

        showtimesGrid.appendChild(gridItem);
    });

    // Event Listener für Ticket-Auswahl-Buttons
    document.querySelectorAll(".select-ticket-button").forEach(button => {
        button.addEventListener("click", (event) => {
            const showId = event.target.getAttribute("data-show-id");
            const movieId = new URLSearchParams(window.location.search).get("movie_id");
            window.location.href = `/mainpages/seatreservationpageStructure.html?show_id=${showId}&movie_id=${movieId}`;
        });
    });
}

// Funktion zum Formatieren der Uhrzeit
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`; // Nur Stunden und Minuten zurückgeben
}

// Funktion zum Formatieren des Datums
function formatDate(dateString) {
    const [year, month, day] = dateString.split("-"); // Annahme: ISO-Format YYYY-MM-DD
    return `${day}.${month}.${year}`; // Datum ins deutsche Format umwandeln
}

// movie_id aus der URL holen und Vorstellungen abrufen
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get("movie_id");

if (movieId) {
    fetchShowtimes(movieId);
}
