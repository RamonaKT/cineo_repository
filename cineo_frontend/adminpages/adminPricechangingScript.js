let grundpreise = {};
let rabatte = [];

// Seite laden
window.onload = function () {
    renderGrundpreise();
    renderRabatte();
    fetchData();  // Ruft die Daten vom Server ab, wenn die Seite geladen wird
};

// Grundpreise rendern
function renderGrundpreise() {
    const liste = document.getElementById('preisListe');
    liste.innerHTML = '';

    for (let [kategorie, preis] of Object.entries(grundpreise)) {
        const li = document.createElement('li');
        li.innerHTML = `<div>${kategorie}: <strong>${preis.toFixed(2)} €</strong></div> 
        <button onclick="editGrundpreis('${kategorie}', ${preis})">Ändern</button>`;
        liste.appendChild(li);
    }
}

// Rabatte rendern
function renderRabatte() {
    const liste = document.getElementById('rabattListe');
    liste.innerHTML = '';

    rabatte.forEach((item, index) => {
        const rabattText = item.typ === "prozent" ? `${item.wert}% Rabatt` : `${item.wert.toFixed(2)} € Rabatt`;

        const li = document.createElement('li');
        li.innerHTML = `<div>${item.name} - ${rabattText}</div> 
        <button onclick="deleteRabatt(${index})">Löschen</button>`;
        liste.appendChild(li);
    });
}

// Grundpreis ändern oder hinzufügen
document.getElementById('grundpreisForm').onsubmit = function (e) {
    e.preventDefault();

    const kategorie = document.getElementById('kategorie').value;
    const preis = parseFloat(document.getElementById('preis').value);

    if (kategorie && !isNaN(preis)) {
        // API-Aufruf, um den Grundpreis zu aktualisieren
        updateGrundpreis(kategorie, preis);
        renderGrundpreise();
        document.getElementById('grundpreisForm').reset();
    } else {
        alert('Bitte gültige Werte eingeben.');
    }
};

// Rabatt hinzufügen
document.getElementById('rabattForm').onsubmit = function (e) {
    e.preventDefault();

    const name = document.getElementById('rabattName').value;
    const typ = document.getElementById('rabattTyp').value;
    const wert = parseFloat(document.getElementById('rabattWert').value);

    if (name && !isNaN(wert) && wert > 0) {
        // API-Aufruf, um den Rabatt hinzuzufügen
        addRabatt(name, typ, wert);
        renderRabatte();
        document.getElementById('rabattForm').reset();
    } else {
        alert('Bitte gültige Werte eingeben.');
    }
};

// Rabatt löschen
function deleteRabatt(index) {
    const rabattId = rabatte[index].id;
    // API-Aufruf, um den Rabatt zu löschen
    removeRabatt(rabattId);
}

// Grundpreis bearbeiten
function editGrundpreis(kategorie, preis) {
    document.getElementById('kategorie').value = kategorie;
    document.getElementById('preis').value = preis;
}

// Funktion, um Daten vom Server zu holen
async function fetchData() {
    try {
        // Abrufen der Grundpreise
        const priceResponse = await fetch('/api/ticket_prices');
        if (!priceResponse.ok) {
            throw new Error('Fehler beim Abrufen der Ticketpreise');
        }
        grundpreise = await priceResponse.json();

        // Abrufen der Rabatte
        const discountResponse = await fetch('/api/ticket_discounts');
        if (!discountResponse.ok) {
            throw new Error('Fehler beim Abrufen der Rabatte');
        }
        rabatte = await discountResponse.json();

        // Daten rendern
        renderGrundpreise();
        renderRabatte();
    } catch (error) {
        console.error(error);
        alert('Fehler beim Abrufen der Daten');
    }
}

// Grundpreis auf dem Server aktualisieren
async function updateGrundpreis(kategorie, preis) {
    try {
        const response = await fetch('/api/ticket_prices', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ticket_id: kategorie, ticket_price: preis })
        });

        if (!response.ok) {
            throw new Error('Fehler beim Aktualisieren des Ticketpreises');
        }
    } catch (error) {
        console.error(error);
        alert('Fehler beim Aktualisieren des Ticketpreises');
    }
}

// Rabatt auf dem Server hinzufügen
async function addRabatt(name, typ, wert) {
    try {
        const response = await fetch('/api/ticket_discounts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, typ, price: wert })
        });

        if (!response.ok) {
            throw new Error('Fehler beim Hinzufügen des Rabatts');
        }

        const newRabatt = await response.json();
        rabatte.push(newRabatt.discount); // Rabatt zur Liste hinzufügen
    } catch (error) {
        console.error(error);
        alert('Fehler beim Hinzufügen des Rabatts');
    }
}

// Rabatt vom Server löschen
async function removeRabatt(rabattId) {
    try {
        const response = await fetch('/api/ticket_discounts', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: rabattId })
        });

        if (!response.ok) {
            throw new Error('Fehler beim Löschen des Rabatts');
        }

        rabatte = rabatte.filter(rabatt => rabatt.id !== rabattId); // Rabatt aus der Liste entfernen
        renderRabatte();
    } catch (error) {
        console.error(error);
        alert('Fehler beim Löschen des Rabatts');
    }
}
