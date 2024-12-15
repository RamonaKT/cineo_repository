document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.querySelector(".register-form");

    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault(); // Standard-Formularverhalten verhindern

        const formData = new FormData(registerForm);
        const registerData = {
            username: formData.get("username"),
            email: formData.get("email"),
            password: formData.get("password"),
            confirmPassword: formData.get("confirmPassword"),
        };

        if (registerData.password !== registerData.confirmPassword) {
            alert("Die Passwörter stimmen nicht überein.");
            return;
        }

        try {
            const response = await fetch("registerHandler.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(registerData),
            });

            const result = await response.json();
            if (response.ok) {
                alert("Registrierung erfolgreich!");
                window.location.href = "loginpageStructure.html";
            } else {
                alert(result.message || "Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.");
            }
        } catch (error) {
            console.error("Fehler bei der Registrierung:", error);
            alert("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
        }
    });
});
