document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector(".login-form");

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault(); // Standard-Formularverhalten verhindern

        const formData = new FormData(loginForm);
        const loginData = {
            username: formData.get("username"),
            password: formData.get("password"),
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
                window.location.href = "homepageStructure.html";
            } else {
                alert(result.message || "Login fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.");
            }
        } catch (error) {
            console.error("Fehler beim Login:", error);
            alert("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
        }
    });
});
