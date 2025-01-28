
document.addEventListener('DOMContentLoaded', async function () {
    const ibanForm = document.getElementById('ibanForm');
    const ibanField = document.getElementById('iban');
    const ibanText = document.getElementById('ibanText');
    const confirmationUser = document.getElementById('confirmationMessage-account');
    const confirmationGuest = document.getElementById('confirmationMessage-guest');
    const ibanButton = document.getElementById('ibanButton'); // Der Button im Formular
    const popcornInfo = document.getElementById('popcornInfo'); // Der Container für die Gratis-Popcorn-Info

    const email = localStorage.getItem('userEmail');


    // URL-Parameter auslesen
    const urlParams = new URLSearchParams(window.location.search);
    const showId = urlParams.get("show_id");
    const movieId = urlParams.get("movie_id");
    const ticketData = urlParams.get("ticket_data");
    const userId = urlParams.get("session_id");


    // Überprüfung, ob die URL-Parameter für die Ticketbuchung vorhanden sind
    const isFromTicketPage = showId && movieId && ticketData;

    if (!isFromTicketPage) {
        // Benutzer ist direkt auf das Dashboard gekommen, zeige die bereits gebuchten Tickets an
        const email = localStorage.getItem('userEmail');

        if (!email) {
            alert('Sie sind nicht eingeloggt. Bitte melden Sie sich an.');
            window.location.href = '/mainpages/loginpageStructure.html';
            return;
        }


        /*
        try {
            // Anfrage an den Server senden, um die gebuchten Tickets abzurufen
            const response = await fetch(`/api/tickets?email=${encodeURIComponent(email)}`);
            const tickets = await response.json();
            if (response.ok) {
                const bookedTicketsContainer = document.getElementById('bookedTicketsContainer');
                bookedTicketsContainer.style.display = 'block';

                if (tickets.length > 0) {
                    tickets.forEach(ticket => {
                        const ticketPic = document.createElement('div');
                        const ticketItem = document.createElement('div');
                        const ticketHistory = document.createElement('div');

                        ticketPic.classList.add('ticket-pic');
                        ticketItem.classList.add('ticket-item');
                        ticketHistory.classList.add('ticket-data');

                        ticketPic.innerHTML = '<img src="../images/ticket_icon.svg" class="ticket-pic"/>'


                        // Datum und Uhrzeit formatieren
                        const ticketDate = new Date(ticket.date);
                        const ticketTime = new Date(`${ticket.date}T${ticket.time}`);

                        const formattedDate = new Intl.DateTimeFormat('de-DE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        }).format(ticketDate);

                        const formattedTime = new Intl.DateTimeFormat('de-DE', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                        }).format(ticketTime);

                        ticketHistory.innerHTML = `
         <strong>Film: ${ticket.movie_title} </strong> <br>
         <strong>Datum:</strong> ${formattedDate} <br>
         <strong>Uhrzeit:</strong> ${formattedTime} <br>
         <strong>Saal:</strong> ${ticket.room_id} <br>
         <strong>Bereich:</strong> ${ticket.ticket_type} <br>
         <strong>Rabatt:</strong> ${ticket.discount_name || 'Kein Rabatt'} <br>
         <strong>Preis:</strong> ${Number(ticket.price).toFixed(2)}€ 
     `;

                        ticketItem.appendChild(ticketPic);
                        ticketItem.appendChild(ticketHistory);
                        bookedTicketsContainer.appendChild(ticketItem);

                    });
                } else {
                    const message = document.createElement('p');
                    message.textContent = 'Sie haben noch keine Tickets gebucht.';
                    bookedTicketsContainer.appendChild(message);
                }
            }


        } catch (error) {
            console.error('Netzwerkfehler beim Abrufen der gebuchten Tickets:', error);
            alert('Netzwerkfehler beim Laden der gebuchten Tickets.');
        }
    }*/

        try {
            // Anfrage an den Server senden, um die gebuchten Tickets abzurufen
            const response = await fetch(`/api/tickets?email=${encodeURIComponent(email)}`);
            const tickets = await response.json();

            if (response.ok) {
                const bookedTicketsContainer = document.getElementById('bookedTicketsContainer');
                bookedTicketsContainer.style.display = 'block';

                if (tickets.length > 0) {
                    tickets.forEach(ticket => {
                        try {
                            const ticketPic = document.createElement('div');
                            const ticketItem = document.createElement('div');
                            const ticketHistory = document.createElement('div');

                            ticketPic.classList.add('ticket-pic');
                            ticketItem.classList.add('ticket-item');
                            ticketHistory.classList.add('ticket-data');

                            ticketPic.innerHTML = '<img src="../images/ticket_icon.svg" class="ticket-pic"/>';

                            // Debugging: Prüfen der Ticket-Daten
                            console.log("Verarbeite Ticket:", ticket);


                            // Datum und Uhrzeit validieren
                            if (ticket.date === 'Unbekannt' || ticket.time === 'Unbekannt') {
                                console.warn(`Show wurde bereits gelöscht`, ticket);
                                throw new Error(`Ungültiges Datum oder Uhrzeit für Ticket: ${ticket.ticket_id}`);
                            }

                            // Datum und Uhrzeit validieren
                            if (!ticket.date || isNaN(Date.parse(ticket.date))) {
                                throw new Error(`Ungültiges Datum: ${ticket.date}`);
                            }

                            if (!ticket.time || !/^\d{2}:\d{2}:\d{2}$/.test(ticket.time)) {
                                throw new Error(`Ungültige Uhrzeit: ${ticket.time}`);
                            }

                            // Datum und Uhrzeit formatieren
                            const ticketDate = new Date(ticket.date);
                            const ticketTime = new Date(`${ticket.date}T${ticket.time}`);

                            const formattedDate = new Intl.DateTimeFormat('de-DE', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                            }).format(ticketDate);

                            const formattedTime = new Intl.DateTimeFormat('de-DE', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                            }).format(ticketTime);

                            ticketHistory.innerHTML = `
                                <strong>Film: ${ticket.movie_title} </strong> <br>
                                <strong>Datum:</strong> ${formattedDate} <br>
                                <strong>Uhrzeit:</strong> ${formattedTime} <br>
                                <strong>Saal:</strong> ${ticket.room_id} <br>
                                <strong>Bereich:</strong> ${ticket.ticket_type} <br>
                                <strong>Rabatt:</strong> ${ticket.discount_name || 'Kein Rabatt'} <br>
                                <strong>Preis:</strong> ${Number(ticket.price).toFixed(2)}€ 
                            `;

                            ticketItem.appendChild(ticketPic);
                            ticketItem.appendChild(ticketHistory);
                            bookedTicketsContainer.appendChild(ticketItem);

                        } catch (innerError) {
                            console.error("Fehler bei der Verarbeitung eines Tickets:", innerError.message);
                        }
                    });
                } else {
                    const message = document.createElement('p');
                    message.textContent = 'Sie haben noch keine Tickets gebucht.';
                    bookedTicketsContainer.appendChild(message);
                }
            } else {
                console.error('Fehlerhafte Serverantwort:', tickets);
                alert('Fehler beim Abrufen der Tickets. Bitte versuchen Sie es später erneut.');
            }
        } catch (error) {
            console.error('Netzwerkfehler beim Abrufen der gebuchten Tickets:', error);
            alert('Netzwerkfehler beim Laden der gebuchten Tickets.');
        }

    }

    if (ticketData) {
        const tickets = JSON.parse(decodeURIComponent(ticketData));

        tickets.forEach(ticket => {
            console.log(`Sitzplatz: ${ticket.seat_number} Reihe: ${ticket.row_id} Bereich: ${ticket.category}, Preis: ${ticket.price}, Rabatt: ${ticket.discount_name || 'Kein Rabatt'}`);
        });
    }


    // Tickets anzeigen, wenn vorhanden
    if (showId && movieId && ticketData) {

        if (!showId || !movieId || !userId) {
            alert("Fehler: Ungültige URL-Parameter");
            window.location.href = "/";
            return;
        }

        // Show- und Filmdaten abrufen und anzeigen
        try {
            // Abruf der Filmdetails
            const movieResponse = await fetch(`/api/filme/${movieId}`);
            const movie = await movieResponse.json();

            const showResponse = await fetch(`/api/vorstellungen/${movieId}`);
            const showtimes = await showResponse.json();
            const selectedShow = showtimes.find(show => show.show_id === parseInt(showId));

            if (!selectedShow) {
                alert("Vorstellung nicht gefunden.");
                return;
            }

            // Titel und Show-Details anzeigen
            const showDataElement = document.getElementById("show-data");

            const showDateTime = new Date(`${selectedShow.date}T${selectedShow.time}`);
            const formatter = new Intl.DateTimeFormat('de-DE', {
                dateStyle: 'long',
                timeStyle: 'short'
            });

            // Show-Daten in das HTML-Element einfügen
            showDataElement.textContent = `${movie.title} - ${formatter.format(showDateTime)}Uhr im Kinosaal ${selectedShow.room_id}`;

        } catch (error) {
            console.error("Fehler beim Abrufen der Show-Daten:", error);
            alert("Fehler beim Laden der Show-Daten. Bitte versuchen Sie es später erneut.");
            return;
        }


        const ticketOverviewContainer = document.getElementById("ticketOverviewContainer");
        const ticketList = document.getElementById("ticketList");
        const tickets = JSON.parse(decodeURIComponent(ticketData));


        ticketOverviewContainer.style.display = "flex";
        ticketList.style.display = "flex";


        tickets.forEach(ticket => {
            const listItem = document.createElement("li");
            listItem.innerHTML = `<strong class="info-point">Platznummer:</strong> ${ticket.seat_number}&nbsp;&nbsp; <strong class="info-point">Reihe:</strong> ${ticket.row_id || 'Nicht angegeben'}&nbsp;&nbsp; <strong class="info-point">Bereich:</strong> ${ticket.category}  <br>
              <strong class="info-point">Rabatt:</strong> ${ticket.discount_name || 'Kein Rabatt'} &nbsp;&nbsp; <strong class="info-point">Preis:</strong> ${Number(ticket.price).toFixed(2)}€`;
            ticketList.appendChild(listItem);
        });


        // Tickets buchen, wenn IBAN vorhanden
        document.getElementById("bookTicketsButton").addEventListener("click", async () => {

            // IBAN überprüfen, bevor Tickets gebucht werden
            if (ibanText.textContent == "Keine IBAN hinterlegt" || ibanText.textContent == "Fügen Sie Ihre IBAN ein") {
                alert('Bitte hinterlegen Sie zuerst eine IBAN, um Tickets zu buchen.');
                return; // Stoppe die Buchung, wenn keine IBAN vorhanden ist
            }

            // Alle Sitzplatz-IDs aus den Tickets sammeln
            const selectedSeats = tickets.map(ticket => ticket.seat_id);

            try {
                // Überprüfung der Sitzplatzreservierungen mit dem `/check`-Endpunkt
                const checkResponse = await fetch("/api/seatReservations/check", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ selectedSeats, sessionId: userId }),
                });

                if (!checkResponse.ok) {
                    const result = await checkResponse.json();
                    throw new Error(`Fehler bei der Sitzplatzüberprüfung: ${result.message || 'Unbekannter Fehler'}`);
                }

                const checkResult = await checkResponse.json();

                if (!checkResult.allReserved) {
                    alert("Usain Bolt im Ticketbuchen sind Sie jetzt nicht... Ein oder mehrere Sitzplätze sind nicht mehr reserviert. Bitte starten Sie den Buchungsprozess erneut.");
                    return; // Abbrechen, wenn Sitzplätze nicht mehr verfügbar sind
                }

                // Wenn die Prüfung erfolgreich war, fahre mit der Buchung fort
                for (const ticket of tickets) {
                    const payload = {
                        show_id: showId,
                        ticket_type: ticket.category,
                        price: ticket.price,
                        discount_name: ticket.discount_name,
                        user_mail: localStorage.getItem("userRole") === "guest"
                            ? "Gastnutzer"  // Falls der Benutzer ein Gast ist, speichere "Gastnutzer"
                            : localStorage.getItem("userEmail")  // Ansonsten speichere die E-Mail aus dem localStorage
                    };

                    // Buchung des Tickets
                    const response = await fetch("/api/tickets", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    });

                    if (response.status !== 201) {
                        const result = await response.json();
                        throw new Error(`Fehler bei der Buchung des Tickets: ${result.error || 'Unbekannter Fehler'}`);
                    }

                    // Sitzplatzstatus auf "gebucht" setzen
                    const seatPayload = {
                        seat_id: ticket.seat_id,  // Sitzplatz ID aus dem Ticket
                        user_id: userId,  // Benutzer-ID
                    };

                    const seatResponse = await fetch("/api/seatReservations/book", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(seatPayload),
                    });

                    if (!seatResponse.ok) {
                        const result = await seatResponse.json();
                        throw new Error(`Fehler beim Aktualisieren des Sitzplatzes: ${result.message || 'Unbekannter Fehler'}`);
                    }
                }

                alert("Tickets erfolgreich gebucht!");
                // Weiterleitung zur Bestätigungsseite
                window.location.href = `/mainpages/confirmationpageStructure.html`;

            } catch (error) {
                // Detaillierte Fehlerbehandlung
                console.error('Fehler bei der Ticketbuchung:', error);
                alert(error.message || "Es gab einen Fehler bei der Buchung. Bitte versuchen Sie es erneut.");
            }
        });
    }

    if (!email) {
        alert('Sie sind nicht eingeloggt. Bitte melden Sie sich an.');
        window.location.href = '/mainpages/loginpageStructure.html';
        return;
    }

    // IBAN vom Server abrufen und anzeigen
    try {
        const response = await fetch(`/api/iban?email=${encodeURIComponent(email)}`);
        const data = await response.json();

        if (response.ok) {
            if (data.iban) {
                ibanText.textContent = data.iban;
                ibanButton.textContent = 'IBAN ändern'; // Button-Text auf "IBAN ändern" setzen
                popcornInfo.style.display = "block";
            } else {
                ibanText.textContent = 'Keine IBAN hinterlegt';
                ibanButton.textContent = 'IBAN speichern'; // Button-Text auf "IBAN speichern" setzen
                popcornInfo.style.display = "block";
            }
        } else {
            console.error('Fehler beim Abrufen der IBAN:', data.error);
            ibanText.textContent = 'Fügen Sie Ihre IBAN ein';
            ibanButton.textContent = 'IBAN speichern'; // Button-Text auf "IBAN speichern" setzen
        }
    } catch (error) {
        console.error('Netzwerkfehler:', error);
        ibanText.textContent = 'Netzwerkfehler';
    }

    // IBAN speichern oder ändern
    ibanForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const iban = ibanField.value;

        if (!ibanField.checkValidity()) {
            alert('Bitte eine gültige IBAN eingeben.');
            return;
        }

        try {
            const response = await fetch('/api/iban', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, iban }),
            });

            const result = await response.json();

            if (response.ok && localStorage.getItem("userRole") != "guest") {
                ibanText.textContent = iban;
                confirmationUser.style.display = 'block';
                ibanField.value = ''; // Eingabefeld leeren
                ibanButton.textContent = 'IBAN ändern'; // Button-Text nach dem Speichern ändern

            } else if (response.ok && localStorage.getItem("userRole") == "guest") {
                ibanText.textContent = iban;
                confirmationGuest.style.display = 'block';
                ibanField.value = ''; // Eingabefeld leeren
                ibanButton.textContent = 'IBAN ändern'; // Button-Text nach dem Speichern ändern

            } else {
                alert('Fehler beim Speichern der IBAN: ' + result.error);
            }
        } catch (error) {
            console.error('Fehler beim Speichern:', error);
            alert('Netzwerkfehler beim Speichern der IBAN.');
        }
    });
});
