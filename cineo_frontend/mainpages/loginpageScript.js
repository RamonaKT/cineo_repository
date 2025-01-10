
/*

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://bwtcquzpxgkrositnyrj.supabase.co"; // Dein Supabase-URL
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3dGNxdXpweGdrcm9zaXRueXJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxOTI5NTksImV4cCI6MjA0OTc2ODk1OX0.UYjPNnhS250d31KcmGfs6OJtpuwjaxbd3bebeOZJw9o"; // Dein Supabase-Anon-Schlüssel

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);



//neu


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

// Umschalten zu Login
showLoginLink.addEventListener("click", () => {
    registerContainer.style.display = "none";
    guestContainer.style.display = "none";
    loginContainer.style.display = "block";
});

// Umschalten zu Registrierung
showRegisterLink.addEventListener("click", () => {
    loginContainer.style.display = "none";
    guestContainer.style.display = "none";
    registerContainer.style.display = "block";
});

// Umschalten zu Gast
showGuestLink.addEventListener("click", () => {
    loginContainer.style.display = "none";
    registerContainer.style.display = "none";
    guestContainer.style.display = "block";
});

// Umschalten von Gast zu Login
showLoginFromGuestLink.addEventListener("click", () => {
    guestContainer.style.display = "none";
    loginContainer.style.display = "block";
});

// Umschalten von Gast zu Registrierung
showRegisterFromGuestLink.addEventListener("click", () => {
    guestContainer.style.display = "none";
    registerContainer.style.display = "block";
});








//emde


showLoginLink.addEventListener("click", () => {
    registerContainer.style.display = "none";
    loginContainer.style.display = "block";
});

showRegisterLink.addEventListener("click", () => {
    loginContainer.style.display = "none";
    registerContainer.style.display = "block";
});


////Test

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
// Registrierung
// Registrierung
document.getElementById("registerButton").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const messageDiv = document.getElementById("message");

    // Überprüfen, ob alle Felder ausgefüllt sind
    if (!email || !password || !confirmPassword) {
        showNotification("Please fill out all fields.", "error");
        //messageDiv.textContent = "Please fill out all fields.";
        //messageDiv.style.color = "red";
        return;
    }

    // E-Mail-Format validieren
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestEmail)) {
        showNotification("Please enter a valid email address.", "error");
        //messageDiv.textContent = "Please enter a valid email address.";
        //.style.color = "red";
        return;
    }

    // Überprüfen, ob die Passwörter übereinstimmen
    if (password !== confirmPassword) {
        showNotification("Passwords do not match. Please try again.", "error");
        //messageDiv.textContent = "Passwords do not match. Please try again.";
        //messageDiv.style.color = "red";
        return;
    }

    try {
        // Überprüfen, ob die E-Mail bereits in der Datenbank existiert
        const { data: existingUser, error: fetchError } = await supabase
            .from("users")
            .select("email")
            .eq("email", email)
            .single();

        if (fetchError && fetchError.code !== "PGRST116") {
            // Fehler außer "Row not found"
            console.error("Error checking email:", fetchError);
            showNotification("Unexpected error occurred while checking email.", "error");
            //messageDiv.textContent = "Unexpected error occurred while checking email.";
            //messageDiv.style.color = "red";
            return;
        }

        if (existingUser) {
            // E-Mail existiert bereits
            showNotification("This email is already registered. Please use a different email.", "error");
            //messageDiv.textContent = "This email is already registered. Please use a different email.";
            //messageDiv.style.color = "red";
            return;
        }

        // Überprüfen, ob der Benutzer ein Mitarbeiter ist (E-Mail endet mit "@cineo.com")
        const isEmployee = email.endsWith("@cineo.com");

        // Registrierung bei Supabase durchführen
        const { data, error } = await supabase
            .from("users")
            .insert([{ email, password, role: isEmployee ? "employee" : "customer" }]);

        if (error) {
            showNotification(`Error: ${error.message}`, "error");
            //messageDiv.textContent = `Error: ${error.message}`;
            //messageDiv.style.color = "red";
        } else {
            showNotification("Registration successful!.", "success");
            //messageDiv.textContent = "Registration successful! Please login.";
            //messageDiv.style.color = "green";
        }
    } catch (err) {
        console.error("Unexpected error:", err);
        showNotification("Unexpected error occured.", "error");
        //messageDiv.textContent = "Unexpected error occurred.";
        //messageDiv.style.color = "red";
    }
});



// Login
document.getElementById("loginButton").addEventListener("click", async () => {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const messageDiv = document.getElementById("loginMessage");

    if (!email || !password) {
        showNotification("Please fill out all fields.", "error");
        //.textContent = "Please fill out all fields.";
        //messageDiv.style.color = "red";
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
            showNotification(`Error: ${error.message}`, "error");
            //messageDiv.textContent = `Error: ${error.message}`;
            //messageDiv.style.color = "red";
            return;
        }

        if (data.length > 0) {
            // Speichern der E-Mail im localStorage
            localStorage.setItem('userEmail', data[0].email);

            // Überprüfen, ob die E-Mail mit "@cineo.com" endet
            const isEmployee = email.endsWith("@cineo.com");

            if (isEmployee) {
                showNotification("Login successful! Redirecting to employee dashboard...", "success");
                //messageDiv.textContent = "Login successful! Redirecting to employee dashboard...";
                //messageDiv.style.color = "green";
                setTimeout(() => {
                    window.location.href = "mitarbeiterDashboardpageStructure.html"; // Weiterleitung zur Mitarbeiter-Seite
                }, 2000);
            } else {
                showNotification("Login successful! Redirecting to customer homepage...", "success");
                //messageDiv.textContent = "Login successful! Redirecting to customer homepage...";
                //messageDiv.style.color = "green";
                setTimeout(() => {
                    window.location.href = "kundeDashboardpageStructure.html"; // Weiterleitung zur Kunden-Homepage
                }, 2000);
            }
        } else {
            showNotification("Invalid email or password.", "error");
            //messageDiv.textContent = "Invalid email or password.";
            //messageDiv.style.color = "red";
        }
    } catch (err) {
        console.error("Unexpected error:", err);
        showNotification("Unexpected error occurred.", "error");
        //messageDiv.textContent = "Unexpected error occurred.";
        //messageDiv.style.color = "red";
    }
});






// Gastmodus mit E-Mail-Validierung (ohne Datenbankprüfung)
document.getElementById("guestButton").addEventListener("click", () => {
    const guestEmail = document.getElementById("guestEmail").value;
    const messageDiv = document.getElementById("guestMessage");

    // Überprüfen, ob eine E-Mail-Adresse eingegeben wurde
    if (!guestEmail) {
        showNotification("Please enter an email address.", "error");
        //messageDiv.textContent = "Please enter an email address.";
        //messageDiv.style.color = "red";
        return;
    }

    // E-Mail-Format validieren
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestEmail)) {
        showNotification("Please enter a valid email address.", "error");
        //messageDiv.textContent = "Please enter a valid email address.";
        //messageDiv.style.color = "red";
        return;
    }

    // Gastdaten lokal speichern
    localStorage.setItem("userEmail", guestEmail);
    localStorage.setItem("userRole", "guest");

    // Erfolgsmeldung und Weiterleitung
    showNotification("Continuing as guest...", "success");
    //messageDiv.textContent = "Continuing as guest...";
    //messageDiv.style.color = "green";

    setTimeout(() => {
        window.location.href = "kundeDashboardpageStructure.html"; // Kunden-Dashboard-Seite
    }, 2000);
});


*/


/*
// Utility function for notifications
function showNotification(message, type = "error") {
    const notificationContainer = document.getElementById("notification-container");
    const notification = document.createElement("div");
    notification.classList.add("notification", type);
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">✖</button>
    `;
    notificationContainer.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}

// Switching between forms
const forms = {
    register: document.getElementById("registerContainer"),
    login: document.getElementById("loginContainer"),
    guest: document.getElementById("guestContainer"),
};

function switchForm(target) {
    Object.values(forms).forEach((form) => (form.style.display = "none"));
    forms[target].style.display = "block";
}

document.getElementById("showLoginLink").addEventListener("click", () => switchForm("login"));
document.getElementById("showRegisterLink").addEventListener("click", () => switchForm("register"));
document.getElementById("showGuestLink").addEventListener("click", () => switchForm("guest"));
document.getElementById("showLoginFromGuestLink").addEventListener("click", () => switchForm("login"));
document.getElementById("showRegisterFromGuestLink").addEventListener("click", () => switchForm("register"));

// Register User
document.getElementById("registerButton").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!email || !password || !confirmPassword) return showNotification("All fields are required.");
    if (password !== confirmPassword) return showNotification("Passwords do not match.");
    if (!/\S+@\S+\.\S+/.test(email)) return showNotification("Invalid email format.");

    try {
        const response = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error);

        showNotification("Registration successful!", "success");
        switchForm("login");
    } catch (err) {
        showNotification(`Error: ${err.message}`);
    }
});

// Login User
document.getElementById("loginButton").addEventListener("click", async () => {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) return showNotification("All fields are required.");

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error);

        localStorage.setItem("userEmail", email);
        const redirectPage = result.role === "employee" ? "mitarbeiterDashboardpageStructure.html" : "kundeDashboardpageStructure.html";
        showNotification("Login successful!", "success");
        setTimeout(() => (window.location.href = redirectPage), 2000);
    } catch (err) {
        showNotification(`Error: ${err.message}`);
    }
});

// Guest Login
document.getElementById("guestButton").addEventListener("click", async () => {
    const guestEmail = document.getElementById("guestEmail").value;

    if (!/\S+@\S+\.\S+/.test(guestEmail)) return showNotification("Invalid email format.");

    try {
        const response = await fetch("/api/guest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: guestEmail }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error);

        localStorage.setItem("userEmail", guestEmail);
        localStorage.setItem("userRole", "guest");
        showNotification("Continuing as guest...", "success");
        setTimeout(() => (window.location.href = "kundeDashboardpageStructure.html"), 2000);
    } catch (err) {
        showNotification(`Error: ${err.message}`);
    }
});
*/


/*
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

// Umschalten zu Login
showLoginLink.addEventListener("click", () => {
    registerContainer.style.display = "none";
    guestContainer.style.display = "none";
    loginContainer.style.display = "block";
});

// Umschalten zu Registrierung
showRegisterLink.addEventListener("click", () => {
    loginContainer.style.display = "none";
    guestContainer.style.display = "none";
    registerContainer.style.display = "block";
});

// Umschalten zu Gast
showGuestLink.addEventListener("click", () => {
    loginContainer.style.display = "none";
    registerContainer.style.display = "none";
    guestContainer.style.display = "block";
});

// Umschalten von Gast zu Login
showLoginFromGuestLink.addEventListener("click", () => {
    guestContainer.style.display = "none";
    loginContainer.style.display = "block";
});

// Umschalten von Gast zu Registrierung
showRegisterFromGuestLink.addEventListener("click", () => {
    guestContainer.style.display = "none";
    registerContainer.style.display = "block";
});

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
        showNotification("Please fill out all fields.", "error");
        return;
    }

    if (password !== confirmPassword) {
        showNotification("Passwords do not match. Please try again.", "error");
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



document.getElementById("loginButton").addEventListener("click", async () => {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
        showNotification("Please fill out all fields.", "error");
        return;
    }

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const result = await response.json();
        console.log(result); // Debug: Überprüfen, ob die API das richtige Ergebnis liefert

        if (response.ok) {
            localStorage.setItem("userEmail", email);

            if (result.role === "employee") {
                showNotification("Login successful! Redirecting to employee dashboard...", "success");
                setTimeout(() => {
                    window.location.href = "mitarbeiterDashboardpageStructure.html";
                }, 2000);
            } else {
                showNotification("Login successful! Redirecting to customer homepage...", "success");
                setTimeout(() => {
                    window.location.href = "kundeDashboardpageStructure.html";
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




/*
// Login
document.getElementById("loginButton").addEventListener("click", async () => {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
        showNotification("Please fill out all fields.", "error");
        return;
    }

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const result = await response.json();

        if (response.ok) {
            localStorage.setItem("userEmail", email);

            if (result.role === "employee") {
                showNotification("Login successful! Redirecting to employee dashboard...", "success");
                setTimeout(() => {
                    window.location.href = "mitarbeiterDashboardpageStructure.html";
                }, 2000);
            } else {
                showNotification("Login successful! Redirecting to customer homepage...", "success");
                setTimeout(() => {
                    window.location.href = "kundeDashboardpageStructure.html";
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


document.getElementById("guestButton").addEventListener("click", async () => {
    const guestEmail = document.getElementById("guestEmail").value;

    if (!guestEmail) {
        showNotification("Please enter an email address.", "error");
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
            showNotification(result.message, "success");
            setTimeout(() => {
                window.location.href = "kundeDashboardpageStructure.html";
            }, 2000);
        } else {
            showNotification(result.error, "error");
        }
    } catch (err) {
        console.error("Unexpected error:", err);
        showNotification("Unexpected error occurred.", "error");
    }
});
*/

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

// Umschalten zu Login
showLoginLink.addEventListener("click", () => {
    toggleView("login");
});

// Umschalten zu Registrierung
showRegisterLink.addEventListener("click", () => {
    toggleView("register");
});

// Umschalten zu Gast
showGuestLink.addEventListener("click", () => {
    toggleView("guest");
});

// Umschalten von Gast zu Login
showLoginFromGuestLink.addEventListener("click", () => {
    toggleView("login");
});

// Umschalten von Gast zu Registrierung
showRegisterFromGuestLink.addEventListener("click", () => {
    toggleView("register");
});

// Umschalten der Ansichten
function toggleView(view) {
    registerContainer.style.display = view === "register" ? "block" : "none";
    loginContainer.style.display = view === "login" ? "block" : "none";
    guestContainer.style.display = view === "guest" ? "block" : "none";
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
        showNotification("Please fill out all fields.", "error");
        return;
    }

    if (password !== confirmPassword) {
        showNotification("Passwords do not match. Please try again.", "error");
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
        showNotification("Please fill out all fields.", "error");
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

            if (result.role === "employee") {
                showNotification("Login successful! Redirecting to employee dashboard...", "success");
                setTimeout(() => {
                    window.location.href = "mitarbeiterDashboardpageStructure.html";
                }, 2000);
            } else {
                showNotification("Login successful! Redirecting to customer homepage...", "success");
                setTimeout(() => {
                    window.location.href = "kundeDashboardpageStructure.html";
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
        showNotification("Please enter an email address.", "error");
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
            showNotification(result.message, "success");
            setTimeout(() => {
                window.location.href = "kundeDashboardpageStructure.html";
            }, 2000);
        } else {
            showNotification(result.error, "error");
        }
    } catch (err) {
        console.error("Unexpected error:", err);
        showNotification("Unexpected error occurred.", "error");
    }
});
