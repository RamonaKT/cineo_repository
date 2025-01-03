document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const showId = urlParams.get("show_id");
    const movieId = urlParams.get("movie_id");

    if (!showId || !movieId) {
        alert("Fehler: Ungültige URL-Parameter");
        window.location.href = "/";
        return;
    }

    try {
        // Abruf der Filmdetails
        const movieResponse = await fetch(`http://localhost:4000/api/filme/${movieId}`);
        const movie = await movieResponse.json();

        const showResponse = await fetch(`http://localhost:4000/api/vorstellungen/${movieId}`);
        const showtimes = await showResponse.json();
        const selectedShow = showtimes.find(show => show.show_id === parseInt(showId));

        if (!selectedShow) {
            alert("Vorstellung nicht gefunden.");
            return;
        }

        document.getElementById("movie-title").textContent = movie.title;

        const showDateTime = new Date(`${selectedShow.date}T${selectedShow.time}`);
        const formatter = new Intl.DateTimeFormat('de-DE', {
            dateStyle: 'long',
            timeStyle: 'short'
        });
        document.getElementById("show-details").textContent = `Datum: ${formatter.format(showDateTime)}, Kinosaal: ${selectedShow.room_id}`;

        // Ticketpreise und Rabatte aus der Datenbank laden
        const ticketResponse = await fetch("http://localhost:4000/api/ticketpreise");
        const { ticketpreise, rabatte } = await ticketResponse.json();

        const ticketOptions = ticketpreise.map(ticket => ({
            type: ticket.ticket_name,
            price: ticket.ticket_price
        }));

        // Render ticket options
        const ticketContainer = document.getElementById("ticket-options");
        const ticketQuantities = {};
        const selectedTicketsContainer = document.getElementById("selected-tickets"); // Container für ausgewählte Tickets

        // Zum Verfolgen jedes Tickets benötigen wir eine eindeutige ID für jedes Ticket
        let ticketIdCounter = 0; // Zähler für eindeutige Ticket-IDs

        ticketOptions.forEach(option => {
            ticketQuantities[option.type] = []; // Ein Array für jedes Ticket, um Rabatte für jedes individuelle Ticket zu speichern

            const ticketDiv = document.createElement("div");
            const ticketTypeDiv = document.createElement("div");
            const ticketPriceDiv = document.createElement("div");
            const ticketCountDiv = document.createElement("div");

            ticketDiv.className = "ticket-option";
            ticketTypeDiv.className = "ticket-type-container";
            ticketPriceDiv.className = "ticket-price-container";
            ticketCountDiv.className = "ticket-count-container";

            // Inhalte für die Tickettyp- und Preisfelder hinzufügen
            ticketTypeDiv.innerHTML = `<span>${option.type}</span>`;
            ticketPriceDiv.innerHTML = `<span>${option.price.toFixed(2)}€</span>`;

            // Ticketanzahl und Buttons zum Erhöhen und Verringern der Anzahl
            ticketCountDiv.innerHTML = `
                <button class="decrease" data-type="${option.type}">-</button>
                <span id="quantity-${option.type}">0</span>
                <button class="increase" data-type="${option.type}">+</button>
            `;

            ticketDiv.appendChild(ticketTypeDiv);
            ticketDiv.appendChild(ticketPriceDiv);
            ticketDiv.appendChild(ticketCountDiv);
            ticketContainer.appendChild(ticketDiv);
        });

        // Event Listener für Änderungen an der Anzahl der Tickets
        ticketContainer.addEventListener("click", (event) => {
            const button = event.target;
            const type = button.dataset.type;

            if (button.classList.contains("increase")) {
                ticketIdCounter++; // Jede neue Auswahl bekommt eine neue eindeutige ID
                ticketQuantities[type].push({ id: ticketIdCounter, discount: null }); // Neues Ticket hinzufügen
            } else if (button.classList.contains("decrease") && ticketQuantities[type].length > 0) {
                ticketQuantities[type].pop(); // Letztes Ticket entfernen
            }

            document.getElementById(`quantity-${type}`).textContent = ticketQuantities[type].length;
            updateSelectedTickets(); // Liste der ausgewählten Tickets aktualisieren
            updateTotalPrice(); // Gesamtpreis aktualisieren
        });

        // Funktion zur Berechnung des Gesamtpreises
        function updateTotalPrice() {
            let totalPrice = 0;

            ticketOptions.forEach(option => {
                const tickets = ticketQuantities[option.type];
                tickets.forEach(ticket => {
                    let ticketPrice = option.price;

                    // Rabatt anwenden, wenn vorhanden
                    if (ticket.discount) {
                        const discountObj = rabatte.find(d => d.name === ticket.discount);
                        if (discountObj) {
                            const discountPercentage = discountObj.value;
                            ticketPrice *= (1 - discountPercentage / 100);
                        }
                    }

                    totalPrice += ticketPrice;
                });
            });

            document.getElementById("total-price").textContent = `Gesamtpreis: ${totalPrice.toFixed(2)}€`;
        }

        // Funktion zur Aktualisierung der Liste der ausgewählten Tickets
        function updateSelectedTickets() {
            // Leere die Liste der ausgewählten Tickets
            selectedTicketsContainer.innerHTML = "";

            ticketOptions.forEach(option => {
                const tickets = ticketQuantities[option.type];
                tickets.forEach(ticket => {
                    const ticketItem = document.createElement("div");
                    ticketItem.className = "selected-ticket-item";
                    let ticketPrice = option.price;

                    // Rabatt anwenden, wenn vorhanden
                    if (ticket.discount) {
                        const discountObj = rabatte.find(d => d.name === ticket.discount);
                        if (discountObj) {
                            const discountPercentage = discountObj.value;
                            ticketPrice *= (1 - discountPercentage / 100);
                        }
                    }

                    ticketItem.innerHTML = `${option.type} - ${ticketPrice.toFixed(2)}€`;

                    // Rabatt auswählen, wenn vorhanden
                    const discountSelect = document.createElement("select");
                    discountSelect.dataset.ticketId = ticket.id; // Eindeutige ID für jedes Ticket
                    const defaultOption = document.createElement("option");
                    defaultOption.value = "";
                    defaultOption.textContent = "Rabatt auswählen";
                    discountSelect.appendChild(defaultOption);

                    rabatte.forEach(discountObj => {
                        const option = document.createElement("option");
                        option.value = discountObj.name;
                        option.textContent = `${discountObj.name} (${discountObj.value}% Rabatt)`;
                        discountSelect.appendChild(option);
                    });

                    // Setze den aktuellen Rabatt im Dropdown
                    if (ticket.discount) {
                        discountSelect.value = ticket.discount;
                    }

                    discountSelect.addEventListener("change", (event) => {
                        const selectedDiscount = event.target.value;
                        const ticketId = parseInt(event.target.dataset.ticketId);
                        const ticket = tickets.find(t => t.id === ticketId);
                        ticket.discount = selectedDiscount;
                        updateSelectedTickets(); // Liste der ausgewählten Tickets aktualisieren
                        updateTotalPrice(); // Gesamtpreis aktualisieren
                    });

                    ticketItem.appendChild(discountSelect);
                    selectedTicketsContainer.appendChild(ticketItem);
                });
            });
        }

        // Ticketbuchung
        document.getElementById("book-tickets-button").addEventListener("click", async () => {
            const ticketsToBook = [];

            // Alle Tickets durchlaufen und mit Rabatt berechnen
            ticketOptions.forEach(option => {
                const tickets = ticketQuantities[option.type];
                tickets.forEach(ticket => {
                    let totalPrice = option.price;

                    // Rabatt anwenden
                    if (ticket.discount) {
                        const discountObj = rabatte.find(d => d.name === ticket.discount);
                        if (discountObj) {
                            const discountPercentage = discountObj.value;
                            totalPrice *= (1 - discountPercentage / 100);
                        }
                    }

                    ticketsToBook.push({ type: option.type, price: totalPrice,  discount_name: ticket.discount || null});
                });
            });

            if (ticketsToBook.length === 0) {
                alert("Bitte wählen Sie mindestens ein Ticket aus.");
                return;
            }

            try {
                for (const ticket of ticketsToBook) {
                    const payload = {
                        show_id: showId,
                        ticket_type: ticket.type,
                        price: ticket.price,
                        discount_name: ticket.discount_name
                    };

                    const response = await fetch("http://localhost:4000/api/tickets", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    });

                    if (response.status !== 201) {
                        const result = await response.json();
                        throw new Error(result.error || "Unbekannter Fehler");
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
