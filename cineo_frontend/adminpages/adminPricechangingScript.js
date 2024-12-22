document.addEventListener("DOMContentLoaded", () => {
    // Testdaten: Beispiel für Benutzer und Tickets (später durch Backend-Daten ersetzen)
    const username = "testuser"; // Platzhalter für eingeloggten Benutzer
    const tickets = [
        {
            title: "Avatar: The Way of Water",
            date: "20. Dezember 2024",
            time: "19:30 Uhr",
            room: "Saal 5 (3D)",
            seat: "Reihe 3, Sitz 12",
        },
        {
            title: "The Batman",
            date: "18. Dezember 2024",
            time: "20:00 Uhr",
            room: "Saal 2",
            seat: "Reihe 7, Sitz 15",
        },
    ];

    // Zeige Benutzername an (optional, falls benötigt)
    const userGreeting = document.querySelector(".overview-title");
    if (userGreeting) {
        userGreeting.innerHTML = `Willkommen, ${username}!<br>${userGreeting.innerHTML}`;
    }

    // Render Tickets in der Ticketliste
    const ticketList = document.querySelector(".ticket-list");
    if (ticketList) {
        ticketList.innerHTML = tickets
            .map(
                (ticket) => `
                <div class="ticket-item">
                    <h3>Kino: ${ticket.title}</h3>
                    <p><strong>Datum:</strong> ${ticket.date}</p>
                    <p><strong>Zeit:</strong> ${ticket.time}</p>
                    <p><strong>Saal:</strong> ${ticket.room}</p>
                    <p><strong>Platz:</strong> ${ticket.seat}</p>
                </div>
            `
            )
            .join("");
    }

    // Button: "Weitere Tickets buchen"
    const bookTicketsButton = document.querySelector(".action-button:not(.logout-button)");
    if (bookTicketsButton) {
        bookTicketsButton.addEventListener("click", () => {
            alert("Leite zur Buchungsseite weiter...");
            window.location.href = "programpageStructur.html"; // URL anpassen
        });
    }

    // Button: "Logout"
    const logoutButton = document.querySelector(".logout-button");
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            if (confirm("Möchten Sie sich wirklich abmelden?")) {
                alert("Sie wurden erfolgreich abgemeldet.");
                window.location.href = "loginpageStructure.html"; // Zur Login-Seite leiten
            }
        });
    }
});
