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





async function fetchShowtimes(movieId) {
    try {
        const response = await fetch(`http://localhost:4000/api/vorstellungen/${movieId}`);
        if (!response.ok) {
            throw new Error("Fehler beim Abrufen der Vorstellungen");
        }
        const showtimes = await response.json();
        renderShowtimes(showtimes);
    } catch (error) {
        console.error("Fehler beim Abrufen der Vorstellungen:", error);
    }
}

function renderShowtimes(showtimes) {
    const showtimesGrid = document.getElementById("showtimes-grid");
    showtimesGrid.innerHTML = ""; // Vorherige Inhalte entfernen

    showtimes.forEach(showtime => {
        const gridItem = document.createElement("div");
        gridItem.classList.add("showtime-grid-item");
        gridItem.innerHTML = `
            <div class="showtime-details">
                <p><strong>Datum:</strong> ${showtime.date}</p>
                <p><strong>Uhrzeit:</strong> ${showtime.time}</p>
                <p><strong>Saal:</strong> ${showtime.room}</p>
            </div>
            <button class="select-ticket-button" data-show-id="${showtime.show_id}">
                Tickets auswählen
            </button>
        `;
        showtimesGrid.appendChild(gridItem);
    });

// Event Listener für Ticket-Auswahl-Buttons
document.querySelectorAll(".select-ticket-button").forEach(button => {
    button.addEventListener("click", (event) => {
        const showId = event.target.getAttribute("data-show-id");
        const movieId = new URLSearchParams(window.location.search).get("movie_id");
        window.location.href = `/mainpages/ticketsStructure.html?show_id=${showId}&movie_id=${movieId}`;
    });
});

/*
    // Event Listener für Ticket-Auswahl-Buttons
    document.querySelectorAll(".select-ticket-button").forEach(button => {
        button.addEventListener("click", (event) => {
            const showId = event.target.getAttribute("data-show-id");
            window.location.href = `/ticketsStructure.html?show_id=${showId}`;
        });
    }); */
}

// movie_id aus der URL holen
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get("movie_id");

if (movieId) {
    fetchShowtimes(movieId);
}





/*document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get('filme_id');

    const showtimeSelect = document.getElementById('showtime-select');
    const ticketTypeSelect = document.getElementById('ticket-type');
    const ticketPriceDisplay = document.querySelector('#ticket-price span');
    const bookTicketBtn = document.getElementById('book-ticket-btn');

    const ticketPrices = {
        Adult: 10,
        Child: 5,
        Student: 7,
        VIP: 15,
    };

    let selectedShowtime = null;

    // 1. Fetch Showtimes for the selected movie
    async function fetchShowtimes(movieId) {
        console.log('fetchShowtimes wird aufgerufen mit movieId:', movieId);

        try {
            const response = await fetch(`http://localhost:4000/api/showtimes/${movieId}`);
            console.log('API-Status:', response.status); // Status der API prüfen

            if (!response.ok) {
                throw new Error(`API-Fehler: ${response.status}`);
            }

            const showtimes = await response.json();
            console.log('API-Antwort:', showtimes);
            console.log('API-Antwort (Details):', JSON.stringify(showtimes, null, 2)); // Ausgabe der zurückgegebenen Daten

            // Sicherstellen, dass die Antwort ein Array ist
            if (!Array.isArray(showtimes)) {
                console.error('Die API hat kein Array zurückgegeben:', showtimes);
                return;
            }

            showtimes.forEach(showtime => {
                const option = document.createElement('option');
                option.value = showtime.showtime_id;
                option.textContent = `${new Date(showtime.datetime).toLocaleString()} - ${showtime.screen}`;
                showtimeSelect.appendChild(option);
            });

            console.log('Vorstellungen erfolgreich hinzugefügt.');
        } catch (error) {
            console.error('Fehler beim Abrufen der Vorstellungen:', error);
        }
    }

    // 2. Update Ticket Price on Ticket Type Change
    ticketTypeSelect.addEventListener('change', () => {
        const ticketType = ticketTypeSelect.value;
        const ticketPrice = ticketPrices[ticketType] || 0;
        ticketPriceDisplay.textContent = ticketPrice;
        console.log('Ticketpreis aktualisiert:', ticketType, ticketPrice);
    });

     // Set the initial price when the page is loaded
     const initialTicketType = ticketTypeSelect.value;  // Get the initial selected ticket type
     ticketPriceDisplay.textContent = ticketPrices[initialTicketType] || 0;  // Set the initial price based on the default value

    // 3. Book Ticket on Button Click
    bookTicketBtn.addEventListener('click', async () => {
        selectedShowtime = showtimeSelect.value;
        const ticketType = ticketTypeSelect.value;
        const ticketPrice = ticketPrices[ticketType];

        console.log('Ticketbuchung gestartet. Auswahl:', {
            selectedShowtime,
            ticketType,
            ticketPrice,
        });

        if (!selectedShowtime || !ticketType) {
            alert('Bitte wählen Sie eine Vorstellung und eine Ticketart.');
            return;
        }

        const payload = {
            showtime_id: selectedShowtime,
            ticket_type: ticketType,
            price: ticketPrice,
        };

        console.log('Buchungsdaten:', payload);

        try {
            const response = await fetch('http://localhost:4000/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                alert('Ticket erfolgreich gebucht!');
                console.log('Buchung erfolgreich.');
            } else {
                alert('Fehler bei der Buchung. Bitte versuchen Sie es erneut.');
                console.error('Buchung fehlgeschlagen. Status:', response.status);
            }
        } catch (error) {
            console.error('Fehler bei der Buchung:', error);
        }
    });

    // Initial Fetch of Showtimes
    if (movieId) {
        await fetchShowtimes(movieId);
    } else {
        alert('Film-ID fehlt. Bitte wählen Sie einen Film.');
        window.location.href = '/';
    }
}); */
