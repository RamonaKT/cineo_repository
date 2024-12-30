let grundpreise = {
    "Parkett": 12.00,
    "Loge": 18.00,
    "VIP": 25.00
};

let rabatte = [];

// Seite laden
window.onload = function () {
    renderGrundpreise();
    renderRabatte();
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
        grundpreise[kategorie] = preis;
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
        rabatte.push({ name, typ, wert });
        renderRabatte();
        document.getElementById('rabattForm').reset();
    } else {
        alert('Bitte gültige Werte eingeben.');
    }
};

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
