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

      const secondLine = document.getElementById("second-line");


      // Füge Event Listener für den Button hinzu
      const toggleButton = document.getElementById("mehr-weniger-button");
      /*toggleButton.addEventListener("click", () => toggleDescription(summaryElement, toggleButton));*/

      const showtimesGrid = document.getElementById("showtimes-grid");

      toggleButton.addEventListener("click", () => toggleDescription(summaryElement, toggleButton, showtimesGrid, secondLine));

   } catch (error) {
      console.error("Fehler beim Abrufen der Filmdetails:", error);
    }



function toggleDescription(summaryElement, toggleButton, showtimesGrid, secondLine) {
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
      //showtimesGrid.classList.remove("expanded");
     // secondLine.classList.remove("expanded");
  } else {
      summaryElement.textContent = fullText;
      toggleButton.textContent = "Weniger";

      // Füge die expanded-Klasse hinzu
      summaryElement.classList.add("expanded");
      //showtimesGrid.classList.add("expanded");
     // secondLine.classList.add("expanded");

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
        
        // Filtern der Vorstellungen, die ab dem heutigen Datum beginnen
        const filteredShowtimes = filterFutureShowtimes(showtimes);
        
        renderShowtimes(filteredShowtimes);
    } catch (error) {
        console.error("Fehler beim Abrufen der Vorstellungen:", error);
    }
}



function filterFutureShowtimes(showtimes) {
  const today = new Date();
  return showtimes.filter(showtime => {
      const showtimeDate = new Date(`${showtime.date}T${showtime.time}`);
      
      // Vergleiche, ob die Vorstellung in der Zukunft liegt
      return showtimeDate >= today;
  });
}




function renderShowtimes(showtimes) {
  console.log("Filtered Showtimes zum Rendern:", showtimes); // Debugging
  const showtimesGrid = document.getElementById("showtimes-grid");
  if (!showtimesGrid) {
      console.error("Element 'showtimes-grid' nicht gefunden.");
      return;
  }

  showtimesGrid.innerHTML = "";

  if (showtimes.length === 0) {
      showtimesGrid.innerHTML = "<div>Keine bevorstehenden Vorstellungen verfügbar.</div>";
      return;
  }

  // Sortiere die Vorstellungen nach Datum und Uhrzeit
  showtimes.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA - dateB; // Älteres Datum zuerst
});


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
          <div class="showtime-room">Kino ${showtime.room_id}</div>
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



  