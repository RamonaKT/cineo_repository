const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

// Supabase-Client initialisieren
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Funktion zum Speichern des Layouts in Supabase
async function saveLayout(layoutData) {
    const { roomNumber, seatCounts } = layoutData;

    // Überprüfen, ob alle benötigten Felder vorhanden sind
    if (!roomNumber || !Array.isArray(seatCounts) || seatCounts.length === 0) {
        throw new Error('Fehlende oder ungültige Layout-Daten');
    }

    try {
        const now = new Date().toISOString(); // Aktueller Zeitstempel

        // 1. Raum in die Tabelle 'room' speichern
        const { error: roomError, data: roomData } = await supabase
            .from('room')
            .upsert([{
                room_id: roomNumber,          // room_id wird auf roomNumber gesetzt
                created_at: now,              // Aktueller Zeitstempel
                capacity: seatCounts.reduce((total, count) => total + count, 0)  // Gesamtkapazität basierend auf der Sitzanzahl
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
        rows.forEach((row, rowIndex) => {
            // Erstelle Sitzplätze für jede Reihe (hier verwenden wir einfache Kategorisierungen)
            for (let i = 0; i < row.seat_count; i++) {
                const seat = {
                    seat_id: `${roomNumber}_${row.row_number}_${i + 1}`,
                    created_at: now,
                    room_id: roomNumber,
                    row_id: row.row_id,
                    category: 0,   // Standard-Kategorie: Parkett
                    status: "available", // Sitzstatus: verfügbar
                    show_id: null, // Hier kannst du ein Show-ID setzen, falls erforderlich
                    reserved_at: null // reserviert_at: null für nicht reservierte Sitze
                };
                seats.push(seat);
            }
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
    const { roomNumber, seatCounts, seatsData } = req.body;

    // Validierung der Anfrage
    if (!roomNumber || !Array.isArray(seatCounts) || !Array.isArray(seatsData)) {
        return res.status(400).json({
            error: 'Ungültige Anfrage. Bitte stellen Sie sicher, dass alle erforderlichen Felder vorhanden sind.'
        });
    }

    try {
        // Weiterverarbeitung der Anfrage (z.B. Aufruf der saveLayout Funktion)
        const result = await saveLayout({
            roomNumber,
            seatCounts,
            seatsData
        });

        // Erfolgreiches Speichern
        res.status(200).json(result); // Rückgabe der resultierenden Daten

    } catch (error) {
        // Fehlerbehandlung
        console.error('Fehler beim Speichern des Layouts:', error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
