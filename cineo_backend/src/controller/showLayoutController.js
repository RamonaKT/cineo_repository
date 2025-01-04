const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Funktion zum Speichern des Layouts in Supabase
async function saveLayout(layoutData, userId) {
    const { roomData, rowData, seatData } = layoutData; // layoutData enthält alle Daten für Raum, Reihen und Sitzplätze

    try {
        // 1. Raum in die Tabelle 'room' speichern
        const { data: roomDataResponse, error: roomError } = await supabase
            .from('room')
            .upsert([{
                capacity: roomData.capacity // Nur das, was übergeben wird
            }], { onConflict: ['room_id'] });

        if (roomError) {
            throw new Error(roomError.message);
        }

        const roomId = roomDataResponse[0].room_id; // Nehme die room_id des neu gespeicherten Raums

        // 2. Reihen in die Tabelle 'rows' speichern
        const rows = rowData.map(row => ({
            room_id: roomId,
            seat_count: row.seat_count,
            row_number: row.row_number
        }));

        const { data: rowDataResponse, error: rowError } = await supabase
            .from('rows')
            .upsert(rows, { onConflict: ['row_id'] });

        if (rowError) {
            throw new Error(rowError.message);
        }

        // 3. Sitzplätze in die Tabelle 'seat' speichern
        const seats = [];
        rowDataResponse.forEach((row, rowIndex) => {
            const rowSeats = seatData[rowIndex].map(seat => ({
                room_id: roomId,
                row_id: row.row_id,
                category: seat.category,
                status: seat.status,
                show_id: seat.show_id,
                reserved_at: seat.reserved_at
            }));
            seats.push(...rowSeats);
        });

        const { data: seatDataResponse, error: seatError } = await supabase
            .from('seat')
            .upsert(seats, { onConflict: ['seat_id'] });

        if (seatError) {
            throw new Error(seatError.message);
        }

        return {
            room: roomDataResponse,
            rows: rowDataResponse,
            seats: seatDataResponse
        };
    } catch (err) {
        throw new Error(`Fehler beim Speichern des Layouts: ${err.message}`);
    }
}

// Endpunkt zum Speichern des Layouts
router.post('/api/save-layout', async (req, res) => {
    const { layoutData, userId } = req.body;

    // Überprüfen, ob Layout-Daten und userId vorhanden sind
    if (!layoutData || !userId) {
        return res.status(400).json({ error: 'Fehlende Layout-Daten oder Benutzer-ID' });
    }

    try {
        const savedLayout = await saveLayout(layoutData, userId);
        res.status(200).json({ message: 'Layout erfolgreich gespeichert', data: savedLayout });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Der gesamte Controller wird exportiert
module.exports = router;
module.exports = { saveLayout };