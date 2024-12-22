let ticketpreise = [
    { kategorie: "Parkett", preis: 10.00, rabattTyp: "kein", rabattWert: 0 },
    { kategorie: "Loge", preis: 15.00, rabattTyp: "kein", rabattWert: 0 },
    { kategorie: "VIP", preis: 20.00, rabattTyp: "kein", rabattWert: 0 }
];

// Preise und Übersicht laden
window.onload = function () {
    renderPriceList();
    updateOverview();
};

// Preisliste rendern
function renderPriceList() {
    const liste = document.getElementById('preisListe');
    liste.innerHTML = '';

    ticketpreise.forEach((item, index) => {
        const rabattText = item.rabattTyp === "prozent" ? `${item.rabattWert}% Rabatt` : 
                           item.rabattTyp === "euro" ? `${item.rabattWert.toFixed(2)} € Rabatt` : "Kein Rabatt";

        const li = document.createElement('li');
        li.innerHTML = `<div>${item.kategorie}: <strong>${item.preis.toFixed(2)} €</strong> - ${rabattText}</div> 
        <button onclick="deletePrice(${index})">Löschen</button>`;
        liste.appendChild(li);
    });

    updateOverview();
}

// Formular-Verarbeitung
document.getElementById('preisForm').onsubmit = function (e) {
    e.preventDefault();

    const kategorie = document.getElementById('kategorie').value;
    const preis = parseFloat(document.getElementById('preis').value);
    const rabattTyp = document.getElementById('rabattTyp').value;
    const rabattWert = parseFloat(document.getElementById('rabattWert').value) || 0;

    const existing = ticketpreise.find(item => item.kategorie === kategorie);
    
    if (existing) {
        existing.preis = preis;
        existing.rabattTyp = rabattTyp;
        existing.rabattWert = rabattWert;
    } else {
        ticketpreise.push({ kategorie, preis, rabattTyp, rabattWert });
    }

    renderPriceList();
    document.getElementById('preisForm').reset();
};

// Übersicht aktualisieren
function updateOverview() {
    const tbody = document.getElementById('preisUebersicht');
    tbody.innerHTML = '';

    ticketpreise.forEach(item => {
        const endpreis = calculateFinalPrice(item);
        tbody.innerHTML += `
            <tr>
                <td>${item.kategorie}</td>
                <td>${item.preis.toFixed(2)}</td>
                <td>${item.rabattTyp === 'kein' ? '—' : item.rabattWert}</td>
                <td>${endpreis.toFixed(2)}</td>
            </tr>`;
    });
}

function calculateFinalPrice(item) {
    if (item.rabattTyp === 'prozent') {
        return item.preis * (1 - item.rabattWert / 100);
    } else if (item.rabattTyp === 'euro') {
        return item.preis - item.rabattWert;
    }
    return item.preis;
}
