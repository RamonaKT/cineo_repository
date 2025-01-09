/*document.addEventListener("DOMContentLoaded", async () => {
    // Extrahiere show_id und movie_id aus der URL
    const urlParams = new URLSearchParams(window.location.search);
    const showId = urlParams.get("show_id");
    const movieId = urlParams.get("movie_id");

    // Überprüfen, ob showId und movieId existieren
    if (!showId || !movieId) {
        alert("Fehler: Ungültige URL-Parameter");
        window.location.href = "/";  // Falls Parameter fehlen, zurück zur Startseite
        return;
    }

    try {
        // Abruf der Filmdetails
        const movieResponse = await fetch(`http://localhost:4000/api/filme/${movieId}`);
        const movie = await movieResponse.json();

        // Abruf der Vorstellungen
        const showResponse = await fetch(`http://localhost:4000/api/vorstellungen/${movieId}`);
        const showtimes = await showResponse.json();
        const selectedShow = showtimes.find(show => show.show_id === parseInt(showId)); 

        if (!selectedShow) {
            alert("Vorstellung nicht gefunden.");
            return;
        }

        // Filmtitel und Vorstellungen anzeigen
        document.getElementById("movie-title").textContent = movie.title;
        document.getElementById("show-details").textContent = `Datum: ${selectedShow.date}, Uhrzeit: ${selectedShow.time}, Saal: ${selectedShow.room}`;
        
        // 3. Ticket options and prices
        const ticketOptions = [
            { type: "VIP", price: 15 },
            { type: "Erwachsener", price: 10 },
            { type: "Kind", price: 5 },
            { type: "Student", price: 7 },
        ];
    
        // Render ticket options
        const ticketContainer = document.getElementById("ticket-options");
        const ticketQuantities = {};
    
        ticketOptions.forEach(option => {
            ticketQuantities[option.type] = 0;
    
            const ticketDiv = document.createElement("div");
            ticketDiv.className = "ticket-option";
            ticketDiv.innerHTML = ` 
                <span>${option.type}</span>
                <span>${option.price.toFixed(2)}€</span>
                <button class="decrease" data-type="${option.type}">-</button>
                <span id="quantity-${option.type}">0</span>
                <button class="increase" data-type="${option.type}">+</button>
            `;
            ticketContainer.appendChild(ticketDiv);
        });
    
        // Handle increase and decrease buttons
        ticketContainer.addEventListener("click", (event) => {
            const button = event.target;
            const type = button.dataset.type;
    
            if (button.classList.contains("increase")) {
                ticketQuantities[type]++;
            } else if (button.classList.contains("decrease") && ticketQuantities[type] > 0) {
                ticketQuantities[type]--;
            }
    
            document.getElementById(`quantity-${type}`).textContent = ticketQuantities[type];
    
            // Update total price whenever quantities change
            updateTotalPrice();
        });
    
        // Funktion zur Berechnung und Anzeige des Gesamtpreises
        function updateTotalPrice() {
            let totalPrice = 0;
    
            Object.entries(ticketQuantities).forEach(([type, quantity]) => {
                const ticketOption = ticketOptions.find(option => option.type === type);
                if (ticketOption) {
                    totalPrice += ticketOption.price * quantity;
                }
            });
    
            // Gesamtpreis anzeigen
            const totalPriceElement = document.getElementById("total-price");
            totalPriceElement.textContent = `Gesamtpreis: ${totalPrice.toFixed(2)}€`;
        }
    
        // Handle ticket booking
        document.getElementById("book-tickets-button").addEventListener("click", async () => {
            const ticketsToBook = Object.entries(ticketQuantities)
                .filter(([, quantity]) => quantity > 0)
                .map(([type, quantity]) => ({ type, quantity, price: ticketOptions.find(opt => opt.type === type).price }));
    
            if (ticketsToBook.length === 0) {
                alert("Bitte wählen Sie mindestens ein Ticket aus.");
                return;
            }
    
            try {
                for (const ticket of ticketsToBook) {
                    const payload = {
                        show_id: showId,
                        ticket_type: ticket.type,
                        price: ticket.price * ticket.quantity,
                    };
                   
                    
                    await fetch("http://localhost:4000/api/tickets", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    });
                }

                
    
                alert("Tickets erfolgreich gebucht!");
                window.location.href = `/confirmation.html?movie_id=${movieId}`;
            } catch (error) {

                 // Fehlermeldung anzeigen
                 if (error.message.includes("Kapazität überschritten")) {
                    alert("Es tut uns leid, die maximale Anzahl an Tickets für diese Vorstellung wurde bereits erreicht.");
                } else {
                    alert("Es gab einen Fehler bei der Buchung. Bitte versuchen Sie es erneut.");
                }
               
            }
        });
    } catch (error) {
        console.error("Fehler beim Abrufen der Daten:", error);
        alert("Es gab ein Problem beim Laden der Filmdaten. Bitte versuchen Sie es später erneut.");
    }
}); */


document.addEventListener("DOMContentLoaded", async () => {
    // Extrahiere show_id und movie_id aus der URL
    const urlParams = new URLSearchParams(window.location.search);
    const showId = urlParams.get("show_id");
    const movieId = urlParams.get("movie_id");

    // Überprüfen, ob showId und movieId existieren
    if (!showId || !movieId) {
        alert("Fehler: Ungültige URL-Parameter");
        window.location.href = "/";  // Falls Parameter fehlen, zurück zur Startseite
        return;
    }

    try {
        // Abruf der Filmdetails
        const movieResponse = await fetch(`http://localhost:4000/api/filme/${movieId}`);
        const movie = await movieResponse.json();

        // Abruf der Vorstellungen
        const showResponse = await fetch(`http://localhost:4000/api/vorstellungen/${movieId}`);
        const showtimes = await showResponse.json();
        const selectedShow = showtimes.find(show => show.show_id === parseInt(showId));

        if (!selectedShow) {
            alert("Vorstellung nicht gefunden.");
            return;
        }


        // Filmtitel und Vorstellungen anzeigen
        document.getElementById("movie-title").textContent = movie.title;

        // Kombiniere Datum und Uhrzeit in ein ISO-Format
        const showDateTime = new Date(`${selectedShow.date}T${selectedShow.time}`);

        // Formatierer für deutsches Datum und Uhrzeit
        const formatter = new Intl.DateTimeFormat('de-DE', {
            dateStyle: 'long',
            timeStyle: 'short'
        });

        // Setze die formatierten Details
        document.getElementById("show-details").textContent = `Datum: ${formatter.format(showDateTime)}, Kinosaal: ${selectedShow.room_id}`;


        // 3. Ticket options and prices
        const ticketOptions = [
            { type: "VIP", price: 15 },
            { type: "Erwachsener", price: 10 },
            { type: "Kind", price: 5 },
            { type: "Student", price: 7 },
        ];

        // Render ticket options
        const ticketContainer = document.getElementById("ticket-options");
        const ticketQuantities = {};

        ticketOptions.forEach(option => {
            ticketQuantities[option.type] = 0;

            const ticketDiv = document.createElement("div");
            ticketDiv.className = "ticket-option";
            ticketDiv.innerHTML = ` 
                <span>${option.type}</span>
                <span>${option.price.toFixed(2)}€</span>
                <button class="decrease" data-type="${option.type}">-</button>
                <span id="quantity-${option.type}">0</span>
                <button class="increase" data-type="${option.type}">+</button>
            `;
            ticketContainer.appendChild(ticketDiv);
        });

        // Handle increase and decrease buttons
        ticketContainer.addEventListener("click", (event) => {
            const button = event.target;
            const type = button.dataset.type;

            if (button.classList.contains("increase")) {
                ticketQuantities[type]++;
            } else if (button.classList.contains("decrease") && ticketQuantities[type] > 0) {
                ticketQuantities[type]--;
            }

            document.getElementById(`quantity-${type}`).textContent = ticketQuantities[type];

            // Update total price whenever quantities change
            updateTotalPrice();
        });

        // Funktion zur Berechnung und Anzeige des Gesamtpreises
        function updateTotalPrice() {
            let totalPrice = 0;

            Object.entries(ticketQuantities).forEach(([type, quantity]) => {
                const ticketOption = ticketOptions.find(option => option.type === type);
                if (ticketOption) {
                    totalPrice += ticketOption.price * quantity;
                }
            });

            // Gesamtpreis anzeigen
            const totalPriceElement = document.getElementById("total-price");
            totalPriceElement.textContent = `Gesamtpreis: ${totalPrice.toFixed(2)}€`;
        }

        // Handle ticket booking
        document.getElementById("book-tickets-button").addEventListener("click", async () => {
            const ticketsToBook = Object.entries(ticketQuantities)
                .filter(([, quantity]) => quantity > 0)
                .map(([type, quantity]) => ({ type, quantity, price: ticketOptions.find(opt => opt.type === type).price }));

            if (ticketsToBook.length === 0) {
                alert("Bitte wählen Sie mindestens ein Ticket aus.");
                return;
            }

            try {
                // Zuerst versuchen, die Tickets zu buchen
                for (const ticket of ticketsToBook) {
                    const payload = {
                        show_id: showId,
                        ticket_type: ticket.type,
                        price: ticket.price * ticket.quantity,
                    };

                    // Sende die Buchungsanfrage an den Server
                    const response = await fetch("http://localhost:4000/api/tickets", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    });

                    // Prüfen, ob die Antwort erfolgreich war
                    if (response.status === 201) {
                        console.log("Ticket erfolgreich gebucht.");
                    } else {
                        // Fehler, falls Kapazität überschritten wurde oder ein anderer Fehler auftritt
                        const result = await response.json();
                        if (response.status === 409 || result.error === "Maximale Kapazität erreicht") {
                            alert("Es tut uns leid, die maximale Anzahl an Tickets für diese Vorstellung wurde bereits erreicht.");
                            return; // Beende die Buchung, wenn Kapazität überschritten wurde
                        } else {
                            throw new Error(result.error || "Unbekannter Fehler");
                        }
                    }
                }

                alert("Tickets erfolgreich gebucht!");
                window.location.href = `/mainpages/confirmationpageStructure.html?movie_id=${movieId}`;
            } catch (error) {
                alert(error.message === "Kapazität überschritten"
                    ? "Es tut uns leid, die maximale Anzahl an Tickets für diese Vorstellung wurde erreicht."
                    : "Es gab einen Fehler bei der Buchung. Bitte versuchen Sie es erneut.");
            }
        });
    } catch (error) {
        console.error("Fehler beim Abrufen der Daten:", error);
        alert("Es gab ein Problem beim Laden der Filmdaten. Bitte versuchen Sie es später erneut.");
    }
});

