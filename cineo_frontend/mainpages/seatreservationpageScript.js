// Beispiel: Säle und Sitzplatzdaten von der API oder Datenbank
const halls = [
    {
        id: 1,
        name: "Saal 1",
        rows: 5,
        columns: 8,
        seats: [
            { id: 1, row: 1, column: 1, type: "standard", reserved: false },
            { id: 2, row: 1, column: 2, type: "premium", reserved: true },
            { id: 3, row: 1, column: 3, type: "vip", reserved: false },
            // Weitere Sitzplätze ...
        ]
    },
    {
        id: 2,
        name: "Saal 2",
        rows: 6,
        columns: 10,
        seats: [
            // Sitzplatzdaten für Saal 2 ...
        ]
    }
];

const hallDropdown = document.getElementById("hall-dropdown");
const seatLayout = document.getElementById("seat-layout");
let selectedSeats = [];

// Dynamisches Dropdown für Säle füllen
function populateHallDropdown() {
    halls.forEach(hall => {
        const option = document.createElement("option");
        option.value = hall.id;
        option.textContent = hall.name;
        hallDropdown.appendChild(option);
    });
}

// Sitzplatzlayout für einen Saal rendern
function renderSeatLayout(hallId) {
    seatLayout.innerHTML = ""; // Reset Layout
    const hall = halls.find(h => h.id === parseInt(hallId));

    if (!hall) return;

    // Grid-Template für Sitzanordnung
    seatLayout.style.gridTemplateRows = `repeat(${hall.rows}, 1fr)`;
    seatLayout.style.gridTemplateColumns = `repeat(${hall.columns}, 1fr)`;

    // Sitzplätze rendern
    hall.seats.forEach(seat => {
        const seatElement = document.createElement("div");
        seatElement.classList.add("seat", seat.type);
        if (seat.reserved) {
            seatElement.classList.add("reserved");
        } else {
            seatElement.addEventListener("click", () => toggleSeatSelection(seat, seatElement));
        }
        seatElement.textContent = seat.row + "-" + seat.column; // Optional: Platznummer anzeigen
        seatLayout.appendChild(seatElement);
    });
}

// Sitzplatzauswahl umschalten
function toggleSeatSelection(seat, seatElement) {
    if (seatElement.classList.contains("selected")) {
        seatElement.classList.remove("selected");
        selectedSeats = selectedSeats.filter(s => s.id !== seat.id);
    } else {
        seatElement.classList.add("selected");
        selectedSeats.push(seat);
    }
}

// Event Listener für Dropdown-Änderung
hallDropdown.addEventListener("change", (event) => {
    renderSeatLayout(event.target.value);
});

// Initialisierung
populateHallDropdown();
