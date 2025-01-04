document.getElementById('roomForm').addEventListener('submit', function (e) {
  e.preventDefault();
  
  const roomNumber = document.getElementById('roomNumber').value;
  const rows = parseInt(document.getElementById('rows').value);
  const seatCounts = document.getElementById('seats').value.split(',').map(num => parseInt(num.trim()));
  
  generateLayout(roomNumber, rows, seatCounts);
});

function generateLayout(roomNumber, rows, seatCounts) {
  const seatLayout = document.getElementById('seatLayout');
  seatLayout.innerHTML = ''; // Clear any existing layout

  for (let i = 0; i < rows; i++) {
      const rowDiv = document.createElement('div');
      rowDiv.classList.add('row');
      
      for (let j = 0; j < seatCounts[i]; j++) {
          const seat = document.createElement('div');
          seat.classList.add('seat', 'parkett'); // Default category is 'parkett'
          seat.addEventListener('click', () => toggleSeatCategory(seat));
          rowDiv.appendChild(seat);
      }
      
      seatLayout.appendChild(rowDiv);
  }
}

function toggleSeatCategory(seat) {
  if (seat.classList.contains('parkett')) {
      seat.classList.remove('parkett');
      seat.classList.add('vip');
  } else if (seat.classList.contains('vip')) {
      seat.classList.remove('vip');
      seat.classList.add('loge');
  } else {
      seat.classList.remove('loge');
      seat.classList.add('parkett');
  }
}

async function submitData(roomNumber, seatCounts) {
  const seatLayout = document.querySelectorAll('.seat');
  const seatsData = [];

  seatLayout.forEach((seat, index) => {
      let category = 0; // Default to parkett
      if (seat.classList.contains('vip')) category = 1;
      if (seat.classList.contains('loge')) category = 2;

      seatsData.push({
          seatId: index + 1,  // Simple ID, can be customized
          category: category
      });
  });

  const response = await fetch('/api/saveLayout', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roomNumber, seatCounts, seatsData }),
  });

  if (response.ok) {
      alert("Layout erfolgreich gespeichert!");
  } else {
      alert("Fehler beim Speichern des Layouts.");
  }
}
