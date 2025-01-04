// Generiert das Layout basierend auf Benutzereingaben
function generateLayout() {
  const roomNumber = document.getElementById('roomNumber').value;
  const rowsCount = parseInt(document.getElementById('rowsCount').value);
  const seatsPerRow = document.getElementById('seatsPerRow').value.split(',').map(Number);

  const layoutDiv = document.getElementById('layout');
  layoutDiv.innerHTML = '';  // Vorheriges Layout löschen

  for (let row = 0; row < rowsCount; row++) {
      const rowDiv = document.createElement('div');
      rowDiv.classList.add('row');

      const seatCount = seatsPerRow[row] || seatsPerRow[seatsPerRow.length - 1];
      for (let seat = 0; seat < seatCount; seat++) {
          const seatDiv = document.createElement('div');
          seatDiv.classList.add('seat');
          seatDiv.dataset.row = row + 1;
          seatDiv.dataset.seat = seat + 1;
          seatDiv.dataset.status = 'available';
          
          seatDiv.addEventListener('click', () => {
              toggleSeatStatus(seatDiv);
          });

          rowDiv.appendChild(seatDiv);
      }

      layoutDiv.appendChild(rowDiv);
  }
}

// Wechseln des Status eines Sitzes (available, selected, reserved)
function toggleSeatStatus(seatDiv) {
  const currentStatus = seatDiv.dataset.status;

  if (currentStatus === 'available') {
      seatDiv.classList.remove('available');
      seatDiv.classList.add('selected');
      seatDiv.dataset.status = 'selected';
      updateSeatStatus(seatDiv, 'selected');
  } else if (currentStatus === 'selected') {
      seatDiv.classList.remove('selected');
      seatDiv.classList.add('reserved');
      seatDiv.dataset.status = 'reserved';
      updateSeatStatus(seatDiv, 'reserved');
  } else if (currentStatus === 'reserved') {
      seatDiv.classList.remove('reserved');
      seatDiv.classList.add('available');
      seatDiv.dataset.status = 'available';
      updateSeatStatus(seatDiv, 'available');
  }
}

// API-Anfrage zum Aktualisieren des Sitzplatzstatus
async function updateSeatStatus(seatDiv, status) {
  const roomId = document.getElementById('roomNumber').value;
  const row = seatDiv.dataset.row;
  const seat = seatDiv.dataset.seat;

  const response = await fetch(`/api/update-seat-status`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roomId, row, seat, status }),
  });

  const data = await response.json();
  console.log('Sitzplatzstatus aktualisiert:', data);
}
