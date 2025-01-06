document.addEventListener('DOMContentLoaded', function () {
    const ibanForm = document.getElementById('ibanForm');
    const ibanField = document.getElementById('iban');
    const ibanText = document.getElementById('ibanText');
    const confirmation = document.getElementById('confirmationMessage');

    // Simulierte Abfrage (später aus Datenbank)
    let gespeicherteIBAN = '';  // Hier wird später die IBAN aus der Datenbank geladen

    // Überprüfen, ob IBAN vorhanden ist
    if (gespeicherteIBAN) {
        ibanText.textContent = gespeicherteIBAN;
    }

    ibanForm.addEventListener('submit', function (event) {
        event.preventDefault();

        if (ibanField.checkValidity()) {
            gespeicherteIBAN = ibanField.value;

            // IBAN im Anzeigefeld setzen
            ibanText.textContent = gespeicherteIBAN || 'Keine IBAN hinterlegt';
            confirmation.style.display = 'block';

            console.log('IBAN gespeichert:', gespeicherteIBAN);

            // Optional: Feld leeren nach Speichern
            ibanField.value = '';
        } else {
            alert('Bitte eine gültige IBAN eingeben.');
        }
    });
});
