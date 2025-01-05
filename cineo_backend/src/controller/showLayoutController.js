const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

// Supabase-Client initialisieren
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

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
                room_id: roomNumber,          // room_id wird auf roomNumber gesetzt
                created_at: now,              // aktueller Zeitstempel für created_at
                capacity: seatCounts.reduce((total, count) => total + count, 0)  // Kapazität als Summe der Sitzplätze
            }], { onConflict: ['room_id'] });

        if (roomError) {
            throw new Error(roomError.message);
        }

        // 2. Reihen in die Tabelle 'rows' speichern
        const rows = seatCounts.map((seat_count, index) => ({
            row_id: `${roomNumber}_${index + 1}`,
            created_at: now,
            seat_count: seat_count,
            row_number: index + 1
        }));

        const { error: rowError, data: rowsData } = await supabase
            .from('rows')
            .upsert(rows, { onConflict: ['row_id'] });

        if (rowError) {
            throw new Error(rowError.message);
        }

        // 3. Sitzplätze in die Tabelle 'seat' speichern
        const seats = [];
        seatsData.forEach((row, rowIndex) => {
            row.forEach((seat, seatIndex) => {
                const seatObj = {
                    seat_id: `${roomNumber}_${rowIndex + 1}_${seatIndex + 1}`,
                    created_at: now,
                    room_id: roomNumber,
                    row_id: `${roomNumber}_${rowIndex + 1}`,
                    category: seat.category,
                    status: 0, 
                    reserved_at: null,
                    show_id: null
                };
                seats.push(seatObj);
            });
        });

        const { error: seatError, data: seatData } = await supabase
            .from('seat')
            .upsert(seats, { onConflict: ['seat_id'] });

        if (seatError) {
            throw new Error(seatError.message);
        }

        return { message: 'Layout erfolgreich gespeichert', data: { roomData, rowsData, seatData } };
    } catch (err) {
        throw new Error(`Fehler beim Speichern des Layouts: ${err.message}`);
    }
}

// Endpunkt zum Speichern des Layouts
router.post('/api/saveLayout', async (req, res) => {
    console.log("Received layout data:", req.body);  // Debugging: Prüfe, was empfangen wird
    const { roomNumber, seatCounts, seatsData } = req.body;

    // Validierung der Anfrage
    if (!Number.isInteger(roomNumber) || roomNumber <= 0) {
        return res.status(400).json({
            error: 'Ungültige Raumnummer. Bitte geben Sie eine positive Ganzzahl an.'
        });
    }

    if (!Array.isArray(seatCounts) || seatCounts.length === 0) {
        return res.status(400).json({
            error: 'Ungültige Sitzanzahl. Bitte stellen Sie sicher, dass seatCounts ein Array mit positiven Ganzzahlen ist.'
        });
    }

    if (!Array.isArray(seatsData) || seatsData.length !== seatCounts.length) {
        return res.status(400).json({
            error: 'Ungültige Sitzdaten. Die Anzahl der Reihen muss der Anzahl der Elemente in seatCounts entsprechen.'
        });
    }

    // Validierung jedes Sitzes in seatsData
    for (let rowIndex = 0; rowIndex < seatsData.length; rowIndex++) {
        const row = seatsData[rowIndex];
        if (!Array.isArray(row)) {
            return res.status(400).json({
                error: `Reihe ${rowIndex + 1} ist ungültig. Bitte stellen Sie sicher, dass sie ein Array von Sitzobjekten ist.`
            });
        }

        for (let seatIndex = 0; seatIndex < row.length; seatIndex++) {
            const seat = row[seatIndex];

            // Überprüfe jedes Sitzobjekt
            if (!seat.seatNumber || !seat.rowNumber || seat.category === undefined) {
                return res.status(400).json({
                    error: `Ungültige Sitzdaten in Reihe ${rowIndex + 1}, Sitz ${seatIndex + 1}. seatNumber, rowNumber und category müssen vorhanden sein.`
                });
            }
        }
    }

    try {
        const result = await saveLayout({ roomNumber, seatCounts, seatsData });
        return res.status(200).json(result);
    } catch (err) {
        console.error('Fehler beim Speichern des Layouts:', err.message);
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
