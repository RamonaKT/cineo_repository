document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const movieIdFromParams = params.get("movie_id");
  const pathParts = window.location.pathname.split("/");
  

  const movieIdFromPath = pathParts[2];
 
 
  const movieId = movieIdFromParams || movieIdFromPath;

  if (!movieId) {
    alert("Film-ID fehlt. Bitte wählen Sie einen Film.");
    window.location.href = "/";
    return;
  }

  async function fetchMovieDetails() {
    try {
      const response = await fetch(`http://localhost:4000/api/filme/${movieId}`);
      const movie = await response.json();

      document.getElementById("movie-title").textContent = movie.title;
      document.getElementById("movie-image").src = movie.image;
      
      document.getElementById("movie-year").textContent = `${movie.year}`;
      document.getElementById("movie-genre").textContent = `${movie.genre}`;
      document.getElementById("movie-length").textContent = `${movie.duration} min.`;



      // Hier wird die description korrekt gekürzt und nicht die Länge gespeichert
      const maxLength = 350;
      let descriptionText = movie.description;
      let shortenedDescription = descriptionText; // Setze den vollständigen Text als Standard

      if (descriptionText.length > maxLength) {
        const lastSpaceIndex = descriptionText.lastIndexOf(' ', maxLength);
        shortenedDescription = descriptionText.substring(0, lastSpaceIndex) + "...";
      }

      // Setze den gekürzten Text und speichere den vollen Text als Data-Attribut
      const summaryElement = document.getElementById("summary");
      summaryElement.textContent = shortenedDescription;
      summaryElement.setAttribute("data-full-text", descriptionText);

      // Füge Event Listener für den Button hinzu
      const toggleButton = document.getElementById("mehr-weniger-button");
      /*toggleButton.addEventListener("click", () => toggleDescription(summaryElement, toggleButton));*/

      const showtimesGrid = document.getElementById("showtimes-grid");

      toggleButton.addEventListener("click", () => toggleDescription(summaryElement, toggleButton, showtimesGrid));

   } catch (error) {
      console.error("Fehler beim Abrufen der Filmdetails:", error);
    }

/*
    function toggleDescription(summaryElement, toggleButton) {
      const isExpanded = toggleButton.textContent === "Weniger";
      const fullText = summaryElement.getAttribute("data-full-text");
    
      // Finde das letzte Leerzeichen im Text, um mitten im Wort zu schneiden zu vermeiden
      const maxLength = 350;
    
      // Wenn der Text angezeigt wird, kürze ihn nur bis zum letzten Leerzeichen
      if (isExpanded) {
        let shortenedText = fullText.substring(0, maxLength);
    
        // Suche das letzte Leerzeichen innerhalb des gekürzten Textes
        const lastSpaceIndex = shortenedText.lastIndexOf(' ');
        if (lastSpaceIndex !== -1) {
          shortenedText = fullText.substring(0, lastSpaceIndex) + "...";
        } else {
          shortenedText = fullText.substring(0, maxLength) + "..."; // Falls kein Leerzeichen gefunden wird
        }
    
        summaryElement.textContent = shortenedText;
        toggleButton.textContent = "Mehr lesen";
      } else {
        summaryElement.textContent = fullText;
        toggleButton.textContent = "Weniger";
      }
    }
  }
*/

function toggleDescription(summaryElement, toggleButton, showtimesGrid) {
  const isExpanded = toggleButton.textContent === "Weniger";
  const fullText = summaryElement.getAttribute("data-full-text");

  // Finde das letzte Leerzeichen im Text, um mitten im Wort zu schneiden zu vermeiden
  const maxLength = 350;

  if (isExpanded) {
      let shortenedText = fullText.substring(0, maxLength);
      const lastSpaceIndex = shortenedText.lastIndexOf(' ');
      shortenedText = lastSpaceIndex !== -1
          ? fullText.substring(0, lastSpaceIndex) + "..."
          : fullText.substring(0, maxLength) + "...";

      summaryElement.textContent = shortenedText;
      toggleButton.textContent = "Mehr lesen";

      // Entferne die expanded-Klasse
      summaryElement.classList.remove("expanded");
      showtimesGrid.classList.remove("expanded");
  } else {
      summaryElement.textContent = fullText;
      toggleButton.textContent = "Weniger";

      // Füge die expanded-Klasse hinzu
      summaryElement.classList.add("expanded");
      showtimesGrid.classList.add("expanded");

      // Dynamische Höhe basierend auf dem Inhalt setzen
      summaryElement.style.maxHeight = `${summaryElement.scrollHeight}px`;
  }
}
  }



  async function fetchShowtimes(movieId) {
    try {
      const response = await fetch(`http://localhost:4000/api/vorstellungen/${movieId}`);
      if (!response.ok) {
        throw new Error("Fehler beim Abrufen der Vorführungen");
      }

      const showtimes = await response.json();
      renderShowtimes(showtimes);
    } catch (error) {
      console.error("Fehler beim Abrufen der Vorstellungen:", error);
    }
  }


  function renderShowtimes(showtimes) {
    console.log("Showtimes zum Rendern:", showtimes); // Debugging
    const showtimesGrid = document.getElementById("showtimes-grid");
    if (!showtimesGrid) {
        console.error("Element 'showtimes-grid' nicht gefunden.");
        return;
    }

    showtimesGrid.innerHTML = "";

    showtimes.forEach(showtime => {
        const datetime = new Date(`${showtime.date}T${showtime.time}`);
        if (isNaN(datetime)) {
            console.error("Ungültiges Datum/Uhrzeit:", showtime);
            return;
        }

        const gridItem = document.createElement("div");
        gridItem.classList.add("showtime-grid-item");
        gridItem.innerHTML = `
            <div class="showtime-datetime">
                <div class="showtime-date">${datetime.toLocaleDateString("de-DE")}</div>
                <div class="showtime-time">${datetime.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}</div>
            </div>
            <div class="showtime-room">${showtime.room}</div>
        `;
        showtimesGrid.appendChild(gridItem);
    });
}

  await fetchMovieDetails();
  await fetchShowtimes(movieId);
// movie_id aus der URL extrahieren



if (movieId) {
  const ticketButton = document.getElementById("ticket-button");
  ticketButton.href = `/mainpages/showsStructure.html?movie_id=${movieId}`;
}

});



  