const seatContainer = document.getElementById("seatLayout");
const submitButton = document.getElementById("submitButton");
const roomNumberInput = document.getElementById("roomNumber");
const seatCountsInput = document.getElementById("seatCounts");

let seatData = [];
let seatCounts = [];

// Event listener für den Bestätigungsbutton
submitButton.addEventListener("click", async () => {
    const roomNumber = roomNumberInput.value;
    if (!roomNumber || seatCounts.length === 0 || seatData.length === 0) {
        alert("Bitte fülle alle Felder aus!");
        return;
    }

    // Sende Daten an den Server
    try {
        const response = await fetch('/api/save-layout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                roomNumber: roomNumber,  // Raum-Nummer als room_id
                seatCounts: seatCounts,   // Sitzanzahl pro Reihe
                seatsData: seatData      // Detailinformationen zu den Sitzplätzen
            })
        });

        if (response.ok) {
            alert('Layout erfolgreich gespeichert!');
        } else {
            alert('Fehler beim Speichern des Layouts.');
        }
    } catch (error) {
        console.error(error);
        alert('Es gab einen Fehler beim Speichern.');
    }
});

// Funktion, um den Saal darzustellen
function generateSeats() {
    seatContainer.innerHTML = ""; // Leere das Container div
    seatData = [];

    seatCounts.forEach((rowSeats, rowIndex) => {
        const rowDiv = document.createElement("div");
        rowDiv.classList.add("row");

        for (let i = 0; i < rowSeats; i++) {
            const seatDiv = document.createElement("div");
            seatDiv.classList.add("seat");
            seatDiv.classList.add("available"); // Standard-Kategorie ist Parkett
            seatDiv.dataset.rowIndex = rowIndex;
            seatDiv.dataset.seatIndex = i;

            seatDiv.addEventListener("click", () => {
                toggleSeatCategory(seatDiv);
            });

            rowDiv.appendChild(seatDiv);
            seatData.push({
                category: 0, // Standard Kategorie: Parkett
                reservedAt: null
            });
        }

        seatContainer.appendChild(rowDiv);
    });
}

// Funktion, um die Kategorie eines Sitzes zu wechseln
function toggleSeatCategory(seatDiv) {
    const seatIndex = seatDiv.dataset.seatIndex;
    const rowIndex = seatDiv.dataset.rowIndex;

    const seat = seatData[rowIndex * seatCounts[rowIndex] + parseInt(seatIndex)];
    if (seat.category === 0) {
        seat.category = 1; // VIP
        seatDiv.classList.remove('available');
        seatDiv.classList.add('vip');
    } else if (seat.category === 1) {
        seat.category = 2; // Loge
        seatDiv.classList.remove('vip');
        seatDiv.classList.add('logen');
    } else {
        seat.category = 0; // Parkett
        seatDiv.classList.remove('logen');
        seatDiv.classList.add('available');
    }
}

// Funktion zum Parsen der Sitzanzahl
function parseSeatCounts() {
    const input = seatCountsInput.value;
    seatCounts = input.split(',').map(num => parseInt(num.trim()));
    generateSeats();
}

// Event listener für die Eingabe der Sitzanzahl
seatCountsInput.addEventListener("input", parseSeatCounts);
