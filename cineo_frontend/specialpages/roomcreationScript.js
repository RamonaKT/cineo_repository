const seatContainer = document.getElementById("seatLayout");
const submitButton = document.getElementById("submitButton");
const roomNumberInput = document.getElementById("roomNumber");
const seatCountsInput = document.getElementById("seatCounts");

let seatData = [];
let seatCounts = [];

// Event listener für den Bestätigungsbutton
submitButton.addEventListener("click", async () => {
    const roomNumber = roomNumberInput.value;
    if (!roomNumber || seatCounts.length === 0) {
        alert("Bitte fülle alle Felder aus!");
        return;
    }

    // Vorbereiten der Daten zum Senden
    const layoutData = {
        roomNumber: parseInt(roomNumber, 10), // Konvertiere in eine Zahl
        seatCounts: seatCounts, // Sitzanzahl pro Reihe (Array)
        seatsData: seatData    // Sitzdaten (Kategorie, Status, etc.)
    };

    try {
        // Debug-Ausgabe der finalen Daten vor dem Senden
        console.log("Daten, die gesendet werden:", JSON.stringify(layoutData, null, 2));

        const result = await submitLayout(layoutData);

        if (result) {
            alert('Layout erfolgreich gespeichert!');
        } else {
            alert('Fehler beim Speichern des Layouts.');
        }
    } catch (error) {
        console.error(error);
        alert('Es gab einen Fehler beim Speichern.');
    }
});

// Funktion zur Generierung der Sitze basierend auf seatCounts
function generateSeats() {
    seatContainer.innerHTML = ""; // Leere das Container div
    seatData = []; // Initialisiere seatData als leeres Array

    // Zähler für die Gesamtsitznummer (um die fortlaufende Nummerierung über alle Reihen hinweg zu ermöglichen)
    let globalSeatNumber = 1;

    // Iteriere durch die Anzahl der Reihen und erstelle die Sitze
    seatCounts.forEach((rowSeats, rowIndex) => {
        const rowDiv = document.createElement("div");
        rowDiv.classList.add("row");

        let rowSeatsData = []; // Erstelle ein Array für die Sitze einer Reihe

        // Iteriere durch die Anzahl der Sitze in der aktuellen Reihe
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

            // Füge einen Sitz zur rowSeatsData hinzu
            rowSeatsData.push({
                seatNumber: globalSeatNumber++,  // Fortlaufende Sitznummer
                rowNumber: rowIndex + 1,         // Reihenummer (1-basiert)
                category: 0                      // Standard Kategorie: Parkett (0)
            });
        }

        seatContainer.appendChild(rowDiv);
        seatData.push(rowSeatsData); // Jede Reihe wird als Array in seatData hinzugefügt
    });
}

// Funktion, um die Kategorie eines Sitzes zu wechseln
function toggleSeatCategory(seatDiv) {
    const seatIndex = seatDiv.dataset.seatIndex;  // Den Index des Sitzes holen
    const rowIndex = seatDiv.dataset.rowIndex;    // Den Index der Reihe holen

    // Hole das Sitzobjekt aus seatData
    const seat = seatData[rowIndex][seatIndex];   

    // Kategorie rotieren: 0 → 1 → 2 → 0
    if (seat.category === 0) {
        seat.category = 1;  // Parkett zu VIP
        seatDiv.classList.remove('available');
        seatDiv.classList.add('vip');
    } else if (seat.category === 1) {
        seat.category = 2;  // VIP zu Loge
        seatDiv.classList.remove('vip');
        seatDiv.classList.add('logen');
    } else {
        seat.category = 0;  // Loge zu Parkett
        seatDiv.classList.remove('logen');
        seatDiv.classList.add('available');
    }

}

// Funktion zum Parsen der Sitzanzahl
function parseSeatCounts() {
    const input = seatCountsInput.value;
    seatCounts = input.split(',').map(num => parseInt(num.trim(), 10)); // Konvertiere Eingabe in Zahlen
    generateSeats();
}

// Event listener für die Eingabe der Sitzanzahl
seatCountsInput.addEventListener("input", parseSeatCounts);

// Funktion für den POST-Request
async function submitLayout(layoutData) {
    try {
        // Überprüfe, ob roomNumber vorhanden und eine gültige Zahl ist
        if (!layoutData.roomNumber || isNaN(layoutData.roomNumber)) {
            throw new Error("Die Raumnummer ist ungültig. Bitte geben Sie eine Zahl an.");
        }

        // Konvertiere roomNumber in eine Zahl
        layoutData.roomNumber = parseInt(layoutData.roomNumber, 10);

        // Debug-Ausgabe: Sitzdaten vor der Umwandlung (zu Debug-Zwecken)
        console.log("Sitzdaten vor Umwandlung:", JSON.stringify(seatData, null, 2));

        // Die Sitzdaten bleiben in ihrer strukturierten Form (mit Reihen)
        layoutData.seatsData = seatData.map(row => 
            row.map(seat => ({
                seatNumber: seat.seatNumber,  // Sitznummer
                rowNumber: seat.rowNumber,    // Reihenummer
                category: seat.category       // Kategorie des Sitzes
            }))
        );

        // Debug-Ausgabe: Zu sendende Daten
        console.log("Daten, die gesendet werden:", JSON.stringify(layoutData, null, 2));

        // API Request an den Server
        const response = await fetch("/api/saveLayout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3dGNxdXpweGdrcm9zaXRueXJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxOTI5NTksImV4cCI6MjA0OTc2ODk1OX0.UYjPNnhS250d31KcmGfs6OJtpuwjaxbd3bebeOZJw9o"
            },
            body: JSON.stringify(layoutData)
        });

        // Überprüfe die Antwort des Servers
        if (!response.ok) {
            throw new Error("Fehler beim Speichern des Layouts");
        }

        // Konvertiere die Antwort in JSON
        const responseData = await response.json();
        console.log("Layout erfolgreich gespeichert", responseData);

        return true; // Erfolgsstatus zurückgeben
    } catch (error) {
        // Fehlerbehandlung
        console.error("Fehler beim Speichern des Layouts:", error);
        return false; // Fehlerstatus zurückgeben
    }
}