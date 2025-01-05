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

    // Vorbereiten der Daten zum Senden
    const layoutData = {
        roomNumber: roomNumber,
        seatCounts: seatCounts, // Sitzanzahl pro Reihe (Array)
        seatsData: seatData      // Detailinformationen zu den Sitzplätzen (Array)
    };

    try {
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

function generateSeats() {
  seatContainer.innerHTML = ""; // Leere das Container div
  seatData = []; // Initialisiere seatData als leeres Array

  seatCounts.forEach((rowSeats, rowIndex) => {
      const rowDiv = document.createElement("div");
      rowDiv.classList.add("row");

      let rowSeatsData = []; // Erstelle ein Array für die Sitze einer Reihe

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

          // Füge einen Sitz zur rowSeatsData hinzu (jede Reihe ist jetzt ein Array)
          rowSeatsData.push({
              category: 0, // Standard Kategorie: Parkett
              reservedAt: null
          });
      }

      seatContainer.appendChild(rowDiv);
      seatData.push(rowSeatsData); // Jede Reihe wird als Array hinzugefügt
  });
}


// Funktion, um die Kategorie eines Sitzes zu wechseln
function toggleSeatCategory(seatDiv) {
  const seatIndex = seatDiv.dataset.seatIndex;  // Den Index des Sitzes holen
  const rowIndex = seatDiv.dataset.rowIndex;    // Den Index der Reihe holen

  // Hole das Sitzobjekt aus seatData
  const seat = seatData[rowIndex][seatIndex];   // rowIndex ist die Reihe, seatIndex ist der Sitz in der Reihe

  if (seat.category === 0) {
      seat.category = 1;  // Wechsle von Parkett (0) zu VIP (1)
      seatDiv.classList.remove('available');
      seatDiv.classList.add('vip');
  } else if (seat.category === 1) {
      seat.category = 2;  // Wechsle von VIP (1) zu Loge (2)
      seatDiv.classList.remove('vip');
      seatDiv.classList.add('logen');
  } else {
      seat.category = 0;  // Wechsle von Loge (2) zu Parkett (0)
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

// Funktion für den POST-Request
async function submitLayout(layoutData) {
    try {
        const response = await fetch('/api/saveLayout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                roomNumber: layoutData.roomNumber,          // z.B. eine Zahl, z.B. 101
                seatCounts: layoutData.seatCounts,          // Array von Integers, z.B. [10, 12, 14]
                seatsData: layoutData.seatsData.map(row => row.map(seat => ({
                    category: seat.category,               // z.B. "VIP" oder "Standard"
                    status: seat.status,                   // z.B. "available" oder "reserved"
                    show_id: seat.show_id,                 // z.B. eine Zahl, z.B. 1 oder 2
                    reserved_at: seat.reserved_at || null, // z.B. ein Datum als String oder null
                })))
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Unbekannter Fehler');
        }

        console.log('Layout erfolgreich gespeichert:', result);
        return result;
    } catch (error) {
        console.error('Fehler beim Senden des Layouts:', error);
        throw error;
    }
}
