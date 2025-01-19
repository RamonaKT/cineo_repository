// Umschalten zwischen Login, Registrierung und Gast
const registerContainer = document.getElementById("registerContainer");
const loginContainer = document.getElementById("loginContainer");
const guestContainer = document.getElementById("guestContainer");

// Links für den Wechsel
const showLoginLink = document.getElementById("showLoginLink");
const showRegisterLink = document.getElementById("showRegisterLink");
const showGuestLink = document.getElementById("showGuestLink");
const showLoginFromGuestLink = document.getElementById("showLoginFromGuestLink");
const showRegisterFromGuestLink = document.getElementById("showRegisterFromGuestLink");
const guestButton = document.getElementById("guestRedirectButton");

// URL-Parameter auslesen
const urlParams = new URLSearchParams(window.location.search);
const showId = urlParams.get("show_id");
const movieId = urlParams.get("movie_id");
const ticketDataParam = urlParams.get("ticket_data");
const guestSection = document.getElementById("guest-section");

// Sichtbarkeit des Gast-Abschnitts basierend auf den URL-Parametern einstellen
if (!showId || !movieId || !ticketDataParam) {
    guestSection.style.display = 'none'; // Versteckt den gesamten Abschnitt
}

if (ticketDataParam) {
    try {
        const ticketData = JSON.parse(decodeURIComponent(ticketDataParam));

        ticketData.forEach(ticket => {
            console.log(`Sitzplatz: ${ticket.seat_id}, Preis: ${ticket.price}€, Rabatt: ${ticket.discount_name}`);
        });

    } catch (error) {
        console.error("Fehler beim Decodieren der Ticket-Daten:", error);
    }
}

const userId = urlParams.get("session_id");

// Umschalten zu Login
showLoginLink.addEventListener("click", () => {
    toggleView("login");
    guestButton.classList.remove("hidden");
});

// Umschalten zu Registrierung
showRegisterLink.addEventListener("click", () => {
    toggleView("register");
    guestButton.classList.remove("hidden");
});

// Umschalten zu Gast
showGuestLink.addEventListener("click", () => {
    toggleView("guest");
    guestButton.classList.add("hidden");
});

// Umschalten von Gast zu Login
showLoginFromGuestLink.addEventListener("click", () => {
    toggleView("login");
    guestButton.classList.remove("hidden");
});

// Umschalten von Gast zu Registrierung
showRegisterFromGuestLink.addEventListener("click", () => {
    toggleView("register");
    guestButton.classList.remove("hidden");
});

// Umschalten der Ansichten
function toggleView(view) {
    registerContainer.style.display = view === "register" ? "block" : "none";
    loginContainer.style.display = view === "login" ? "block" : "none";
    guestContainer.style.display = view === "guest" ? "block" : "none";
}

// Spezielles Angebot anzeigen und den "Weiter als Gast"-Button aktivieren
if (showId && movieId && ticketDataParam) {
    const ticketInfoContainer = document.getElementById("ticketInfoContainer");
    const guestRedirectContainer = document.getElementById("guestRedirectContainer");

    // Nachricht für Ticketinhaber anzeigen
    ticketInfoContainer.style.display = "block";
    ticketInfoContainer.innerHTML = `
        <div class="ticket-info">
          <p><img src= "../images/popcorn.svg" class="popcorn-picture"/><strong> SPECIAL: </strong>Melden Sie sich an und genießen Sie ein gratis Popcorn! <br> <br>  Sie können sich einloggen, neu registrieren oder als Gast fortfahren, um Ihre Buchung zu abzuschließen.</p>
        </div>
    `;

    // "Weiter als Gast"-Button sichtbar machen
    guestRedirectContainer.style.display = "block";

    // Button-Event hinzufügen
    guestButton.addEventListener("click", () => {
        toggleView("guest"); // Zur Guest-Eingabe wechseln
        guestButton.classList.add("hidden");

    });
} else {
    registerContainer.classList.add("down");
    loginContainer.classList.add("down");
    guestContainer.classList.add("down");
}


// Benachrichtigungen anzeigen
function showNotification(message, type = "error") {
    const notificationContainer = document.getElementById("notification-container");
    const notification = document.createElement("div");
    notification.classList.add("notification");
    if (type === "success") {
        notification.classList.add("success");
    }

    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">✖</button>
    `;

    notificationContainer.appendChild(notification);

    // Automatisches Entfernen nach 5 Sekunden
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Registrierung
document.getElementById("registerButton").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!email || !password || !confirmPassword) {
        showNotification("Bitte füllen Sie alle Felder aus.", "error");
        return;
    }

    if (password !== confirmPassword) {
        showNotification("Passwörter stimmen nicht überein. Bitte versuchen Sie es erneut.", "error");
        return;
    }

    try {
        const response = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const result = await response.json();

        if (response.ok) {
            showNotification(result.message, "success");
        } else {
            showNotification(result.error, "error");
        }
    } catch (err) {
        console.error("Unexpected error:", err);
        showNotification("Unexpected error occurred.", "error");
    }
});

// Login
document.getElementById("loginButton").addEventListener("click", async () => {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
        showNotification("Bitte füllen Sie alle Felder aus.", "error");
        return;
    }

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const result = await response.json();
        console.log("Login API response:", result); // Debugging

        if (response.ok) {
            localStorage.setItem("userEmail", email);
            localStorage.setItem("userRole", result.role); // Speichert die Rolle


            const urlParams = new URLSearchParams(window.location.search);
            const showId = urlParams.get("show_id");
            const movieId = urlParams.get("movie_id");
            const ticketData = urlParams.get("ticket_data");

            const redirectUrl = `kundeDashboardpageStructure.html${showId && movieId && ticketData
                    ? `?show_id=${showId}&movie_id=${movieId}&session_id=${userId}&ticket_data=${encodeURIComponent(ticketData)}`
                    : ""
                }`;


            if (result.role === "employee") {
                showNotification("Login war erfolgreich! Sie werden weitergeleitet zum Mitarbeiter-Dashboard...", "success");
                setTimeout(() => {
                    window.location.href = "mitarbeiterDashboardpageStructure.html";
                }, 2000);
            } else {
                showNotification("Login war erfolgreich! Sie werden weitergeleitet...", "success");
                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 2000);
            }
        } else {
            showNotification(result.error, "error");
        }
    } catch (err) {
        console.error("Unexpected error:", err);
        showNotification("Unexpected error occurred.", "error");
    }
});


// Gastmodus mit E-Mail-Validierung
document.getElementById("guestButton").addEventListener("click", async () => {
    const guestEmail = document.getElementById("guestEmail").value;

    if (!guestEmail) {
        showNotification("Bitte fügen Sie eine E-Mail Adresse ein.", "error");
        return;
    }

    try {
        const response = await fetch("/api/guest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: guestEmail }),
        });

        const result = await response.json();

        if (response.ok) {
            localStorage.setItem("userEmail", guestEmail);
            localStorage.setItem("userRole", "guest");

            const urlParams = new URLSearchParams(window.location.search);
            const showId = urlParams.get("show_id");
            const movieId = urlParams.get("movie_id");
            const ticketData = urlParams.get("ticket_data");

            const redirectUrl = `kundeDashboardpageStructure.html${showId && movieId && ticketData
                    ? `?show_id=${showId}&movie_id=${movieId}&session_id=${userId}&ticket_data=${encodeURIComponent(ticketData)}`
                    : ""
                }`;

            showNotification("Continuing as guest...", "success");
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 2000);
        } else {
            showNotification(result.error, "error");
        }
    } catch (err) {
        console.error("Unexpected error:", err);
        showNotification("Unexpected error occurred.", "error");
    }
});
