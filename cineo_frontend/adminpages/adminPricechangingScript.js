let ticketpreise = [
    { kategorie: "Parkett", preis: 10.00, rabattTyp: "kein", rabattWert: 0 },
    { kategorie: "Loge", preis: 15.00, rabattTyp: "kein", rabattWert: 0 },
    { kategorie: "VIP", preis: 20.00, rabattTyp: "kein", rabattWert: 0 }
];

// Preise und Übersicht laden
window.onload = function () {
    renderPriceList();
};

// Preisliste rendern
function renderPriceList() {
    const liste = document.getElementById('preisListe');
    liste.innerHTML = '';

    ticketpreise.forEach((item, index) => {
        const rabattText = item.rabattTyp === "prozent" ? `${item.rabattWert}% Rabatt` : 
                           item.rabattTyp === "euro" ? `${item.rabattWert.toFixed(2)} € Rabatt` : "Kein Rabatt";

        const endpreis = calculateFinalPrice(item).toFixed(2);

        const li = document.createElement('li');
        li.innerHTML = `<div>${item.kategorie}: <strong>${item.preis.toFixed(2)} €</strong> - ${rabattText} | Endpreis: <strong>${endpreis} €</strong></div> 
        <button onclick="deletePrice(${index})">Löschen</button>`;
        liste.appendChild(li);
    });
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

function calculateFinalPrice(item) {
    if (item.rabattTyp === 'prozent') {
        return item.preis * (1 - item.rabattWert / 100);
    } else if (item.rabattTyp === 'euro') {
        return item.preis - item.rabattWert;
    }
    return item.preis;
}

// Preis löschen
function deletePrice(index) {
    ticketpreise.splice(index, 1);
    renderPriceList();
}
