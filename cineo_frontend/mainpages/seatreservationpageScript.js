
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const bodyParser = require('body-parser');
const app = express();
app.use(express.json());
app.use(bodyParser.json());

// Supabase-Client initialisieren
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

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

// Farben für Status
const reservedColor = 'red';
const selectedColor = 'orange';

let selectedSeats = new Set();
    
document.addEventListener('DOMContentLoaded', async () => {
    await loadSeats();
    setupRealtimeSubscription();
});

// Funktion zum Laden der Sitzplätze aus Supabase
async function loadSeats() {
    const { data: seats, error } = await supabase
        .from('seat')
        .select('*')
        .eq('show_id', showId);

    if (error) {
        console.error('Fehler beim Laden der Sitzplätze:', error);
        return;
    }

    renderSeats(seats);
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
    const reservedAt = new Date().toISOString();

    const { error } = await supabase
        .from('seat')
        .update({ status: 1, reserved_by: sessionId, reserved_at: reservedAt })
        .eq('seat_id', seatId)
        .eq('status', 0);

    if (error) console.error('Fehler beim Reservieren:', error);
}

// Funktion zum Freigeben eines Sitzplatzes
async function releaseSeat(seatId) {
    const { error } = await supabase
        .from('seat')
        .update({ status: 0, reserved_by: null, reserved_at: null })
        .eq('seat_id', seatId)
        .eq('reserved_by', sessionId);

    if (error) console.error('Fehler beim Freigeben:', error);
}

// Echtzeit-Update für Sitzplatzänderungen
function setupRealtimeSubscription() {
    supabase
        .from(`seat:show_id=eq.${showId}`)
        .on('UPDATE', payload => {
            loadSeats();
        })
        .subscribe();
}

// Weiterleitung zur nächsten Seite mit ausgewählten Sitzplätzen
document.getElementById('confirm-btn').addEventListener('click', () => {
    const seatIds = Array.from(selectedSeats).join(',');
    const nextPage = `ticketsStructure.html?show_id=${showId}&movie_id=${movieId}&session_id=${sessionId}&seat_id=${seatIds}`;
    window.location.href = nextPage;
});

setInterval(autoReleaseSeat, 10000); // Check 10 seconds

