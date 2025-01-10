document.addEventListener("DOMContentLoaded", () => {
    // Abrufen der Ticketdaten aus der URL (z.B. über queryParams)
    const urlParams = new URLSearchParams(window.location.search);
    const showId = urlParams.get("show_id");
    const movieId = urlParams.get("movie_id");
    const totalPrice = parseFloat(urlParams.get("total_price"));

    // Gesamtpreis anzeigen
    document.getElementById("total-price").textContent = `${totalPrice.toFixed(2)}€`;

    // Prüfen, ob der Nutzer bereits eingeloggt ist (mit localStorage)
    const userEmail = localStorage.getItem("userEmail");
    const userRole = localStorage.getItem("userRole");

    if (userEmail) {
        // Rabatt anwenden, falls der Nutzer eingeloggt ist
        if (userRole === "customer") {
            const discountAmount = 10; // Beispiel: 10% Rabatt für eingeloggte Nutzer
            const discountedPrice = totalPrice - (totalPrice * discountAmount / 100);
            document.getElementById("total-price").textContent = `${discountedPrice.toFixed(2)}€`;

            // Rabatt-Info anzeigen
            document.getElementById("discount-info").style.display = "block";
            document.getElementById("discount-amount").textContent = `${discountAmount}%`;
        }
    }

    // Weiterleitung bei Klick auf die Buttons
    document.getElementById("loginButton").addEventListener("click", () => {
        // Die Ticketdaten an die Login-Seite weitergeben
        window.location.href = `login.html?show_id=${showId}&movie_id=${movieId}&total_price=${totalPrice}`;
    });

    document.getElementById("registerButton").addEventListener("click", () => {
        window.location.href = `register.html?show_id=${showId}&movie_id=${movieId}&total_price=${totalPrice}`;
    });

    document.getElementById("guestButton").addEventListener("click", async () => {
        // Als Gast fortfahren und Ticketbuchung durchführen
        try {
            const response = await fetch("/api/guest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: "guest@example.com" }), // Beispiel-Gast-Email
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error);

            localStorage.setItem("userEmail", "guest@example.com");
            localStorage.setItem("userRole", "guest");

            alert("Als Gast fortgefahren!");
            window.location.href = `/confirmation.html?show_id=${showId}&movie_id=${movieId}&total_price=${totalPrice}`;
        } catch (error) {
            alert("Fehler beim Gastlogin. Bitte versuchen Sie es später erneut.");
        }
    });
});
