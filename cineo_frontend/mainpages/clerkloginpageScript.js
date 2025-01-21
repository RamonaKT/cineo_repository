// Supabase-Setup
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://bwtcquzpxgkrositnyrj.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// Elemente auswählen
const formTitle = document.getElementById("form-title");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const submitBtn = document.getElementById("submit-btn");
const toggleAuth = document.getElementById("toggle-auth");
const toggleText = document.getElementById("toggle-text");

let isRegister = true;

// Authentifizierungsmodus umschalten
toggleAuth.addEventListener("click", () => {
    isRegister = !isRegister;
    formTitle.textContent = isRegister ? "Registrieren" : "Einloggen";
    submitBtn.textContent = isRegister ? "Registrieren" : "Einloggen";
    toggleText.textContent = isRegister ? "Einloggen" : "Registrieren";
});

// Formular absenden
document.getElementById("auth-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    if (isRegister) {
        // Registrierung
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });
        if (error) {
            alert("Fehler bei der Registrierung: " + error.message);
        } else {
            alert("Registrierung erfolgreich! Bitte überprüfe deine E-Mail.");
        }
    } else {
        // Anmeldung
        const { error, data } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            alert("Fehler beim Einloggen: " + error.message);
        } else {
            alert("Erfolgreich eingeloggt!");
            console.log("Benutzerdaten:", data);
        }
    }
});
