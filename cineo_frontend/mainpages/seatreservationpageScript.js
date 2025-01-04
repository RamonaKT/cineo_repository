let selectedSeats = [];
let totalSeats = [];
const roomId = 1;  // Beispiel Room ID
const seatLayout = document.getElementById('seat-layout');
const reservationCountInput = document.getElementById('reservation-count');

// Funktion, um die Sitzplatzinformationen vom Backend abzurufen
async function loadSeats() {
    const response = await fetch(`/api/room/${roomId}/seats`);
    const seats = await response.json();
    totalSeats = seats;
    displaySeats(seats);
}

// Funktion, um die Sitzplätze darzustellen
function displaySeats(seats) {
    seatLayout.innerHTML = '';  // Leert den Layout-Bereich
    seats.forEach(seat => {
        const seatElement = document.createElement('div');
        seatElement.classList.add('seat');
        seatElement.classList.add(seat.status === 'booked' ? 'reserved' : 'available');
        seatElement.dataset.seatId = seat.seat_id;
        seatElement.addEventListener('click', () => toggleSeatSelection(seatElement, seat.seat_id));
        seatLayout.appendChild(seatElement);
    });
}

// Funktion, um den Sitzplatz zu wählen oder abzuwählen
function toggleSeatSelection(seatElement, seatId) {
    if (seatElement.classList.contains('selected')) {
        seatElement.classList.remove('selected');
        selectedSeats = selectedSeats.filter(id => id !== seatId);
    } else {
        seatElement.classList.add('selected');
        selectedSeats.push(seatId);
    }
}

// Funktion, um die Reservierung zu bestätigen
async function confirmReservation() {
    const requiredCount = parseInt(reservationCountInput.value, 10);
    if (selectedSeats.length !== requiredCount) {
        alert(`Bitte genau ${requiredCount} Sitzplätze auswählen.`);
        return;
    }

    const response = await fetch('/api/confirm-reservation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ seatIds: selectedSeats, roomId })
    });

    if (response.ok) {
        alert('Reservierung erfolgreich!');
        loadSeats();  // Lade die Sitze erneut, um den Status zu aktualisieren
    } else {
        alert('Fehler bei der Reservierung.');
    }
}

// Lade die Sitzplätze bei Laden der Seite
window.onload = loadSeats;
