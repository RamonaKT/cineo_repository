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

const reservedColor = 'gray';
const selectedColor = 'purple';

let selectedSeats = new Set();

document.addEventListener('DOMContentLoaded', async () => {
    await loadSeats();
});

// Funktion zum Laden der Sitzplätze über das Backend
async function loadSeats() {
    try {
        const response = await fetch(`/api/seatReservations/seats?show_id=${showId}`);
        const seats = await response.json();
        console.log(showId);

        if (response.ok) {
            console.log(seats);
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

    console.log(seats);

    if (seats.length === 0) {
        seatContainer.innerHTML = 'Keine Sitzplätze verfügbar.';
        return;
    }

    // Schritt 1: Nach Reihen gruppieren
    const rows = groupSeatsByRow(seats);

    // Schritt 2: Sitzplätze für jede Reihe rendern
    rows.forEach((seatsInRow, rowIndex) => {
        const rowElement = document.createElement('div');
        rowElement.classList.add('row'); // Für CSS Styling

        seatsInRow.forEach(seat => {
            const seatElement = document.createElement('div');
            seatElement.classList.add('seat'); // Grundklasse für alle Sitzplätze

            // Setze die Kategorie als data-Attribut
            seatElement.dataset.category = seat.category;
            seatElement.dataset.seatId = seat.seat_id;

            // Markiere nicht verfügbare Sitzplätze
            if (seat.status === 1 || seat.status === 2) {
                seatElement.classList.add('unavailable');
            }

            console.log("Rendering seat element:", seatElement);

            seatElement.dataset.seatId = seat.seat_id;
            seatElement.addEventListener('click', () => toggleSeatSelection(seatElement, seat));

            rowElement.appendChild(seatElement);
        });

        console.log("Seat Container:", seatContainer);
        
        seatContainer.appendChild(rowElement);
    });
    console.log("Container nach dem Hinzufügen:", seatContainer.innerHTML);

}

// Hilfsfunktion zum Gruppieren der Sitzplätze nach Reihen
function groupSeatsByRow(seats) {
    const rows = {};

    seats.forEach(seat => {
        if (!rows[seat.row_id]) {
            rows[seat.row_id] = [];
        }
        rows[seat.row_id].push(seat);
    });

    console.log("Gruppierte Reihen:", rows);

    // Umwandeln des Objekts in ein Array von Reihen, sortiert nach `row_id`
    return Object.keys(rows).sort((a, b) => a - b).map(rowId => rows[rowId]);
}

// Funktion zur Bestimmung der Sitzkategorie und Rückgabe der entsprechenden CSS-Klasse
function getSeatCategoryClass(seat) {
    switch (seat.category) {
        case 0:
            return 'parkett'; // Parkett
        case 1:
            return 'vip';     // VIP
        case 2:
            return 'loge';    // Loge
        default:
            return '';        // Falls keine Kategorie vorhanden ist
    }
}

// Sitzplatz auswählen oder abwählen
async function toggleSeatSelection(seatElement, seat) {
    if (seat.status === 1 || seat.status === 2) return;

    const seatId = seat.seat_id;

    if (selectedSeats.has(seatId)) {
        // Abwählen
        selectedSeats.delete(seatId);
        seatElement.classList.remove('selected'); // Entfernt die ausgewählte Klasse
        await releaseSeat(seatId);
    } else {
        // Auswählen
        selectedSeats.add(seatId);
        seatElement.classList.add('selected');
        await reserveSeat(seatId);
    }
}


// Funktion zum Reservieren eines Sitzplatzes
async function reserveSeat(seatId) {
    try {
        const response = await fetch('/api/seatReservations/reserve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ seat_id: seatId, session_id: userId })
        });

        const result = await response.json();
        if (response.ok) {
            console.log(result.message);
        } else if (response.status === 409) {
            alert('Sitzplatz bereits reserviert, bitte Seite neu laden.');
        } else {
            console.error('Fehler beim Reservieren:', result.message);
        }
    } catch (error) {
        console.error('Netzwerkfehler beim Reservieren:', error);
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

// Prüft und gibt abgelaufene Reservierungen frei
async function checkAndReleaseExpiredSeats() {
    try {
        // Abrufen der reservierten Sitzplätze (status = 1)
        const response = await fetch(`/api/seatReservations/seats?show_id=${showId}`);
        const seats = await response.json();

        const tenMinutesAgo = Date.now() - 10 * 60 * 1000;

        for (const seat of seats) {
            if (seat.status === 1) {  // Nur reservierte Sitzplätze prüfen
                const reservedAtTimestamp = new Date(seat.reserved_at).getTime();

                // Überprüfung, ob die Reservierung älter als 10 Minuten ist
                if (reservedAtTimestamp < tenMinutesAgo) {
                    // Setze Sitzplatzstatus im Backend auf verfügbar (0)
                    await releaseSeat(seat.seat_id);

                    // Aktualisierung des Sitzplatzes im DOM
                    const seatElement = document.querySelector(`div[data-seat-id='${seat.seat_id}']`);
                    if (seatElement) {
                        seatElement.classList.remove('selected');  // Entfernt die ausgewählte Klasse
                        seatElement.style.backgroundColor = seatColors[seat.category];  // Ursprungsfarbe setzen

                        // Entferne den Sitzplatz aus der Menge der ausgewählten Sitzplätze
                        selectedSeats.delete(seat.seat_id);
                    }

                    console.log(`Sitzplatz ${seat.seat_id} wurde wegen Ablauf freigegeben.`);
                }
            }
        }
    } catch (error) {
        console.error('Fehler beim Überprüfen der abgelaufenen Sitzplätze:', error);
    }
}

// Funktion alle 1 Minute ausführen
setInterval(checkAndReleaseExpiredSeats, 60 * 1000);
