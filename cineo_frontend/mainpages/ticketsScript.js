
/*
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
                            if (discountObj.type === "prozent") {
                                const discountPercentage = discountObj.value;
                                ticketPrice *= (1 - discountPercentage / 100);
                            } else if (discountObj.type === "euro") {
                                const discountAmount = discountObj.value;
                                ticketPrice -= discountAmount;
                            }
                        }
                    }

                    totalPrice += ticketPrice > 0 ? ticketPrice : 0; // Preis kann nicht negativ sein
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
                            if (discountObj.type === "prozent") {
                                const discountPercentage = discountObj.value;
                                ticketPrice *= (1 - discountPercentage / 100);
                            } else if (discountObj.type === "euro") {
                                const discountAmount = discountObj.value;
                                ticketPrice -= discountAmount;
                            }
                        }
                    }

                    ticketItem.innerHTML = `
                <div class="ticket-info"> <span>${option.type} - ${ticketPrice.toFixed(2)}€</span> </div>
            `;

                    // Rabatt auswählen, wenn vorhanden
                    const discountContainer = document.createElement("div");
                    discountContainer.className = "discount-container";

                    const discountSelect = document.createElement("select");
                    discountSelect.dataset.ticketId = ticket.id; // Eindeutige ID für jedes Ticket
                    const defaultOption = document.createElement("option");
                    defaultOption.value = "";
                    defaultOption.textContent = "Rabatt wählen";
                    discountSelect.appendChild(defaultOption);

                    discountContainer.appendChild(discountSelect);

                    rabatte.forEach(discountObj => {
                        const option = document.createElement("option");
                        option.value = discountObj.name;
                        option.textContent = `${discountObj.name}`;
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

                    ticketItem.appendChild(discountContainer);
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

                    ticketsToBook.push({ type: option.type, price: totalPrice, discount_name: ticket.discount || null });
                });
            });

            if (ticketsToBook.length === 0) {
                alert("Bitte wählen Sie mindestens ein Ticket aus.");
                return;
            }

            try {
           
                window.location.href = `/mainpages/loginpageStructure.html?show_id=${showId}&movie_id=${movieId}&ticket_data=${encodeURIComponent(JSON.stringify(ticketsToBook))}`;
              
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
*/


/*
document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const showId = urlParams.get("show_id");
    const movieId = urlParams.get("movie_id");
    const sessionId = urlParams.get("session_id");
    const seatIds = urlParams.get("seat_id")?.split(",");

    if (!showId || !movieId || !seatIds || seatIds.length === 0) {
        alert("Fehler: Ungültige URL-Parameter");
        window.location.href = "/";
        return;
    }

    try {
        // Filmdetails abrufen
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
            timeStyle: 'short',
        });
        document.getElementById("show-details").textContent = `Datum: ${formatter.format(showDateTime)}, Kinosaal: ${selectedShow.room_id}`;

        // Rabatte abrufen
        const ticketResponse = await fetch("http://localhost:4000/api/ticketpreise");
        const { rabatte } = await ticketResponse.json();

        // Container für Tickets
        const ticketContainer = document.getElementById("ticket-options");
        const selectedTickets = [];

        // Sitzplätze anzeigen
        seatIds.forEach(seatId => {
            const ticketItem = document.createElement("div");
            ticketItem.className = "selected-ticket-item";

            ticketItem.innerHTML = `
                <div class="ticket-info">
                    Sitzplatz: ${seatId} - Preis: 10.00€
                </div>
            `;

            // Rabatt auswählen
            const discountContainer = document.createElement("div");
            discountContainer.className = "discount-container";

            const discountSelect = document.createElement("select");
            discountSelect.dataset.seatId = seatId;
            const defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.textContent = "Rabatt wählen";
            discountSelect.appendChild(defaultOption);

            rabatte.forEach(discount => {
                const option = document.createElement("option");
                option.value = discount.name;
                option.textContent = discount.name;
                discountSelect.appendChild(option);
            });

            discountSelect.addEventListener("change", () => {
                const selectedDiscount = discountSelect.value;
                const ticket = selectedTickets.find(t => t.seatId === seatId);
                ticket.discount = selectedDiscount;
                updateTotalPrice(); // Gesamtpreis aktualisieren
            });

            discountContainer.appendChild(discountSelect);
            ticketItem.appendChild(discountContainer);
            ticketContainer.appendChild(ticketItem);

            // Ticket zur Liste hinzufügen
            selectedTickets.push({
                seatId,
                price: 10.0, // Beispielpreis
                discount: null,
            });
        });

        // Funktion zur Berechnung des Gesamtpreises
        function updateTotalPrice() {
            let totalPrice = 0;

            selectedTickets.forEach(ticket => {
                let ticketPrice = ticket.price;

                if (ticket.discount) {
                    const discountObj = rabatte.find(d => d.name === ticket.discount);
                    if (discountObj) {
                        if (discountObj.type === "prozent") {
                            ticketPrice *= (1 - discountObj.value / 100);
                        } else if (discountObj.type === "euro") {
                            ticketPrice -= discountObj.value;
                        }
                    }
                }

                totalPrice += Math.max(ticketPrice, 0); // Kein negativer Preis
            });

            document.getElementById("total-price").textContent = `Gesamtpreis: ${totalPrice.toFixed(2)}€`;
        }

        // Buchungslogik
        document.getElementById("book-tickets-button").addEventListener("click", async () => {
            try {
                const bookingData = selectedTickets.map(ticket => ({
                    seat_id: ticket.seatId,
                    price: ticket.price,
                    discount_name: ticket.discount || null,
                }));

                if (bookingData.length === 0) {
                    alert("Keine Tickets ausgewählt.");
                    return;
                }

                const payload = {
                    session_id: sessionId,
                    show_id: showId,
                    tickets: bookingData,
                };

                const response = await fetch("http://localhost:4000/api/tickets", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                if (response.status === 201) {
                    alert("Tickets erfolgreich gebucht!");
                    window.location.href = `/mainpages/confirmation.html?booking_data=${encodeURIComponent(
                        JSON.stringify(payload)
                    )}`;
                } else {
                    const result = await response.json();
                    throw new Error(result.error || "Unbekannter Fehler");
                }
            } catch (error) {
                alert(`Fehler bei der Buchung: ${error.message}`);
            }
        });
    } catch (error) {
        console.error("Fehler beim Abrufen der Daten:", error);
        alert("Es gab ein Problem beim Laden der Daten. Bitte versuchen Sie es später erneut.");
    }
});
*/

/*
document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);

    const showId = urlParams.get("show_id");
    const movieId = urlParams.get("movie_id");
    const sessionId = urlParams.get("session_id");
    const seatsParam = urlParams.get("seats");

    if (!showId || !movieId || !seatsParam) {
        alert("Fehler: Ungültige URL-Parameter");
        window.location.href = "/";
        return;
    }

    // Sitzplatzdaten dekodieren
    const selectedSeats = JSON.parse(decodeURIComponent(seatsParam));

    try {
        // Ticketpreise und Kategorien abrufen
        const response = await fetch("/api/ticketpreise");
        const { ticketpreise, rabatte } = await response.json();

        if (!response.ok || !ticketpreise) {
            throw new Error("Fehler beim Abrufen der Ticketpreise.");
        }

        // Rendern der Sitzplätze
        renderTickets(selectedSeats, ticketpreise, rabatte);
    } catch (error) {
        console.error("Fehler:", error);
        alert("Es gab ein Problem beim Laden der Daten. Bitte versuchen Sie es später erneut.");
    }
});

// Funktion zum Rendern der Tickets
function renderTickets(selectedSeats, ticketpreise, rabatte) {
    const ticketContainer = document.getElementById("ticket-options");

    selectedSeats.forEach(({ seatId, category }) => {
        const ticketItem = document.createElement("div");
        ticketItem.className = "selected-ticket-item";

        // Ticketpreis anhand der Kategorie finden
        const ticketInfo = ticketpreise.find(tp => tp.ticket_name.toLowerCase() === category.toLowerCase());
        const ticketPrice = ticketInfo?.ticket_price || 0;

        ticketItem.innerHTML = `
            <div class="ticket-info">
                Sitzplatz: ${seatId} - Kategorie: ${category} - Preis: ${ticketPrice.toFixed(2)}€
            </div>
        `;

        // Rabatt auswählen (falls vorhanden)
        const discountContainer = document.createElement("div");
        discountContainer.className = "discount-container";

        const discountSelect = document.createElement("select");
        discountSelect.dataset.seatId = seatId;
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Rabatt wählen";
        discountSelect.appendChild(defaultOption);

        rabatte.forEach(discount => {
            const option = document.createElement("option");
            option.value = discount.name;
            option.textContent = discount.name;
            discountSelect.appendChild(option);
        });

        discountContainer.appendChild(discountSelect);
        ticketItem.appendChild(discountContainer);
        ticketContainer.appendChild(ticketItem);
    });
}
*/

let rabatte = [];

//let showId, movieId, sessionId;


document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);

    const showId = urlParams.get("show_id");
    const movieId = urlParams.get("movie_id");
    const seatsParam = urlParams.get("seats");

    if (!showId || !movieId || !seatsParam) {
        alert("Fehler: Ungültige URL-Parameter");
        window.location.href = "/";
        return;
    }

    
    // Show- und Filmdaten abrufen und anzeigen
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

        // Titel und Show-Details anzeigen
        document.getElementById("movie-title").textContent = movie.title;

        const showDateTime = new Date(`${selectedShow.date}T${selectedShow.time}`);
        const formatter = new Intl.DateTimeFormat('de-DE', {
            dateStyle: 'long',
            timeStyle: 'short'
        });
        document.getElementById("show-details").textContent = `Datum: ${formatter.format(showDateTime)}, Kinosaal: ${selectedShow.room_id}`;

    } catch (error) {
        console.error("Fehler beim Abrufen der Show-Daten:", error);
        alert("Fehler beim Laden der Show-Daten. Bitte versuchen Sie es später erneut.");
        return;
    }

    // Sitzplatzdaten dekodieren
    const selectedSeats = JSON.parse(decodeURIComponent(seatsParam));

    try {
        // Ticketpreise und Kategorien abrufen
        const response = await fetch("/api/ticketpreise");
        const data = await response.json();

        if (!response.ok || !data.ticketpreise) {
            throw new Error("Fehler beim Abrufen der Ticketpreise.");
        }

        rabatte = data.rabatte; // Globale Variable initialisieren
        const ticketpreise = data.ticketpreise;

        // Rendern der Sitzplätze
        renderTickets(selectedSeats, ticketpreise, rabatte);
    } catch (error) {
        console.error("Fehler:", error);
        alert("Es gab ein Problem beim Laden der Daten. Bitte versuchen Sie es später erneut.");
    }
});


function calculateDiscountedPrice(originalPrice, discountName, rabatte) {
    const discount = rabatte.find(r => r.name === discountName);
    if (!discount) return originalPrice;

    // Rabatt anwenden (Prozentual oder Festbetrag)
    if (discount.type === "prozent") {
        return originalPrice * (1 - discount.value / 100);
    } else if (discount.type === "euro") {
        return Math.max(0, originalPrice - discount.value);
    }

    return originalPrice; // Fallback: Keine Änderung
}



function calculateTotalPriceWithDiscounts(selectedSeats, ticketpreise, rabatte) {
    let total = 0;

    selectedSeats.forEach(({ seatId, category }) => {
        const categoryMapping = {
            0: "Parkett",
            1: "VIP",
            2: "Loge"
        };

        // Kategorie-Name aus der Zahl ermitteln
        const categoryName = categoryMapping[category] || "Unbekannt";

        // Ticketpreis anhand der Kategorie finden
        const ticketInfo = ticketpreise.find(tp => tp.ticket_name.toLowerCase() === categoryName.toLowerCase());
        const originalPrice = ticketInfo?.ticket_price || 0;

        // Rabatt aus dem Dropdown des jeweiligen Sitzplatzes holen
        const discountSelect = document.querySelector(`select[data-seat-id='${seatId}']`);
        const selectedDiscount = discountSelect?.value || null;

        // Rabattierter Preis berechnen
        const discountedPrice = calculateDiscountedPrice(originalPrice, selectedDiscount, rabatte);

        // Addiere den rabattierten Preis zum Gesamtpreis
        total += discountedPrice;
    });

    return total;
}




function renderTickets(selectedSeats, ticketpreise, rabatte) {
    const ticketContainer = document.getElementById("selected-tickets");
    const totalPriceElement = document.getElementById("total-price");

    const categoryMapping = {
        0: "Parkett",
        1: "VIP",
        2: "Loge"
    };

    let totalPrice = 0;

    ticketContainer.innerHTML = ""; // Vorherige Inhalte löschen

    selectedSeats.forEach(({ seatId, category }) => {
        const ticketItem = document.createElement("div");
        ticketItem.className = "selected-ticket-item";

        // Kategorie-Name aus der Zahl ermitteln
        const categoryName = categoryMapping[category] || "Unbekannt";

        // Ticketpreis anhand der Kategorie finden
        const ticketInfo = ticketpreise.find(tp => tp.ticket_name.toLowerCase() === categoryName.toLowerCase());
        let ticketPrice = ticketInfo?.ticket_price || 0;

        // Element für den Ticketpreis
        const ticketPriceElement = document.createElement("div");
        ticketPriceElement.className = "ticket-price";
        ticketPriceElement.textContent = `Preis: ${ticketPrice.toFixed(2)}€`;


        // Rabatt auswählen (falls vorhanden)
        const discountContainer = document.createElement("div");
        discountContainer.className = "discount-container";

        const discountSelect = document.createElement("select");
        discountSelect.dataset.seatId = seatId;

        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Rabatt wählen";
        discountSelect.appendChild(defaultOption);

        rabatte.forEach(discount => {
            const option = document.createElement("option");
            option.value = discount.name;
            option.textContent = discount.name;
            discountSelect.appendChild(option);
        });

        discountSelect.addEventListener("change", () => {
            const selectedDiscount = discountSelect.value;
            console.log(`Rabatt geändert für Sitzplatz ${seatId}: ${selectedDiscount}`);

            // Rabattierter Preis für diesen Sitz berechnen
            const discountedPrice = calculateDiscountedPrice(ticketPrice, selectedDiscount, rabatte);
            console.log(`Originalpreis: ${ticketPrice}, Rabattierter Preis: ${discountedPrice}`);

            // Aktualisiere den Preis für das einzelne Ticket
            ticketPriceElement.textContent = `Preis: ${discountedPrice.toFixed(2)}€`;

            // Gesamtpreis neu berechnen und aktualisieren
            const totalPrice = calculateTotalPriceWithDiscounts(selectedSeats, ticketpreise, rabatte);
            console.log(`Neuer Gesamtpreis: ${totalPrice}`);
            totalPriceElement.textContent = `Gesamtpreis: ${totalPrice.toFixed(2)}€`;
        });


        discountContainer.appendChild(discountSelect);

        // Ticket-Elemente zusammenfügen
    const ticketInformation = document.createElement("div");
    ticketInformation.className="ticket-info";
        ticketItem.innerHTML = `
            <div class="ticket-info">
                Sitzplatz: ${seatId} <br><br> Bereich: ${categoryName}
            </div>
        `;
        ticketItem.appendChild(ticketPriceElement);
        ticketItem.appendChild(discountContainer);
        ticketContainer.appendChild(ticketItem);

        // Initialen Preis zum Gesamtpreis addieren
        totalPrice += ticketPrice;
    });

    // Gesamtpreis im DOM aktualisieren
    totalPriceElement.textContent = `Gesamtpreis: ${totalPrice.toFixed(2)}€`;
}

document.getElementById("book-tickets-button").addEventListener("click", async () => {
    const ticketsToBook = [];
    const ticketOptionsContainer = document.getElementById("selected-tickets");

    const urlParams = new URLSearchParams(window.location.search);
    const showId = urlParams.get("show_id");
    const movieId = urlParams.get("movie_id");

    if (!showId || !movieId) {
        console.error("Fehler: Show- oder Movie-ID fehlen.");
        alert("Fehler bei der Buchung. Bitte versuchen Sie es später erneut.");
        return;
    }


    // Prüfe, ob rabatte geladen wurde
    if (!rabatte || rabatte.length === 0) {
        console.error("Rabatte wurden nicht geladen.");
        alert("Fehler beim Laden der Rabatte. Bitte versuchen Sie es später erneut.");
        return;
    }

    // Alle Tickets durchlaufen und die Daten erfassen
    const ticketItems = ticketOptionsContainer.querySelectorAll(".selected-ticket-item");

    ticketItems.forEach(ticketItem => {
        const seatId = ticketItem.querySelector(".ticket-info").textContent.match(/Sitzplatz: (\S+)/)[1];
        const category = ticketItem.querySelector(".ticket-info").textContent.match(/Bereich: (\S+)/)[1];

        const priceText = ticketItem.querySelector(".ticket-price").textContent;
        const priceMatch = priceText.match(/Preis: (\d+\.\d+)/);
        if (!priceMatch) {
            console.error("Fehler: Preis konnte nicht extrahiert werden.", priceText);
            return;
        }
        const originalPrice = parseFloat(priceMatch[1]);

        const discountSelect = ticketItem.querySelector("select");
        const selectedDiscount = discountSelect.value;

        let discountedPrice = originalPrice;
        if (selectedDiscount) {
            const discountObj = rabatte.find(d => d.name === selectedDiscount);
            if (discountObj) {
                if (discountObj.type === "prozent") {
                    discountedPrice *= (1 - discountObj.value / 100);
                } else if (discountObj.type === "euro") {
                    discountedPrice = Math.max(0, originalPrice - discountObj.value);
                }
            } else {
                console.warn("Rabatt nicht gefunden:", selectedDiscount);
            }
        }

        ticketsToBook.push({
            seat_id: seatId,
            category: category,
            price: discountedPrice.toFixed(2),
            discount_name: selectedDiscount || null,
        });
    });

    if (ticketsToBook.length === 0) {
        alert("Bitte wählen Sie mindestens ein Ticket aus.");
        return;
    }

    try {
        const redirectUrl = `/mainpages/loginpageStructure.html?show_id=${showId}&movie_id=${movieId}&ticket_data=${encodeURIComponent(JSON.stringify(ticketsToBook))}`;
        console.log("Weiterleitungs-URL:", redirectUrl);
        window.location.href = redirectUrl;
    } catch (error) {
        console.error("Fehler bei der Buchung:", error);
        alert(error.message === "Kapazität überschritten"
            ? "Es tut uns leid, die maximale Anzahl an Tickets für diese Vorstellung wurde erreicht."
            : `Es gab einen Fehler bei der Buchung: ${error.message}. Bitte versuchen Sie es erneut.`);
    }

});
