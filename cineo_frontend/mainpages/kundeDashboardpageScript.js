document.addEventListener('DOMContentLoaded', async function () {
    const ibanForm = document.getElementById('ibanForm');
    const ibanField = document.getElementById('iban');
    const ibanText = document.getElementById('ibanText');
    const confirmation = document.getElementById('confirmationMessage');

    const email = localStorage.getItem('userEmail');

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
