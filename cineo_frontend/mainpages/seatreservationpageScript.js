const showId = new URLSearchParams(window.location.search).get('show_id');
const movieId = new URLSearchParams(window.location.search).get('movie_id');

// Session-ID als Benutzer-ID verwenden
let userId = sessionStorage.getItem('session_id');
if (!userId) {
  userId = `session-${crypto.randomUUID()}`;
  sessionStorage.setItem('session_id', userId);
}

// Farben für Sitzplatzkategorien
const seatColors = {
    0: 'lightgreen', // Parkett
    1: 'gold',       // VIP
    2: 'lightblue'   // Loge
};

const reservedColor = 'red';
const selectedColor = 'orange';

let selectedSeats = new Set();

document.addEventListener('DOMContentLoaded', async () => {
    await loadSeats();
});

// Funktion zum Laden der Sitzplätze über das Backend
async function loadSeats() {
    try {
        const response = await fetch(`/api/seatReservations/seats?show_id=${showId}`);
        const seats = await response.json();

        if (response.ok) {
            renderSeats(seats);
        } else {
            console.error('Fehler beim Laden der Sitzplätze:', seats);
        }
    } catch (error) {
        console.error('Fehler beim Laden der Sitzplätze:', error);
    }
}

// Funktion zum Rendern der Sitzplätze
function renderSeats(seats) {
    const seatContainer = document.getElementById('seats-container');
    seatContainer.innerHTML = ''; // Clear container

    seats.forEach(seat => {
        const seatElement = document.createElement('div');
        seatElement.classList.add('seat');
        seatElement.style.backgroundColor = getSeatColor(seat);

        if (seat.status === 1 || seat.status === 2) {
            seatElement.classList.add('unavailable');
        }

        seatElement.dataset.seatId = seat.seat_id;
        seatElement.addEventListener('click', () => toggleSeatSelection(seatElement, seat));

        seatContainer.appendChild(seatElement);
    });
}

// Funktion zur Bestimmung der Sitzfarbe
function getSeatColor(seat) {
    if (seat.status === 1 || seat.status === 2) return reservedColor;
    return seatColors[seat.category];
}

// Sitzplatz auswählen oder abwählen
async function toggleSeatSelection(seatElement, seat) {
    if (seat.status === 1 || seat.status === 2) return;

    const seatId = seat.seat_id;

    if (selectedSeats.has(seatId)) {
        // Abwählen
        selectedSeats.delete(seatId);
        seatElement.style.backgroundColor = getSeatColor(seat);
        await releaseSeat(seatId);
    } else {
        // Auswählen
        selectedSeats.add(seatId);
        seatElement.style.backgroundColor = selectedColor;
        await reserveSeat(seatId);
    }
}

// Funktion zum Reservieren eines Sitzplatzes
async function reserveSeat(seatId) {
    const response = await fetch('/api/seatReservations/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seat_id: seatId, session_id: userId })
    });

    const result = await response.json();
    if (response.ok) {
        console.log(result.message);
    } else {
        console.error('Fehler beim Reservieren:', result.message);
    }
}

// Funktion zum Freigeben eines Sitzplatzes
async function releaseSeat(seatId) {
    const response = await fetch('/api/seatReservations/release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seat_id: seatId, session_id: userId })
    });

    const result = await response.json();
    if (response.ok) {
        console.log(result.message);
    } else {
        console.error('Fehler beim Freigeben:', result.message);
    }
}

// Weiterleitung zur nächsten Seite mit ausgewählten Sitzplätzen
document.getElementById('confirm-btn').addEventListener('click', () => {
    const seatIds = Array.from(selectedSeats).join(',');
    const nextPage = `ticketsStructure.html?show_id=${showId}&movie_id=${movieId}&session_id=${userId}&seat_id=${seatIds}`;
    window.location.href = nextPage;
});

