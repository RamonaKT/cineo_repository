const showId = new URLSearchParams(window.location.search).get('show_id');
const movieId = new URLSearchParams(window.location.search).get('movie_id');

// Session-ID als Benutzer-ID verwenden
// Funktion zur Generierung einer UUID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

// Überprüfen und Erstellen einer Benutzer-ID
let userId = sessionStorage.getItem('session_id');
if (!userId) {
    userId = `session-${generateUUID()}`; // Verwendung der benutzerdefinierten UUID-Funktion
    sessionStorage.setItem('session_id', userId);
}


let reservationTimer; // Timer-Variable
let isReservationExpired = false; // Statusvariable für abgelaufene Reservierung
let isNavigating = false; // Globaler Zustand

document.addEventListener('DOMContentLoaded', () => {
    const reservationDuration = 5 * 60 * 1000; // 5 Minuten Timer

    reservationTimer = setTimeout(async () => {
        try {
            isReservationExpired = true;

            if (selectedSeats.size > 0) {
                console.log("Ausgewählte Sitzplätze:", selectedSeats);

                const releasePromises = Array.from(selectedSeats).map(seatId =>
                    fetch('api/seatReservations/release', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            seat_id: seatId,
                            session_id: userId,
                        }),
                    }).then(response => {
                        if (!response.ok) {
                            throw new Error(`Fehler bei Sitz ${seatId}`);
                        }
                        return response.json();
                    }).then(data => {
                        console.log(`Sitz ${seatId} freigegeben:`, data);
                    }).catch(error => {
                        console.error(`Fehler beim Freigeben von Sitz ${seatId}:`, error.message);
                    })
                );

                await Promise.all(releasePromises);
                console.log('Alle Reservierungen wurden freigegeben.');
                selectedSeats.clear(); // Auswahl leeren
            } else {
                console.error("Keine Sitzplätze ausgewählt.");
            }

            // Zeige Alert-Meldung
            alert('Ihre Reservierung ist abgelaufen. Sie werden zur Programmseite weitergeleitet.');

            // Weiterleitung zur Programmseite
            window.location.href = '/mainpages/programpageStructure.html';

        } catch (error) {
            console.error("Fehler beim Freigeben der Reservierungen:", error.message);
        }
    }, reservationDuration);


    // Event Listener für das Verlassen der Seite
    window.addEventListener('beforeunload', async (event) => {
        if (isNavigating) {
            console.log('Benutzer navigiert weiter, keine Freigabe erforderlich.');
            return;
        }

        if (selectedSeats.size > 0) {
            try {
                const releasePromises = Array.from(selectedSeats).map(seatId =>
                    fetch('/api/seatReservations/release', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            seat_id: seatId,
                            session_id: userId,
                        }),
                    }).then(response => {
                        if (!response.ok) {
                            throw new Error(`Fehler beim Freigeben von Sitz ${seatId}`);
                        }
                        return response.json();
                    }).then(data => {
                        console.log(`Sitz ${seatId} freigegeben:`, data);
                    }).catch(error => {
                        console.error(`Fehler beim Freigeben von Sitz ${seatId}:`, error.message);
                    })
                );

                await Promise.all(releasePromises);
                console.log('Alle Reservierungen wurden freigegeben.');
                selectedSeats.clear(); // Auswahl leeren
            } catch (error) {
                console.error("Fehler beim Freigeben der Reservierungen:", error.message);
            }
        }
    });

});

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

/*
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
}*/

async function loadSeats() {
    try {
        const response = await fetch(`/api/seatReservations/seats?show_id=${showId}`);
        if (!response.ok) {
            console.error(`Fehler: ${response.status} - ${response.statusText}`);
            throw new Error('Serverantwort war nicht erfolgreich');
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Antwort ist kein JSON");
        }

        const seats = await response.json();
        console.log(seats);
        renderSeats(seats);
    } catch (error) {
        console.error('Fehler beim Laden der Sitzplätze:', error.message);
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
            seatElement.dataset.rowId = seat.row_id; // Reihennummer als Attribut
            seatElement.dataset.seatNumber = seat.seat_number; // Platznummer als Attribut

            // Markiere nicht verfügbare Sitzplätze
            if (seat.status === 1 || seat.status === 2) {
                seatElement.classList.add('unavailable');
            }

            console.log("Rendering seat element:", seatElement);

            seatElement.dataset.seatId = seat.seat_id;
            seatElement.addEventListener('click', () => toggleSeatSelection(seatElement, seat));

            // Füge Event Listener für Hover hinzu
            handleSeatHover(seatElement, seat);

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
    return Object.keys(rows)
        .sort((a, b) => a - b) // Reihen sortieren
        .map(rowId => rows[rowId].sort((a, b) => a.seat_number - b.seat_number)); // Sitzplätze in jeder Reihe sortieren
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
        // Abwählen des Sitzplatzes
        const releaseSuccess = await releaseSeat(seatId);
        if (releaseSuccess) {
            selectedSeats.delete(seatId);
            seatElement.classList.remove('selected');
        } else {
            alert('Fehler beim Freigeben des Sitzplatzes.');
        }
    } else {
        // Reservieren des Sitzplatzes
        const reserveSuccess = await reserveSeat(seatId);
        if (reserveSuccess) {
            selectedSeats.add(seatId);
            seatElement.classList.add('selected');
        } else {
            alert('Sitzplatz konnte nicht reserviert werden. Bitte laden Sie die Seite neu.');
        }
    }
}



// Funktion zum Reservieren eines Sitzplatzes
async function reserveSeat(seatId) {
    try {
        const responseD = await fetch('/api/seatReservations/reserve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ seat_id: seatId, session_id: userId })
        });

        const result = await responseD.json();
        if (responseD.ok) {
            console.log(result.message);
            return true;
        } else if (responseD.status === 409) {
            alert('Sitzplatz bereits reserviert, bitte Seite neu laden.');
            return false;
        } else {
            console.error('Fehler beim Reservieren:', result.message);
            return false;
        }
    } catch (error) {
        console.error('Netzwerkfehler beim Reservieren:', error);
        return false;
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
        return response.ok;
    } else {
        console.error('Fehler beim Freigeben:', result.message);
        return false;
    }
}


// Weiterleitung zur nächsten Seite mit ausgewählten Sitzplätzen
document.getElementById('confirm-btn').addEventListener('click', () => {

    if (selectedSeats.size === 0) {
        // Wenn keine Sitzplätze ausgewählt wurden, zeigen wir eine Benachrichtigung an
        alert('Bitte wählen Sie mindestens einen Sitzplatz aus, bevor Sie fortfahren.');
        return;  // Verhindert die Weiterleitung
    }

    isNavigating = true; // Markiert, dass der Benutzer navigiert
    // Timer wird beendet
    clearTimeout(reservationTimer);

    // Erstellen eines Arrays mit Sitzplatzinformationen (ID + Kategorie)
    const selectedSeatsArray = Array.from(selectedSeats).map(seatId => {
        const seatElement = document.querySelector(`div[data-seat-id='${seatId}']`);
        return {
            seatId,
            category: seatElement?.dataset.category || null, // Kategorie des Sitzplatzes
            rowId: seatElement?.dataset.rowId ? String(seatElement.dataset.rowId).slice(2) : null, // Entfernt die ersten 3 Ziffern
            seatNumber: seatElement?.dataset.seatNumber || null // Platznummer 
        };

    });

    // Kodieren der Daten in einem Query-Parameter
    const encodedSeats = encodeURIComponent(JSON.stringify(selectedSeatsArray));

    const nextPage = `ticketsStructure.html?show_id=${showId}&movie_id=${movieId}&session_id=${userId}&seats=${encodedSeats}`;
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

// Diese Funktion wird aufgerufen, wenn ein Sitzplatz länger als 3 Sekunden gehovt wird
function handleSeatHover(seatElement, seat) {
    let timeoutId;

    seatElement.addEventListener('mouseover', () => {
        // Setze einen Timer, der nach 3 Sekunden die Details anzeigt
        timeoutId = setTimeout(() => {
            const rowIdStr = parseInt(String(seat.row_id).slice(-3), 10);
            const seatNumber = seat.seat_number;    // Die Zimmernummer (Achtung: Dies muss im seat-Objekt vorhanden sein)

            // Tooltip-Inhalt aktualisieren
            tooltipContent.textContent = `Reihe: ${rowIdStr}, Platz: ${seatNumber}`;
            tooltip.style.display = 'block';

            tooltip.style.left = `${seatElement.getBoundingClientRect().left + window.scrollX}px`;
            tooltip.style.top = `${seatElement.getBoundingClientRect().top + seatElement.offsetHeight + 5 + window.scrollY}px`;
        }, 1500);
    });

    // Wenn der Benutzer den Hover vor den 3 Sekunden verlässt, brechen wir den Timer ab
    seatElement.addEventListener('mouseout', () => {
        clearTimeout(timeoutId);
        tooltip.style.display = 'none';  // Verstecke das Tooltip
    });
}

