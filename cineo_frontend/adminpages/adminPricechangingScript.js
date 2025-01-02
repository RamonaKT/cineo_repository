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
