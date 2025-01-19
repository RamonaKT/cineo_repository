
let rabatte = [];


document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);

    const showId = urlParams.get("show_id");
    const movieId = urlParams.get("movie_id");
    const seatsParam = urlParams.get("seats");

    const userId = urlParams.get("session_id");

    if (!showId || !movieId || !seatsParam || !userId) {
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
    console.log("Rabatt gefunden:", discount); // Log, um den Rabatt zu überprüfen

    if (!discount) {
        console.log("Kein Rabatt gefunden, Originalpreis:", originalPrice);
        return originalPrice;
    }

    let discountedPrice = originalPrice;

    if (discount.type === "prozent") {
        console.log(`Prozent-Rabatt angewendet: ${discount.value}%`);
        discountedPrice = originalPrice * (1 - discount.value / 100);
    } else if (discount.type === "euro") {
        console.log(`Euro-Rabatt angewendet: ${discount.value}€`);
        discountedPrice = originalPrice - discount.value;
        // Sicherstellen, dass der rabattierte Preis nicht negativ ist
        discountedPrice = Math.max(0, discountedPrice);
    }

    console.log("Rabattierter Preis:", discountedPrice); // Log, um den finalen Preis zu überprüfen
    return discountedPrice;
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

    selectedSeats.forEach(({ seatId, category, rowId, seatNumber }) => {
        const ticketItem = document.createElement("div");
        ticketItem.className = "selected-ticket-item";

        // Kategorie-Name aus der Zahl ermitteln
        const categoryName = categoryMapping[category] || "Unbekannt";

        // Ticketpreis anhand der Kategorie finden
        const ticketInfo = ticketpreise.find(tp => tp.ticket_name.toLowerCase() === categoryName.toLowerCase());
        let ticketPrice = ticketInfo?.ticket_price || 0;

        // Rabatt auswählen (falls vorhanden)
        const discountContainer = document.createElement("div");
        discountContainer.className = "discount-container";


        const discountSelect = document.createElement("select");
        discountSelect.dataset.seatId = seatId;

        // Hier nur den Standardoption und die Rabattoptionen anzeigen
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


        // Initialen rabattierten Preis berechnen
        const selectedDiscount = discountSelect.value;
        const discountedPrice = calculateDiscountedPrice(ticketPrice, selectedDiscount, rabatte);

        // Preis für das Ticket im UI anzeigen
        const ticketPriceElement = document.createElement("div");
        ticketPriceElement.className = "ticket-price";
        ticketPriceElement.textContent = `Preis: ${discountedPrice.toFixed(2)}€`;

        // Event Listener für Rabattänderung
        discountSelect.addEventListener("change", () => {
            const selectedDiscount = discountSelect.value;
            console.log(`Rabatt geändert für Sitzplatz ${seatId}: ${selectedDiscount}`);

            // Rabattierten Preis bei Änderung neu berechnen
            const discountedPrice = calculateDiscountedPrice(ticketPrice, selectedDiscount, rabatte);
            console.log(`Originalpreis: ${ticketPrice}, Rabattierter Preis: ${discountedPrice}`);

            // Preis für das Ticket im UI aktualisieren
            ticketPriceElement.textContent = `Preis: ${discountedPrice.toFixed(2)}€`;

            // Gesamtpreis neu berechnen und anzeigen
            const totalPrice = calculateTotalPriceWithDiscounts(selectedSeats, ticketpreise, rabatte);
            console.log(`Neuer Gesamtpreis: ${totalPrice}`);
            totalPriceElement.textContent = `Gesamtpreis: ${totalPrice.toFixed(2)}€`;
        });

        discountContainer.appendChild(discountSelect);

        const ticketInformation = document.createElement("div");
        ticketInformation.className = "ticket-info";
        ticketItem.innerHTML = ` 
            <div class="ticket-info">
                 Platz: ${seatNumber} <br>
            Reihe: ${rowId} <br> <br> Bereich: ${categoryName}
            </div>
        `;


        ticketItem.appendChild(ticketPriceElement);
        ticketItem.appendChild(discountContainer);
        ticketContainer.appendChild(ticketItem);
        // Gesamtpreis berechnen
        totalPrice += discountedPrice; // Rabattierten Preis berücksichtigen
    });

    // Gesamtpreis anzeigen
    totalPriceElement.textContent = `Gesamtpreis: ${totalPrice.toFixed(2)}€`;
}


document.getElementById("book-tickets-button").addEventListener("click", async () => {
    const ticketsToBook = [];
    const ticketOptionsContainer = document.getElementById("selected-tickets");

    const urlParams = new URLSearchParams(window.location.search);
    const showId = urlParams.get("show_id");
    const movieId = urlParams.get("movie_id");
    const userId = urlParams.get("session_id");

    if (!showId || !movieId) {
        console.error("Fehler: Show- oder Movie-ID fehlen.");
        alert("Fehler bei der Buchung. Bitte versuchen Sie es später erneut.");
        return;
    }

    // Prüfe, ob rabatte geladen wurden
    if (!rabatte || rabatte.length === 0) {
        console.error("Rabatte wurden nicht geladen.");
        alert("Fehler beim Laden der Rabatte. Bitte versuchen Sie es später erneut.");
        return;
    }

    // Alle Tickets durchlaufen und die Daten erfassen
    const ticketItems = ticketOptionsContainer.querySelectorAll(".selected-ticket-item");

    ticketItems.forEach(ticketItem => {
        // Extrahiere Sitzplatz-ID und Kategorie
        /* const seatId = ticketItem.querySelector(".ticket-info").textContent.match(/Platz: (\S+)/)[1];*/
        const seatId = ticketItem.querySelector("select").dataset.seatId;
        const seatNumber = ticketItem.querySelector(".ticket-info").textContent.match(/Platz: (\S+)/)[1];
        const rowId = ticketItem.querySelector(".ticket-info").textContent.match(/Reihe: (\S+)/)[1];
        const category = ticketItem.querySelector(".ticket-info").textContent.match(/Bereich: (\S+)/)[1];

        // Extrahiere den rabattierten Preis
        const priceText = ticketItem.querySelector(".ticket-price").textContent;
        const priceMatch = priceText.match(/Preis: (\d+\.\d+)/);
        if (!priceMatch) {
            console.error("Fehler: Preis konnte nicht extrahiert werden.", priceText);
            return;
        }
        const discountedPrice = parseFloat(priceMatch[1]);  // Den rabattierten Preis hier speichern

        // Extrahiere den Rabatt (falls vorhanden)
        const discountSelect = ticketItem.querySelector("select");
        const selectedDiscount = discountSelect ? discountSelect.value : null;  // Sicherstellen, dass discountSelect existiert

        console.log(`Rabatt für Sitzplatz ${seatId}:`, selectedDiscount);  // Debugging-Ausgabe

        // Füge das Ticket zu ticketsToBook hinzu
        ticketsToBook.push({
            seat_id: seatId,
            category: category,
            price: discountedPrice.toFixed(2),  // Rabattierter Preis wird hier gespeichert
            discount_name: selectedDiscount || null,  // Rabattname oder null
            row_id: rowId,    // Reihe hinzufügen
            seat_number: seatNumber,  // Sitznummer hinzufügen
        });
    });


    if (ticketsToBook.length === 0) {
        alert("Bitte wählen Sie mindestens ein Ticket aus.");
        return;
    }

    try {
        const redirectUrl = `/mainpages/loginpageStructure.html?show_id=${showId}&movie_id=${movieId}&session_id=${userId}&ticket_data=${encodeURIComponent(JSON.stringify(ticketsToBook))}`;
        console.log("Weiterleitungs-URL:", redirectUrl);
        window.location.href = redirectUrl;
    } catch (error) {
        console.error("Fehler bei der Buchung:", error);
        alert(error.message === "Kapazität überschritten"
            ? "Es tut uns leid, die maximale Anzahl an Tickets für diese Vorstellung wurde erreicht."
            : `Es gab einen Fehler bei der Buchung: ${error.message}. Bitte versuchen Sie es erneut.`);
    }
});

