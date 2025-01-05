const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

// Supabase-Client initialisieren
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Funktion zum Speichern des Layouts in Supabase
// Funktion zum Speichern des Layouts in Supabase
async function saveLayout(layoutData) {
    const { roomNumber, seatCounts, seatsData } = layoutData;

    // Überprüfe, ob alle benötigten Felder vorhanden sind
    if (!roomNumber || !Array.isArray(seatCounts) || seatCounts.length === 0 || !Array.isArray(seatsData)) {
        throw new Error('Fehlende oder ungültige Layout-Daten');
    }

    try {
        const now = new Date().toISOString(); // Aktueller Zeitstempel

        // 1. Raum in die Tabelle 'room' speichern
        const { error: roomError, data: roomData } = await supabase
            .from('room')
            .upsert([{
                room_id: roomNumber,
                created_at: now,
                capacity: seatCounts.reduce((total, count) => total + count, 0)
            }], { onConflict: ['room_id'] });

        if (roomError) {
            console.error('Fehler beim Speichern des Raums:', roomError.message, roomError);
            throw new Error(roomError.message);
        }

        // Weitere Upsert-Operationen für 'rows' und 'seats'...
        // (weitere Fehlerprotokollierung wie oben einfügen)

        return { message: 'Layout erfolgreich gespeichert', data: { roomData, rowsData, seatData } };
    } catch (err) {
        console.error('Fehler beim Speichern des Layouts:', err.message, err);
        throw new Error(`Fehler beim Speichern des Layouts: ${err.message}`);
    }
}


// Endpunkt zum Speichern des Layouts
// Endpunkt zum Speichern des Layouts
router.post('/api/saveLayout', async (req, res) => {
    console.log("Received layout data:", req.body);  // Debugging: Prüfe, was empfangen wird
    const { roomNumber, seatCounts, seatsData } = req.body;

    // 1. Validierung der Anfrage: Überprüfe, ob 'roomNumber' eine gültige Zahl ist
    if (!Number.isInteger(roomNumber) || roomNumber <= 0) {
        console.log("Fehler: Ungültige Raumnummer", roomNumber);
        return res.status(400).json({
            error: 'Ungültige Raumnummer. Bitte geben Sie eine positive Ganzzahl an.'
        });
    }

    // 2. Validierung von 'seatCounts': Muss ein Array mit positiven Ganzzahlen sein
    if (!Array.isArray(seatCounts) || seatCounts.length === 0) {
        console.log("Fehler: Ungültige seatCounts", seatCounts);
        return res.status(400).json({
            error: 'Ungültige Sitzanzahl. Bitte stellen Sie sicher, dass seatCounts ein Array mit positiven Ganzzahlen ist.'
        });
    }

    // 3. Validierung von 'seatsData': Muss ein Array sein und die gleiche Länge wie 'seatCounts' haben
    if (!Array.isArray(seatsData) || seatsData.length !== seatCounts.length) {
        console.log("Fehler: Anzahl der Reihen in seatsData stimmt nicht mit seatCounts überein");
        return res.status(400).json({
            error: 'Ungültige Sitzdaten. Die Anzahl der Reihen muss der Anzahl der Elemente in seatCounts entsprechen.'
        });
    }

    // 4. Validierung jedes Sitzes in 'seatsData'
    for (let rowIndex = 0; rowIndex < seatsData.length; rowIndex++) {
        const row = seatsData[rowIndex];
        if (!Array.isArray(row)) {
            console.log(`Fehler: Reihe ${rowIndex + 1} ist nicht gültig`);
            return res.status(400).json({
                error: `Reihe ${rowIndex + 1} ist ungültig. Bitte stellen Sie sicher, dass sie ein Array von Sitzobjekten ist.`
            });
        }

        // 5. Validierung der Anzahl der Sitze in jeder Reihe
        if (row.length !== seatCounts[rowIndex]) {
            console.log(`Fehler: Anzahl der Sitze in Reihe ${rowIndex + 1} stimmt nicht mit seatCounts überein`, row.length, seatCounts[rowIndex]);
            return res.status(400).json({
                error: `In Reihe ${rowIndex + 1} gibt es nicht die erwartete Anzahl an Sitzen. Erwartet: ${seatCounts[rowIndex]}, erhalten: ${row.length}.`
            });
        }

        // 6. Validierung jedes einzelnen Sitzes
        for (let seatIndex = 0; seatIndex < row.length; seatIndex++) {
            const seat = row[seatIndex];

            // Überprüfe jedes Sitzobjekt auf Vollständigkeit
            if (seat.seatNumber == undefined || seat.rowNumber == undefined || seat.category == undefined) {
                console.log(`Fehler: Ungültige Sitzdaten in Reihe ${rowIndex + 1}, Sitz ${seatIndex + 1}`, seat);
                return res.status(400).json({
                    error: `Ungültige Sitzdaten in Reihe ${rowIndex + 1}, Sitz ${seatIndex + 1}. seatNumber, rowNumber und category müssen vorhanden sein.`
                });
            }

            // Validierungen für 'seatNumber', 'rowNumber' und 'category'
            if (!Number.isInteger(seat.seatNumber) || seat.seatNumber <= 0) {
                console.log(`Fehler: Ungültige seatNumber in Reihe ${rowIndex + 1}, Sitz ${seatIndex + 1}`, seat.seatNumber);
                return res.status(400).json({
                    error: `Ungültige seatNumber in Reihe ${rowIndex + 1}, Sitz ${seatIndex + 1}. Es muss eine positive Ganzzahl sein.`
                });
            }

            if (!Number.isInteger(seat.rowNumber) || seat.rowNumber <= 0) {
                console.log(`Fehler: Ungültige rowNumber in Reihe ${rowIndex + 1}, Sitz ${seatIndex + 1}`, seat.rowNumber);
                return res.status(400).json({
                    error: `Ungültige rowNumber in Reihe ${rowIndex + 1}, Sitz ${seatIndex + 1}. Es muss eine positive Ganzzahl sein.`
                });
            }

            if (![0, 1, 2].includes(seat.category)) {
                console.log(`Fehler: Ungültige category in Reihe ${rowIndex + 1}, Sitz ${seatIndex + 1}`, seat.category);
                return res.status(400).json({
                    error: `Ungültige category in Reihe ${rowIndex + 1}, Sitz ${seatIndex + 1}. Erlaubte Werte sind 0, 1 oder 2.`
                });
            }
        }
    }

    // 7. Wenn die Validierung erfolgreich war, speichern wir das Layout
    try {
        const result = await saveLayout({ roomNumber, seatCounts, seatsData }); // Die validierten Daten werden übergeben
        return res.status(200).json(result);
    } catch (err) {
        console.error('Fehler beim Speichern des Layouts:', err.message);
        return res.status(500).json({ error: err.message });
    }
});


module.exports = router;
