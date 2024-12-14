document.addEventListener('DOMContentLoaded', async () => {
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
});
