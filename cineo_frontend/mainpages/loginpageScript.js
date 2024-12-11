document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector(".login-form");

    // Testbenutzer-Daten (lokal)
    const testUser = {
        username: "testuser",
        password: "test1234",
    };

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault(); // Standard-Formularverhalten verhindern

        // Formulardaten auslesen
        const formData = new FormData(loginForm);
        const inputUsername = formData.get("username");
        const inputPassword = formData.get("password");

        // Testbenutzer-Validierung (lokal)
        if (inputUsername === testUser.username && inputPassword === testUser.password) {
            alert("Login erfolgreich!");
            window.location.href = "accountOverviewpageStructure.html"; // Weiterleitung zur Übersicht
            return; // Kein Backend-Check notwendig
        }

        // Backend-Login (falls Testbenutzer nicht zutrifft)
        const loginData = {
            username: inputUsername,
            password: inputPassword,
        };

        try {
            const response = await fetch("loginHandler.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(loginData),
            });

            const result = await response.json();
            if (response.ok) {
                alert("Login erfolgreich!");
                window.location.href = "accountOverviewpageStructure.html"; // Weiterleitung zur Übersicht
            } else {
                alert(result.message || "Login fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.");
            }
        } catch (error) {
            console.error("Fehler beim Login:", error);
            alert("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
        }
    });
});
