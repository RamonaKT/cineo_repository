/*

document.addEventListener('DOMContentLoaded', async function () {
    const ibanForm = document.getElementById('ibanForm');
    const ibanField = document.getElementById('iban');
    const ibanText = document.getElementById('ibanText');
    const confirmation = document.getElementById('confirmationMessage');

    const email = localStorage.getItem('userEmail');

    // URL-Parameter auslesen
    const urlParams = new URLSearchParams(window.location.search);
    const showId = urlParams.get("show_id");
    const movieId = urlParams.get("movie_id");
    const ticketData = urlParams.get("ticket_data");

    // Tickets anzeigen, wenn vorhanden
    if (showId && movieId && ticketData) {
        const ticketOverviewContainer = document.getElementById("ticketOverviewContainer");
        const ticketList = document.getElementById("ticketList");
        const tickets = JSON.parse(decodeURIComponent(ticketData));

        ticketOverviewContainer.style.display = "block";

        tickets.forEach(ticket => {
            const listItem = document.createElement("li");
            listItem.textContent = `Sitzplatz: ${ticket.seat}, Preis: ${ticket.price}€`;
            ticketList.appendChild(listItem);
        });
    }

    if (!email) {
        alert('Sie sind nicht eingeloggt. Bitte melden Sie sich an.');
        window.location.href = '/login.html';
        return;
    }

    // IBAN vom Server abrufen und anzeigen
    try {
        const response = await fetch(`/api/iban?email=${encodeURIComponent(email)}`);
        const data = await response.json();

        if (response.ok) {
            ibanText.textContent = data.iban || 'Keine IBAN hinterlegt';
        } else {
            console.error('Fehler beim Abrufen der IBAN:', data.error);
            ibanText.textContent = 'Fehler beim Laden der IBAN';
        }
    } catch (error) {
        console.error('Netzwerkfehler:', error);
        ibanText.textContent = 'Netzwerkfehler';
    }

    // IBAN speichern
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

            if (response.ok) {
                ibanText.textContent = iban;
                confirmation.style.display = 'block';
                ibanField.value = '';  // Eingabefeld leeren
            } else {
                alert('Fehler beim Speichern der IBAN: ' + result.error);
            }
        } catch (error) {
            console.error('Fehler beim Speichern:', error);
            alert('Netzwerkfehler beim Speichern der IBAN.');
        }
    });
});
*/

document.addEventListener('DOMContentLoaded', async function () {
    const ibanForm = document.getElementById('ibanForm');
    const ibanField = document.getElementById('iban');
    const ibanText = document.getElementById('ibanText');
    const confirmation = document.getElementById('confirmationMessage');
    const ibanButton = document.getElementById('ibanButton'); // Der Button im Formular
    const popcornInfo = document.getElementById('popcornInfo'); // Der Container für die Gratis-Popcorn-Info

    const email = localStorage.getItem('userEmail');

    // URL-Parameter auslesen
    const urlParams = new URLSearchParams(window.location.search);
    const showId = urlParams.get("show_id");
    const movieId = urlParams.get("movie_id");
    const ticketData = urlParams.get("ticket_data");

    
    if (ticketData) {
        const tickets = JSON.parse(decodeURIComponent(ticketData));

        tickets.forEach(ticket => {
            console.log(`Ticket-Typ: ${ticket.type}, Preis: ${ticket.price}, Rabatt: ${ticket.discount_name || 'Kein Rabatt'}`);
        });
    }

    // Tickets anzeigen, wenn vorhanden
    if (showId && movieId && ticketData) {
        const ticketOverviewContainer = document.getElementById("ticketOverviewContainer");
        const ticketList = document.getElementById("ticketList");
        const tickets = JSON.parse(decodeURIComponent(ticketData));

        ticketOverviewContainer.style.display = "flex";
        ticketList.style.display= "flex";


        /* tickets.forEach(ticket => {
             const listItem = document.createElement("li");
             listItem.textContent = `Sitzplatz: ${ticket.seat}, Preis: ${ticket.price}€`;
             ticketList.appendChild(listItem);
         });*/

         tickets.forEach(ticket => {
            const listItem = document.createElement("li");
            listItem.innerHTML = `<strong>Sitzplatz:</strong> ${ticket.seat || 'Nicht angegeben'} <strong>Tickettyp:</strong> ${ticket.type} <br>
            <strong>Preis:</strong> ${Number(ticket.price).toFixed(2)}€`;
            ticketList.appendChild(listItem);
        });
        

        // Event-Listener für "Tickets buchen"
        document.getElementById("bookTicketsButton").addEventListener("click", async () => {

            try {
                for (const ticket of tickets) {
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
                // Weiterleitung zur Login-Seite mit Ticketdaten
                window.location.href = `/mainpages/confirmationpageStructure.html`;

            } catch (error) {
                alert(error.message === "Kapazität überschritten"
                    ? "Es tut uns leid, die maximale Anzahl an Tickets für diese Vorstellung wurde erreicht."
                    : "Es gab einen Fehler bei der Buchung. Bitte versuchen Sie es erneut.");
            }
        });
        /*  const result = await response.json();

          if (response.ok) {
              alert("Tickets erfolgreich gebucht!");
              ticketOverviewContainer.style.display = "none"; // Versteckt die Tickets nach der Buchung
          } else {
              alert(`Fehler bei der Buchung: ${result.error}`);
          }
      } catch (err) {
          console.error("Fehler beim Buchen der Tickets:", err);
          alert("Ein unerwarteter Fehler ist aufgetreten.");
      }
  });*/
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

            if (response.ok) {
                ibanText.textContent = iban;
                confirmation.style.display = 'block';
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
