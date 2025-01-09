import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://bwtcquzpxgkrositnyrj.supabase.co"; // Dein Supabase-URL
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3dGNxdXpweGdrcm9zaXRueXJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxOTI5NTksImV4cCI6MjA0OTc2ODk1OX0.UYjPNnhS250d31KcmGfs6OJtpuwjaxbd3bebeOZJw9o"; // Dein Supabase-Anon-Schlüssel

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Umschalten zwischen Register und Login über Links
const registerContainer = document.getElementById("registerContainer");
const loginContainer = document.getElementById("loginContainer");
const showLoginLink = document.getElementById("showLoginLink");
const showRegisterLink = document.getElementById("showRegisterLink");

showLoginLink.addEventListener("click", () => {
    registerContainer.style.display = "none";
    loginContainer.style.display = "block";
});

showRegisterLink.addEventListener("click", () => {
    loginContainer.style.display = "none";
    registerContainer.style.display = "block";
});

// Registrierung
// Registrierung
document.getElementById("registerButton").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const messageDiv = document.getElementById("message");

    // Überprüfen, ob alle Felder ausgefüllt sind
    if (!email || !password || !confirmPassword) {
        messageDiv.textContent = "Please fill out all fields.";
        messageDiv.style.color = "red";
        return;
    }

    // Überprüfen, ob die Passwörter übereinstimmen
    if (password !== confirmPassword) {
        messageDiv.textContent = "Passwords do not match. Please try again.";
        messageDiv.style.color = "red";
        return;
    }

    // Überprüfen, ob der Benutzer ein Mitarbeiter ist (E-Mail endet mit "@cineo.com")
    const isEmployee = email.endsWith("@cineo.com");

    try {
        // Registrierung bei Supabase durchführen
        const { data, error } = await supabase
            .from("users")
            .insert([{ email, password, role: isEmployee ? "employee" : "customer" }]); // Rolle speichern

        if (error) {
            messageDiv.textContent = `Error: ${error.message}`;
            messageDiv.style.color = "red";
        } else {
            messageDiv.textContent = "Registration successful!";
            messageDiv.style.color = "green";
        }
    } catch (err) {
        console.error("Unexpected error:", err);
        messageDiv.textContent = "Unexpected error occurred.";
        messageDiv.style.color = "red";
    }
});


// Login
document.getElementById("loginButton").addEventListener("click", async () => {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const messageDiv = document.getElementById("loginMessage");

    if (!email || !password) {
        messageDiv.textContent = "Please fill out all fields.";
        messageDiv.style.color = "red";
        return;
    }

    try {
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .eq("password", password);

        if (error) {
            console.error("Error fetching user:", error);
            messageDiv.textContent = `Error: ${error.message}`;
            messageDiv.style.color = "red";
            return;
        }

        if (data.length > 0) {
            // Speichern der E-Mail im localStorage
            localStorage.setItem('userEmail', data[0].email);

            // Überprüfen, ob die E-Mail mit "@cineo.com" endet
            const isEmployee = email.endsWith("@cineo.com");

            if (isEmployee) {
                messageDiv.textContent = "Login successful! Redirecting to employee dashboard...";
                messageDiv.style.color = "green";
                setTimeout(() => {
                    window.location.href = "mitarbeiterDashboardpageStructure.html"; // Weiterleitung zur Mitarbeiter-Seite
                }, 2000);
            } else {
                messageDiv.textContent = "Login successful! Redirecting to customer homepage...";
                messageDiv.style.color = "green";
                setTimeout(() => {
                    window.location.href = "kundeDashboardpageStructure.html"; // Weiterleitung zur Kunden-Homepage
                }, 2000);
            }
        } else {
            messageDiv.textContent = "Invalid email or password.";
            messageDiv.style.color = "red";
        }
    } catch (err) {
        console.error("Unexpected error:", err);
        messageDiv.textContent = "Unexpected error occurred.";
        messageDiv.style.color = "red";
    }
});
