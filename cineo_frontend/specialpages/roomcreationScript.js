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
      roomNumber: roomNumber,
      seatCounts: seatCounts, // Sitzanzahl pro Reihe (Array)
      seatsData: seatData    // Sitzdaten (Kategorie, Status, etc.)
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
              status: "available",  // Status für den Sitz
              reserved_at: null // reserved_at: null für nicht reservierte Sitze
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
      // Überprüfe, ob roomNumber vorhanden und eine gültige Zahl ist
      if (!layoutData.roomNumber || isNaN(+layoutData.roomNumber)) {
          throw new Error("Die Raumnummer ist ungültig. Bitte geben Sie eine Zahl an.");
      }

      // Konvertiere roomNumber in einen Integer
      layoutData.roomNumber = parseInt(layoutData.roomNumber, 10);

      // Debug-Ausgabe: Zu sendende Daten
      console.log("Daten, die gesendet werden:", layoutData);

      // API Request an den Server
      const response = await fetch("/api/saveLayout", {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
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

