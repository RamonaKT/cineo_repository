// Frontend JavaScript zur Anzeige der Ticketpreise und Rabatte
let grundpreise = {};
let rabatte = [];

// Seite laden und Daten von der API holen
window.onload = async function () {
    await fetchPreiseUndRabatte();
    renderGrundpreise();
    renderRabatte();
};

// Preise und Rabatte von der API abrufen
async function fetchPreiseUndRabatte() {
    try {
        const response = await fetch('/api/ticketpreise');
        const data = await response.json();

        if (data.ticketpreise) {
            data.ticketpreise.forEach(ticket => {
                if (ticket.ticket_id === 0) grundpreise["Parkett"] = ticket.ticket_price;
                if (ticket.ticket_id === 1) grundpreise["VIP"] = ticket.ticket_price;
                if (ticket.ticket_id === 2) grundpreise["Loge"] = ticket.ticket_price;
            });
        }

        if (data.rabatte) {
            rabatte = data.rabatte;
        }

        renderGrundpreise();
        renderRabatte();
    } catch (error) {
        console.error('Fehler beim Abrufen der Daten:', error);
    }
}

// Grundpreise rendern
function renderGrundpreise() {
    const liste = document.getElementById('preisListe');
    liste.innerHTML = '';

    for (let [kategorie, preis] of Object.entries(grundpreise)) {
        const li = document.createElement('li');
        li.innerHTML = `<div>${kategorie}: <strong>${preis.toFixed(2)} €</strong></div> 
        <button onclick="editGrundpreis('${kategorie}', ${preis})">\u00c4ndern</button>`;
        liste.appendChild(li);
    }
}

// Rabatte rendern
function renderRabatte() {
    const liste = document.getElementById('rabattListe');
    liste.innerHTML = '';

    rabatte.forEach((item, index) => {
        const rabattText = item.type === "Prozent" ? `${item.value}% Rabatt` : `${item.value.toFixed(2)} € Rabatt`;

        const li = document.createElement('li');
        li.innerHTML = `<div>${item.name} - ${rabattText}</div> 
        <button onclick="deleteRabatt(${index})">Löschen</button>`;
        liste.appendChild(li);
    });
}

// Rabatt löschen
function deleteRabatt(index) {
    rabatte.splice(index, 1);
    renderRabatte();
}

// Grundpreis bearbeiten
function editGrundpreis(kategorie, preis) {
    document.getElementById('kategorie').value = kategorie;
    document.getElementById('preis').value = preis;
}


// Rabatt löschen
async function deleteRabatt(index) {
    const name = rabatte[index].name;

    try {
        const response = await fetch(`/api/ticketrabatt/${name}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            rabatte.splice(index, 1); // Rabatt aus der Liste entfernen
            renderRabatte();
        } else {
            console.error('Fehler beim Löschen des Rabatts');
        }
    } catch (error) {
        console.error('Fehler beim Löschen:', error);
    }
}


/**
 * 
 * // Grundpreis aktualisieren
async function updateGrundpreis(event) {
    event.preventDefault();

    const kategorie = document.getElementById('kategorie').value;
    const preis = parseFloat(document.getElementById('preis').value);

    let ticket_id;
    if (kategorie === 'Parkett') ticket_id = 0;
    if (kategorie === 'VIP') ticket_id = 1;
    if (kategorie === 'Loge') ticket_id = 2;

    const body = {};
    body[kategorie.toLowerCase()] = preis;  // Die dynamische Zuweisung der Werte

    try {
        const response = await fetch('/api/ticketpreise', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (response.ok) {
            grundpreise[kategorie] = preis;
            renderGrundpreise();
            document.getElementById('grundpreisForm').reset();
        } else {
            console.error('Fehler beim Aktualisieren des Grundpreises');
        }
    } catch (error) {
        console.error('Fehler beim Aktualisieren:', error);
    }
}

// Rabatt hinzufügen oder aktualisieren
async function addRabatt(event) {
    event.preventDefault();

    const name = document.getElementById('rabattName').value;
    const type = document.getElementById('rabattTyp').value;
    const value = parseFloat(document.getElementById('rabattWert').value);

    try {
        const response = await fetch('/api/ticketrabatt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, type, value })
        });

        if (response.ok) {
            const newRabatt = await response.json();
            rabatte = rabatte.filter(r => r.name !== name); // Entfernen des alten Rabatts (falls existiert)
            rabatte.push({ name, type, value });
            renderRabatte();
            document.getElementById('rabattForm').reset();
        } else {
            console.error('Fehler beim Hinzufügen des Rabatts');
        }
    } catch (error) {
        console.error('Fehler beim Hinzufügen:', error);
    }
}
 */
