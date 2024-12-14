document.addEventListener('DOMContentLoaded', async () => {
  // Zuerst versuche, die movieId aus der URL zu extrahieren
  const params = new URLSearchParams(window.location.search);
  const movieIdFromParams = params.get('filme_id'); // Extrahiert die ID aus den URL-Parametern
  const pathParts = window.location.pathname.split('/'); // Teilt den Pfad in Teile
  const movieIdFromPath = pathParts[2]; // Extrahiert die ID aus dem Pfad

  // Überprüfe, welche movieId verfügbar ist und gib sie aus
  console.log('movieId aus URL-Parametern:', movieIdFromParams);
  console.log('movieId aus URL-Pfad:', movieIdFromPath);

  // Priorisiere die movieId aus den URL-Parametern (falls vorhanden)
  const movieId = movieIdFromParams || movieIdFromPath;

  // Wenn keine movieId vorhanden ist, eine Fehlermeldung ausgeben
  if (!movieId) {
      alert('Film-ID fehlt. Bitte wählen Sie einen Film.');
      window.location.href = '/'; // Zurück zur Startseite
      return;
  }

  // Funktion, um die Filmdetails zu holen
  async function fetchMovieDetails() {
      try {
          const response = await fetch(`http://localhost:4000/api/filme/${movieId}`);
          const movie = await response.json();
          
          // Filmdetails in HTML einfügen
          document.getElementById('movie-title').textContent = movie.title;
          document.getElementById('movie-image').src = movie.image;
          document.getElementById('movie-year').textContent = `${movie.year}`;
          document.getElementById('movie-genre').textContent = `${movie.genre}`;
          document.getElementById('movie-length').textContent = `${movie.length} minutes`;
      } catch (error) {
          console.error('Error fetching movie details:', error);
      }
  }

  // Funktion, um die Showtimes des Films abzurufen und anzuzeigen
  async function fetchShowtimes(movieId) {
      try {
          const response = await fetch(`http://localhost:4000/api/showtimes/${movieId}`);
          if (!response.ok) {
              throw new Error('Fehler beim Abrufen der Vorführungen');
          }

          const showtimes = await response.json();
          if (Array.isArray(showtimes)) {
              renderShowtimes(showtimes); // Zeige die Vorführungen an
          } else {
              console.error('Showtimes-Daten sind nicht im erwarteten Format');
          }
      } catch (error) {
          console.error('Fehler beim Abrufen der Vorstellungen:', error);
      }
  }

  function renderShowtimes(showtimes) {
    const showtimesGrid = document.getElementById('showtimes-grid');
    showtimesGrid.innerHTML = ''; // Vorherige Inhalte entfernen

    showtimes.forEach(showtime => {
        // Erstelle einen vollständigen datetime-String, der date und time zusammenführt
        const datetime = new Date(`${showtime.date}T${showtime.time}`);

        // Stelle sicher, dass der datetime-Wert gültig ist
        if (isNaN(datetime)) {
            console.error('Ungültiges Datum oder Uhrzeit:', showtime);
            return; // Überspringe ungültige Einträge
        }

        const gridItem = document.createElement('div');
        gridItem.classList.add('showtime-grid-item');
        gridItem.innerHTML = `
            <div class="showtime-datetime">
                <div class="showtime-date">${datetime.toLocaleDateString()}</div>
                <div class="showtime-time">${datetime.toLocaleTimeString()}</div>
            </div>
            <div class="showtime-screen">${showtime.screen}</div>
        `;
        showtimesGrid.appendChild(gridItem);
    });
}



  // Filmdetails und Showtimes abrufen
  await fetchMovieDetails();
  await fetchShowtimes(movieId);

  // Ticket-Link anpassen
  const ticketButton = document.getElementById('ticket-button');
  if (ticketButton) {
      ticketButton.href = `/tickets?filme_id=${movieId}`;
  }
});


/*

document.addEventListener('DOMContentLoaded', async () => {
  // Extrahiere die movieId aus der URL
  const params = new URLSearchParams(window.location.search);
  const movieId = params.get('filme_id'); // Die movieId aus der URL holen

  // Wenn keine movieId vorhanden ist, eine Fehlermeldung ausgeben
  if (!movieId) {
      alert('Film-ID fehlt. Bitte wählen Sie einen Film.');
      window.location.href = '/'; // Zurück zur Startseite
      return;
  }

  // Funktion, um die Filmdetails zu holen
  async function fetchMovieDetails() {
      try {
          const response = await fetch(`http://localhost:4000/api/filme/${movieId}`);
          const movie = await response.json();
          
          // Filmdetails in HTML einfügen
          document.getElementById('movie-title').textContent = movie.title;
          document.getElementById('movie-image').src = movie.image;
          document.getElementById('movie-year').textContent = `${movie.year}`;
          document.getElementById('movie-genre').textContent = `${movie.genre}`;
          document.getElementById('movie-length').textContent = `${movie.length} minutes`;
      } catch (error) {
          console.error('Error fetching movie details:', error);
      }
  }

  // Funktion, um die Showtimes des Films abzurufen und anzuzeigen
  async function fetchShowtimes(movieId) {
      try {
          const response = await fetch(`http://localhost:4000/api/showtimes/${movieId}`);
          if (!response.ok) {
              throw new Error('Fehler beim Abrufen der Vorführungen');
          }

          const showtimes = await response.json();
          if (Array.isArray(showtimes)) {
              renderShowtimes(showtimes); // Zeige die Vorführungen an
          } else {
              console.error('Showtimes-Daten sind nicht im erwarteten Format');
          }
      } catch (error) {
          console.error('Fehler beim Abrufen der Vorstellungen:', error);
      }
  }

  // Funktion zur Darstellung der Vorführungen in einem Grid
  function renderShowtimes(showtimes) {
      const showtimesGrid = document.getElementById('showtimes-grid');
      showtimesGrid.innerHTML = ''; // Vorherige Inhalte entfernen

      showtimes.forEach(showtime => {
          const gridItem = document.createElement('div');
          gridItem.classList.add('showtime-grid-item');
          gridItem.innerHTML = `
              <div class="showtime-time">${new Date(showtime.datetime).toLocaleString()}</div>
              <div class="showtime-screen">${showtime.screen}</div>
          `;
          showtimesGrid.appendChild(gridItem);
      });
  }

  // Filmdetails und Showtimes abrufen
  await fetchMovieDetails();
  await fetchShowtimes(movieId);

  // Ticket-Link anpassen
  const ticketButton = document.getElementById('ticket-button');
  if (ticketButton) {
      ticketButton.href = `/tickets?filme_id=${movieId}`;
  }
});




// Funktion zum Abrufen der Filmdetails
async function fetchMovieDetails() {
    const movieId = window.location.pathname.split('/')[2]; // Die ID aus der URL extrahieren
    try {
      // API-Anfrage für die Filmdetails
      const response = await fetch(`http://localhost:4000/api/filme/${movieId}`);
      const movie = await response.json();
      
      // Movie-Details in die HTML-Elemente einfügen
      document.getElementById('movie-title').textContent = movie.title;
      document.getElementById('movie-image').src = movie.image;
      document.getElementById('movie-year').textContent = `${movie.year}`;
      document.getElementById('movie-genre').textContent = `${movie.genre}`;
      document.getElementById('movie-length').textContent = `${movie.length} minutes`;
    } catch (error) {
      console.error('Error fetching movie details:', error);
    }
  }
  
  // Ruft die Funktion beim Laden der Seite auf
  document.addEventListener('DOMContentLoaded', fetchMovieDetails);

  document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get('filme_id'); // Die movieId aus der URL holen

   
    const showtimesGrid = document.getElementById('showtimes-grid');

    // 1. Showtimes für den ausgewählten Film abrufen
    async function fetchShowtimes(movieId) {
        try {
            const response = await fetch(`http://localhost:4000/api/showtimes/${movieId}`);
            if (!response.ok) {
                throw new Error('API-Fehler');
            }

            const showtimes = await response.json();

            // Sicherstellen, dass die Antwort ein Array ist
            if (Array.isArray(showtimes)) {
                renderShowtimes(showtimes);
            } else {
                console.error('Showtimes-Daten sind nicht im erwarteten Format');
            }
        } catch (error) {
            console.error('Fehler beim Abrufen der Vorstellungen:', error);
        }
    }

    // 2. Showtimes in der Tabelle anzeigen
    function renderShowtimes(showtimes) {
        // Tabellenansicht
        showtimes.forEach(showtime => {
            // Gridansicht
            const gridItem = document.createElement('div');
            gridItem.classList.add('showtime-grid-item');
            gridItem.innerHTML = `
                <div class="showtime-time">${new Date(showtime.datetime).toLocaleString()}</div>
                <div class="showtime-screen">${showtime.screen}</div>
            `;
            showtimesGrid.appendChild(gridItem);
        });
    }

    // Initiale Showtimes abrufen
    if (movieId) {
        await fetchShowtimes(movieId);
    } else {
        alert('Film-ID fehlt. Bitte wählen Sie einen Film.');
        window.location.href = '/';
    }
});


  document.addEventListener('DOMContentLoaded', () => {
    // Extrahiere die movieId aus der URL
    const pathParts = window.location.pathname.split('/'); // Teilt den Pfad in Teile
    const movieId = pathParts[2]; // Index 2 sollte die ID enthalten
    
    // Füge die movieId in den Link ein
    if (movieId) {
        const ticketButton = document.getElementById('ticket-button');
        ticketButton.href = `/tickets?filme_id=${movieId}`;
    } else {
        console.error('Film-ID konnte nicht aus der URL extrahiert werden.');
    }
});




/*async function fetchMovieDetails() {
    const movieId = window.location.pathname.split('/')[2]; // Die ID aus der URL extrahieren
    try {
      const response = await fetch(`http://localhost:4000/api/filme/${movieId}`);
      const movie = await response.json();
      document.getElementById('movie-title').textContent = movie.title;
      document.getElementById('movie-image').src = movie.image;
      document.getElementById('movie-year').textContent = `Year: ${movie.year}`;
      document.getElementById('movie-genre').textContent = `Genre: ${movie.genre}`;
      document.getElementById('movie-length').textContent = `Length: ${movie.length} minutes`;
    } catch (error) {
      console.error('Error fetching movie details:', error);
    }
  }

  fetchMovieDetails();*/

  